# Deployment Guide for Drafting Issue Tracker

## Prerequisites
- GitHub account
- Render account (https://render.com)
- Supabase project already set up

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Drafting Issue Tracker"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Deploy to Render

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - Name: `drafting-issue-tracker` (or your preferred name)
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: (leave blank)
   - Runtime: `Node`

   **Build & Deploy:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Auto-Deploy: Yes (optional)

   **Environment Variables:**
   Click "Add Environment Variable" for each:
   - `REACT_APP_SUPABASE_URL` = Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = Your Supabase anon key

5. Click "Create Web Service"

## Step 3: Configure for Static Site (Recommended)

Since this is a React app, it's better to deploy as a Static Site:

1. In Render, create "New +" → "Static Site" instead
2. Configure:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
3. Add the same environment variables
4. Create a `_redirects` file in the `public` folder with:
   ```
   /* /index.html 200
   ```

## Important Notes

- Make sure your Supabase project is configured to accept connections from your Render URL
- In Supabase, go to Authentication → URL Configuration and add your Render URL to allowed redirect URLs
- The database schema must be set up in Supabase using `clean_database_schema.sql`
- Environment variables in Render must match exactly (including the `REACT_APP_` prefix)

## Troubleshooting

If the app doesn't load:
1. Check Render logs for build errors
2. Verify environment variables are set correctly
3. Ensure Supabase tables are created
4. Check browser console for any errors

## Local Development

```bash
npm install
# Copy .env.example to .env and add your Supabase credentials
npm start
```