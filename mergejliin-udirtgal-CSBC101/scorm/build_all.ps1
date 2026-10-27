# CSBC101 — 8 лекцийн SCORM 1.2 багцыг (.zip) үүсгэнэ (Windows PowerShell).
# Ашиглах: scorm хавтаст байж   powershell -ExecutionPolicy Bypass -File build_all.ps1
$ErrorActionPreference = "Stop"
$HERE = Split-Path -Parent $MyInvocation.MyCommand.Path
$OUT  = Join-Path $HERE "dist"
New-Item -ItemType Directory -Force -Path $OUT | Out-Null
Get-ChildItem -Path $OUT -Filter *.zip -ErrorAction SilentlyContinue | Remove-Item -Force

foreach ($n in 1..8) {
  $lesson = Join-Path $HERE "content\lesson$n.js"
  if (-not (Test-Path $lesson)) { Write-Host "АЛГА: $lesson"; continue }
  $tmp = Join-Path $env:TEMP ("scorm_" + [System.Guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  node (Join-Path $HERE "build_scorm.js") $lesson $tmp | Out-Null
  $zip = Join-Path $OUT ("CSBC101_Lekts_{0:D2}_SCORM.zip" -f $n)
  if (Test-Path $zip) { Remove-Item $zip -Force }
  # imsmanifest.xml болон бусад файл zip-ийн ҮНДЭС-д байрлахын тулд агуулгыг (\*) шахна
  Compress-Archive -Path (Join-Path $tmp "*") -DestinationPath $zip -Force
  Remove-Item -Recurse -Force $tmp
  Write-Host ("OK  " + (Split-Path $zip -Leaf))
}
Write-Host "Бэлэн: $OUT"
Get-ChildItem -Path $OUT -Filter *.zip | Select-Object Name, Length
