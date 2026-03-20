@echo off
echo Setting up CreateHub with MongoDB Atlas...
echo.
echo 1. Go to https://cloud.mongodb.com
echo 2. Create free account or sign in
echo 3. Click "Build a Database"
echo 4. Choose "M0 Sandbox" (FREE)
echo 5. Select a cloud provider (AWS, GCP, or Azure)
echo 6. Choose a region close to you
echo 7. Click "Create Cluster"
echo.
echo 8. Add Database User:
echo    - Username: createhub
echo    - Password: CreateHub123! (or your own)
echo.
echo 9. Add IP Address:
echo    - Click "Add IP Address"
echo    - Choose "Allow Access from Anywhere" (0.0.0.0/0)
echo.
echo 10. Get Connection String:
echo     - Click "Connect"
echo     - Choose "Connect your application"
echo     - Copy the connection string
echo.
echo 11. Replace password in connection string with your password
echo.
pause
