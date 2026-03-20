@echo off
echo ========================================
echo   CreateHub Setup - Real-Time App
echo ========================================
echo.

echo Step 1: MongoDB Atlas Setup
echo ----------------------------
echo 1. Double-click setup-mongodb.bat for guided setup
echo 2. Or go to https://cloud.mongodb.com
echo.
pause

echo Step 2: Create Environment File
echo --------------------------------
echo Creating .env file in backend directory...
echo.

if not exist "backend\.env" (
    copy .env.example backend\.env
    echo ✅ Created backend\.env from template
) else (
    echo ⚠️  backend\.env already exists
)

echo.
echo Step 3: Configure Environment Variables
echo ----------------------------------------
echo Edit backend\.env and update:
echo - MONGODB_URI (from MongoDB Atlas)
echo - JWT_SECRET (create a strong secret)
echo - PORT=8081
echo - FRONTEND_URL=http://localhost:8081
echo.
pause

echo Step 4: Install Dependencies
echo ----------------------------
cd backend
npm install
cd ..
echo ✅ Dependencies installed
echo.

echo Step 5: Start the Application
echo ------------------------------
echo Starting CreateHub on http://localhost:8081
echo.
cd backend
npm start

pause
