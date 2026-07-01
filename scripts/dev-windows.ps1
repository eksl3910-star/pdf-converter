$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Test-PortListening($Port) {
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

Write-Host "=== PDF Converter Start ===" -ForegroundColor Cyan

$venvPython = Join-Path $Root "services\pdf2docx\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "Run setup-windows.ps1 first." -ForegroundColor Red
    & (Join-Path $Root "scripts\setup-windows.ps1")
}

$pdf2docxJob = $null
if (-not (Test-PortListening 8000)) {
    Write-Host "Starting pdf2docx on port 8000..." -ForegroundColor Yellow
    $pdf2docxJob = Start-Job -ScriptBlock {
        param($Root, $Python)
        Set-Location (Join-Path $Root "services\pdf2docx")
        & $Python -m uvicorn main:app --host 127.0.0.1 --port 8000
    } -ArgumentList $Root, $venvPython
    Start-Sleep -Seconds 2
} else {
    Write-Host "pdf2docx already running on port 8000" -ForegroundColor Green
}

if (-not (Test-PortListening 3001)) {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Write-Host "Starting Gotenberg via Docker..." -ForegroundColor Yellow
        docker compose up -d gotenberg 2>$null
    } else {
        Write-Host "Docker not found - Office/HTML to PDF needs LibreOffice or Docker" -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "Next.js dev server: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor DarkGray
Write-Host ""

try {
    pnpm dev
} finally {
    if ($pdf2docxJob) {
        Stop-Job $pdf2docxJob -ErrorAction SilentlyContinue
        Remove-Job $pdf2docxJob -Force -ErrorAction SilentlyContinue
    }
}
