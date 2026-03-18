# CreateHub Railway Deployment Guide

## 🚀 Deploy to Railway

Your CreateHub application has been configured for Railway deployment.

### ✅ Railway Configuration Ready:

- **railway.json**: Optimized Railway configuration with health checks
- **Procfile**: Railway-compatible deployment script
- **Environment Variables**: Pre-configured for Railway

### 📋 Deployment Steps:

#### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Railway deployment"
git push origin main
```

#### 2. Set up Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your CreateHub repository
4. Railway will automatically detect and deploy

#### 3. Configure Environment Variables
In your Railway project dashboard, go to **Variables** tab and add:

**Required Variables:**
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app-name.up.railway.app
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/createhub?retryWrites=true&w=majority
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@your-domain.com
```

**Optional (for payments):**
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Security:**
```
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 4. Update FRONTEND_URL
After Railway deploys, update `FRONTEND_URL` with your actual Railway URL:
`https://your-app-name.up.railway.app`

#### 5. Redeploy
After setting environment variables, Railway will automatically redeploy.

### 🔧 Railway Features Configured:

- **Health Checks**: `/api/health` endpoint monitored
- **Auto-restart**: On failure with 10 retry attempts
- **Build Optimization**: Nixpacks builder for Node.js
- **Static Files**: Frontend served from `/frontend/public`

### 📊 Monitoring:

- **Health Endpoint**: `https://your-app.up.railway.app/api/health`
- **Logs**: View in Railway dashboard
- **Metrics**: Built-in Railway monitoring

### 🌐 Access Your App:

After deployment, your app will be available at:
`https://your-app-name.up.railway.app`

### 🛠️ Troubleshooting:

**Build Issues:**
- Check Railway build logs
- Ensure all dependencies are in package.json

**Runtime Issues:**
- Verify environment variables in Railway dashboard
- Check health endpoint response

**Database Issues:**
- Verify MONGODB_URI is correct
- Ensure MongoDB Atlas allows Railway IP

### 🎉 Success!

Your CreateHub is now running on Railway with:
- ✅ Automatic HTTPS
- ✅ Health monitoring
- ✅ Auto-restart on failure
- ✅ Production-ready security

---

**🚀 Ready to scale your creator economy platform!**
