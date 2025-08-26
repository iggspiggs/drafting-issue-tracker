# Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and click "New Project"
3. Choose organization, enter project name: "drafting-issue-tracker"
4. Choose a secure database password
5. Wait for project to initialize

### 2. Set up Database
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the entire contents of `database_schema.sql`
4. Click **Run** to execute the SQL
5. ✅ Your database is ready!

### 3. Get API Keys
1. Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJ0eXAiOiJKV1Q...` (long string)

### 4. Configure Environment
1. Open `.env` file in your project root
2. Replace the placeholder values:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Restart Development Server
```bash
npm start
```

## ✅ You're Done!

The app will now:
- Show a login screen
- Authenticate users with Supabase
- Store all data in PostgreSQL database
- Support real-time collaboration
- Automatically migrate localStorage data (if any exists)

## Features Added

### 🔐 Authentication
- Email/password signup and login
- Secure user sessions
- Automatic logout on session expiry

### 📊 Database Storage  
- PostgreSQL database (enterprise-grade)
- Real-time data synchronization
- Automatic backups
- Row-level security enabled

### 👥 Multi-user Support
- Multiple team members can access same data
- User attribution (created_by tracking)
- Concurrent editing support

### 📱 Migration Support
- Automatically offers to migrate localStorage data
- One-time migration process
- Data preservation during upgrade

## Database Schema

### `issues` table
- `id` (TEXT) - Issue ID like "ERE-001"
- `job_number` (TEXT) - Project job number
- `category` (TEXT) - Issue category
- `description` (TEXT) - Issue description
- `status` (TEXT) - Current status
- `priority` (TEXT) - Priority level
- `date_reported` (DATE) - When reported
- `resolution_notes` (TEXT) - Resolution details
- `assignee` (TEXT) - Assigned person/team
- Timestamps and user tracking

### `issue_reviews` table
- Review history for each issue
- Reviewer name and approval status
- Review notes and timestamps

## Security

- Row Level Security (RLS) enabled
- Users can only access authenticated data
- SQL injection protection
- Secure API keys

## Troubleshooting

### App shows "Missing Supabase environment variables"
- Check your `.env` file has correct values
- Restart development server after changes

### Login not working
- Verify project URL and API key are correct
- Check Supabase dashboard for any errors

### Migration fails
- Check browser console for errors
- Ensure user is properly authenticated
- Try refreshing and logging in again

## Next Steps

- **Production Deployment**: Deploy to Vercel, Netlify, or similar
- **Team Access**: Invite team members in Supabase dashboard
- **Backups**: Automatic with Supabase (no action needed)
- **Scaling**: Supabase handles automatically