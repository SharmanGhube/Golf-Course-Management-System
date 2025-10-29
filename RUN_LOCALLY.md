# 🖥️ Run Golf Course Management System Locally

## Quick Start Guide - Run on Your Computer

No deployment needed! Just run the project on your local machine.

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Docker Desktop** installed and running
  - Download: https://www.docker.com/products/docker-desktop
- ✅ **Git** installed
  - Download: https://git-scm.com/downloads
- ✅ **Your project** already cloned (you have it ✅)

---

## 🚀 Method 1: Docker Compose (Easiest - One Command!)

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** application
2. Wait for it to fully start (icon turns green/running)

### Step 2: Run the Project

Open PowerShell in your project directory and run:

```powershell
cd "d:\DBMS Microproject"
docker-compose up --build
```

That's it! ✅

### Step 3: Access Your Application

Wait ~2 minutes for everything to build and start, then:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend Health**: http://localhost:8080/health
- **Database**: localhost:3306 (MySQL)

### Step 4: Create Admin Account

1. Open browser: http://localhost:3000
2. Click **"Sign Up"**
3. Create your admin account
4. Start using the system!

### Step 5: Stop the Application

When done, press `Ctrl + C` in PowerShell, then run:

```powershell
docker-compose down
```

---

## 🚀 Method 2: Run Without Docker (Manual Setup)

If you prefer running without Docker:

### Prerequisites:
- ✅ **Go 1.21+** installed
- ✅ **Node.js 18+** installed
- ✅ **MySQL 8.0** installed

### Step 1: Start MySQL Database

```powershell
# Option A: Using Docker for database only
docker run -d `
  --name golf-mysql `
  -e MYSQL_ROOT_PASSWORD=root_password_123 `
  -e MYSQL_DATABASE=golf_course_db `
  -e MYSQL_USER=golf_user `
  -e MYSQL_PASSWORD=golf_password `
  -p 3306:3306 `
  mysql:8.0

# Wait 30 seconds for MySQL to start
Start-Sleep -Seconds 30

# Initialize database schema
docker exec -i golf-mysql mysql -ugolf_user -pgolf_password golf_course_db < "database/init.sql"
```

### Step 2: Start Backend

```powershell
# Open a NEW PowerShell window
cd "d:\DBMS Microproject\backend"

# Create .env file
@"
DB_HOST=localhost
DB_PORT=3306
DB_USER=golf_user
DB_PASSWORD=golf_password
DB_NAME=golf_course_db
PORT=8080
GIN_MODE=debug
JWT_SECRET=your-local-jwt-secret-key-for-development
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8

# Install dependencies
go mod download

# Run backend
go run main.go
```

**Backend running at**: http://localhost:8080

### Step 3: Start Frontend

```powershell
# Open ANOTHER NEW PowerShell window
cd "d:\DBMS Microproject\frontend"

# Create .env.local file
@"
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
"@ | Out-File -FilePath .env.local -Encoding utf8

# Install dependencies
npm install

# Run frontend
npm run dev
```

**Frontend running at**: http://localhost:3000

### Step 4: Access Application

Open browser: http://localhost:3000

---

## 🎯 For Project Demonstration

### Recommended: Method 1 (Docker Compose)

**Why?**
- ✅ One command to start everything
- ✅ No manual configuration
- ✅ Consistent environment
- ✅ Easy to show your guide

### Quick Demo Script:

```powershell
# 1. Start Docker Desktop (show it's running)

# 2. Open PowerShell and run:
cd "d:\DBMS Microproject"
docker-compose up --build

# 3. Wait ~2 minutes (explain what's happening)
#    - Building backend (Go application)
#    - Building frontend (Next.js application)
#    - Starting MySQL database
#    - Initializing database schema

# 4. Open browser to http://localhost:3000

# 5. Demonstrate features:
#    - Sign up
#    - Login
#    - Book tee time
#    - View dashboard
#    - Admin panel (if applicable)
#    - Equipment rental
#    - Range booking

# 6. Show backend health:
#    http://localhost:8080/health

# 7. When done: Ctrl+C and docker-compose down
```

---

## 📊 What's Running

When you start with `docker-compose up`:

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Frontend** | 3000 | http://localhost:3000 | Next.js UI |
| **Backend** | 8080 | http://localhost:8080 | Go API |
| **Database** | 3306 | localhost:3306 | MySQL 8.0 |

---

## 🔍 Verify Everything Works

### Check Backend Health:
```powershell
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-29T..."
}
```

### Check Frontend:
Open browser: http://localhost:3000

Should see the Golf Course landing page.

### Check Database:
```powershell
# Connect to MySQL
docker exec -it dbms-microproject-db-1 mysql -ugolf_user -pgolf_password golf_course_db

# Run a query
mysql> SHOW TABLES;
mysql> SELECT * FROM users;
mysql> exit;
```

---

## 🛠️ Troubleshooting

### Issue: "Port 3306 already in use"

**Solution**: You have MySQL already running locally

```powershell
# Option 1: Stop local MySQL service
net stop MySQL80

# Option 2: Use different port in docker-compose.yml
# Change: "3306:3306" to "3307:3306"
```

### Issue: "Port 8080 already in use"

**Solution**: Something else is using port 8080

```powershell
# Find what's using the port
netstat -ano | findstr :8080

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F
```

### Issue: Docker not starting

**Solution**: 
1. Restart Docker Desktop
2. Wait for it to fully start
3. Run `docker ps` to verify it's working

### Issue: Frontend shows "API connection failed"

**Solution**:
1. Check backend is running: `curl http://localhost:8080/health`
2. Check CORS settings (should allow localhost:3000)
3. Check `.env.local` in frontend has correct API URL

---

## 📝 Project Features to Demonstrate

### User Features:
- ✅ Sign up / Login
- ✅ View golf courses
- ✅ Book tee times
- ✅ View booking history
- ✅ Rent equipment
- ✅ Book driving range sessions
- ✅ View weather conditions
- ✅ Track scorecards

### Admin Features (if you have admin role):
- ✅ Manage courses
- ✅ Manage users
- ✅ View all bookings
- ✅ Manage equipment inventory
- ✅ View analytics/dashboard
- ✅ System settings

---

## 🎬 Sample Data

The database comes pre-loaded with:
- ✅ 1 Championship Course (18 holes)
- ✅ Sample equipment (carts, clubs, accessories)
- ✅ System settings configured
- ✅ Admin user (you create during signup)

---

## 💡 Pro Tips for Demonstration

### Tip 1: Prepare Before Demo
```powershell
# Start everything 5 minutes before demonstration
docker-compose up -d  # -d runs in background

# Verify it's working
curl http://localhost:8080/health
```

### Tip 2: Have Test Data Ready
- Create a test account beforehand
- Make some sample bookings
- This shows the system with realistic data

### Tip 3: Show the Technology Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Go 1.21 + Gin framework + GORM
- **Database**: MySQL 8.0
- **Security**: JWT authentication, bcrypt passwords, rate limiting
- **Deployment**: Docker containers (production-ready)

### Tip 4: Demonstrate Security Features
- Password hashing (bcrypt)
- JWT token authentication
- Rate limiting (check network tab)
- CORS protection
- Input validation

---

## 🔄 Reset Database (If Needed)

If you want to reset everything to fresh state:

```powershell
# Stop everything
docker-compose down

# Remove database volume (deletes all data)
docker volume rm dbms-microproject_mysql-data

# Start fresh
docker-compose up --build
```

---

## 📦 Quick Command Reference

```powershell
# Start everything
docker-compose up --build

# Start in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache
docker-compose up

# Check running containers
docker ps

# Access backend logs
docker logs dbms-microproject-backend-1

# Access frontend logs
docker logs dbms-microproject-frontend-1

# Access database
docker exec -it dbms-microproject-db-1 mysql -ugolf_user -pgolf_password golf_course_db
```

---

## ✅ Before Your Demonstration

**Checklist**:
- [ ] Docker Desktop installed and running
- [ ] Project code up to date (`git pull origin main`)
- [ ] Run `docker-compose up --build` successfully
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend health check passes
- [ ] Created test user account
- [ ] Made sample bookings to show data
- [ ] Prepared talking points about features

---

## 🎉 You're Ready!

Your Golf Course Management System is fully functional locally!

**For demonstration**:
1. Start: `docker-compose up --build`
2. Show: http://localhost:3000
3. Demonstrate all features
4. Stop: `docker-compose down`

**No deployment, no hosting, no complexity - just works!** ✅

---

## Need Help?

All features are working locally. If you encounter any issues:
1. Check Docker Desktop is running
2. Verify ports 3000, 8080, 3306 are free
3. Check logs: `docker-compose logs`
4. Restart: `docker-compose down` then `docker-compose up --build`

**Good luck with your project presentation! 🚀**
