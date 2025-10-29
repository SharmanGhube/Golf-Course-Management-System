# Deploying to Vercel (Frontend) + Render (Backend)

This guide walks you through deploying your Golf Course Management System with:
- **Frontend**: Vercel (Next.js optimized platform)
- **Backend**: Render (Go API + MySQL database)

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup on Render](#database-setup-on-render)
3. [Backend Deployment on Render](#backend-deployment-on-render)
4. [Frontend Deployment on Vercel](#frontend-deployment-on-vercel)
5. [Environment Variables](#environment-variables)
6. [Testing the Deployment](#testing-the-deployment)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ **Required Accounts** (all free tier available):
- [GitHub Account](https://github.com) - for code repository
- [Vercel Account](https://vercel.com) - for frontend hosting
- [Render Account](https://render.com) - for backend + database hosting

✅ **Before Starting**:
1. Push your code to a GitHub repository (public or private)
2. Ensure `.gitignore` is in place (already created ✅)
3. Have your secure secrets ready (already generated ✅)

---

## Step 1: Database Setup on Render

### 1.1 Create MySQL Database

1. **Log into Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → Select **"PostgreSQL"** or use external MySQL provider

> ⚠️ **Note**: Render doesn't offer managed MySQL. Choose one option:

**Option A: Use PostgreSQL on Render (Recommended)**
- Free tier available
- Managed service with automatic backups
- Requires minor code changes (GORM supports PostgreSQL)

**Option B: Use External MySQL Provider**
- [PlanetScale](https://planetscale.com/) - Free tier available
- [Railway](https://railway.app/) - MySQL support, free tier
- [AWS RDS](https://aws.amazon.com/rds/) - Paid, production-grade

**Option C: Use Render PostgreSQL (Simple Migration)**

Let me know which option you prefer! For this guide, I'll show **PostgreSQL on Render**:

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `golf-course-db`
   - **Database**: `golf_course`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
3. Click **"Create Database"**
4. **Save the connection details**:
   - Internal Database URL (for backend)
   - External Database URL (for migrations)

### 1.2 Initialize Database Schema

1. **Get the External Database URL** from Render dashboard
2. **Connect and run schema**:

```powershell
# Install PostgreSQL client (if using PostgreSQL)
# Or use Render's web shell

# Copy your init.sql and modify for PostgreSQL if needed
```

**If using PostgreSQL**, I can help convert your MySQL schema. If using external MySQL, use the existing `database/init.sql`.

---

## Step 2: Backend Deployment on Render

### 2.1 Create Web Service

1. **In Render Dashboard** → Click **"New +"** → **"Web Service"**
2. **Connect GitHub Repository**:
   - Authorize Render to access your GitHub
   - Select your repository
3. **Configure Service**:
   - **Name**: `golf-course-backend`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Go`
   - **Build Command**: `go build -o main`
   - **Start Command**: `./main`
   - **Plan**: Free (or paid for production)

### 2.2 Add Environment Variables

In the **"Environment"** section, add these variables:

```bash
# Database Configuration (from Render PostgreSQL)
DB_HOST=your-db.internal.render.com
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=golf_course

# OR if using external MySQL:
# DB_HOST=your-mysql-host.com
# DB_PORT=3306
# DB_USER=your_user
# DB_PASSWORD=your_password
# DB_NAME=golf_course

# Application Settings
PORT=8080
GIN_MODE=release
JWT_SECRET=xSUPjc3VT7bdF/o5.%s*0YuA"$XzH,G-(vO4peJM'qyt+w&6

# CORS (will be updated with Vercel URL)
ALLOWED_ORIGINS=https://your-app.vercel.app

# Database Connection Pool
DB_MAX_IDLE_CONNS=10
DB_MAX_OPEN_CONNS=100
```

### 2.3 Deploy Backend

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install Go dependencies
   - Build your application
   - Deploy and provide a URL like: `https://golf-course-backend.onrender.com`
3. **Save this backend URL** - you'll need it for the frontend!

### 2.4 Verify Backend Health

Once deployed, test the health endpoint:

```bash
curl https://golf-course-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-29T..."
}
```

---

## Step 3: Frontend Deployment on Vercel

### 3.1 Prepare Frontend

No changes needed! Your Next.js config is already perfect with `output: 'standalone'` ✅

### 3.2 Deploy to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..."** → **"Project"**
3. **Import Git Repository**:
   - Connect GitHub if not already connected
   - Select your repository
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 3.3 Add Environment Variables

In the **"Environment Variables"** section:

```bash
# Backend API URL (from Render)
NEXT_PUBLIC_API_URL=https://golf-course-backend.onrender.com/api/v1

# Weather API (optional)
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key_here
```

### 3.4 Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build your Next.js app
   - Deploy to global CDN
   - Provide a URL like: `https://golf-course.vercel.app`
3. **Copy your Vercel URL** - you'll need it for backend CORS!

---

## Step 4: Update Backend CORS

### 4.1 Update Environment Variables on Render

1. Go back to **Render Dashboard** → Your backend service
2. **Environment** tab → Edit `ALLOWED_ORIGINS`:

```bash
ALLOWED_ORIGINS=https://your-actual-app.vercel.app,https://your-actual-app-*.vercel.app
```

**Note**: The `*` pattern allows Vercel preview deployments to work!

3. **Save Changes** - Render will automatically redeploy

### 4.2 Verify CORS

Test from your browser console at your Vercel URL:

```javascript
fetch('https://golf-course-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

Should return health data without CORS errors.

---

## Step 5: Environment Variables Reference

### Backend (Render)

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `DB_HOST` | `dpg-xyz.internal.render.com` | ✅ | Database host |
| `DB_PORT` | `5432` or `3306` | ✅ | Database port |
| `DB_USER` | `golf_user` | ✅ | Database username |
| `DB_PASSWORD` | `IVmGQMguLZFiO5Erls9tWHN2P6phYkcD` | ✅ | Database password |
| `DB_NAME` | `golf_course` | ✅ | Database name |
| `PORT` | `8080` | ✅ | Server port |
| `GIN_MODE` | `release` | ✅ | Production mode |
| `JWT_SECRET` | `xSUPjc3VT7bdF/o5.%s*0YuA"$XzH,G-(vO4peJM'qyt+w&6` | ✅ | JWT signing key |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | ✅ | CORS allowed origins |
| `DB_MAX_IDLE_CONNS` | `10` | ⚪ | Connection pool |
| `DB_MAX_OPEN_CONNS` | `100` | ⚪ | Max connections |

### Frontend (Vercel)

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://golf-course-backend.onrender.com/api/v1` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_WEATHER_API_KEY` | `your_key` | ⚪ | OpenWeather API key |

---

## Step 6: Testing the Deployment

### 6.1 Health Checks

**Backend**:
```bash
curl https://golf-course-backend.onrender.com/health
```

**Frontend**:
Visit `https://your-app.vercel.app` in browser

### 6.2 Test User Flow

1. **Sign Up**: Create a new account
2. **Login**: Authenticate with credentials
3. **Dashboard**: View dashboard data
4. **Book Tee Time**: Test booking functionality
5. **Admin Panel**: Test admin features (if applicable)

### 6.3 Monitor Logs

**Render Backend Logs**:
- Go to your service → **"Logs"** tab
- Monitor for errors or warnings

**Vercel Frontend Logs**:
- Go to your deployment → **"Logs"** tab
- Check for build or runtime errors

---

## Step 7: Custom Domain Setup (Optional)

### 7.1 Frontend Custom Domain (Vercel)

1. **In Vercel Project** → **"Settings"** → **"Domains"**
2. **Add Domain**: `www.yourgolfcourse.com`
3. **Configure DNS** (at your domain registrar):
   ```
   CNAME www -> cname.vercel-dns.com
   ```
4. **Wait for SSL** (automatic via Let's Encrypt)

### 7.2 Backend Custom Domain (Render)

1. **In Render Service** → **"Settings"** → **"Custom Domain"**
2. **Add Domain**: `api.yourgolfcourse.com`
3. **Configure DNS**:
   ```
   CNAME api -> your-service.onrender.com
   ```
4. **Update Frontend Env**:
   ```bash
   NEXT_PUBLIC_API_URL=https://api.yourgolfcourse.com/api/v1
   ```

---

## Step 8: Production Best Practices

### 8.1 Enable Auto-Deploy

✅ **Vercel**: Auto-deploys on git push (enabled by default)
✅ **Render**: Auto-deploys on git push (enable in settings)

### 8.2 Set Up Monitoring

**Render**:
- Built-in metrics available in dashboard
- Consider: [Better Stack](https://betterstack.com/) or [Sentry](https://sentry.io/)

**Vercel**:
- Analytics available in dashboard
- Consider: [Vercel Analytics](https://vercel.com/analytics) (integrated)

### 8.3 Database Backups

**Render PostgreSQL**:
- Automatic daily backups on paid plans
- Manual backups: Use Render dashboard

**External MySQL**:
- Set up automated backups via provider
- Or use the backup scripts provided

### 8.4 Performance Optimization

**Backend**:
- ✅ Connection pooling enabled
- ✅ Rate limiting in place
- ✅ Health checks configured

**Frontend**:
- ✅ Next.js standalone output
- ✅ Vercel global CDN
- Consider: Image optimization, ISR/SSG for static pages

---

## Troubleshooting

### Issue: Backend build fails on Render

**Solution**:
```bash
# Check go.mod version matches Render's Go version
# Render supports Go 1.21+

# In go.mod:
go 1.21
```

### Issue: Database connection timeout

**Solutions**:
1. Use **Internal Database URL** from Render (faster)
2. Check firewall rules
3. Verify connection string format:
   ```
   postgresql://user:password@host:5432/database
   mysql://user:password@host:3306/database
   ```

### Issue: CORS errors in browser

**Solutions**:
1. Update `ALLOWED_ORIGINS` in Render backend
2. Include Vercel preview URLs: `https://*-your-app.vercel.app`
3. Redeploy backend after environment changes

### Issue: Frontend API calls fail

**Solutions**:
1. Check `NEXT_PUBLIC_API_URL` in Vercel
2. Ensure it includes `/api/v1` suffix
3. Verify backend is responding: `curl https://backend-url/health`
4. Check browser console for exact error

### Issue: Slow backend response (Render free tier)

**Expected Behavior**:
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- Subsequent requests are fast

**Solutions**:
1. Upgrade to paid plan ($7/month) for always-on
2. Keep alive with cron job (ping every 10 minutes)
3. Show loading state in frontend

---

## Cost Breakdown

### Free Tier Limits

**Vercel** (Free):
- 100 GB bandwidth/month
- Unlimited API requests
- Automatic SSL
- **Perfect for**: Small to medium traffic sites

**Render** (Free):
- 750 hours/month (enough for 1 service)
- Spins down after 15 min inactivity
- 100 GB bandwidth/month
- **Perfect for**: Development, low-traffic apps

**Render PostgreSQL** (Free):
- 1 GB storage
- 90-day data retention
- **Perfect for**: Development, small datasets

### Upgrade Recommendations

**For Production** (paid tiers):
- **Vercel Pro**: $20/month - More bandwidth, team features
- **Render Starter**: $7/month - Always-on, faster builds
- **Render PostgreSQL**: $7/month - 10 GB storage, better backups

**Total Cost**: ~$14/month for fully managed, always-on production setup

---

## Next Steps

✅ **Immediate**:
1. Deploy database on Render or external provider
2. Deploy backend on Render
3. Deploy frontend on Vercel
4. Update CORS settings
5. Test complete user flow

✅ **Optional** (production):
1. Add custom domains
2. Set up monitoring
3. Configure automated backups
4. Enable auto-deploy on git push
5. Add environment-specific branches (staging, production)

---

## Quick Reference URLs

After deployment, save these:

```bash
# Frontend
Production: https://your-app.vercel.app
Dashboard: https://vercel.com/dashboard

# Backend
Production: https://golf-course-backend.onrender.com
Dashboard: https://dashboard.render.com

# Database
Connection: [saved in Render dashboard]

# Repository
GitHub: https://github.com/your-username/your-repo
```

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Gin (Go) Docs**: https://gin-gonic.com/docs/

---

**Need help?** Check the troubleshooting section or review the deployment logs in each platform's dashboard!
