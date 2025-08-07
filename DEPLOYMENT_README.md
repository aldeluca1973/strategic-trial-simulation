# Strategic Trial Simulation - Clean Deployment Package

## 🎯 What's Included

This is a **complete, clean project** with all the latest enhancements:

### ✅ Latest Features
- **Enhanced Strategic Courtroom** with pre-trial case file screen
- **"Start Trial" button** and proper trial initialization
- **Sign out buttons** on all screens
- **Improved evidence presentation** with timeline
- **Collapsible case file** for reference during trial
- **Trial phase navigation** and controls
- **Custom branded email system** for user confirmations
- **All bug fixes** applied

### ✅ Clean Project Structure
- **No conflicting files** - removed old Courtroom.tsx
- **Proper component organization**
- **Updated dependencies**
- **Vercel-ready configuration**

## 🚀 Deployment Instructions

### Step 1: Clear Your Repository
1. **Delete everything** in your current GitHub repository
2. **Keep only** the `.git` folder and any `.github` workflows you want to preserve

### Step 2: Upload This Package
1. **Extract this entire package** to your repository folder
2. **Copy all files and folders** (including hidden files like `.gitignore`)

### Step 3: Deploy to Vercel
```bash
# Navigate to your repository folder
cd your-repository-name

# Add all files
git add .

# Commit the clean project
git commit -m "Fresh clean deployment - Strategic Trial Simulation v2.0"

# Push to GitHub
git push origin main
```

### Step 4: Configure Vercel
1. **Vercel should automatically detect** the React/Vite project
2. **Build settings** should be:
   - Build Command: `npm run build` or `pnpm build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `pnpm install`

### Step 5: Add Environment Variables
In your Vercel dashboard, add these environment variables:
```
VITE_SUPABASE_URL=https://frgacnilaymjjthobztp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZ2FjbmlsYXltamp0aG9ienRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDcyMjQsImV4cCI6MjA2OTgyMzIyNH0.6nANNAu4j_S0Ne8busky8hhkH4uQDBGJpLsVvqTMJ2o
```

## 🎮 What You'll See After Deployment

### 1. Authentication
- Clean login/registration pages
- Custom branded confirmation emails
- Proper error handling

### 2. Game Modes
- Mode selection interface with all options
- Junior Justice, Training Academy, Career Progression
- Strategic Trial Simulation (main focus)

### 3. Strategic Trial Simulation
- **Pre-trial screen** with:
  - Case file overview
  - Evidence preview
  - Strategic tips
  - Role information
  - **"Begin Trial Proceedings" button**
- **Main trial interface** with:
  - Phase indicators
  - Evidence timeline
  - Collapsible case file
  - Sign out option
  - Proper navigation controls

## 🔧 Troubleshooting

### If Deployment Fails
1. Check Vercel build logs for errors
2. Ensure all environment variables are set
3. Try clearing Vercel cache and redeploying

### If Features Don't Appear
1. **Hard refresh** browser (Ctrl+Shift+R)
2. **Clear browser cache** completely
3. **Try incognito/private mode**
4. Check browser console for errors

### Support
If you encounter any issues, provide:
- Vercel deployment logs
- Browser console errors
- Description of unexpected behavior

## 📁 Project Structure
```
strategic-trial-simulation/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   │   ├── auth/     # Authentication
│   │   ├── game/     # Game components (StrategicCourtroom, etc.)
│   │   ├── lobby/    # Game lobby
│   │   └── ...       # Other components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities and Supabase config
│   └── stores/       # State management
├── package.json      # Dependencies
├── vite.config.ts    # Vite configuration
└── vercel.json       # Vercel configuration
```

---

**Ready to deploy!** This package contains everything needed for a successful deployment. 🚀
