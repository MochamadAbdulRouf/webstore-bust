@echo off
echo.
echo ╔══════════════════════════════════════════╗
echo ║    🎮 BUST - Development Setup Script    ║
echo ╚══════════════════════════════════════════╝
echo.

echo [1/4] Checking for Docker...
docker --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo ❌ Docker not found. Please install Docker Desktop first.
  echo    Download: https://www.docker.com/products/docker-desktop
  echo.
  echo Alternatively, make sure PostgreSQL is running on localhost:5432
  echo and the database 'bust_db' exists.
  pause
  exit /b 1
)

echo [2/4] Starting PostgreSQL via Docker...
docker-compose up -d postgres
echo ✅ PostgreSQL started at localhost:5432

echo.
echo [3/4] Waiting for database to be ready...
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Running database migration and seed...
cd backend
call npx prisma migrate dev --name init
call npm run db:seed

echo.
echo ✅ Setup complete! Now start the servers:
echo.
echo   Backend:  cd backend ^&^& npm run dev
echo   Frontend: cd frontend ^&^& npm run dev
echo.
pause
