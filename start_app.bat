@echo off
title MyMenuEG - Unified Server
echo ==========================================
echo    Starting MyMenuEG Development Environment
echo ==========================================
echo.
echo [1/2] Checking dependencies...
if not exist node_modules (
    echo.
    echo Node modules not found. Installing...
    call npm install
)
echo.
echo [2/2] Launching Server and Frontend...
npm run dev:all
pause
