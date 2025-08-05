# 🚀 Virtual Gavel - Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. **Fork/Upload to GitHub**
2. **Connect to Vercel**
3. **Deploy** - Vercel will auto-detect the Vite config
4. **Environment Variables**: Add your Supabase keys in Vercel dashboard

### Option 2: Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

1. **Connect GitHub repo**
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy**

### Option 3: Manual Deploy
```bash
# Build the project
npm install
npm run build

# Deploy the 'dist' folder to any static hosting
```

## Environment Variables Needed

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ⚠️ Authentication Configuration

**Important**: Before deployment, configure Supabase authentication settings:

1. **Go to** Supabase Dashboard → Authentication → Settings
2. **Configure Email Domains**:
   - Add allowed domains for user registration
   - Remove domain restrictions if needed for public use
3. **SMTP Settings** (Optional):
   - Configure email templates
   - Set up custom SMTP for branded emails

**Current Status**: Domain restrictions are enabled - only `@minimax.com` and pre-configured domains are allowed.

## Production Features
- ✅ Mobile-optimized responsive design
- ✅ Progressive Web App (PWA)
- ✅ Gamification features
- ✅ Real-time multiplayer support
- ✅ Optimized for performance

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Deployment**: Vercel/Netlify ready

---

**Need help?** Check the main README.md for setup instructions.
