import { motion } from 'framer-motion'
import { 
  Zap, 
  Users, 
  GraduationCap, 
  Crown, 
  Star, 
  Clock,
  Target,
  TrendingUp
} from 'lucide-react'
import { SwipeableCard } from './SwipeableCard'
import { useIsMobile } from '@/hooks/use-mobile'

interface GameMode {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  players: string
  features: string[]
  isPopular?: boolean
  isNew?: boolean
}

interface MobileGameModesProps {
  onSelectMode: (mode: string) => void
  selectedMode?: string
}

export function MobileGameModes({ onSelectMode, selectedMode }: MobileGameModesProps) {
  const isMobile = useIsMobile()
  
  const gameModes: GameMode[] = [
    {
      id: 'standard',
      name: 'Virtual Courtroom',
      description: 'Experience a full trial with AI jury, evidence presentation, and strategic gameplay.',
      icon: Users,
      difficulty: 'intermediate',
      estimatedTime: '15-30 min',
      players: '1-4 players',
      features: ['AI Jury', 'Evidence System', 'Strategic Depth'],
      isPopular: true
    },
    {
      id: 'junior',
      name: 'Junior Justice',
      description: 'Perfect for beginners! Learn the basics with guided tutorials and simplified cases.',
      icon: GraduationCap,
      difficulty: 'beginner',
      estimatedTime: '10-15 min',
      players: '1-2 players',
      features: ['Tutorial Mode', 'Simplified Rules', 'Learning Path']
    },
    {
      id: 'master',
      name: 'Legal Master',
      description: 'Challenge yourself with complex cases, advanced strategy, and competitive rankings.',
      icon: Crown,
      difficulty: 'advanced',
      estimatedTime: '30-45 min',
      players: '2-6 players',
      features: ['Complex Cases', 'Advanced Strategy', 'Competitive Mode'],
      isNew: true
    },
    {
      id: 'training',
      name: 'Training Academy',
      description: 'Hone your skills with targeted practice sessions and skill-building exercises.',
      icon: Target,
      difficulty: 'intermediate',
      estimatedTime: '5-20 min',
      players: 'Solo practice',
      features: ['Skill Building', 'Practice Mode', 'Progress Tracking']
    },
    {
      id: 'career',
      name: 'Career Mode',
      description: 'Build your legal career from junior associate to supreme court justice.',
      icon: TrendingUp,
      difficulty: 'intermediate',
      estimatedTime: 'Ongoing',
      players: 'Solo journey',
      features: ['Progression System', 'Unlockable Content', 'Story Mode']
    }
  ]
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100'
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100'
      case 'advanced':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gavel-blue bg-gavel-blue/10'
    }
  }
  
  const handleModeSelect = (mode: GameMode) => {
    onSelectMode(mode.id)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30])
    }
  }
  
  return (
    <div className="spacing-mobile">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <motion.h2 
          className="title-mobile-responsive text-parchment font-bold mb-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          Choose Your Legal Challenge
        </motion.h2>
        <motion.p 
          className="text-mobile-responsive text-parchment/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Select a game mode that matches your experience level
        </motion.p>
      </motion.div>
      
      <div className="mobile-grid">
        {gameModes.map((mode, index) => {
          const Icon = mode.icon
          const isSelected = selectedMode === mode.id
          
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            >
              <SwipeableCard
                onTap={() => handleModeSelect(mode)}
                className={`relative ${
                  isSelected ? 'ring-2 ring-verdict-gold' : ''
                }`}
              >
                <motion.div
                  className={`card-mobile-interactive p-5 relative overflow-hidden ${
                    mode.isPopular ? 'bg-gradient-to-br from-verdict-gold/10 to-gavel-blue/5' : ''
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    {mode.isPopular && (
                      <motion.span
                        className="bg-verdict-gold text-gavel-blue px-2 py-1 rounded-full text-xs font-bold"
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: -12 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        POPULAR
                      </motion.span>
                    )}
                    {mode.isNew && (
                      <motion.span
                        className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                        initial={{ scale: 0, rotate: 12 }}
                        animate={{ scale: 1, rotate: 12 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        NEW
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Mode icon */}
                  <motion.div
                    className="w-12 h-12 bg-gavel-blue/10 rounded-xl flex items-center justify-center mb-4"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="w-6 h-6 text-gavel-blue" />
                  </motion.div>
                  
                  {/* Mode info */}
                  <h3 className="font-bold text-gavel-blue text-lg mb-2">
                    {mode.name}
                  </h3>
                  
                  <p className="text-sm text-mahogany/80 mb-4 leading-relaxed">
                    {mode.description}
                  </p>
                  
                  {/* Mode metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-mahogany/60">Difficulty:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getDifficultyColor(mode.difficulty)
                      }`}>
                        {mode.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-mahogany/60">Duration:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-mahogany/60" />
                        <span className="text-xs text-mahogany/80">{mode.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-mahogany/60">Players:</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-mahogany/60" />
                        <span className="text-xs text-mahogany/80">{mode.players}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {mode.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gavel-blue/10 text-gavel-blue text-xs rounded-md"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 border-2 border-verdict-gold rounded-xl pointer-events-none"
                      initial={{ scale: 1.05, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    />
                  )}
                </motion.div>
              </SwipeableCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}