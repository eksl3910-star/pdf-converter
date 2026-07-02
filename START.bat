@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  PDF 변환 사이트 실행
echo  - Docker Desktop이 켜져 있어야 합니다
echo  - 종료: 이 창에서 Ctrl+C
echo  - 완전 중지: STOP.bat
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-public.ps1"

if errorlevel 1 (
    echo.
    echo  Tunnel failed. Docker may still be running.
    echo  Try local: http://localhost:13000
    echo  Or run START.bat again.
    pause
)
