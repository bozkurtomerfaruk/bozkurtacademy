// scripts/generate-alfabe-audio.mjs birim testleri: istek gövdeleri (Google, Azure, ElevenLabs), sadece eksik/metni
// değişen kliplerin üretilmesi, kendi kayıtların korunması, --check, .env okuma ve ffmpeg ile 48 kbit/sn mono MP3.
// Servise gerçek istek gitmez: fetch taklit edilir, "servis yanıtı" ffmpeg ile üretilen kısa bir WAV'dır.
// Çalıştırma: node --test tests/alfabe-ses.test.mjs (npm run test:alfabe). ffmpeg yoksa ses dosyası testleri atlanır.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  REPO, buildRequest, loadClips, loadEnv, run, textHash, planGeneration, indexAudio, hasFfmpeg, readManifest
} from '../scripts/generate-alfabe-audio.mjs';

const clips = loadClips();
const by = Object.fromEntries(clips.map((c) => [c.id, c]));
const FFMPEG = hasFfmpeg();

// A copy of what the script reads, in a temporary folder.
function tempRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'alfabe-ses-test-'));
  for (const f of ['data/alfabe.json', 'js/alfabe-logic.js']) {
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.copyFileSync(path.join(REPO, f), path.join(root, f));
  }
  fs.mkdirSync(path.join(root, 'docs'));
  return root;
}
function wav(seconds = 0.4) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'alfabe-wav-')), 'a.wav');
  // silence, a tone, silence: the trim must leave the tone.
  spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `anullsrc=r=24000:cl=mono:d=0.3`, '-f', 'lavfi', '-i', `sine=frequency=440:sample_rate=24000:duration=${seconds}`,
    '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono:d=0.3', '-filter_complex', '[0][1][2]concat=n=3:v=0:a=1', '-c:a', 'pcm_s16le', file]);
  return fs.readFileSync(file);
}
function fakeGoogle(calls) {
  const audio = wav();
  return async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), headers: init.headers });
    return new Response(JSON.stringify({ audioContent: audio.toString('base64') }), { status: 200 });
  };
}
const quiet = () => {};

test('istekler: Google SSML + IPA, Azure ses ve ton, ElevenLabs düz metin; anahtar başlıkta', () => {
  const env = { GOOGLE_TTS_API_KEY: 'g-key', AZURE_SPEECH_KEY: 'a-key', AZURE_SPEECH_REGION: 'westeurope', ELEVENLABS_API_KEY: 'e-key', ELEVENLABS_VOICE_DE: 'v-de', ELEVENLABS_VOICE_TR: 'v-tr' };
  const g = buildRequest('google', by['harf-v'], env);
  const gb = JSON.parse(g.init.body);
  assert.equal(gb.input.ssml, '<speak><phoneme alphabet="ipa" ph="faʊ">Vau</phoneme></speak>');
  assert.deepEqual(gb.voice, { languageCode: 'de-DE', name: 'de-DE-Neural2-C' });
  assert.equal(gb.audioConfig.audioEncoding, 'LINEAR16');
  assert.equal(g.init.headers['X-Goog-Api-Key'], 'g-key');
  assert.ok(!g.url.includes('g-key'), 'anahtar adreste değil');
  const tr = JSON.parse(buildRequest('google', by['aferin'], { ...env, ALFABE_VOICE_TR: 'tr-TR-Chirp3-HD-X' }).init.body);
  assert.equal(tr.input.ssml, '<speak><prosody rate="95%" pitch="+2st">Aferin!</prosody></speak>', 'çocuk modu: sıcak ton');
  assert.equal(tr.voice.name, 'tr-TR-Chirp3-HD-X');
  const a = buildRequest('azure', by['richtig'], env);
  assert.equal(a.url, 'https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1');
  assert.match(a.init.body, /<voice name="de-DE-KatjaNeural">Richtig!<\/voice>/);
  assert.equal(a.init.headers['Ocp-Apim-Subscription-Key'], 'a-key');
  const e = buildRequest('elevenlabs', by['harf-q'], env);
  assert.equal(JSON.parse(e.init.body).text, 'Kuh');
  assert.match(e.url, /text-to-speech\/v-de\?output_format=pcm_24000/);
  assert.equal(buildRequest('google', by['harf-v'], env, { pcm: false }).format, 'mp3');
});

test('.env okunur ama ortamdaki değer önceliklidir; .env depoya girmez', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'alfabe-env-'));
  fs.writeFileSync(path.join(dir, '.env'), '# yorum\nGOOGLE_TTS_API_KEY="dosyadan"\nALFABE_VOICE_DE=de-DE-Test\n');
  const env = loadEnv(path.join(dir, '.env'), { ALFABE_VOICE_DE: 'ortamdan' });
  assert.equal(env.GOOGLE_TTS_API_KEY, 'dosyadan');
  assert.equal(env.ALFABE_VOICE_DE, 'ortamdan');
  assert.match(fs.readFileSync(path.join(REPO, '.gitignore'), 'utf8'), /^\.env$/m);
});

test('plan: eksik ve metni değişen üretilir, kendi kaydın korunur', () => {
  const m = { clips: {
    'harf-a': { textHash: textHash(by['harf-a']), source: 'google' },
    'harf-b': { textHash: 'eski', source: 'google' },
    'harf-c': { textHash: 'eski', source: 'kendi' }
  } };
  const ids = planGeneration(clips, m).map((c) => c.id);
  assert.ok(!ids.includes('harf-a') && ids.includes('harf-b') && !ids.includes('harf-c') && ids.includes('harf-d'));
  assert.deepEqual(planGeneration(clips, m, { only: ['harf-a', 'harf-b'] }).map((c) => c.id), ['harf-b']);
  assert.ok(planGeneration(clips, m, { force: true }).some((c) => c.id === 'harf-a'));
  assert.ok(!planGeneration(clips, m, { force: true }).some((c) => c.id === 'harf-c'));
});

test('anahtarsız: --dry-run maliyeti gösterir, gerçek üretim anahtar ister; servise istek gitmez', async () => {
  const root = tempRepo();
  const lines = [], calls = [];
  assert.equal(await run(['--dry-run'], { root, env: {}, fetchImpl: fakeGoogle(calls), log: (l) => lines.push(l) }), 0);
  assert.ok(lines.some((l) => /125 klip/.test(l)) && lines.some((l) => /0 \$/.test(l)));
  assert.equal(await run([], { root, env: {}, fetchImpl: fakeGoogle(calls), log: (l) => lines.push(l) }), 1);
  assert.ok(lines.some((l) => /Anahtar eksik: GOOGLE_TTS_API_KEY/.test(l)));
  assert.equal(calls.length, 0);
});

test('üretim: 48 kbit/sn mono MP3, liste ve tablo; ikinci çalıştırmada bir şey üretilmez; metin değişince sadece o', { skip: !FFMPEG && 'ffmpeg yok' }, async () => {
  const root = tempRepo();
  const calls = [];
  const env = { GOOGLE_TTS_API_KEY: 'test' };
  const only = ['harf-v', 'kelime-der-vogel', 'aferin'];
  assert.equal(await run(['--only', only.join(',')], { root, env, fetchImpl: fakeGoogle(calls), log: quiet }), 0);
  assert.equal(calls.length, 3);
  const file = path.join(root, 'audio/alfabe/de/harf-v.mp3');
  const probe = JSON.parse(spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8' }).stdout);
  assert.equal(probe.streams[0].codec_name, 'mp3');
  assert.equal(probe.streams[0].channels, 1);
  assert.ok(Math.abs(Number(probe.streams[0].bit_rate) - 48000) <= 8000, `bit hızı ${probe.streams[0].bit_rate}`);
  assert.ok(Number(probe.format.duration) < 0.75, `sessizlik kırpıldı (${probe.format.duration} sn)`);
  const m = readManifest(path.join(root, 'audio/alfabe'));
  assert.deepEqual(Object.keys(m.clips).sort(), [...only].sort());
  assert.equal(m.clips['harf-v'].source, 'google');
  assert.equal(m.clips['harf-v'].voice, 'de-DE-Neural2-C');
  assert.match(m.clips['harf-v'].audioHash, /^[0-9a-f]{12}$/);
  const table = fs.readFileSync(path.join(root, 'docs/alfabe-ses-listesi.md'), 'utf8');
  assert.match(table, /`de\/harf-v\.mp3` \| de \| Harf adı \| Vau \| \/faʊ\/ \| üretildi \(google\)/);
  assert.equal(await run(['--check'], { root, env: {}, log: quiet }), 0);

  // Again: nothing to do.
  calls.length = 0;
  assert.equal(await run(['--only', only.join(',')], { root, env, fetchImpl: fakeGoogle(calls), log: quiet }), 0);
  assert.equal(calls.length, 0);

  // A text changes: that clip is stale (not played) until it is generated again; the others stay.
  const dataFile = path.join(root, 'data/alfabe.json');
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  data.seslendirme.tr.aferin = 'Aferin sana!';
  fs.writeFileSync(dataFile, JSON.stringify(data));
  assert.equal(await run(['--check'], { root, env: {}, log: quiet }), 1, '--check: liste güncel değil');
  assert.equal(await run(['--index'], { root, env: {}, log: quiet }), 0);
  assert.equal(readManifest(path.join(root, 'audio/alfabe')).clips.aferin.stale, true);
  assert.equal(await run(['--only', only.join(',')], { root, env, fetchImpl: fakeGoogle(calls), log: quiet }), 0);
  assert.deepEqual(calls.map((c) => c.body.input.ssml), ['<speak><prosody rate="95%" pitch="+2st">Aferin sana!</prosody></speak>']);
  assert.equal(readManifest(path.join(root, 'audio/alfabe')).clips.aferin.stale, undefined);
});

test('kendi kaydın: aynı adla konan dosya --index ile listeye girer ve üzerine yazılmaz; yanlış ad --check ile yakalanır', { skip: !FFMPEG && 'ffmpeg yok' }, async () => {
  const root = tempRepo();
  const calls = [];
  const env = { GOOGLE_TTS_API_KEY: 'test' };
  const dir = path.join(root, 'audio/alfabe');
  fs.mkdirSync(path.join(dir, 'de'), { recursive: true });
  // An own recording for "Vau", made with ffmpeg (any MP3 works).
  spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=300:duration=0.5', '-ac', '1', '-b:a', '64k', path.join(dir, 'de/harf-v.mp3')]);
  const own = fs.readFileSync(path.join(dir, 'de/harf-v.mp3'));
  assert.equal(await run(['--check'], { root, env: {}, log: quiet }), 1, 'listeye eklenmeden --check geçmez');
  const lines = [];
  assert.equal(await run(['--index'], { root, env: {}, log: (l) => lines.push(l) }), 0);
  assert.ok(lines.some((l) => /Kendi kaydın olarak eklendi: harf-v/.test(l)));
  const m = readManifest(dir);
  assert.equal(m.clips['harf-v'].source, 'kendi');
  assert.equal(await run(['--check'], { root, env: {}, log: quiet }), 0);
  assert.equal(await run(['--only', 'harf-v,harf-w', '--force'], { root, env, fetchImpl: fakeGoogle(calls), log: quiet }), 0);
  assert.deepEqual(calls.length, 1, 'sadece harf-w üretildi');
  assert.deepEqual(fs.readFileSync(path.join(dir, 'de/harf-v.mp3')), own, 'kendi kaydın değişmedi');
  // Replacing a generated file with an own recording later works the same way.
  fs.copyFileSync(path.join(dir, 'de/harf-v.mp3'), path.join(dir, 'de/harf-w.mp3'));
  await run(['--index'], { root, env: {}, log: quiet });
  assert.equal(readManifest(dir).clips['harf-w'].source, 'kendi');
  // A file with a wrong name is reported.
  fs.copyFileSync(path.join(dir, 'de/harf-v.mp3'), path.join(dir, 'de/harf-vau.mp3'));
  const out = [];
  assert.equal(await run(['--check'], { root, env: {}, log: (l) => out.push(l) }), 1);
  assert.ok(out.some((l) => /listede olmayan dosya: de\/harf-vau\.mp3/.test(l)));
  // Own recording whose text changed: not played until --accept-own.
  const res = indexAudio(dir, clips.map((c) => (c.id === 'harf-v' ? { ...c, ssml: c.ssml + '!' } : c)), readManifest(dir));
  assert.equal(res.manifest.clips['harf-v'].stale, true);
  const accepted = indexAudio(dir, clips.map((c) => (c.id === 'harf-v' ? { ...c, ssml: c.ssml + '!' } : c)), readManifest(dir), { acceptOwn: true });
  assert.equal(accepted.manifest.clips['harf-v'].stale, undefined);
});

test('depodaki liste ve tablo güncel (--check, CI)', async () => {
  assert.equal(await run(['--check'], { env: {}, log: quiet }), 0);
});
