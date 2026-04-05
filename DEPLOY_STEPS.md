# 🚀 Step-by-Step Deployment Guide

Follow these exact steps in order. Estimated time: **20 minutes**

---

## Step 1: Commit & Push Code to GitHub (2 min)

```powershell
cd d:\FILES\PROJECTS\studentportal

git add .
git commit -m "Prepare for production deployment"
git push origin main
```

**Expected**: See "✓ Done" message from GitHub.

---

## Step 2: Create Render Account & PostgreSQL Database (5 min)

### 2a. Create Render Account
1. Go to https://render.com
2. Click "Sign Up" 
3. Sign up with GitHub (easiest - it auto-links)
4. Verify email

### 2b. Create PostgreSQL Database
1. Click **"New +"** button (top right)
2. Select **"PostgreSQL"**
3. Fill in form:
   ```
   Name: student-portal-db
   Database: student_portal
   User: postgres
   Region: (Select closest to you - US Generally or your timezone)
   ```
4. Click **"Create Database"**
5. ⏱️ Wait 2-3 minutes for database to initialize
6. Once ready, click on the database name
7. Under "Connections" section, **copy the full Internal Database URL**
   - Looks like: `postgresql://username:password@host:5432/database`

**Keep this URL safe - you'll need it next.**

---

## Step 3: Deploy Backend to Render (5 min)

### 3a. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Click **"Deploy an existing repository"**
3. Login with GitHub (if not already)
4. Search for and select: **studentportal**
5. Click **"Connect"**

### 3b. Configure Service
1. Fill in settings:
   ```
   Name: student-portal-backend
   Environment: Node
   Region: (Select same as database)
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: node src/index.js
   ```

2. Click **"Create Web Service"** (don't worry about environment variables yet)

### 3c. Add Environment Variables

1. Wait for the service to appear in dashboard
2. Click on **"student-portal-backend"** service
3. Go to **"Environment"** tab
4. Click **"+ Add Environment Variable"** and add these ONE BY ONE:

   ```
   PORT = 5000
   NODE_ENV = production
   
   JWT_SECRET = (Generate a random string - use: https://1password.com/password-generator/)
   Example: aB3xK9mL2qR5wZ8nC1dF4gH7jP0sT3vX6
   
   JWT_EXPIRES_IN = 7d
   BCRYPT_SALT_ROUNDS = 10
   FRONTEND_URL = (Save for later after Vercel deploy)
   ```

   Now extract values from the PostgreSQL URL:
   ```
   From: postgresql://user:password@host:5432/database
   
   DB_HOST = host (e.g., dpg-abc123.render.com)
   DB_PORT = 5432
   DB_NAME = student_portal
   DB_USER = user (from URL)
   DB_PASSWORD = password (from URL)
   ```

5. Click **"Save"** (automatic redeploy starts)

### 3d. Run Database Migrations

1. Go to **"Shell"** tab (next to Environment)
2. Copy & paste this command and press Enter:
   ```bash
   cd backend && npm install && npm run migrate && npm run seed
   ```
3. ⏱️ Wait for it to complete (takes 1-2 minutes)
4. You should see:
   ```
   ✓ Database tables created
   ✓ Seed data inserted
   ```

### 3e. Get Your Backend URL
1. Go back to service overview page
2. Find "Live URL" or copy the link at the top
3. Should look like: `https://student-portal-backend.onrender.com`
4. **Save this URL - you need it for Step 4**

Test it:
```
https://your-backend-url.onrender.com/api/health
(should return data or not error)
```

---

## Step 4: Deploy Admin Panel to Vercel (3 min)

### 4a. Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel with GitHub
5. Verify email

### 4b. Deploy Project
1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Paste: `https://github.com/YOUR_USERNAME/studentportal`
4. Click **"Import"**

### 4c. Configure Build Settings
1. Look for **"Framework"** dropdown
2. Set to: **Create React App**

3. Look for **"Root Directory"** section
4. Set to: **admin-panel**

5. Under **"Environment Variables"**, add:
   ```
   REACT_APP_API_URL = https://your-backend-url.onrender.com/api
   (Replace with your actual backend URL from Step 3e)
   ```

6. Click **"Deploy"**
7. ⏱️ Wait 3-5 minutes for deployment
8. You'll see a success page with a link like: `https://studentportal-admin.vercel.app`

### 4d. Test Admin Panel
1. Click the Vercel link to open your admin panel
2. Try logging in:
   ```
   Email: admin@university.edu
   Password: admin123
   ```
3. If you see the dashboard, ✅ **It works!**

---

## Step 5: Update Backend CORS (2 min)

### 5a. Get Vercel URL
- From Step 4b, find your Vercel deployment URL (e.g., `https://your-project.vercel.app`)

### 5b. Update Backend Environment
1. Go to Render Dashboard
2. Click **"student-portal-backend"** service
3. Go to **"Environment"** tab
4. Find **"FRONTEND_URL"** environment variable
5. Click edit (pencil icon)
6. Paste your Vercel URL: `https://your-vercel-domain.vercel.app`
7. Click **"Save"**

Render will automatically redeploy with updated CORS.

---

## Step 6: Final Testing (2 min)

### ✅ Test Checklist

- [ ] Admin panel loads at Vercel URL
- [ ] Can login with admin@university.edu / admin123
- [ ] Can navigate to different pages (Dashboard, Students, etc.)
- [ ] No "CORS error" in browser console
- [ ] Can see student data (if seed ran successfully)

### 🐛 If Something's Wrong
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Most common: CORS errors → Double-check FRONTEND_URL
- Second most common: Database not initialized → Re-run migrations

---

## 🎉 You're Done!

Your application is now live and free:

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | `https://student-portal-backend.onrender.com` | ✅ Live |
| Admin Panel | `https://your-project.vercel.app` | ✅ Live |
| Database | Render PostgreSQL | ✅ Live |

**Share these URLs with your client!**

---

## 📝 Important Notes

1. **Cold Start**: First request might be slow (5-10 sec) on free tier - this is normal
2. **Auto Redeploy**: Every time you push to GitHub, both services auto-update
3. **No Credit Card**: Free tier requires no payment for demos
4. **Limitations**: 
   - Render backend spins down after 15 min of inactivity (wakes on next request)
   - Free database has 0.25GB limit (plenty for demo)

---

## Next Steps (Later)

When ready to go live:
1. Buy a custom domain (namecheap, godaddy, etc.)
2. Point domain to Vercel
3. Upgrade Render plan if needed
4. Set up monitoring/error tracking
5. Configure email service for notifications

