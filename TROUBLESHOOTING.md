# Deployment Checklist & Troubleshooting

## Pre-Deployment Checklist

### Local Testing
- [ ] Backend starts locally without errors: `npm run dev` in `/backend`
- [ ] Admin panel starts locally: `npm start` in `/admin-panel`
- [ ] Can login to admin panel with test credentials
- [ ] All API calls work (check Network tab in DevTools)
- [ ] Database migrations work: `npm run migrate && npm run seed`
- [ ] No console errors in browser or terminal

### Code Cleanup
- [ ] All console.log() statements removed (or kept for debugging)
- [ ] No hardcoded URLs or API endpoints
- [ ] CORS configuration updated for production
- [ ] .env files are NOT committed (check .gitignore)
- [ ] No sensitive data in code
- [ ] All dependencies installed and up to date

### Git Repository
- [ ] Code pushed to GitHub
- [ ] Main branch is stable and tested
- [ ] README.md is up to date

---

## Deployment Order

1. **Create Render PostgreSQL Database** ← Start here
2. **Deploy Backend to Render** ← With database credentials
3. **Get Backend URL from Render**
4. **Deploy Admin Panel to Vercel** ← With backend URL
5. **Update CORS in Backend** ← With Vercel URL
6. **Test Everything**

---

## Troubleshooting Guide

### ❌ Problem: "Database connection failed" on Render

**Causes:**
- Database not fully created yet (takes 2-3 minutes)
- Wrong credentials in environment variables
- Connection string format incorrect

**Solution:**
1. Wait 3-5 minutes and try again
2. Double-check all environment variables match exactly:
   ```
   DB_HOST=<from-connection-url>
   DB_PORT=5432
   DB_NAME=student_portal
   DB_USER=<your-user>
   DB_PASSWORD=<your-password>
   ```
3. Test locally with same credentials first

---

### ❌ Problem: "CORS error" in admin panel

**Error Message:** 
```
Access to XMLHttpRequest blocked by CORS policy
```

**Causes:**
- Backend CORS not updated with Vercel URL
- Backend not recognizing the request origin

**Solution:**
1. Copy your Vercel admin panel URL
2. Update backend environment variable:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
3. Wait for backend to redeploy (automatically triggered)
4. Refresh admin panel in browser (clear cache: Ctrl+Shift+Del)

---

### ❌ Problem: "Cannot GET /" or blank page on Vercel

**Causes:**
- Framework detected incorrectly
- Build output directory wrong
- Environment variable missing

**Solution:**
1. In Vercel dashboard:
   - Go to Settings → Build & Development Settings
   - Framework Preset: **Create React App**
   - Root Directory: **admin-panel**
   - Build Command: `npm run build`
   - Output Directory: `build`
2. Redeploy (click "Redeploy")

---

### ❌ Problem: 404 errors on some routes

**Causes:**
- React Router not configured for Vercel's handling
- Missing public/index.html in build

**Solution:**
1. Vercel will automatically handle this for Create React App
2. If still failing, add `vercel.json` in admin-panel with rewrite rules:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### ❌ Problem: "Command failed" during migration on Render

**Causes:**
- Node modules not installed
- Database doesn't exist yet
- Migration file has syntax errors

**Solution:**
1. In Render Shell:
```bash
cd backend
npm install
npm run migrate
npm run seed
```
2. Watch for error messages in the output
3. Check [backend/src/config/migrate.js](../backend/src/config/migrate.js) for syntax

---

### ❌ Problem: Login works locally but not on Render

**Causes:**
- JWT_SECRET not set or too short
- Database doesn't have user data (seed not run)
- Password hashing inconsistent

**Solution:**
1. Ensure migrations and seed ran successfully
2. Check JWT_SECRET is at least 32 characters
3. Verify BCRYPT_SALT_ROUNDS=10 in env variables
4. Test with seed user: admin@university.edu / admin123

---

### ⚠️ Problem: Deployment takes very long

**Common In:**
- First deployment (building from scratch)
- Large node_modules (normal)

**Wait Times:**
- Backend first deploy: 3-5 minutes
- Admin panel first deploy: 2-4 minutes
- Normal redeploys: 1-2 minutes

If it exceeds 10 minutes, check the deployment logs.

---

## Logs & Debugging

### Render Logs
1. Go to Render Dashboard
2. Select your web service
3. Click "Logs" tab
4. Real-time logs appear here
5. Look for error messages (red text)

### Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment
5. View build logs

### Local Testing Before Production
```bash
# Test backend with production database locally
NODE_ENV=production npm start

# Test admin panel with production API
REACT_APP_API_URL=https://your-backend.onrender.com/api npm start
```

---

## Environment Variables Cheat Sheet

### Backend (Render Environment)
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
DB_HOST=xxx.render.com
DB_PORT=5432
DB_NAME=student_portal
DB_USER=postgres
DB_PASSWORD=xxxxxxxxxx
JWT_SECRET=long-random-secret-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### Admin Panel (Vercel)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## Quick Redeploy

If you made code changes:

1. **Backend:**
   - Push to GitHub
   - Render auto-deploys (or click Redeploy)

2. **Admin Panel:**
   - Push to GitHub
   - Vercel auto-deploys

No manual steps needed after initial setup!

---

## Performance Notes

For a **free tier demo:**
- First request after idle = cold start (5-10 seconds)
- Subsequent requests = fast
- This is normal and acceptable for demos
- Let client know if they see delays

---

## Getting Help

If still stuck:
1. Check deployment logs (most helpful)
2. Verify all environment variables once more
3. Try local testing with same config
4. Check that .git/config points to correct repo
5. Render support: support@render.com
6. Vercel support: support@vercel.com

