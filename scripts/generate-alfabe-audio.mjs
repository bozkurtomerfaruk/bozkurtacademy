// Almanca Alfabe oyunu (/almanca-alfabe/) ses dosyaları: bir TTS servisiyle bir kez üretilir, audio/alfabe/ altında
// statik dosya olarak durur. Oyun oynanırken hiçbir servise istek gitmez. Ayrıntı: docs/alfabe-oyunu.md › "Sesler".
//
//   node scripts/generate-alfabe-audio.mjs --dry-run          ne üretileceğini, karakter sayısını ve maliyeti gösterir (anahtar gerekmez)
//   node scripts/generate-alfabe-audio.mjs                    eksik ve metni değişmiş klipleri üretir (anahtar gerekir)
//   node scripts/generate-alfabe-audio.mjs --only harf-v,kelime-der-vogel   sadece bu klipler
//   node scripts/generate-alfabe-audio.mjs --force            kendi kayıtların dışında hepsini yeniden üretir
//   node scripts/generate-alfabe-audio.mjs --index            kendi koyduğun dosyaları listeye ekler (anahtar gerekmez)
//   node scripts/generate-alfabe-audio.mjs --accept-own       metni değişen kendi kayıtlarını yine de kullan
//   node scripts/generate-alfabe-audio.mjs --voices           servisin de-DE ve tr-TR seslerini listeler
//   node scripts/generate-alfabe-audio.mjs --check            liste ve tablo güncel mi (CI; anahtar gerekmez)
//
// Servis: ALFABE_TTS_PROVIDER = google (varsayılan) | azure | elevenlabs. Anahtarlar SADECE ortam değişkeninden ya da
// depoya girmeyen .env dosyasından okunur (.gitignore'da): GOOGLE_TTS_API_KEY; AZURE_SPEECH_KEY + AZURE_SPEECH_REGION;
// ELEVENLABS_API_KEY + ELEVENLABS_VOICE_DE + ELEVENLABS_VOICE_TR. Sesler: ALFABE_VOICE_DE, ALFABE_VOICE_TR.
//
// Dosya adları basit ve sabittir (de/harf-v.mp3, de/kelime-der-vogel.mp3, tr/aferin.mp3 …; tam liste
// docs/alfabe-ses-listesi.md). Kendi kaydını aynı adla koyup --index çalıştırınca o kullanılır ve bir daha üzerine
// yazılmaz. Klipler ffmpeg ile kırpılır, ses seviyesi eşitlenir (−16 LUFS) ve 48 kbit/sn mono MP3 olur. ffmpeg yoksa
// servisin MP3'ü olduğu gibi kaydedilir. Yeni npm paketi yok: Node 20+ (fetch) ve ffmpeg yeter.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const AUDIO_DIR = 'audio/alfabe';
export const TABLE_FILE = 'docs/alfabe-ses-listesi.md';
const BITRATE = '48k';

/* ---------- Data ---------- */
export function loadLogic(root = REPO) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/alfabe-logic.js'), 'utf8'), ctx);
  return ctx.window.baAlfabeLogic;
}
export function loadClips(root = REPO) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/alfabe.json'), 'utf8'));
  return JSON.parse(JSON.stringify(loadLogic(root).audioClips(data)));
}
const sha = (buf, n = 12) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, n);
// What the clip says: the same text and tone give the same hash, whatever the voice.
export const textHash = (clip) => sha(JSON.stringify([clip.lang, clip.ssml, clip.tone]), 16);

// KEY=value lines; values already in the environment win. The file is never committed (.gitignore).
export function loadEnv(file, env = process.env) {
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
}

/* ---------- Manifest ---------- */
export function readManifest(dir) {
  const file = path.join(dir, 'manifest.json');
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return { clips: {} }; }
}
export const manifestText = (m) => JSON.stringify({
  _aciklama: 'Almanca Alfabe ses dosyaları. Elle düzenleme: node scripts/generate-alfabe-audio.mjs --index yeniler. source: servis adı ya da "kendi" (kendi kaydın). stale: metin değişti, dosya oynatılmaz.',
  clips: Object.fromEntries(Object.keys(m.clips).sort().map((k) => [k, m.clips[k]]))
}, null, 2) + '\n';

// Brings the manifest in line with the files on disk. A file whose content is not what the manifest says (or that
// the manifest does not know) is an own recording. An entry whose text changed is "stale" and is not played.
export function indexAudio(dir, clips, manifest, { acceptOwn = false } = {}) {
  const out = { clips: {} };
  const notes = { own: [], stale: [], missing: [], orphans: [], removed: [] };
  const known = new Set(clips.map((c) => c.file));
  for (const clip of clips) {
    const file = path.join(dir, clip.file);
    const old = manifest.clips?.[clip.id];
    if (!fs.existsSync(file)) { notes.missing.push(clip.id); if (old) notes.removed.push(clip.id); continue; }
    const buf = fs.readFileSync(file);
    const audioHash = sha(buf);
    const hash = textHash(clip);
    let entry;
    if (old && old.audioHash === audioHash) entry = { ...old };
    else {
      entry = { file: clip.file, lang: clip.lang, kind: clip.kind, text: clip.text, textHash: hash, audioHash, source: 'kendi' };
      notes.own.push(clip.id);
    }
    entry.file = clip.file; entry.lang = clip.lang; entry.kind = clip.kind; entry.bytes = buf.length;
    if (entry.source === 'kendi' && acceptOwn) entry.textHash = hash;
    if (entry.textHash === hash) { entry.text = clip.text; delete entry.stale; }
    else { entry.stale = true; notes.stale.push(clip.id); }
    out.clips[clip.id] = entry;
  }
  for (const id of Object.keys(manifest.clips || {})) if (!out.clips[id] && !clips.some((c) => c.id === id)) notes.removed.push(id);
  for (const lang of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const sub = path.join(dir, lang);
    if (!fs.statSync(sub).isDirectory()) continue;
    for (const f of fs.readdirSync(sub)) if (f.endsWith('.mp3') && !known.has(`${lang}/${f}`)) notes.orphans.push(`${lang}/${f}`);
  }
  return { manifest: out, notes };
}

// Which clips the generator makes: missing ones and generated ones whose text changed. Own recordings never,
// unless --force-own. --only limits the list.
export function planGeneration(clips, manifest, { force = false, forceOwn = false, only = null } = {}) {
  return clips.filter((c) => {
    if (only && !only.includes(c.id)) return false;
    const e = manifest.clips[c.id];
    if (!e) return true;
    if (e.source === 'kendi') return forceOwn;
    return force || e.stale || e.textHash !== textHash(c);
  });
}

/* ---------- Table (docs/alfabe-ses-listesi.md) ---------- */
const KIND = { harf: 'Harf adı', kelime: 'Kelime', isaret: 'İşaret', soru: 'Senaryo sorusu', cevap: 'Senaryo cevabı', geri: 'Geri bildirim', talimat: 'Talimat' };
export function tableText(clips, manifest) {
  const cell = (s) => String(s ?? '').replace(/\|/g, '\\|');
  const status = (e) => !e ? 'eksik (cihaz sesi)' : e.stale ? 'metin değişti (oynatılmaz)' : e.source === 'kendi' ? 'kendi kaydın' : `üretildi (${e.source})`;
  const rows = clips.map((c, i) => {
    const e = manifest.clips[c.id];
    return `| ${i + 1} | \`${c.file}\` | ${c.lang} | ${KIND[c.kind] || c.kind} | ${cell(c.text)} | ${c.ipa ? `/${cell(c.ipa)}/` : ''} | ${status(e)} | ${e ? (e.bytes / 1024).toFixed(1) + ' KB' : ''} |`;
  });
  const total = clips.reduce((n, c) => n + (manifest.clips[c.id]?.bytes || 0), 0);
  const have = clips.filter((c) => manifest.clips[c.id] && !manifest.clips[c.id].stale).length;
  return `# Almanca Alfabe ses klipleri

Bu dosya \`node scripts/generate-alfabe-audio.mjs\` ile üretilir; elle düzenleme. Dinlemek için:
\`python3 -m http.server 8765\` açıkken \`http://localhost:8765/tools/audio-check.html\` (sayfa yayına girmez).
Kendi kaydını aynı dosya adıyla \`audio/alfabe/\` altına koy, sonra \`node scripts/generate-alfabe-audio.mjs --index\`.

- Klip: ${clips.length} (dosyası olan: ${have})
- Toplam boyut: ${(total / 1024).toFixed(1)} KB

| # | Dosya | Dil | Tür | Metin | IPA | Durum | Boyut |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
}

/* ---------- Providers ---------- */
export const PROVIDERS = {
  google: {
    keys: ['GOOGLE_TTS_API_KEY'],
    voices: { de: 'de-DE-Neural2-C', tr: 'tr-TR-Wavenet-C' },
    // Free monthly characters and price per million after that, by voice family (cloud.google.com/text-to-speech/pricing).
    price(voice) {
      if (/Chirp3-HD/i.test(voice)) return { free: 1e6, perMillion: 30 };
      if (/Neural2/i.test(voice)) return { free: 1e6, perMillion: 16 };
      if (/Wavenet|Standard/i.test(voice)) return { free: 4e6, perMillion: 4 };
      return { free: 0, perMillion: 30 };
    }
  },
  azure: { keys: ['AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION'], voices: { de: 'de-DE-KatjaNeural', tr: 'tr-TR-EmelNeural' }, price: () => ({ free: 5e5, perMillion: 16 }) },
  elevenlabs: { keys: ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_DE', 'ELEVENLABS_VOICE_TR'], voices: { de: '', tr: '' }, price: () => ({ free: 0, perMillion: null }) }
};
const LOCALE = { de: 'de-DE', tr: 'tr-TR' };
// Warm, a little slower and higher for the children's mode; neutral otherwise.
const toneSsml = (clip) => (clip.tone === 'cocuk' ? `<prosody rate="95%" pitch="+2st">${clip.ssml}</prosody>` : clip.ssml);
export function voiceFor(provider, lang, env) {
  if (provider === 'elevenlabs') return env[`ELEVENLABS_VOICE_${lang.toUpperCase()}`] || '';
  return env[`ALFABE_VOICE_${lang.toUpperCase()}`] || PROVIDERS[provider].voices[lang];
}

// The HTTP request for one clip. pcm: ask for uncompressed audio (ffmpeg makes the MP3).
export function buildRequest(provider, clip, env, { pcm = true } = {}) {
  const voice = voiceFor(provider, clip.lang, env);
  if (provider === 'google') {
    return {
      url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': env.GOOGLE_TTS_API_KEY },
        body: JSON.stringify({
          input: { ssml: `<speak>${toneSsml(clip)}</speak>` },
          voice: { languageCode: LOCALE[clip.lang], name: voice },
          audioConfig: { audioEncoding: pcm ? 'LINEAR16' : 'MP3', sampleRateHertz: 24000 }
        })
      },
      format: pcm ? 'wav' : 'mp3', voice,
      read: async (res) => Buffer.from((await res.json()).audioContent, 'base64')
    };
  }
  if (provider === 'azure') {
    return {
      url: `https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      init: {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': pcm ? 'riff-24khz-16bit-mono-pcm' : 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'bozkurtacademy-alfabe-audio'
        },
        body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${LOCALE[clip.lang]}"><voice name="${voice}">${toneSsml(clip)}</voice></speak>`
      },
      format: pcm ? 'wav' : 'mp3', voice,
      read: async (res) => Buffer.from(await res.arrayBuffer())
    };
  }
  if (provider === 'elevenlabs') {
    // No SSML: the plain text (letter names already spelled for speaking: "Vau", "Kuh", "Eszett").
    return {
      url: `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=${pcm ? 'pcm_24000' : 'mp3_44100_64'}`,
      init: {
        method: 'POST',
        headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clip.text, model_id: env.ELEVENLABS_MODEL || 'eleven_multilingual_v2', language_code: clip.lang })
      },
      format: pcm ? 'pcm' : 'mp3', voice,
      read: async (res) => Buffer.from(await res.arrayBuffer())
    };
  }
  throw new Error(`Bilinmeyen servis: ${provider}`);
}

/* ---------- ffmpeg ---------- */
export const hasFfmpeg = () => spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
// Trim silence (a little stays at both ends), even loudness, mono MP3 at 48 kbit/s.
export function encodeMp3(input, format, outFile) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'alfabe-ses-'));
  const src = path.join(tmp, 'in.' + (format === 'pcm' ? 'raw' : format));
  fs.writeFileSync(src, input);
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05';
  const args = ['-hide_banner', '-loglevel', 'error', '-y',
    ...(format === 'pcm' ? ['-f', 's16le', '-ar', '24000', '-ac', '1'] : []), '-i', src,
    '-af', `${trim},areverse,${trim.replace('0.05', '0.12')},areverse,loudnorm=I=-16:TP=-1.5:LRA=11`,
    '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', BITRATE, '-map_metadata', '-1', outFile];
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  fs.rmSync(tmp, { recursive: true, force: true });
  if (r.status !== 0) throw new Error('ffmpeg: ' + (r.stderr || r.error));
}

/* ---------- Run ---------- */
function parseArgs(argv) {
  const o = { dryRun: false, force: false, forceOwn: false, index: false, check: false, voices: false, acceptOwn: false, only: null, provider: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') o.dryRun = true;
    else if (a === '--force') o.force = true;
    else if (a === '--force-own') o.forceOwn = true;
    else if (a === '--index') o.index = true;
    else if (a === '--check') o.check = true;
    else if (a === '--voices') o.voices = true;
    else if (a === '--accept-own') o.acceptOwn = true;
    else if (a === '--only') o.only = String(argv[++i] || '').split(',').filter(Boolean);
    else if (a.startsWith('--only=')) o.only = a.slice(7).split(',').filter(Boolean);
    else if (a === '--provider') o.provider = argv[++i];
    else if (a.startsWith('--provider=')) o.provider = a.slice(11);
    else throw new Error(`Bilinmeyen seçenek: ${a}`);
  }
  return o;
}
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

// root: repository; fetchImpl and env are replaceable for the tests. Returns an exit code.
export async function run(argv, { root = REPO, fetchImpl = globalThis.fetch, env = process.env, log = console.log } = {}) {
  const o = parseArgs(argv);
  loadEnv(path.join(root, '.env'), env);
  const dir = path.join(root, AUDIO_DIR);
  const clips = loadClips(root);
  const provider = o.provider || env.ALFABE_TTS_PROVIDER || 'google';
  if (!PROVIDERS[provider]) throw new Error(`Bilinmeyen servis: ${provider} (google, azure, elevenlabs)`);
  const ids = new Set(clips.map((c) => c.id));
  for (const id of o.only || []) if (!ids.has(id)) throw new Error(`Böyle bir klip yok: ${id} (liste: ${TABLE_FILE})`);

  const onDisk = readManifest(dir);
  let { manifest, notes } = indexAudio(dir, clips, onDisk, { acceptOwn: o.acceptOwn });
  const write = () => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'manifest.json'), manifestText(manifest));
    fs.writeFileSync(path.join(root, TABLE_FILE), tableText(clips, manifest));
  };
  const report = () => {
    const total = Object.values(manifest.clips).reduce((n, e) => n + e.bytes, 0);
    const have = Object.values(manifest.clips).filter((e) => !e.stale).length;
    log(`Klip: ${clips.length}, dosyası olan: ${have}, eksik: ${clips.length - have}. Toplam boyut: ${kb(total)}.`);
    if (notes.stale.length) log(`Metni değişti, oynatılmıyor (${notes.stale.length}): ${notes.stale.join(', ')}`);
    if (notes.orphans.length) log(`Listede olmayan dosyalar (adını kontrol et): ${notes.orphans.join(', ')}`);
  };

  if (o.check) {
    const bad = [];
    if (manifestText(manifest) !== manifestText(onDisk)) bad.push(`${AUDIO_DIR}/manifest.json`);
    const table = path.join(root, TABLE_FILE);
    if (!fs.existsSync(table) || fs.readFileSync(table, 'utf8') !== tableText(clips, manifest)) bad.push(TABLE_FILE);
    if (notes.orphans.length) bad.push(`listede olmayan dosya: ${notes.orphans.join(', ')}`);
    report();
    if (bad.length) { log(`Güncel değil: ${bad.join('; ')}\nnode scripts/generate-alfabe-audio.mjs --index çalıştır ve sonucu commit et.`); return 1; }
    log('PASS: Almanca Alfabe ses listesi güncel.');
    return 0;
  }
  if (notes.own.length) log(`Kendi kaydın olarak eklendi: ${notes.own.join(', ')}`);

  if (o.index) { write(); report(); return 0; }

  const env2 = env;
  if (o.voices) {
    if (provider !== 'google') { log('--voices şimdilik sadece Google için. Azure/ElevenLabs seslerini kendi panellerinden seç.'); return 0; }
    if (!env2.GOOGLE_TTS_API_KEY) { log('GOOGLE_TTS_API_KEY yok (.env ya da ortam değişkeni).'); return 1; }
    for (const code of ['de-DE', 'tr-TR']) {
      const res = await fetchImpl(`https://texttospeech.googleapis.com/v1/voices?languageCode=${code}`, { headers: { 'X-Goog-Api-Key': env2.GOOGLE_TTS_API_KEY } });
      const body = await res.json();
      if (!res.ok) { log(`Hata ${res.status}: ${JSON.stringify(body)}`); return 1; }
      log(`${code}:\n` + (body.voices || []).map((v) => `  ${v.name}  ${v.ssmlGender}`).sort().join('\n'));
    }
    return 0;
  }

  const todo = planGeneration(clips, manifest, o);
  const chars = todo.reduce((n, c) => n + (provider === 'elevenlabs' ? c.text.length : `<speak>${toneSsml(c)}</speak>`.length), 0);
  const voices = { de: voiceFor(provider, 'de', env2), tr: voiceFor(provider, 'tr', env2) };
  const prices = [...new Set(todo.map((c) => c.lang))].map((l) => PROVIDERS[provider].price(voices[l]));
  log(`Servis: ${provider} · sesler: de=${voices.de || '(ELEVENLABS_VOICE_DE)'}, tr=${voices.tr || '(ELEVENLABS_VOICE_TR)'}`);
  log(`Üretilecek: ${todo.length} klip, yaklaşık ${chars} karakter (SSML etiketleri dahil).`);
  if (prices.length) {
    const p = prices[0];
    log(p.perMillion == null
      ? `Maliyet: ${chars} kredi (ElevenLabs aboneliğinden düşer).`
      : `Maliyet: aylık ${p.free.toLocaleString('tr-TR')} ücretsiz karakter içinde 0 $; ücretsiz kota dolmuşsa en çok ${(chars / 1e6 * p.perMillion).toFixed(4)} $.`);
  }
  if (o.dryRun) { for (const c of todo) log(`  ${c.file}  ${c.text}`); return 0; }
  if (!todo.length) { write(); report(); log('Üretilecek klip yok.'); return 0; }

  const missingKeys = PROVIDERS[provider].keys.filter((k) => !env2[k]);
  if (missingKeys.length) { log(`Anahtar eksik: ${missingKeys.join(', ')}. .env dosyasına ya da ortam değişkenine yaz (docs/alfabe-oyunu.md).`); return 1; }
  const pcm = hasFfmpeg();
  if (!pcm) log('Uyarı: ffmpeg yok; servisin MP3 dosyası kırpılmadan ve ses seviyesi eşitlenmeden kaydedilecek.');

  let made = 0;
  for (const clip of todo) {
    const req = buildRequest(provider, clip, env2, { pcm });
    let res;
    for (let attempt = 1; ; attempt++) {
      res = await fetchImpl(req.url, req.init);
      if (res.ok || attempt >= 3 || ![429, 500, 502, 503, 504].includes(res.status)) break;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      log(`HATA ${clip.id}: ${res.status} ${body.slice(0, 300)}`);
      write(); report();
      return 1;
    }
    const buf = await req.read(res);
    const out = path.join(dir, clip.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    if (pcm) encodeMp3(buf, req.format, out);
    else fs.writeFileSync(out, buf);
    const audioBuf = fs.readFileSync(out);
    manifest.clips[clip.id] = { file: clip.file, lang: clip.lang, kind: clip.kind, text: clip.text, textHash: textHash(clip),
      audioHash: sha(audioBuf), bytes: audioBuf.length, source: provider, voice: req.voice, generatedAt: new Date().toISOString().slice(0, 10) };
    made++;
    log(`  ${clip.file}  ${kb(audioBuf.length)}  ${clip.text}`);
  }
  ({ manifest, notes } = indexAudio(dir, clips, manifest));
  write();
  log(`Üretildi: ${made} klip.`);
  report();
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  run(process.argv.slice(2)).then((code) => process.exit(code), (error) => { console.error(error.message || error); process.exit(1); });
}
