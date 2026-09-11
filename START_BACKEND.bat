@echo off
title FloodGuard AI - Backend Server
color 0A

echo.
echo ================================================================
echo   FloodGuard AI - Backend API Server
echo   IBM Granite 4-8B Instruct via IBM Watsonx.AI
echo ================================================================
echo.

cd /d "%~dp0backend"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Installation failed!
        pause
        exit /b 1
    )
)

echo Starting Backend API on http://localhost:5000
echo.
npm start

pause
