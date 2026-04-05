# Deployment Guide - Free Hosting

This guide will help you deploy your Student Portal application for free using Render (Backend + Database) and Vercel (Admin Panel).

---

## Prerequisites

- GitHub account (repository must be public or use free tier)
- Render account (https://render.com)
- Vercel account (https://vercel.com)

---

## Part 1: Backend Deployment on Render

### Step 1: Push Your Project to GitHub

If not already done:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create a PostgreSQL Database on Render

1. Go to https://render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in details:
   - **Name**: `student-portal-db`
   - **Database**: `student_portal`
   - **User**: Keep default or create custom
   - **Region**: Choose closest to you
4. Click **"Create Database"**
5. Wait for database to be ready (2-3 minutes)
6. Copy the connection string (you'll need this)

### Step 3: Create a Web Service for Backend

1. Click **"New +"** → **"Web Service"**
2. Choose **"Deploy an existing repository"**
3. Connect your GitHub account and select your `studentportal` repository
4. Fill in settings:
   - **Name**: `student-portal-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `node backend/src/index.js`
   - **Region**: Same as database

### Step 4: Set Environment Variables

In the Render web service, go to **Environment** tab and add:

```
PORT=5000
NODE_ENV=production
DB_HOST=<your-db-host-from-connection-string>
DB_PORT=5432
DB_NAME=student_portal
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
JWT_SECRET=your_super_secure_secret_key_here_12345
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### Step 5: Run Database Migrations

1. Go to Render Dashboard → Your Web Service
2. Click **"Shell"** tab
3. Run migrations:
```bash
cd backend && npm install && npm run migrate && npm run seed
```

4. Wait for completion (you'll see success message)

### Step 6: Test Backend

Once deployed, test your API:
```bash
https://your-backend-url.onrender.com/api/health
```

You should see a response (or the route may not exist, but no 500 error means it's working).

**Copy your backend URL** - you'll need it for the admin panel.

---

## Part 2: Admin Panel Deployment on Vercel

### Step 1: Create Environment Variable for Admin Panel

1. In your local repo, go to `admin-panel/` folder
2. Create `.env.local` file:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

Replace `your-backend-url` with the actual Render backend URL from Part 1.

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Paste your GitHub repo URL and import
4. Select **"studentportal"** as the root
5. Under **Framework Preset**, select **"Create React App"**
6. Go to **Settings** → **Root Directory** → Set to `admin-panel`
7. Add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`
8. Click **"Deploy"**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# In your project root
cd admin-panel
vercel

# Follow prompts and add environment variable when asked
```

### Step 3: Verify Admin Panel

Once deployed, visit your Vercel URL and test:
1. Login with an admin account (use credentials from seed data)
2. Try navigating to different sections

---

## Part 3: Update Backend CORS for Production

Update `backend/src/index.js` to allow your Vercel frontend:

```javascript
const cors = require('cors');

// ... other code ...

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-vercel-url.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### Push Changes

```bash
git add .
git commit -m "Update CORS for production deployment"
git push origin main
```

This will trigger automatic redeployment on Render.

---

## Part 4: Mobile App (Optional for Demo)

### Option A: Expo Web
```bash
cd mobile
npm install
npm start
# Press 'w' to open web version
```

### Option B: Expo Go
Share with client using Expo app without building.

---

## Testing Checklist

- [ ] Backend API works (test with curl or Postman)
- [ ] Admin panel loads
- [ ] Can login to admin panel
- [ ] Can view and manage data
- [ ] API calls show correct backend URL
- [ ] Database migrations ran successfully

---

## Troubleshooting

### Backend won't start on Render
- Check "Logs" tab on Render dashboard
- Verify all environment variables are set
- Ensure database connection string is correct

### Admin panel shows CORS error
- Check backend CORS settings
- Verify correct API URL in `.env.local`
- Make sure backend is running

### Database migrations failed
- Verify database credentials are correct
- Check if database was created successfully
- Try running migrations manually via Shell tab

---

## Cost Summary

- **Render Backend**: Free tier (limited, but sufficient for demos)
- **Render Database**: Free tier (0.25GB - adequate for testing)
- **Vercel Admin Panel**: Free (unlimited projects)
- **Total Cost**: **$0**

---

## Next Steps for Production

When ready for real users:
1. Upgrade Render database plan
2. Add custom domain
3. Set up SSL/HTTPS (automatic on both platforms)
4. Add monitoring and error tracking
5. Set up backups

---

## Quick Reference

| Service | Free Limit | URL |
|---------|-----------|-----|
| Render Backend | 750 hrs/month | onrender.com |
| Render Database | 256MB | onrender.com |
| Vercel | Unlimited | vercel.app |

