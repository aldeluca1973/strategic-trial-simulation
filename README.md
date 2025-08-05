# Virtual Courtroom - Legal Education Platform

A comprehensive legal education platform that provides immersive trial simulation experiences for students and legal professionals.

## 🎯 Overview

Virtual Courtroom is an interactive educational platform designed to teach legal concepts through realistic trial simulations. Users can take on roles of prosecutors, defense attorneys, or judges in various legal scenarios across multiple areas of law.

## ✨ Features

### Game Modes
- **Virtual Courtroom**: Full trial simulation with evidence, witnesses, and jury decisions
- **Junior Justice**: Beginner-friendly mode with simplified cases and enhanced guidance
- **Career Mode**: Progressive learning with skill development tracking
- **Training Academy**: Educational content and guided tutorials

### Core Functionality
- **Multiple Legal Areas**: Criminal Law, Contract Law, Constitutional Law, and more
- **Evidence System**: Interactive evidence presentation and examination
- **Witness Examination**: Realistic questioning and cross-examination
- **Case File Integration**: Rich case context with police reports and background information
- **Adaptive Difficulty**: Adjustable complexity levels from beginner to expert
- **Tutorial System**: Comprehensive "How to Play" guides and contextual instructions

### Educational Features
- **69+ Legal Cases**: Diverse collection including landmark cases and murder trials
- **Phase-by-Phase Guidance**: Context-sensitive help during trials
- **Role-Specific Instructions**: Tailored guidance for prosecutors vs. defense attorneys
- **Random Case Selection**: "Surprise Me!" feature for varied practice

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Shadcn/ui** component library
- **React Router** for navigation

### Backend
- **Supabase** for database, authentication, and real-time features
- **PostgreSQL** database with Row Level Security (RLS)
- **Edge Functions** for server-side logic
- **Supabase Auth** for user management

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **PostCSS** for CSS processing
- **Git** for version control

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd virtual-courtroom
   ```

2. **Install dependencies**
   ```bash
   cd virtual-gavel-enhanced
   npm install
   # or
   pnpm install
   ```

3. **Configure Supabase**
   - Create a new Supabase project
   - Apply database migrations from `/supabase/migrations/`
   - Deploy edge functions from `/supabase/functions/`
   - Configure authentication settings

4. **Environment Variables**
   Create `.env.local` in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   # or
   pnpm build
   ```

## 🗃️ Database Setup

### Migrations
The `/supabase/migrations/` directory contains all database schema changes:
- `1754342696_update_criminal_case_categories.sql` - Criminal law case categories
- `1754343686_fix_profiles_table_defaults.sql` - User profile defaults
- `1754352931_fix_user_profile_creation_trigger.sql` - Profile creation automation
- `1754352944_clean_up_profiles_rls_policies.sql` - Security policies

### Edge Functions
- `create-admin-user/` - Administrative user creation functionality

## 🎮 Usage

### For Students
1. **Create Account**: Register with email and password
2. **Choose Mode**: Select from Virtual Courtroom, Junior Justice, Career, or Training
3. **Configure Game**: Set difficulty, legal area, and game length
4. **Practice Trials**: Engage in realistic legal simulations
5. **Learn**: Use tutorials and contextual guidance to improve

### For Educators
- **Assign Cases**: Direct students to specific legal scenarios
- **Track Progress**: Monitor student engagement and performance
- **Customize Difficulty**: Adjust complexity based on learning objectives

## 🧪 Testing Status

**Latest Comprehensive Testing**: 2025-08-05

### ✅ Verified Features
- ✅ Authentication system (stable, no timeouts)
- ✅ Criminal Law filter (murder cases accessible)
- ✅ All game modes functional
- ✅ Trial gameplay (evidence, witnesses, case files)
- ✅ Tutorial system and instructions
- ✅ Difficulty controls and setup options
- ✅ Single-click interactions
- ✅ Quit functionality

### 📊 Test Results
- **Overall Completion**: 85% of comprehensive scope tested
- **Critical Systems**: 100% functional
- **Educational Value**: Ready for teaching
- **User Experience**: Significantly improved

See `/docs/final_comprehensive_testing_report.pdf` for detailed testing documentation.

## 🏗️ Project Structure

```
virtual-gavel-enhanced/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── game/           # Game-related components
│   │   ├── tutorial/       # Tutorial and help components
│   │   ├── junior/         # Junior Justice mode
│   │   ├── career/         # Career mode components
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── stores/             # State management
│   └── ...
├── public/                 # Static assets
├── supabase/              # Database and backend
│   ├── migrations/        # Database schema changes
│   └── functions/         # Edge functions
└── docs/                  # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test all changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Check the documentation in `/docs/`
- Review the comprehensive testing report for known limitations

## 🎯 Educational Impact

Virtual Courtroom provides:
- **Hands-on Learning**: Practice legal skills in realistic scenarios
- **Diverse Cases**: Exposure to various areas of law
- **Progressive Difficulty**: Appropriate challenges for all skill levels
- **Immediate Feedback**: Learn from trial outcomes and guidance
- **Accessibility**: Web-based platform available anywhere

---

**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-05  
**Version**: 1.0.0

Built with ❤️ for legal education
