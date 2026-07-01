$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$dockerBin = "C:\Program Files\Docker\Docker\resources\bin"
if (Test-Path $dockerBin) {
    $env:Path = "$dockerBin;" + $env:Path
}

Write-Host "=== PDF Converter - Cloudflare Tunnel ===" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop이 실행 중이어야 합니다."
}

$running = docker compose ps --status running --format "{{.Name}}" 2>$null
if ($running -notmatch "pdf-app") {
    Write-Host "Docker 컨테이너 시작 중..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 5
}

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    throw "cloudflared가 필요합니다. winget install Cloudflare.cloudflared"
}

Write-Host ""
Write-Host "공개 URL 생성 중... (잠시만 기다려 주세요)" -ForegroundColor Yellow
Write-Host "종료: Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

cloudflared tunnel --url http://localhost:3000
