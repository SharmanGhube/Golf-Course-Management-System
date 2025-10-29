# 🚀 Production Deployment Guide

## Golf Course Management System - Complete Deployment Instructions

---

## 📋 Pre-Deployment Checklist

### ✅ **1. System Requirements**
- [ ] Linux server (Ubuntu 20.04+ recommended) or Windows Server
- [ ] Docker 20.10+ and Docker Compose 2.0+
- [ ] 2GB+ RAM
- [ ] 20GB+ disk space
- [ ] Domain name configured
- [ ] SSL certificate (Let's Encrypt or purchased)

### ✅ **2. Required Accounts/Keys**
- [ ] Weather API key (free from weatherapi.com)
- [ ] Email SMTP credentials (Gmail, SendGrid, or AWS SES)
- [ ] (Optional) Stripe account for payments
- [ ] (Optional) Sentry account for error tracking

---

## 🔐 Step 1: Generate Secure Secrets

### On Linux/Mac:
```bash
# Generate JWT secret (48 characters)
openssl rand -base64 48

# Generate database passwords (32 characters)
openssl rand -base64 32
openssl rand -base64 32  # Run again for root password
```

### On Windows PowerShell:
```powershell
# Run the secret generation script
$jwtSecret = -join ((65..90) + (97..122) + (48..57) + (33..47) | Get-Random -Count 48 | ForEach-Object {[char]$_})
$dbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$rootPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "JWT_SECRET=$jwtSecret"
Write-Host "DB_PASSWORD=$dbPassword"  
Write-Host "ROOT_PASSWORD=$rootPassword"
```

**📝 SAVE THESE SECURELY** - You'll need them in the next step!

---

## 📁 Step 2: Clone and Configure

### 2.1 Clone Repository
```bash
git clone <your-repository-url>
cd golf-course-management
```

### 2.2 Create Production Environment File
```bash
cp .env.production.example .env.production
```

### 2.3 Edit .env.production
```bash
nano .env.production  # or use your preferred editor
```

Update these critical values:
```env
# Replace with your generated secrets
MYSQL_ROOT_PASSWORD=<YOUR_GENERATED_ROOT_PASSWORD>
MYSQL_PASSWORD=<YOUR_GENERATED_DB_PASSWORD>
JWT_SECRET=<YOUR_GENERATED_JWT_SECRET>

# Replace with your domain
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# Add your Weather API key
WEATHER_API_KEY=<YOUR_WEATHER_API_KEY>
```

---

## 🏗️ Step 3: Update CORS Configuration

Edit `backend/internal/middleware/middleware.go`:

```go
// Replace these with your actual domains
allowedOrigins := map[string]bool{
    "https://yourdomain.com": true,
    "https://www.yourdomain.com": true,
}
```

---

## 🐳 Step 4: Build and Deploy

### 4.1 Using Production Docker Compose
```bash
# Build images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4.2 Verify Health
```bash
# Check health endpoint
curl http://localhost:8080/health

# Check all services
docker-compose -f docker-compose.prod.yml ps
```

---

## 🔒 Step 5: Configure SSL/HTTPS

### Option A: Using Nginx Reverse Proxy (Recommended)

#### 5.1 Install Nginx
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

#### 5.2 Create Nginx Configuration
Create `/etc/nginx/sites-available/golf-course`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5.3 Enable Site and Get SSL
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/golf-course /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### Option B: Using Traefik (Alternative)

See `docs/traefik-setup.md` for Traefik configuration.

---

## 🔧 Step 6: Post-Deployment Configuration

### 6.1 Create First Admin User
```bash
# Connect to database
docker exec -it golf_course_db mysql -u golf_user -p golf_course_db

# Create admin user (update password hash)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES ('admin@yourdomain.com', '$2a$12$...', 'Admin', 'User', 'admin', true, true);
```

### 6.2 Configure Automated Backups
```bash
# Make backup script executable
chmod +x backup-database.sh

# Test backup
./backup-database.sh

# Add to cron (daily backups at 2 AM)
crontab -e

# Add this line:
0 2 * * * /path/to/golf-course-management/backup-database.sh >> /var/log/db-backup.log 2>&1
```

### 6.3 Configure Firewall
```bash
# Allow HTTP, HTTPS, and SSH only
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📊 Step 7: Monitoring Setup

### 7.1 View Logs
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Database logs
docker-compose -f docker-compose.prod.yml logs -f mysql

# All services
docker-compose -f docker-compose.prod.yml logs -f
```

### 7.2 Monitor Resources
```bash
# Check container stats
docker stats

# Check disk usage
df -h

# Check database size
docker exec golf_course_db mysql -u golf_user -p -e "SELECT table_schema 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'golf_course_db';"
```

---

## 🧪 Step 8: Testing

### 8.1 Health Checks
```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend
curl https://yourdomain.com

# Database
docker exec golf_course_db mysqladmin -u golf_user -p ping
```

### 8.2 API Testing
```bash
# Test signup
curl -X POST https://api.yourdomain.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'

# Test login
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test rate limiting
for i in {1..10}; do curl https://api.yourdomain.com/api/v1/courses; done
```

---

## 🔄 Step 9: Updates and Maintenance

### 9.1 Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### 9.2 Database Migrations
```bash
# Backup before migration
./backup-database.sh

# Run migration SQL
docker exec -i golf_course_db mysql -u golf_user -p golf_course_db < database/migrations/001_add_new_column.sql
```

### 9.3 Rollback Procedure
```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore from backup
gunzip < backups/golf_course_db_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i golf_course_db mysql -u golf_user -p golf_course_db

# Revert to previous version
git checkout <previous-commit-hash>
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🚨 Troubleshooting

### Issue: Cannot connect to database
```bash
# Check if MySQL is running
docker ps | grep mysql

# Check MySQL logs
docker logs golf_course_db

# Verify credentials
docker exec golf_course_db mysql -u golf_user -p golf_course_db -e "SELECT 1"
```

### Issue: CORS errors
1. Check `backend/internal/middleware/middleware.go`
2. Verify allowed origins include your domain
3. Ensure HTTPS is configured correctly

### Issue: High memory usage
```bash
# Restart services
docker-compose -f docker-compose.prod.yml restart

# Check resource usage
docker stats

# Adjust resource limits in docker-compose.prod.yml if needed
```

---

## 📞 Support

For issues and questions:
1. Check logs: `docker-compose logs -f`
2. Verify health: `/health` endpoint
3. Review error messages in browser console
4. Check firewall and network settings

---

## 📝 Production Checklist

Before going live:

- [ ] All secrets changed from defaults
- [ ] HTTPS/SSL configured and working
- [ ] Domain DNS configured correctly
- [ ] CORS configured with actual domain
- [ ] Firewall configured
- [ ] Automated backups set up
- [ ] Monitoring configured
- [ ] Health checks passing
- [ ] Admin user created
- [ ] API tested end-to-end
- [ ] Rate limiting verified
- [ ] Error tracking configured (optional)
- [ ] Load testing performed (optional)

---

## 🎉 You're Live!

Your Golf Course Management System is now running in production!

**Next Steps:**
1. Monitor logs for first 24-48 hours
2. Set up alerts for critical errors
3. Plan regular maintenance windows
4. Document any custom configurations
5. Train staff on admin panel usage

---

**Last Updated:** October 29, 2025  
**Version:** 1.0.0
