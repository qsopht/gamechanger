# Railway Deployment Guide

This application is configured to be deployed on Railway.

## Prerequisites

1. Railway account (https://railway.app)
2. GitHub account with this repository
3. Environment variables configured

## Deployment Steps

### 1. Create a New Project on Railway

- Visit https://railway.app and create a new project
- Select "Deploy from GitHub"
- Connect your GitHub repository

### 2. Add PostgreSQL Database

- In your Railway project, click "New"
- Select "Database"
- Choose "PostgreSQL"
- Railway will automatically add a `DATABASE_URL` environment variable

### 3. Configure Environment Variables

In your Railway project settings, add the following environment variables:

```
DATABASE_URL=<automatically set by Railway>
POSTGRES_DB=gamechanger
JWT_SECRET=your_secure_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
FRONTEND_URL=https://your-frontend-url.railway.app
PORT=3000
NODE_ENV=production
```

### 4. Configure Build Settings

Railway will automatically detect the `railway.json` configuration file and:
- Install dependencies using npm
- Run migrations on startup
- Start the server

### 5. Deploy

Push your code to GitHub. Railway will automatically:
1. Build the application
2. Run database migrations
3. Start the server
4. Make it available at your Railway domain

## Frontend Deployment

For frontend deployment, you can either:

1. **Build and deploy as static files**: 
   - Build: `npm run build:frontend`
   - Deploy to Railway/Vercel/Netlify as static content

2. **Deploy on Railway with backend**:
   - Modify `railway.json` to serve frontend from the backend
   - Configure a reverse proxy in the backend to serve static files

## Monitoring

- View logs: Railway dashboard > project > Deployments > View Logs
- Monitor: Railway provides built-in monitoring dashboard
- Scale: Use Railway dashboard to scale services as needed

## Troubleshooting

- **Database connection issues**: Verify `DATABASE_URL` is set correctly
- **Migrations failing**: Check database connectivity and permissions
- **Build failures**: Check build logs in Railway dashboard for errors
- **Missing dependencies**: Ensure all dependencies are listed in package.json files
