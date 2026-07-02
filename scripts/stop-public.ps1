$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ProjectName = "pdf-converter"
$ComposeFile = "docker-compose.public.yml"

$dockerBin = "C:\Program Files\Docker\Docker\resources\bin"
if (Test-Path $dockerBin) {
    $env:Path = "$dockerBin;" + $env:Path
}

Write-Host ""
Write-Host "PDF 변환 서비스 중지 (pdf-converter 전용)..." -ForegroundColor Yellow

if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker compose -f $ComposeFile -p $ProjectName down 2>$null
}

$urlFile = Join-Path $Root ".public-url.txt"
if (Test-Path $urlFile) {
    Remove-Item $urlFile -Force
}

Write-Host "중지 완료." -ForegroundColor Green
Write-Host "  - Docker: pdf-converter 컨테이너만 종료" -ForegroundColor DarkGray
Write-Host "  - 다른 프로젝트는 영향 없음" -ForegroundColor DarkGray
Write-Host ""
