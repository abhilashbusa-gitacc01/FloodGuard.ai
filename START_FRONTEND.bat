@echo off
title FloodGuard AI - Frontend React App
color 0B

echo.
echo ================================================================
echo   FloodGuard AI - Frontend React Dashboard
echo   Smart Urban Flooding Management UI
echo ================================================================
echo.

cd /d "%~dp0frontend"

if not exist node_modules (
    echo Installing React dependencies (this may take a few minutes)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Installation failed!
        pause
        exit /b 1
    )
)

echo Starting Frontend on http://localhost:3000
echo.
npm start

pause
