@echo off
title FloodGuard AI - Smart Urban Flooding Management System
color 1F

echo.
echo ================================================================
echo   FloodGuard AI - Smart Urban Flooding Management System
echo   IBM Granite 4-8B Instruct + IBM Watsonx.AI
echo   Ahmedabad and Surat - Urban Infrastructure Challenge
echo ================================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org
    echo Minimum version required: Node.js 16.x
    pause
    exit /b 1
)

echo [OK] Node.js detected: 
node --version

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not available!
    pause
    exit /b 1
)

echo [OK] npm detected:
npm --version
echo.

:: Install Backend dependencies
echo [1/4] Installing Backend dependencies...
cd backend
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend installation failed!
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed successfully
) else (
    echo [OK] Backend node_modules already exists, skipping install
)
cd ..

:: Install Frontend dependencies
echo.
echo [2/4] Installing Frontend dependencies...
cd frontend
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend installation failed!
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed successfully
) else (
    echo [OK] Frontend node_modules already exists, skipping install
)
cd ..

:: Check .env configuration
echo.
echo [3/4] Checking environment configuration...
if not exist backend\.env (
    copy backend\.env-example backend\.env
    echo [WARNING] Created .env from .env-example
    echo [ACTION REQUIRED] Please edit backend\.env and add your IBM Watsonx credentials:
    echo   - WATSONX_API_KEY
    echo   - WATSONX_PROJECT_ID
    echo   - WATSONX_URL
    echo.
    echo Opening .env file for editing...
    notepad backend\.env
    pause
) else (
    echo [OK] .env file found
)

echo.
echo [4/4] Starting application servers...
echo.

:: Start Backend
echo Starting Backend API (Port 5000)...
start "FloodGuard Backend - IBM Granite API" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

:: Start Frontend
echo Starting Frontend React App (Port 3000)...
start "FloodGuard Frontend - React Dashboard" cmd /k "cd frontend && npm start"
timeout /t 5 /nobreak >nul

echo.
echo ================================================================
echo   APPLICATION IS STARTING!
echo   
echo   Backend API:     http://localhost:5000
echo   Frontend UI:     http://localhost:3000
echo   Health Check:    http://localhost:5000/api/health
echo.
echo   6 AI Agents Active:
echo   - Flood Risk Prediction Agent
echo   - Drainage Maintenance Scheduling Agent
echo   - Real-Time Civic Response Coordination Agent
echo   - Citizen Flood Reporting Agent
echo   - Urban Resilience Dashboard Agent
echo   - Post-Disaster Damage Assessment Agent
echo ================================================================
echo.
echo Opening application in browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Application started! Check the opened browser windows.
echo Press any key to exit this launcher...
pause >nul
