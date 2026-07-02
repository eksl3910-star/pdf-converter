@echo off
cd /d "%~dp0"
echo YouTube Player - http://localhost:8765
python -m http.server 8765
