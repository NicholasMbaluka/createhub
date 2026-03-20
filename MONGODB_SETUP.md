# MongoDB Setup for CreateHub

## Quick Setup Options:

### Option 1: MongoDB Atlas (Recommended for Production)
1. Go to https://cloud.mongodb.com
2. Create free account
3. Build a free M0 cluster
4. Get connection string
5. Add to environment variables

### Option 2: Local MongoDB (Development)
```bash
# Windows
# Download and install MongoDB Community Server from mongodb.com

# Mac
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Environment Variables Required:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/createhub?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=development
PORT=8081
FRONTEND_URL=http://localhost:8081
RESEND_API_KEY=your_resend_api_key
```

### Verify Setup:
```bash
# Test connection
mongosh "mongodb://localhost:27017/createhub"

# Start the app
cd backend && npm start
```

The app will NOT start without MongoDB connection - this is intentional for real-time functionality.
