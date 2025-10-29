# 🚀 DEPLOYMENT QUICK REFERENCE

## Your Deployment Setup: Vercel + Render

```
┌─────────────────────────────────────────────────────┐
│              DEPLOYMENT ARCHITECTURE                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (Next.js)                                 │
│  ├─ Platform: Vercel                                │
│  ├─ Cost: FREE                                      │
│  ├─ Deploy Time: 2-3 minutes                        │
│  └─ URL: https://your-app.vercel.app               │
│                                                     │
│  Backend (Go/Gin)                                   │
│  ├─ Platform: Render                                │
│  ├─ Cost: FREE (or $7/mo for always-on)             │
│  ├─ Deploy Time: 3-5 minutes                        │
│  └─ URL: https://your-backend.onrender.com         │
│                                                     │
│  Database                                           │
│  ├─ Platform: Render PostgreSQL (recommended)       │
│  ├─ Alternative: PlanetScale MySQL, Railway         │
│  ├─ Cost: FREE (or $7/mo for 10GB)                  │
│  └─ Setup Time: 5 minutes                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Files You Need

### Deployment Guides
| File | Purpose | When to Use |
|------|---------|-------------|
| `QUICK_DEPLOY.md` | Fast deployment (30 min) | **START HERE** |
| `VERCEL_RENDER_DEPLOYMENT.md` | Comprehensive guide | Detailed reference |
| `DATABASE_CHOICE_GUIDE.md` | Choose database | Help decide PostgreSQL vs MySQL |
| `DEPLOYMENT_SUMMARY.md` | Overview & checklist | Before starting |

### Configuration Files
| File | Purpose | Auto-Used By |
|------|---------|--------------|
| `vercel.json` | Vercel config | Vercel (auto-detected) |
| `render.yaml` | Render blueprint | Render (optional, for IaC) |
| `database/init-postgres.sql` | PostgreSQL schema | You (run manually) |
| `database/init.sql` | MySQL schema | You (if using MySQL) |

---

## ⚡ 30-Minute Deployment

### Prerequisites (5 min)
```powershell
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Create accounts (if not done)
# - GitHub: ✅
# - Vercel: https://vercel.com/signup
# - Render: https://render.com/signup
```

### Deploy Database (5 min)
1. Render Dashboard → New PostgreSQL
2. Copy internal connection URL
3. Save credentials

### Deploy Backend (10 min)
1. Render Dashboard → New Web Service
2. Connect GitHub repo
3. Configure: `backend` directory, Go runtime
4. Add environment variables (see below)
5. Deploy!

### Deploy Frontend (5 min)
1. Vercel Dashboard → Import Project
2. Connect GitHub repo
3. Configure: `frontend` directory
4. Add `NEXT_PUBLIC_API_URL` variable
5. Deploy!

### Update CORS (2 min)
1. Render Backend → Environment
2. Set `ALLOWED_ORIGINS` to Vercel URL
3. Save (auto-redeploys)

### Test (3 min)
1. Visit Vercel URL
2. Create account
3. Login
4. Test features

---

## 🔑 Environment Variables Cheatsheet

### Backend (Render) - Copy/Paste Ready

```bash
# Database (PostgreSQL)
DB_TYPE=postgres
DB_HOST=dpg-xxx.oregon-postgres.render.com
DB_PORT=5432
DB_USER=golf_user
DB_PASSWORD=GET_FROM_RENDER_DASHBOARD
DB_NAME=golf_course

# App Settings
PORT=8080
GIN_MODE=release
JWT_SECRET=xSUPjc3VT7bdF/o5.%s*0YuA"$XzH,G-(vO4peJM'qyt+w&6

# CORS (update with YOUR Vercel URL)
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app

# Connection Pool
DB_MAX_IDLE_CONNS=10
DB_MAX_OPEN_CONNS=100
```

### Frontend (Vercel) - Copy/Paste Ready

```bash
# API URL (update with YOUR Render backend URL)
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1

# Weather API (optional)
NEXT_PUBLIC_WEATHER_API_KEY=your_key_here
```

---

## 🎯 Post-Deployment Checklist

### Immediate Testing
- [ ] Visit frontend URL - loads correctly
- [ ] Create new user account - works
- [ ] Login with credentials - succeeds
- [ ] View dashboard - data displays
- [ ] Book tee time - booking works
- [ ] Check admin panel - accessible (if admin)

### Verify Backend
- [ ] Health check: `curl https://backend-url/health`
- [ ] Response: `{"status":"healthy","database":"connected"}`
- [ ] No CORS errors in browser console
- [ ] API calls return data

### Check Logs
- [ ] Render Backend → Logs tab → No errors
- [ ] Vercel Frontend → Logs tab → Build successful
- [ ] Database → Connected, queries working

---

## 🐛 Common Issues & Fast Fixes

### Issue: CORS Error
```
Fix: Update ALLOWED_ORIGINS in Render backend
Include: https://your-app.vercel.app,https://your-app-*.vercel.app
```

### Issue: Database Connection Failed
```
Fix: Use INTERNAL database URL, not external
Check: DB_HOST should be dpg-xxx.oregon-postgres.render.com
Verify: DB_TYPE=postgres is set
```

### Issue: Backend Build Failed
```
Fix: Check go.mod has go 1.21 (Render supports 1.21+)
Verify: All dependencies installed (go mod tidy)
```

### Issue: Frontend Can't Reach Backend
```
Fix: Check NEXT_PUBLIC_API_URL includes /api/v1
Test: curl https://backend-url/health
Verify: Backend is deployed and running
```

### Issue: Backend Slow/Timeout
```
Expected: Render free tier spins down after 15 min
First request: 30-60 seconds (cold start)
Fix: Upgrade to $7/month for always-on
```

---

## 💰 Cost Calculator

### Development/Testing (FREE)
```
Vercel Frontend:    $0/month
Render Backend:     $0/month (spins down after 15 min)
Render PostgreSQL:  $0/month (1 GB storage)
────────────────────────────
TOTAL:              $0/month
```

### Production (RECOMMENDED)
```
Vercel Frontend:    $0/month (free tier sufficient)
Render Backend:     $7/month (always-on, no spin-down)
Render PostgreSQL:  $7/month (10 GB, better backups)
────────────────────────────
TOTAL:              $14/month
```

### High Traffic (SCALE)
```
Vercel Pro:         $20/month (more bandwidth)
Render Backend:     $7/month (or scale to $25/month)
Render PostgreSQL:  $15/month (50 GB, high availability)
────────────────────────────
TOTAL:              $42-58/month
```

---

## 📊 Feature Comparison

| Feature | Free Tier | Paid Tier ($14/mo) |
|---------|-----------|-------------------|
| **Uptime** | 99% (spins down) | 99.9% (always-on) |
| **First Load** | 30-60s (cold start) | Instant |
| **Database** | 1 GB | 10 GB |
| **Backups** | 90 days | Point-in-time recovery |
| **Traffic** | 100 GB/month | Unlimited (backend), 100 GB (frontend) |
| **Support** | Community | Email support |
| **Best For** | Development, Testing | Production, Live Sites |

---

## 🔄 Git Workflow (Auto-Deploy)

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Automatic deployments:
# ✅ Vercel: Builds & deploys frontend (~2 min)
# ✅ Render: Builds & deploys backend (~3 min)

# Preview deployments (Vercel only):
git checkout -b feature-branch
git push origin feature-branch
# ✅ Vercel creates preview URL for testing
```

---

## 🛠️ Useful Commands

### Test Backend Health
```powershell
curl https://your-backend.onrender.com/health
```

### Test Backend API
```powershell
# Get courses
curl https://your-backend.onrender.com/api/v1/courses

# Login
curl -X POST https://your-backend.onrender.com/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"user@example.com","password":"password123"}'
```

### Check Frontend Build
```powershell
# Local test
cd frontend
npm run build
npm run start
```

### Database Connection Test
```powershell
# If you have psql installed
psql "postgres://user:pass@host:5432/database"
```

---

## 📞 Support Resources

### Platform Help
- **Vercel**: https://vercel.com/docs
- **Render**: https://render.com/docs  
- **PostgreSQL**: https://www.postgresql.org/docs/

### Project Guides
- **Quick Deploy**: `QUICK_DEPLOY.md`
- **Full Guide**: `VERCEL_RENDER_DEPLOYMENT.md`
- **Database Choice**: `DATABASE_CHOICE_GUIDE.md`
- **Security**: `SECURITY_FIXES_QUICKSTART.md`

### Community
- **Next.js**: https://nextjs.org/discord
- **Gin (Go)**: https://github.com/gin-gonic/gin/discussions
- **PostgreSQL**: https://www.postgresql.org/community/

---

## ✅ Success Checklist

When you see all these, you're live! ✨

- [x] Backend URL returns health check: `{"status":"healthy"}`
- [x] Frontend loads at Vercel URL
- [x] Can create new user account
- [x] Can login successfully
- [x] Dashboard displays data
- [x] No CORS errors in console
- [x] API calls work from frontend
- [x] Database connected and queries running

---

## 🎉 You're Ready!

Everything is configured and ready to deploy:
- ✅ Backend supports PostgreSQL & MySQL
- ✅ Docker security hardened
- ✅ Rate limiting implemented
- ✅ Security headers configured
- ✅ Health checks ready
- ✅ Deployment guides written
- ✅ Environment variables prepared

**Next Step**: Open `QUICK_DEPLOY.md` and follow the 30-minute guide!

---

**Total Deployment Time**: ~30 minutes  
**Total Cost (Free Tier)**: $0/month  
**Total Cost (Production)**: $14/month  

**Let's deploy! 🚀**
