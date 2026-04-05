# Deployment Quick Start

## 1️⃣ Backend on Render (5 minutes)

```bash
# A. Create PostgreSQL Database
# - Go to render.com → New → PostgreSQL
# - Save the connection URL

# B. Create Web Service
# - New → Web Service → Connect GitHub
# - Build: cd backend && npm install
# - Start: node backend/src/index.js

# C. Set Environment Variables
# PORT=5000
# NODE_ENV=production
# DB_HOST=<from-connection-url>
# DB_PORT=5432
# DB_NAME=student_portal
# DB_USER=<your-user>
# DB_PASSWORD=<your-password>
# JWT_SECRET=create_a_random_secret_here
# JWT_EXPIRES_IN=7d
# BCRYPT_SALT_ROUNDS=10

# D. Run Migrations
# Open Shell tab and run:
# cd backend && npm install && npm run migrate && npm run seed
```

## 2️⃣ Admin Panel on Vercel (3 minutes)

```bash
# A. Create .env.local in admin-panel/
# REACT_APP_API_URL=https://<your-backend-url>.onrender.com/api

# B. Deploy
# - Go to vercel.com → Import Git Repository
# - Root: admin-panel
# - Framework: Create React App
# - Add env variable: REACT_APP_API_URL
```

## 3️⃣ Update Backend CORS

Replace CORS in `backend/src/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-vercel-url.vercel.app'],
  credentials: true
}));
```

## 📍 Your URLs After Deployment
- Backend: `https://your-backend.onrender.com`
- Admin Panel: `https://your-project.vercel.app`

See DEPLOYMENT.md for detailed instructions.
