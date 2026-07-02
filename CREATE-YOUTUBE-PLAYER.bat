@echo off
cd /d "%~dp0"
echo.
echo Creating youtube-player folder...
powershell -ExecutionPolicy Bypass -File "%~dp0CREATE-YOUTUBE-PLAYER.ps1"
echo.
pause
