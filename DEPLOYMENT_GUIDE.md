# GitHub se Render par Deployment Guide

## Step 1: Project ko GitHub par Upload kariye

### Method 1: GitHub Web Interface (Recommended)
1. [GitHub.com](https://github.com) par jaiye aur login kariye
2. "New" button click karke "New repository" select kariye
3. Repository name diye (example: `smm-panel`)
4. "Public" ya "Private" select kariye
5. "Create repository" click kariye

### Method 2: ZIP Upload Process
1. Apne project folder ka ZIP banaye (node_modules folder exclude karke)
2. GitHub repository me "uploading an existing file" link click kariye
3. ZIP file drag & drop kariye ya "choose your files" click kariye
4. "Commit changes" button click kariye

## Step 2: Render.com Account Setup

1. [Render.com](https://render.com) par jaiye
2. "Get Started for Free" click kariye
3. GitHub account se sign up kariye
4. GitHub access permission diye

## Step 3: Web Service Create kariye

1. Render dashboard me "New +" button click kariye
2. "Web Service" select kariye
3. "Connect a repository" section me apni repository search kariye
4. Repository select karke "Connect" click kariye

## Step 4: Service Configuration

### Build & Deploy Settings:
- **Name**: `smm-panel` (ya koi bhi naam)
- **Environment**: `Node`
- **Region**: `Oregon` (free tier ke liye)
- **Branch**: `main` ya `master`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start`

### Environment Variables:
Dashboard me "Environment" tab me jaiye aur ye variables add kariye:

```
NODE_ENV = production
JWT_SECRET = SomeVeryStrongRandomSecret
SESSION_SECRET = SomeVeryStrongRandomSecret
TELEGRAM_BOT_TOKEN = 7275717734:AAE6bq0Mdypn_wQL6F1wpphzEtLAco3_B3Y
TELEGRAM_CHAT_ID = 6881713177
PORT = 3000
```

## Step 5: Database Setup

1. Render dashboard me "New +" click kariye
2. "PostgreSQL" select kariye
3. Database details:
   - **Name**: `smm-panel-db`
   - **Database**: `smm_panel`
   - **User**: `smm_user`
   - **Region**: Oregon (same as web service)
4. "Create Database" click kariye

## Step 6: Database ko Web Service se Connect kariye

1. Web service ke "Environment" tab me jaiye
2. "Add Environment Variable" click kariye
3. **Key**: `DATABASE_URL`
4. **Value**: Database ke "Connections" tab se "External Connection String" copy kariye

## Step 7: Deploy aur Test kariye

1. "Manual Deploy" button click kariye ya auto-deploy wait kariye
2. Build logs check kariye errors ke liye
3. Deploy complete hone ke baad service URL milega
4. URL open karke site test kariye

## Step 8: Database Schema Setup

1. Render dashboard me web service ke "Shell" tab me jaiye
2. Ya local terminal se production database connect kariye:
```bash
npm run db:push
```

## Common Issues aur Solutions:

### Build Fail ho rahi hai:
- `package.json` me dependencies check kariye
- Build logs me exact error dekhe
- Node.js version compatibility check kariye

### Database Connection Error:
- DATABASE_URL correctly set hai ya nahi check kariye
- Database aur web service same region me hai ya nahi verify kariye

### Environment Variables Missing:
- Required variables properly set hai ya nahi check kariye
- Restart service after adding new variables

## Success Checklist:

✅ GitHub repository created
✅ All project files uploaded (except node_modules)
✅ Render account connected to GitHub
✅ Web service deployed successfully
✅ PostgreSQL database created
✅ Environment variables configured
✅ Database schema pushed
✅ Application accessible via Render URL

## Important Notes:

- Free tier limitations: Service sleeps after 15 minutes of inactivity
- Database: 1GB storage limit
- Build time: Maximum 15 minutes
- Custom domain available after successful deployment

Koi problem aaye to Render ke build logs check kariye ya support contact kariye.