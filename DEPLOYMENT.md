# Deployment Guide - Virtual Courtroom

This guide covers deployment options for the Virtual Courtroom platform.

## 🚀 Quick Deploy Options

### Vercel (Recommended)
1. **Connect GitHub Repository**
   - Log in to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select the `virtual-gavel-enhanced` folder as the project root

2. **Configure Build Settings**
   - Build Command: `npm run build` or `pnpm build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `pnpm install`

3. **Environment Variables**
   Add these in Vercel's dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - Your app will be available at a `.vercel.app` URL

### Netlify
1. **Connect Repository**
   - Log in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   - Base directory: `virtual-gavel-enhanced`
   - Build command: `npm run build`
   - Publish directory: `virtual-gavel-enhanced/dist`

3. **Environment Variables**
   In Netlify's site settings, add:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🗄️ Supabase Backend Setup

### 1. Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id
```

### 2. Apply Database Migrations
```bash
# Apply all migrations
supabase db push

# Or apply individually
supabase migration up
```

### 3. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy create-admin-user
```

### 4. Configure Authentication
In your Supabase dashboard:
1. **Authentication → Settings**
2. **Site URL**: Set to your deployed frontend URL
3. **Redirect URLs**: Add your deployment URLs
4. **Email Templates**: Customize as needed

### 5. Set Up Row Level Security (RLS)
The migrations include RLS policies, but verify:
1. **Database → Tables**
2. Check that RLS is enabled on all tables
3. Verify policies are in place for `legal_cases`, `user_profiles`, etc.

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics (if using)
VITE_ANALYTICS_ID=your-analytics-id
```

### Development vs Production
- **Development**: Use `.env.local` file
- **Production**: Set in your hosting platform's dashboard

## 📊 Database Content

### Legal Cases Data
The platform includes 69+ legal cases. To populate:

1. **Automatic Migration**: Cases are included in migrations
2. **Manual Import**: Use the SQL files in `/supabase/migrations/`
3. **Custom Cases**: Add via Supabase dashboard or API

### User Management
- **Registration**: Public registration enabled
- **Admin Users**: Use the `create-admin-user` edge function
- **Profiles**: Auto-created on user registration

## 🔍 Post-Deployment Testing

### Critical Features to Verify
1. **Authentication**
   - User registration works
   - Login/logout functions properly
   - Profile creation is automatic

2. **Game Modes**
   - Virtual Courtroom loads correctly
   - Junior Justice mode is accessible
   - Career and Training modes function

3. **Core Functionality**
   - Criminal Law filter shows cases
   - Evidence system works
   - Case files display properly
   - Trial progression is smooth

4. **Database Connectivity**
   - Cases load from Supabase
   - User progress saves correctly
   - Real-time features work

### Performance Checklist
- [ ] Page load times < 3 seconds
- [ ] Authentication response < 1 second
- [ ] Case loading < 2 seconds
- [ ] Smooth trial interactions
- [ ] Mobile responsiveness

## 🚨 Troubleshooting

### Common Issues

**Authentication Timeout**
- Check Supabase URL and keys
- Verify RLS policies
- Check network connectivity

**Cases Not Loading**
- Verify database migrations applied
- Check legal_cases table has data
- Review RLS policies on legal_cases

**Build Failures**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all dependencies are installed

### Logs and Debugging
- **Frontend**: Browser developer console
- **Backend**: Supabase dashboard logs
- **Build**: Check deployment platform logs

## 🔄 Updates and Maintenance

### Updating the Application
1. **Code Changes**: Push to GitHub repository
2. **Auto-Deploy**: Most platforms auto-deploy on git push
3. **Database Changes**: Apply migrations via Supabase CLI

### Database Maintenance
```bash
# Backup database
supabase db dump -f backup.sql

# Apply new migrations
supabase migration up

# Reset database (if needed)
supabase db reset
```

### Monitoring
- **Uptime**: Use services like UptimeRobot
- **Performance**: Monitor Core Web Vitals
- **Errors**: Set up error tracking (Sentry, etc.)

## 🎯 Production Considerations

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] RLS policies tested
- [ ] API rate limiting configured

### Performance
- [ ] CDN configured
- [ ] Images optimized
- [ ] Bundle size optimized
- [ ] Caching strategies implemented

### Scalability
- [ ] Database indexed appropriately
- [ ] Edge functions optimized
- [ ] Client-side caching implemented
- [ ] Error boundaries in place

---

**Need Help?** Check the main README.md or create an issue on GitHub.
