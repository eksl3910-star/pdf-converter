$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

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
Write-Host "  PDF Converter - Public (pdf-converter only)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Local:  $LocalUrl" -ForegroundColor White
Write-Host "  Port:   $LocalPort (not 3000)" -ForegroundColor DarkGray
Write-Host ""

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop을 먼저 실행해 주세요."
}

Write-Host "[1/2] Docker start..." -ForegroundColor Yellow
docker compose -f $ComposeFile -p $ProjectName up -d --build

if (-not (Wait-ForApp)) {
    Write-Host ""
    Write-Host "App not ready. Check logs:" -ForegroundColor Red
    Write-Host "  docker compose -f $ComposeFile -p $ProjectName logs -f" -ForegroundColor White
    throw "Timeout"
}

Write-Host "[2/2] Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Public URL: https://....trycloudflare.com (below)" -ForegroundColor Green
Write-Host "  Local URL:  $LocalUrl" -ForegroundColor Green
Write-Host "  Stop tunnel: Ctrl+C  |  Stop all: STOP.bat" -ForegroundColor DarkGray
Write-Host ""

$bin = Ensure-Cloudflared

# cloudflared logs to stderr; Stop treats that as fatal without this
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"

try {
    & $bin tunnel --url $LocalUrl 2>&1 | ForEach-Object {
        if ($_ -is [System.Management.Automation.ErrorRecord]) {
            $line = $_.ToString()
        } else {
            $line = "$_"
        }

        Write-Host $line

        if ($line -match "(https://[^\s]+\.trycloudflare\.com)") {
            $publicUrl = $Matches[1]
            Set-Content -Path $urlFile -Value $publicUrl -Encoding UTF8
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  PUBLIC URL: $publicUrl" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
        }
    }
} finally {
    $ErrorActionPreference = $prevEap
}
