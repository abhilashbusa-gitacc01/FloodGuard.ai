@echo off
title FloodGuard AI - Create Public URL (ngrok)
color 0D

echo.
echo ================================================================
echo   FloodGuard AI - Create Public URL via ngrok
echo ================================================================
echo.

:: Check if ngrok is available
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] ngrok not found. Attempting to download...
    echo.
    echo Please install ngrok manually:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Extract ngrok.exe to this folder OR add to PATH
    echo 3. Sign up at https://ngrok.com and get your authtoken
    echo 4. Run: ngrok config add-authtoken YOUR_TOKEN
    echo 5. Run this script again
    echo.
    
    :: Try using winget
    winget install ngrok.ngrok >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] ngrok installed via winget
    ) else (
        echo [WARNING] Could not auto-install ngrok.
        echo Please install manually from https://ngrok.com/download
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Make sure FloodGuard AI is running first (START.bat)
echo [INFO] This will create a public URL for your backend API (port 5000)
echo.

:: Ask what to expose
echo What would you like to expose publicly?
echo [1] Backend API only (port 5000) - for API access
echo [2] Frontend UI only (port 3000) - for browser access  
echo [3] Both (opens two ngrok tunnels)
echo.
set /p choice="Enter choice (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo Starting ngrok tunnel for Backend API (port 5000)...
    start "ngrok - Backend" ngrok http 5000 --log=stdout
    timeout /t 3 /nobreak >nul
    echo.
    echo [OK] Public URL created for Backend!
    echo Check the ngrok window for your public URL
)

if "%choice%"=="2" (
    echo.
    echo Starting ngrok tunnel for Frontend UI (port 3000)...
    start "ngrok - Frontend" ngrok http 3000 --log=stdout
    timeout /t 3 /nobreak >nul
    echo.
    echo [OK] Public URL created for Frontend!
    echo Check the ngrok window for your public URL
)

if "%choice%"=="3" (
    echo.
    echo Starting ngrok tunnels for both ports...
    start "ngrok - Backend" ngrok http 5000 --log=stdout
    timeout /t 2 /nobreak >nul
    start "ngrok - Frontend" ngrok http 3000 --log=stdout
    timeout /t 3 /nobreak >nul
    echo.
    echo [OK] Public URLs created!
    echo Check the ngrok windows for your public URLs
    echo Also visit: http://127.0.0.1:4040 for ngrok dashboard
)

echo.
echo ================================================================
echo   NGROK TUNNEL ACTIVE
echo   Visit http://127.0.0.1:4040 to see your public URL
echo   Share the ngrok URL with others to access your system
echo ================================================================
echo.
pause
