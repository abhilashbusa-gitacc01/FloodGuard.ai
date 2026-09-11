@echo off
title FloodGuard AI - Stop All Services
color 0C

echo.
echo ================================================================
echo   Stopping FloodGuard AI Services...
echo ================================================================
echo.

:: Kill processes on port 5000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill processes on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [OK] All FloodGuard AI services stopped.
echo.
pause
