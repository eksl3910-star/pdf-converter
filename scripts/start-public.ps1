$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ProjectName = "pdf-converter"
$ComposeFile = "docker-compose.public.yml"
$LocalPort = 13000
$LocalUrl = "http://localhost:$LocalPort"

$dockerBin = "C:\Program Files\Docker\Docker\resources\bin"
if (Test-Path $dockerBin) {
    $env:Path = "$dockerBin;" + $env:Path
}

$cloudflaredDir = Join-Path $Root "tools"
$cloudflaredExe = Join-Path $cloudflaredDir "cloudflared.exe"
$urlFile = Join-Path $Root ".public-url.txt"

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

function Wait-ForApp {
    param([int]$Seconds = 180)

    Write-Host "앱 준비 대기 중 ($LocalUrl)..." -ForegroundColor Yellow
    $deadline = (Get-Date).AddSeconds($Seconds)

    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $LocalUrl -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds 3
        }
    }

    return $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PDF 변환 - 공개 실행 (이 프로젝트 전용)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  로컬:   $LocalUrl" -ForegroundColor White
Write-Host "  포트:   $LocalPort (다른 프로젝트 3000과 분리)" -ForegroundColor DarkGray
Write-Host "  Docker: $ProjectName 컨테이너만 사용" -ForegroundColor DarkGray
Write-Host ""

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop을 먼저 실행해 주세요."
}

Write-Host "[1/2] Docker 시작 (pdf-converter 전용)..." -ForegroundColor Yellow
docker compose -f $ComposeFile -p $ProjectName up -d --build

if (-not (Wait-ForApp)) {
    Write-Host ""
    Write-Host "앱이 아직 준비되지 않았습니다. 로그 확인:" -ForegroundColor Red
    Write-Host "  docker compose -f $ComposeFile -p $ProjectName logs -f" -ForegroundColor White
    throw "시작 시간 초과"
}

Write-Host "[2/2] 공개 URL 생성 중..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  곧 https://....trycloudflare.com 주소가 나옵니다." -ForegroundColor Green
Write-Host "  종료: Ctrl+C  |  완전 중지: STOP.bat" -ForegroundColor DarkGray
Write-Host ""

$bin = Ensure-Cloudflared

& $bin tunnel --url $LocalUrl 2>&1 | ForEach-Object {
    $line = "$_"
    Write-Host $line
    if ($line -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
        Set-Content -Path $urlFile -Value $Matches[1] -Encoding UTF8
    }
}
