#!/bin/bash

echo "🚀 CreateHub Deployment Setup"
echo "================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 Setting up environment variables..."
echo "Please get your MongoDB connection string from MongoDB Atlas"
echo "Visit: https://www.mongodb.com/cloud/atlas"
echo ""

# Create .env file for local development
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your MongoDB URI."
fi

echo "🌐 Ready to deploy to Vercel!"
echo ""
echo "Steps to deploy:"
echo "1. Run: vercel login"
echo "2. Run: vercel"
echo "3. Set environment variables in Vercel dashboard:"
echo "   - MONGODB_URI (your MongoDB Atlas connection string)"
echo "   - JWT_SECRET (generate a strong 32+ character secret)"
echo "   - NODE_ENV=production"
echo "   - FRONTEND_URL=https://your-app-name.vercel.app"
echo ""
echo "4. Deploy: vercel --prod"
echo ""
echo "🎯 After deployment:"
echo "- Register at your app URL with:"
echo "  Email: nicholasmbaluka05@gmail.com"
echo "  Password: Nisuchondey2702#"
echo ""
echo "🛡️ Security features enabled:"
echo "- Password encryption (bcrypt, 12 salt rounds)"
echo "- Rate limiting (100 req/15min)"
echo "- Input sanitization"
echo "- JWT authentication"
echo "- Admin protection"
