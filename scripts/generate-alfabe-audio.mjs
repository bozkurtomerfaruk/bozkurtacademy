// Almanca Alfabe oyunu (/almanca-alfabe/) ses dosyaları: bir kez üretilir, audio/alfabe/ altında statik dosya olarak
// durur. Oyun oynanırken hiçbir servise istek gitmez. Ayrıntı ve kurulum: docs/alfabe-oyunu.md › "Sesler".
//
// Varsayılan: "yerel" = ücretsiz, kartsız, bilgisayarında çalışan açık kaynak sesler. Almanca: Piper
// (de_DE-thorsten-medium, Thorsten-Voice CC0). Türkçe: Chatterbox Multilingual (Resemble AI, MIT). Kalite kapısı: Whisper
// (faster-whisper, MIT) her kelime/cümle için birkaç adaydan en iyi anlaşılanı seçer. Kurulum bir kez:
// scripts/alfabe-ses/kur.sh (Linux/macOS) ya da kur.ps1 (Windows); kurulum modelleri de indirir. Sonra:
//   node scripts/generate-alfabe-audio.mjs --modelleri-indir  modelleri .tts-modeller/ klasörüne indirir (git'e girmez)
//   node scripts/generate-alfabe-audio.mjs                    eksik ve metni değişmiş klipleri üretir
//   node scripts/generate-alfabe-audio.mjs --alternatifler    harf adlarının yazım alternatiflerini üretir (tools/audio-alternatifler/)
//   node scripts/generate-alfabe-audio.mjs --dry-run          ne üretileceğini gösterir
//   node scripts/generate-alfabe-audio.mjs --only harf-v,kelime-der-vogel   sadece bu klipler
//   node scripts/generate-alfabe-audio.mjs --force            kendi kayıtların dışında hepsini yeniden üretir
//   node scripts/generate-alfabe-audio.mjs --index            kendi koyduğun dosyaları listeye ekler (anahtar gerekmez)
//   node scripts/generate-alfabe-audio.mjs --accept-own       metni değişen kendi kayıtlarını yine de kullan
//   node scripts/generate-alfabe-audio.mjs --voices           servisin de-DE ve tr-TR seslerini listeler
//   node scripts/generate-alfabe-audio.mjs --check            liste ve tablo güncel mi (CI; anahtar gerekmez)
//
// İsteğe bağlı ücretli servisler: ALFABE_TTS_PROVIDER = yerel (varsayılan) | google | azure | elevenlabs. Anahtarlar SADECE ortam değişkeninden ya da
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
import { spawn, spawnSync } from 'node:child_process';
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
// What the clip says: the same text, tone and local reading (say) give the same hash, whatever the voice.
export const textHash = (clip) => sha(JSON.stringify([clip.lang, clip.ssml, clip.tone, clip.say || '']), 16);

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

// Which clips the generator makes: missing ones, generated ones whose text changed and, with render, generated ones
// made with other voice settings (another voice or speed). Own recordings never, unless --force-own. --only limits the list.
export function planGeneration(clips, manifest, { force = false, forceOwn = false, only = null, render = null } = {}) {
  return clips.filter((c) => {
    if (only && !only.includes(c.id)) return false;
    const e = manifest.clips[c.id];
    if (!e) return true;
    if (e.source === 'kendi') return forceOwn;
    return force || e.stale || e.textHash !== textHash(c) || Boolean(render && e.render && e.render !== render(c));
  });
}

/* ---------- Table (docs/alfabe-ses-listesi.md) ---------- */
const KIND = { harf: 'Harf adı', kelime: 'Kelime', isaret: 'İşaret', soru: 'Senaryo sorusu', cevap: 'Senaryo cevabı', geri: 'Geri bildirim', talimat: 'Talimat' };
export function tableText(clips, manifest) {
  const cell = (s) => String(s ?? '').replace(/\|/g, '\\|');
  const status = (e) => !e ? 'eksik (cihaz sesi)' : e.stale ? 'metin değişti (oynatılmaz)' : e.source === 'kendi' ? 'kendi kaydın' : `üretildi (${e.source})`;
  const rows = clips.map((c, i) => {
    const e = manifest.clips[c.id];
    const said = c.say && c.say.replace(/[.]$/, '') !== c.text ? cell(c.say) : '';
    const heard = e?.heard != null ? `${cell(e.heard)} (${e.score})` : '';
    return `| ${i + 1} | \`${c.file}\` | ${c.lang} | ${KIND[c.kind] || c.kind} | ${cell(c.text)} | ${said} | ${c.ipa ? `/${cell(c.ipa)}/` : ''} | ${e?.phonemes ? `/${cell(e.phonemes)}/` : ''} | ${heard} | ${status(e)} | ${e ? (e.bytes / 1024).toFixed(1) + ' KB' : ''} |`;
  });
  const total = clips.reduce((n, c) => n + (manifest.clips[c.id]?.bytes || 0), 0);
  const have = clips.filter((c) => manifest.clips[c.id] && !manifest.clips[c.id].stale).length;
  return `# Almanca Alfabe ses klipleri

Bu dosya \`node scripts/generate-alfabe-audio.mjs\` ile üretilir; elle düzenleme. Dinlemek için:
\`python3 -m http.server 8765\` açıkken \`http://localhost:8765/tools/audio-check.html\` (sayfa yayına girmez).
Kendi kaydını aynı dosya adıyla \`audio/alfabe/\` altına koy, sonra \`node scripts/generate-alfabe-audio.mjs --index\`.

- Klip: ${clips.length} (dosyası olan: ${have})
- Toplam boyut: ${(total / 1024).toFixed(1)} KB

Okutulan metin: yerel ses üreticisine verilen metin, metinden farklıysa (\`data/alfabe.json\` → \`sesMetni\`; \`[[ … ]]\` fonemdir).
Hedef IPA: harf adının doğru okunuşu. Üretilen fonemler: Piper'ın gerçekten okuduğu (Türkçe motor fonem vermez).
Makine kulağı: konuşma tanımanın (Whisper) en iyi adaydan duyduğu ve benzerlik puanı (1 = birebir). Kulakla kontrol
yerine geçmez; puanı düşük klipleri önce dinle.

| # | Dosya | Dil | Tür | Metin | Okutulan metin | Hedef IPA | Üretilen fonemler | Makine kulağı | Durum | Boyut |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
}

/* ---------- Providers ---------- */
export const PROVIDERS = {
  // Free and without a card: open models on this computer (scripts/alfabe-ses/yerel_tts.py).
  yerel: { keys: [], voices: { de: 'piper:de_DE-thorsten-medium', tr: 'chatterbox:multilingual' }, price: () => ({ free: Infinity, perMillion: 0 }) },
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

/* ---------- Local voices (Piper, Coqui) ---------- */
// German: the Piper voice files. Turkish (Chatterbox) and Whisper are fetched by their own libraries from Hugging Face
// into .tts-modeller/hf (HF_HOME), by --modelleri-indir or on the first run.
export const MODELS = {
  de: { file: 'piper/de_DE-thorsten-medium.onnx',
    urls: ['https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx',
      'https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx.json'] }
};
// Takes per clip for the speech-recognition check ("en iyi N"): letter names 1 (Whisper does not recognise single
// letter names reliably; their reading is fixed by phonemes), words and phrases several.
export const CANDIDATES = { harf: 1, isaret: 3, kelime: 5, cevap: 5, soru: 3, geri: 5, talimat: 5 };
// Speed per kind of clip (Piper/Coqui length_scale: above 1 is slower). Letter names a little slower and clearer;
// the Turkish instructions for children slower and calmer. Spelling pauses are set in the game (js/alfabe-logic.js).
export const LOCAL_SPEED = { harf: 1.2, isaret: 1.1, kelime: 1.05, cevap: 1.12, soru: 1.0, geri: 1.0, talimat: 1.1 };
export const localSpeed = (clip) => (clip.lang === 'tr' ? 1 : LOCAL_SPEED[clip.kind] || 1); // Chatterbox: pace via tone
export const renderKey = (provider, clip, env = {}) => (provider === 'yerel'
  ? `yerel:${PROVIDERS.yerel.voices[clip.lang]}:${localSpeed(clip)}`
  : `${provider}:${voiceFor(provider, clip.lang, env)}`);
export const modelDir = (root, env) => env.ALFABE_MODEL_DIR || path.join(root, '.tts-modeller');
// Environment for the Python helper: models from Hugging Face stay in .tts-modeller/hf (not the user's home folder).
const pyEnv = (root, env) => ({ ...process.env, ...env, HF_HOME: env.HF_HOME || path.join(modelDir(root, env), 'hf'), PYTHONIOENCODING: 'utf-8' });
const asrConfig = (env) => (env.ALFABE_ASR === '0' ? null : { model: env.ALFABE_ASR_MODEL || 'medium' });
export function pythonFor(root, env) {
  if (env.ALFABE_PYTHON) return env.ALFABE_PYTHON;
  for (const p of ['venv/bin/python', 'venv/Scripts/python.exe']) {
    const f = path.join(modelDir(root, env), p);
    if (fs.existsSync(f)) return f;
  }
  return null;
}
export function missingModels(root, env) {
  // Only the Piper files are checked here; the Hugging Face models are fetched by their libraries when needed.
  const dir = modelDir(root, env);
  return Object.entries(MODELS).filter(([, m]) => !fs.existsSync(path.join(dir, m.file))).map(([k]) => k);
}
async function download(url, file, fetchImpl, log) {
  log(`  indiriliyor: ${url.split('/').pop()}`);
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`İndirilemedi (${res.status}): ${url}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}
export async function downloadModels(root, env, { fetchImpl = globalThis.fetch, log = console.log } = {}) {
  const dir = modelDir(root, env);
  for (const [key, m] of Object.entries(MODELS)) {
    if (fs.existsSync(path.join(dir, m.file))) { log(`${key}: var (${m.file})`); continue; }
    for (const url of m.urls) await download(url, path.join(dir, 'piper', url.split('/').pop()), fetchImpl, log);
  }
  const python = pythonFor(root, env);
  if (!python) { log('Python ortamı yok: Türkçe (Chatterbox) ve Whisper modelleri kurulumdan sonra indirilecek.'); return; }
  log('Türkçe (Chatterbox) ve Whisper modelleri indiriliyor (ilk seferde birkaç GB)…');
  const r = spawnSync(python, ['-I', path.join(root, 'scripts/alfabe-ses/yerel_tts.py'), '--indir', asrConfig(env)?.model || ''],
    { env: pyEnv(root, env), stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error('Model indirme başarısız (yerel_tts.py --indir)');
  log(`Modeller hazır: ${dir}`);
}
// Runs scripts/alfabe-ses/yerel_tts.py once for all jobs; calls onDone(result) per clip as soon as it is ready.
export function runLocal(root, env, jobs, onDone) {
  const python = pythonFor(root, env);
  if (!python) return Promise.reject(new Error('Python ortamı yok: önce scripts/alfabe-ses/kur.sh (ya da kur.ps1) çalıştır ya da ALFABE_PYTHON ver.'));
  const dir = modelDir(root, env);
  const input = JSON.stringify({ models: { de: path.join(dir, MODELS.de.file) }, asr: asrConfig(env), jobs });
  return new Promise((resolve, reject) => {
    const child = spawn(python, ['-I', path.join(root, 'scripts/alfabe-ses/yerel_tts.py')], { stdio: ['pipe', 'pipe', 'pipe'], env: pyEnv(root, env) });
    let buf = '', err = '';
    child.stdout.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith('{')) continue;
        let r; try { r = JSON.parse(line); } catch (e) { reject(e); return; }
        if (r.warning) process.stderr.write(r.warning + '\n'); else onDone(r);
      }
    });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`yerel_tts.py çıkış kodu ${code}\n${err.slice(-2000)}`))));
    child.stdin.end(input);
  });
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
  const o = { dryRun: false, force: false, forceOwn: false, index: false, check: false, voices: false, acceptOwn: false, only: null, provider: null, models: false, alternatives: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') o.dryRun = true;
    else if (a === '--force') o.force = true;
    else if (a === '--force-own') o.forceOwn = true;
    else if (a === '--index') o.index = true;
    else if (a === '--check') o.check = true;
    else if (a === '--voices') o.voices = true;
    else if (a === '--accept-own') o.acceptOwn = true;
    else if (a === '--modelleri-indir') o.models = true;
    else if (a === '--alternatifler') o.alternatives = true;
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
  let provider = o.provider || env.ALFABE_TTS_PROVIDER || 'yerel';
  if (provider === 'piper') provider = 'yerel';
  if (!PROVIDERS[provider]) throw new Error(`Bilinmeyen servis: ${provider} (yerel, google, azure, elevenlabs)`);
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
  if (o.models) { await downloadModels(root, env, { fetchImpl, log }); return 0; }
  if (o.alternatives) return alternatives(root, env, clips, { log, force: o.force });

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

  const todo = planGeneration(clips, manifest, { ...o, render: (c) => renderKey(provider, c, env) });
  if (provider === 'yerel') {
    log(`Servis: yerel (ücretsiz) · de=${PROVIDERS.yerel.voices.de}, tr=${PROVIDERS.yerel.voices.tr}`);
    log(`Üretilecek: ${todo.length} klip. Maliyet: 0 $ (bilgisayarında çalışır, hesap ve kart gerekmez).`);
    if (o.dryRun) { for (const c of todo) log(`  ${c.file}  ${c.say || c.text}`); return 0; }
    if (!todo.length) { write(); report(); log('Üretilecek klip yok.'); return 0; }
    if (!hasFfmpeg()) { log('ffmpeg gerekli (docs/alfabe-oyunu.md › Kurulum).'); return 1; }
    const missing = missingModels(root, env);
    if (missing.length) { log(`Model eksik (${missing.join(', ')}): önce node scripts/generate-alfabe-audio.mjs --modelleri-indir`); return 1; }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'alfabe-yerel-'));
    const byId = Object.fromEntries(todo.map((c) => [c.id, c]));
    const jobs = todo.map((c) => ({ id: c.id, lang: c.lang, text: c.say || c.text, out: path.join(tmp, c.id + '.wav'), length_scale: localSpeed(c),
      tone: c.tone, expect: c.expect || c.text, candidates: CANDIDATES[c.kind] || 1 }));
    let made = 0, failed = 0;
    try {
      await runLocal(root, env, jobs, (r) => {
        const clip = byId[r.id];
        if (!r.ok) { failed++; log(`HATA ${r.id}: ${r.error}`); return; }
        const out = path.join(dir, clip.file);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        encodeMp3(fs.readFileSync(path.join(tmp, r.id + '.wav')), 'wav', out);
        const audioBuf = fs.readFileSync(out);
        manifest.clips[clip.id] = { file: clip.file, lang: clip.lang, kind: clip.kind, text: clip.text, say: clip.say, phonemes: r.phonemes || undefined,
          heard: r.heard ?? undefined, score: r.score ?? undefined,
          textHash: textHash(clip), audioHash: sha(audioBuf), bytes: audioBuf.length, source: 'yerel', voice: PROVIDERS.yerel.voices[clip.lang],
          render: renderKey('yerel', clip), generatedAt: new Date().toISOString().slice(0, 10) };
        made++;
        log(`  ${clip.file}  ${kb(audioBuf.length)}  ${clip.say || clip.text}${r.heard != null ? `  (duyulan: ${r.heard}, ${r.score})` : ''}`);
      });
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
      ({ manifest, notes } = indexAudio(dir, clips, manifest));
      write();
    }
    log(`Üretildi: ${made} klip${failed ? `, hata: ${failed}` : ''}.`);
    report();
    return failed ? 1 : 0;
  }
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
      audioHash: sha(audioBuf), bytes: audioBuf.length, source: provider, voice: req.voice, render: renderKey(provider, clip, env2),
      generatedAt: new Date().toISOString().slice(0, 10) };
    made++;
    log(`  ${clip.file}  ${kb(audioBuf.length)}  ${clip.text}`);
  }
  ({ manifest, notes } = indexAudio(dir, clips, manifest));
  write();
  log(`Üretildi: ${made} klip.`);
  report();
  return 0;
}

/* ---------- Letter-name alternatives (tools/audio-alternatifler/, check page only, not published) ---------- */
export const ALT_DIR = 'tools/audio-alternatifler';
export const altFile = (clip, i) => `de/${clip.id}--${i + 1}.mp3`;
async function alternatives(root, env, clips, { log = console.log, force = false } = {}) {
  const dir = path.join(root, ALT_DIR);
  const listFile = path.join(dir, 'liste.json');
  let old = {};
  try { old = Object.fromEntries(JSON.parse(fs.readFileSync(listFile, 'utf8')).harfler.flatMap((h) => h.secenekler.map((s) => [s.file, s]))); } catch (_) {}
  const letters = clips.filter((c) => c.kind === 'harf' && c.alts && c.alts.length);
  const options = letters.flatMap((c) => c.alts.map((text, i) => ({ clip: c, text, file: altFile(c, i), key: sha(JSON.stringify([text, localSpeed(c)]), 12) })));
  const todo = options.filter((o) => force || !old[o.file] || old[o.file].key !== o.key || !fs.existsSync(path.join(dir, o.file)));
  log(`Harf adı alternatifleri: ${options.length} (${letters.length} harf), üretilecek: ${todo.length}.`);
  const result = Object.fromEntries(options.filter((o) => !todo.includes(o)).map((o) => [o.file, old[o.file]]));
  if (todo.length) {
    if (!hasFfmpeg()) { log('ffmpeg gerekli.'); return 1; }
    const missing = missingModels(root, env).filter((k) => k === 'de');
    if (missing.length) { log('Almanca model eksik: önce --modelleri-indir'); return 1; }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'alfabe-alt-'));
    const byName = Object.fromEntries(todo.map((o, i) => ['alt' + i, o]));
    try {
      await runLocal(root, env, todo.map((o, i) => ({ id: 'alt' + i, lang: 'de', text: o.text, out: path.join(tmp, `alt${i}.wav`), length_scale: localSpeed(o.clip) })), (r) => {
        const o = byName[r.id];
        if (!r.ok) { log(`HATA ${o.file}: ${r.error}`); return; }
        const out = path.join(dir, o.file);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        encodeMp3(fs.readFileSync(path.join(tmp, r.id + '.wav')), 'wav', out);
        const bytes = fs.statSync(out).size;
        result[o.file] = { file: o.file, text: o.text, phonemes: r.phonemes, key: o.key, audioHash: sha(fs.readFileSync(out)), bytes };
      });
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  }
  const list = {
    _aciklama: 'Harf adlarının yazım alternatifleri (node scripts/generate-alfabe-audio.mjs --alternatifler). Sadece tools/audio-check.html için; yayına girmez. Seçmek için data/alfabe.json → sesMetni.',
    harfler: letters.map((c) => ({ clip: c.id, text: c.text, ipa: c.ipa, secili: c.say,
      secenekler: c.alts.map((text, i) => result[altFile(c, i)]).filter(Boolean).map((s) => ({ ...s, secili: s.text === c.say })) }))
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(listFile, JSON.stringify(list, null, 2) + '\n');
  for (const lang of fs.readdirSync(dir)) {
    const sub = path.join(dir, lang);
    if (!fs.statSync(sub).isDirectory()) continue;
    for (const f of fs.readdirSync(sub)) if (!result[`${lang}/${f}`]) fs.rmSync(path.join(sub, f));
  }
  const total = Object.values(result).reduce((n, s) => n + (s?.bytes || 0), 0);
  log(`Alternatifler hazır: ${ALT_DIR}/ (${kb(total)}). Dinle: tools/audio-check.html`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  run(process.argv.slice(2)).then((code) => process.exit(code), (error) => { console.error(error.message || error); process.exit(1); });
}
