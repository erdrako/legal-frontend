@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-ux-audit.ps1" %*
endlocal
