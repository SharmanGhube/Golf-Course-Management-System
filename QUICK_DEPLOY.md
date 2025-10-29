# Quick Start: Deploy to Vercel + Render

This is a simplified guide to get your Golf Course Management System deployed in **under 30 minutes**.

## Prerequisites

✅ GitHub account  
✅ Vercel account (free)  
✅ Render account (free)  

---

## Step 1: Push to GitHub (5 minutes)

1. **Initialize Git** (if not already done):
```powershell
cd "d:\DBMS Microproject"
git init
git add .
git commit -m "Initial commit - Golf Course Management System"
```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Name: `golf-course-management`
   - Click "Create repository"

3. **Push Code**:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/golf-course-management.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Database on Render (5 minutes)

### Option A: PostgreSQL (Recommended - Free Tier Available)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `golf-course-db`
   - **Database**: `golf_course`
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
4. Click **"Create Database"**
5. **Copy** the "Internal Database URL" (looks like: `postgres://user:pass@dpg-xxx.oregon-postgres.render.com/golf_course`)

### Option B: External MySQL Provider

- **PlanetScale** (Free): https://planetscale.com/
- **Railway** (Free trial): https://railway.app/

---

## Step 3: Deploy Backend on Render (10 minutes)

1. **In Render Dashboard** → Click **"New +"** → **"Web Service"**
2. **Connect Repository**: 
   - Click "Connect account" → GitHub
   - Select your `golf-course-management` repository
3. **Configure**:
   ```
   Name: golf-course-backend
   Region: Oregon (same as database)
   Branch: main
   Root Directory: backend
   Runtime: Go
   Build Command: go build -o main
   Start Command: ./main
   ```
4. **Add Environment Variables**:
   ```bash
   DB_TYPE=postgres
   DB_HOST=dpg-xxx.oregon-postgres.render.com
   DB_PORT=5432
   DB_USER=[from Render DB dashboard]
   DB_PASSWORD=[from Render DB dashboard]
   DB_NAME=golf_course
   PORT=8080
   GIN_MODE=release
   JWT_SECRET=xSUPjc3VT7bdF/o5.%s*0YuA"$XzH,G-(vO4peJM'qyt+w&6
   ALLOWED_ORIGINS=http://localhost:3000
   DB_MAX_IDLE_CONNS=10
   DB_MAX_OPEN_CONNS=100
   ```
   
   **⚠️ Important**: Get `DB_HOST`, `DB_USER`, `DB_PASSWORD` from your Render PostgreSQL dashboard (Internal connection info)

5. Click **"Create Web Service"**
6. **Wait for deployment** (~3-5 minutes)
7. **Copy your backend URL** (e.g., `https://golf-course-backend.onrender.com`)

### Initialize Database Schema

Once backend is deployed:

1. Go to your Render PostgreSQL dashboard
2. Click **"Connect"** → Choose **"External Connection"**
3. Use provided command or connect via tool
4. Run the schema from `database/init-postgres.sql`

**OR use Render's web shell:**
```bash
# In Render PostgreSQL dashboard → Shell tab
\i /path/to/init-postgres.sql
```

---

## Step 4: Deploy Frontend on Vercel (5 minutes)

1. Go to https://vercel.com/new
2. **Import Git Repository**:
   - Connect GitHub
   - Select `golf-course-management`
3. **Configure**:
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```
4. **Add Environment Variables**:
   ```bash
   NEXT_PUBLIC_API_URL=https://golf-course-backend.onrender.com/api/v1
   ```
   
   **Replace** `golf-course-backend.onrender.com` with YOUR actual Render backend URL!

5. Click **"Deploy"**
6. **Wait for deployment** (~2-3 minutes)
7. **Copy your Vercel URL** (e.g., `https://golf-course-xyz.vercel.app`)

---

## Step 5: Update CORS (2 minutes)

1. **Go back to Render** → Your backend service → **Environment** tab
2. **Edit** `ALLOWED_ORIGINS` variable:
   ```bash
   ALLOWED_ORIGINS=https://golf-course-xyz.vercel.app,https://golf-course-xyz-*.vercel.app
   ```
   **Replace** with YOUR actual Vercel URL!

3. Click **"Save Changes"** (Render will auto-redeploy)

---

## Step 6: Test Everything (3 minutes)

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. **Test backend health**: 
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"healthy","database":"connected",...}`

3. **Create an account** on your frontend
4. **Login** and test features

---

## Troubleshooting

### Backend won't connect to database

**Solution**: Make sure you're using the **Internal Database URL** from Render, not External.

Format should be:
```
postgres://user:pass@dpg-xxx.oregon-postgres.render.com/golf_course
```

### CORS errors in browser

**Solution**: 
1. Check `ALLOWED_ORIGINS` in Render backend includes your Vercel URL
2. Make sure you saved and redeployed
3. Clear browser cache

### Frontend can't reach backend

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` in Vercel includes `/api/v1` at the end
2. Test backend directly: `curl https://your-backend.onrender.com/health`
3. Check browser console for exact error

### First load is very slow

**Expected**: Render free tier "spins down" after 15 min of inactivity. First request takes ~30-60 seconds to "wake up". Subsequent requests are fast.

**Solution**: Upgrade to paid tier ($7/month) for always-on service, or keep-alive with cron job.

---

## What You Get (Free Tier)

✅ **Frontend** (Vercel Free):
- Fast global CDN
- Automatic HTTPS
- 100 GB bandwidth/month
- Unlimited API requests

✅ **Backend** (Render Free):
- 750 hours/month
- 100 GB bandwidth/month
- Auto SSL/HTTPS
- Spins down after 15 min (wakes on request)

✅ **Database** (Render PostgreSQL Free):
- 1 GB storage
- Automatic backups (90 days)
- Secure internal networking

**Total Cost**: $0/month 🎉

---

## Upgrade to Production

For a production-ready setup ($14/month):

1. **Render Backend**: Upgrade to Starter ($7/month)
   - Always-on (no spin-down)
   - Faster performance
   
2. **Render PostgreSQL**: Upgrade to Starter ($7/month)
   - 10 GB storage
   - Point-in-time recovery
   - Better backup retention

3. **Vercel**: Free tier is fine unless you need:
   - More bandwidth
   - Team collaboration features
   - Advanced analytics

---

## Next Steps

✅ **Add Custom Domain** (optional):
- Frontend: Vercel dashboard → Settings → Domains
- Backend: Render dashboard → Settings → Custom Domain

✅ **Enable Auto-Deploy**:
- Already enabled! Just `git push` to deploy changes

✅ **Set up Monitoring**:
- Vercel: Built-in analytics
- Render: Built-in metrics + logs

✅ **Add Features**:
- Email notifications (SendGrid, etc.)
- Payment processing (Stripe)
- Advanced analytics

---

## Quick Reference

Save these URLs:

```
Frontend (Vercel): https://your-app.vercel.app
Backend (Render): https://golf-course-backend.onrender.com
GitHub Repo: https://github.com/YOUR_USERNAME/golf-course-management

Admin Login:
Email: admin@golfcourse.com
Password: [Set during first login]
```

---

## Need Help?

Check the full guide: `VERCEL_RENDER_DEPLOYMENT.md`

**Platform Documentation**:
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- PostgreSQL: https://www.postgresql.org/docs/

---

**Deployment Complete! 🎉**

Your Golf Course Management System is now live and accessible worldwide!
