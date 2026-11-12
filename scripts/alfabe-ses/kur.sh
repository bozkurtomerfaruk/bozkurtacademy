#!/usr/bin/env bash
# Almanca Alfabe: yerel ses üretimi için bir kez kurulum (Linux ve macOS). Ücretsiz, hesap ve kart gerekmez.
# Gerekenler: Python 3.10–3.13, Node 20+, ffmpeg (macOS: brew install ffmpeg; Debian/Ubuntu: sudo apt install ffmpeg).
# Kurulanlar .tts-modeller/ klasörüne gider (git'e girmez): Python ortamı, Piper (Almanca), Chatterbox (Türkçe) ve faster-whisper (kalite kontrolü), modeller.
# Sonra üretim tek komut: node scripts/generate-alfabe-audio.mjs
set -euo pipefail
cd "$(dirname "$0")/../.."
PY="${PYTHON:-python3}"
command -v ffmpeg >/dev/null || { echo "ffmpeg yok: macOS'ta 'brew install ffmpeg', Ubuntu'da 'sudo apt install ffmpeg'"; exit 1; }
mkdir -p .tts-modeller
[ -x .tts-modeller/venv/bin/python ] || "$PY" -m venv .tts-modeller/venv
.tts-modeller/venv/bin/python -m pip install --upgrade pip
# piper-tts: Almanca. chatterbox-tts: Türkçe (PyTorch ile gelir). faster-whisper: makine kulağı.
# setuptools<81: Chatterbox'ın ses filigranı (resemble-perth) pkg_resources ister.
.tts-modeller/venv/bin/python -m pip install piper-tts chatterbox-tts faster-whisper "setuptools<81" numpy
node scripts/generate-alfabe-audio.mjs --modelleri-indir
echo "Kurulum tamam. Sesleri üretmek için: node scripts/generate-alfabe-audio.mjs"
