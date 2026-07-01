$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "=== PDF Converter - Windows Setup ===" -ForegroundColor Cyan

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw "pnpm is required. Install Node.js then: npm install -g pnpm"
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python is required. https://www.python.org/downloads/"
}

Write-Host ""
Write-Host "[1/3] Installing Node dependencies..." -ForegroundColor Yellow
pnpm install

Write-Host ""
Write-Host "[2/3] Setting up Python pdf2docx service..." -ForegroundColor Yellow
$venvPath = Join-Path $Root "services\pdf2docx\.venv"
if (-not (Test-Path $venvPath)) {
    python -m venv $venvPath
}
$pip = Join-Path $venvPath "Scripts\pip.exe"
& $pip install -r (Join-Path $Root "services\pdf2docx\requirements.txt")

Write-Host ""
Write-Host "[3/3] Checking env files..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $Root ".env.local"))) {
    Copy-Item (Join-Path $Root ".env.example") (Join-Path $Root ".env.local")
}

New-Item -ItemType Directory -Force -Path (Join-Path $Root "tmp\conversions") | Out-Null

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Run:  pnpm dev:windows" -ForegroundColor White
Write-Host "Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Without Docker you can use:" -ForegroundColor White
Write-Host "  - PDF merge/split, text/image to PDF, PDF to Word" -ForegroundColor White
Write-Host ""
Write-Host "For Word/Excel/PPT to PDF:" -ForegroundColor White
Write-Host "  - Install LibreOffice, OR" -ForegroundColor White
Write-Host "  - winget install Docker.DockerDesktop" -ForegroundColor White
Write-Host ""
