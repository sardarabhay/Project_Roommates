# HarmonyHomes Deployment Guide

Deploy HarmonyHomes using **Neon** (database), **Render** (backend), and **Vercel** (frontend).

---

## Prerequisites

1. Push your code to a **GitHub repository**
2. Create accounts on:
   - [Neon](https://neon.tech) - PostgreSQL database
   - [Render](https://render.com) - Backend hosting
   - [Vercel](https://vercel.com) - Frontend hosting

---

## Step 1: Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click **New Project** → Name it "harmony-homes"
3. Copy the **Connection String** (looks like `postgresql://user:pass@host/db?sslmode=require`)
4. Save this for the backend deployment

---

## Step 2: Deploy Backend to Render

### 2.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `harmony-homes-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run prisma:migrate:deploy && npm start`

### 2.2 Set Environment Variables

In the Render dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Generate a secure random string (use `openssl rand -base64 32`) |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` (update after Vercel deploy) |

### 2.3 Deploy

Click **Create Web Service**. Wait for the build to complete (takes 2-5 minutes).

Note your backend URL: `https://harmony-homes-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`

### 3.2 Set Environment Variables

Add these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://harmony-homes-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://harmony-homes-api.onrender.com` |

### 3.3 Deploy

Click **Deploy**. Wait for build to complete.

Note your frontend URL: `https://your-app.vercel.app`

---

## Step 4: Update CORS Origins

Go back to Render and update the `CORS_ORIGINS` environment variable with your Vercel URL:

```
CORS_ORIGINS=https://your-app.vercel.app
```

Render will automatically redeploy.

---

## Step 5: Run Database Migrations (First Time Only)

The start command runs migrations automatically. If you need to seed data:

1. In Render, go to your service
2. Click **Shell** tab
3. Run: `npm run seed`

---

## Optional: Custom Domain

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your domain and follow DNS instructions

### Render (Backend)
1. Go to Service Settings → Custom Domains
2. Add subdomain like `api.yourdomain.com`
3. Update `CORS_ORIGINS` to include your custom domain

---

## Troubleshooting

### Backend not starting
- Check Render logs for errors
- Verify `DATABASE_URL` is correct
- Ensure Neon database allows connections

### CORS errors
- Verify `CORS_ORIGINS` includes your exact frontend URL (no trailing slash)
- Check browser console for the exact origin being blocked

### Socket.io not connecting
- Ensure `VITE_SOCKET_URL` points to backend (not `/api`)
- Check backend logs for socket connection attempts

### Database connection failed
- Neon free tier may sleep after inactivity - first request wakes it
- Verify connection string includes `?sslmode=require`

---

## Environment Variables Reference

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://your-app.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## Cost Estimates (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Neon | 0.5GB storage, 3GB transfer | $19+ |
| Render | 750 hours (sleeps after 15min) | $7+ (always on) |
| Vercel | 100GB bandwidth | $20+ |

**Total (free tier)**: $0/month with cold start delays
**Total (always on)**: ~$7/month (just Render paid)
