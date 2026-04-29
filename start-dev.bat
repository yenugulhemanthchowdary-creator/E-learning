@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"

echo Starting EduAI development environment...
echo.

where py >nul 2>nul
if errorlevel 1 (
  echo Python launcher ^(`py`^) was not found. Install Python first.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Node.js / npm was not found. Install Node.js first.
  pause
  exit /b 1
)

if not exist "%BACKEND_DIR%\.env" (
  copy /Y "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
)

if not exist "%FRONTEND_DIR%\.env.local" (
  copy /Y "%FRONTEND_DIR%\.env.example" "%FRONTEND_DIR%\.env.local" >nul
)

if not exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
  echo Creating backend virtual environment...
  py -m venv "%BACKEND_DIR%\.venv"
  if errorlevel 1 (
    echo Failed to create backend virtual environment.
    pause
    exit /b 1
  )
)

echo Installing backend dependencies...
pushd "%BACKEND_DIR%"
call .venv\Scripts\activate
"%BACKEND_DIR%\.venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 (
  popd
  echo.
  echo Backend dependency installation failed.
  echo Fix the backend error above, then run start-dev.bat again.
  pause
  exit /b 1
)
popd

if not exist "%FRONTEND_DIR%\node_modules" (
  echo Installing frontend dependencies...
  pushd "%FRONTEND_DIR%"
  npm.cmd install
  if errorlevel 1 (
    popd
    echo.
    echo Frontend dependency installation failed.
    pause
    exit /b 1
  )
  popd
)

netstat -ano | findstr ":8000" | findstr "LISTENING" >nul
if errorlevel 1 (
  start "EduAI Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && call .venv\Scripts\activate && python -m uvicorn app.main:app --reload --port 8000"
) else (
  echo Backend already running on port 8000. Skipping new backend launch.
)

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if errorlevel 1 (
  start "EduAI Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm.cmd run dev"
) else (
  echo Frontend already running on port 5173. Skipping new frontend launch.
)

echo.
echo Backend and frontend windows have been opened.
echo Wait until the backend shows Uvicorn running on port 8000.
echo Then open http://localhost:5173 in your browser.
