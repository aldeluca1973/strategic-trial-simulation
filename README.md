# ⚖️ Virtual Gavel - Legal Education Game

**An immersive legal education platform featuring real courtroom cases, gamification, and mobile-first design.**

## 🎮 Live Demo
🔗 **[Play Virtual Gavel](https://aw157fnhbdue.space.minimax.io)**

## ✨ Features

### 🎯 Game Modes
- **🏛️ Virtual Courtroom** - Full trial simulations with real cases
- **🎓 Training Academy** - Interactive legal education
- **👑 Legal Career** - RPG-style progression system  
- **🌈 Junior Justice** - Kid-friendly legal learning (Ages 8-14)
- **⚖️ Legal Master** - Advanced professional training

### 📱 Mobile-First Design
- **Touch-optimized interface** with 44px+ touch targets
- **Bottom navigation** for thumb-friendly access
- **Swipe gestures** for intuitive navigation
- **Progressive Web App** - Install like a native app
- **Responsive design** - Perfect on any device

### 🎮 Gamification Features
- **Power-ups & Combos** - Strategic courtroom advantages
- **Achievement System** - Unlock badges and rewards
- **Leaderboards** - Compete with other players
- **Avatar Selection** - Personalize your attorney
- **Real-time Scoring** - Dynamic feedback system

### ⚖️ Educational Content
- **25+ Real Legal Cases** - Historical and landmark trials
- **Multiple Practice Areas** - Criminal, Civil, Contract Law
- **Interactive Evidence** - Present and examine evidence
- **AI Jury System** - Realistic trial outcomes
- **Professional Insights** - Learn real legal strategies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/virtual-gavel.git
cd virtual-gavel

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### ⚠️ Authentication Note
**Important**: The authentication system currently has domain restrictions configured in Supabase. For user registration and login:

- ✅ **Allowed domains**: `@minimax.com` and other pre-configured domains
- ❌ **Restricted**: Most public email providers (`@gmail.com`, `@yahoo.com`, etc.)

**For Testing**: Use the built-in test account generator in Supabase dashboard, or contact the administrator to allowlist your domain.

**For Production**: Configure Supabase authentication settings to allow your desired email domains.

## 📱 Mobile Testing
Test the mobile experience by:
1. Opening on your smartphone
2. Adding to home screen (PWA)
3. Testing touch interactions and gestures

## 🛠️ Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with mobile-first design
- **Backend**: Supabase (Database, Auth, Real-time)
- **State**: Zustand + React Query
- **Animations**: Framer Motion
- **PWA**: Service Worker + Web App Manifest

## 📦 Project Structure
```
├── src/
│   ├── components/
│   │   ├── mobile/          # Mobile-optimized components
│   │   ├── game/           # Courtroom game components
│   │   ├── auth/           # Authentication
│   │   └── ui/             # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # State management
│   └── lib/                # Utilities and API
├── supabase/               # Database schema & functions
└── public/                 # Static assets
```

## 🎯 Game Features

### Courtroom Simulation
- **Real Cases**: Based on actual legal precedents
- **Role Playing**: Act as prosecutor, defense, or judge
- **Evidence System**: Present and challenge evidence
- **Witness Examination**: Interactive questioning
- **Jury Deliberation**: AI-powered verdict system

### Educational Value
- **Legal Concepts**: Learn through interactive gameplay
- **Critical Thinking**: Develop analytical skills
- **Public Speaking**: Practice courtroom presentation
- **Ethics**: Understand legal and moral principles

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile devices
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Legal case data sourced from public court records
- Educational content reviewed by legal professionals
- Mobile UX inspired by modern gaming interfaces

---

**Made with ⚖️ for legal education and gaming enthusiasts**
