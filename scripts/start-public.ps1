$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$dockerBin = "C:\Program Files\Docker\Docker\resources\bin"
if (Test-Path $dockerBin) {
    $env:Path = "$dockerBin;" + $env:Path
}

$cloudflaredDir = Join-Path $Root "tools"
$cloudflaredExe = Join-Path $cloudflaredDir "cloudflared.exe"

function Ensure-Cloudflared {
    if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
        return (Get-Command cloudflared).Source
    }
    if (Test-Path $cloudflaredExe) {
        return $cloudflaredExe
    }

    Write-Host "cloudflared 다운로드 중..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $cloudflaredDir | Out-Null

    $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    Invoke-WebRequest -Uri $url -OutFile $cloudflaredExe -UseBasicParsing
    return $cloudflaredExe
}

Write-Host ""
Write-Host "=== PDF 변환 사이트 공개 (카드 불필요) ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop을 먼저 실행해 주세요."
}

Write-Host "[1/2] Docker 시작..." -ForegroundColor Yellow
docker compose up -d
Start-Sleep -Seconds 5

$bin = Ensure-Cloudflared

Write-Host "[2/2] Cloudflare 공개 URL 생성..." -ForegroundColor Yellow
Write-Host ""
Write-Host "아래에 https://xxxx.trycloudflare.com 주소가 나옵니다." -ForegroundColor Green
Write-Host "PC를 켜 두는 동안 누구나 접속할 수 있습니다." -ForegroundColor Green
Write-Host "종료: Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

& $bin tunnel --url http://localhost:3000
