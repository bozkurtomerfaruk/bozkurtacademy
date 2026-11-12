# Almanca Alfabe: yerel ses üretimi için bir kez kurulum (Windows, PowerShell). Ücretsiz, hesap ve kart gerekmez.
# Gerekenler: Python 3.10-3.13 (python.org, "Add to PATH" işaretli), Node 20+, ffmpeg (winget install Gyan.FFmpeg).
# Çalıştırma (depo klasöründe): powershell -ExecutionPolicy Bypass -File scripts\alfabe-ses\kur.ps1
# Kurulanlar .tts-modeller\ klasörüne gider (git'e girmez). Sonra üretim tek komut: node scripts\generate-alfabe-audio.mjs
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..\..')
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { throw 'ffmpeg yok: winget install Gyan.FFmpeg (sonra yeni bir PowerShell aç)' }
New-Item -ItemType Directory -Force .tts-modeller | Out-Null
if (-not (Test-Path .tts-modeller\venv\Scripts\python.exe)) { python -m venv .tts-modeller\venv }
.\.tts-modeller\venv\Scripts\python.exe -m pip install --upgrade pip
.\.tts-modeller\venv\Scripts\python.exe -m pip install piper-tts chatterbox-tts faster-whisper "setuptools<81" numpy
node scripts\generate-alfabe-audio.mjs --modelleri-indir
Write-Host 'Kurulum tamam. Sesleri üretmek için: node scripts\generate-alfabe-audio.mjs'
