# youtube-player 폴더를 GitHub에서 받아 생성합니다.
# 사용: PowerShell에서 이 파일 실행
#   cd C:\Users\win11pro\Desktop\project
#   powershell -ExecutionPolicy Bypass -File .\CREATE-YOUTUBE-PLAYER.ps1

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetDir = Join-Path $ProjectRoot 'youtube-player'
$BaseUrl = 'https://raw.githubusercontent.com/eksl3910-star/pdf-converter/main/youtube-player'

$Files = @(
    'index.html',
    'player.css',
    'player.js',
    'README.md',
    'START.bat',
    'test-ad.html',
    'test-ad.mjs',
    '.gitignore'
)

Write-Host ''
Write-Host '=== YouTube Player folder setup ===' -ForegroundColor Cyan
Write-Host "Target: $TargetDir"
Write-Host ''

New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

foreach ($file in $Files) {
    $url = "$BaseUrl/$file"
    $out = Join-Path $TargetDir $file
    Write-Host "Downloading $file ..."
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
}

Write-Host ''
Write-Host 'Done!' -ForegroundColor Green
Write-Host "Folder created: $TargetDir"
Write-Host ''
Write-Host 'Run player:' -ForegroundColor Yellow
Write-Host "  cd `"$TargetDir`""
Write-Host '  .\START.bat'
Write-Host '  -> open http://localhost:8765'
Write-Host ''
