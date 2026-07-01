$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$dockerBin = "C:\Program Files\Docker\Docker\resources\bin"
if (Test-Path $dockerBin) {
    $env:Path = "$dockerBin;" + $env:Path
}

Write-Host "=== PDF Converter - 고정 도메인 터널 설정 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "사전 준비:" -ForegroundColor Yellow
Write-Host "  1. Cloudflare 계정"
Write-Host "  2. Cloudflare에 연결된 도메인 (예: example.com)"
Write-Host ""

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    throw "cloudflared 설치: winget install Cloudflare.cloudflared"
}

$hostname = Read-Host "사용할 주소 입력 (예: convert.example.com)"
if (-not $hostname) {
    throw "호스트명을 입력해 주세요."
}

Write-Host ""
Write-Host "1) Cloudflare 로그인..." -ForegroundColor Yellow
cloudflared tunnel login

Write-Host ""
Write-Host "2) 터널 생성..." -ForegroundColor Yellow
cloudflared tunnel create pdf-converter

$configDir = Join-Path $env:USERPROFILE ".cloudflared"
$configPath = Join-Path $Root "cloudflare-tunnel.yml"

$yaml = @"
tunnel: pdf-converter
credentials-file: $configDir\pdf-converter.json

ingress:
  - hostname: $hostname
    service: http://localhost:3000
  - service: http_status:404
"@

Set-Content -Path $configPath -Value $yaml -Encoding UTF8

Write-Host ""
Write-Host "3) DNS 연결..." -ForegroundColor Yellow
cloudflared tunnel route dns pdf-converter $hostname

Write-Host ""
Write-Host "설정 파일: $configPath" -ForegroundColor Green
Write-Host ""
Write-Host "터널 실행:" -ForegroundColor Green
Write-Host "  docker compose up -d" -ForegroundColor White
Write-Host "  cloudflared tunnel --config `"$configPath`" run" -ForegroundColor White
Write-Host ""
Write-Host "접속: https://$hostname" -ForegroundColor Cyan
