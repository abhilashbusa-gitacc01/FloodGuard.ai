@echo off
title FloodGuard AI - Install Dependencies
color 0E

echo.
echo ================================================================
echo   FloodGuard AI - Installing All Dependencies
echo ================================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Download from: https://nodejs.org/en/download
    echo Install Node.js LTS version, then run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version

echo.
echo Installing Backend dependencies...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend installation failed!
    pause
    exit /b 1
)
echo [OK] Backend installed!

echo.
echo Installing Frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b 1
)
echo [OK] Frontend installed!

echo.
echo ================================================================
echo   ALL DEPENDENCIES INSTALLED SUCCESSFULLY!
echo.
echo   Next steps:
echo   1. Edit backend\.env and add your IBM Watsonx credentials
echo   2. Double-click START.bat to launch the application
echo ================================================================
echo.
pause
