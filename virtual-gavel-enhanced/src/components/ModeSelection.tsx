import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, Gavel, Heart, Clock, Trophy, Star, GraduationCap, Crown, ShoppingCart, Book, Play } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { PremiumCasesModal } from '@/components/premium'
import { HowToPlayGuide } from '@/components/tutorial/HowToPlayGuide'

export type GameMode = 'training' | 'career' | 'junior' | 'standard' | 'master'

interface ModeSelectionProps {
  onModeSelect: (mode: GameMode) => void
}

export function ModeSelection({ onModeSelect }: ModeSelectionProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const modes = [
    {
      id: 'training' as GameMode,
      title: '🎓 Training Academy',
      subtitle: 'All Levels • Learn at your pace',
      description: 'Master the fundamentals of law through interactive lessons and guided practice sessions.',
      features: [
        '📚 Interactive legal tutorials',
        '🎯 Step-by-step skill building',
        '✅ Progress tracking system',
        '🏆 Certification badges',
        '🎮 Practice scenarios'
      ],
      color: 'from-emerald-500 to-teal-500',
      icon: GraduationCap,
      difficulty: 1
    },
    {
      id: 'career' as GameMode,
      title: '👑 Legal Career',
      subtitle: 'RPG Mode • Progressive challenges',
      description: 'Build your legal career from junior associate to master attorney through progressive cases.',
      features: [
        '📈 XP and ranking system',
        '🎯 Unlock higher difficulty cases',
        '💼 Specialization paths',
        '🏆 Professional achievements',
        '💎 Premium landmark cases'
      ],
      color: 'from-amber-500 to-yellow-600',
      icon: Crown,
      difficulty: 2
    },
    {
      id: 'junior' as GameMode,
      title: '🌈 Junior Justice',
      subtitle: 'Ages 8-14 • 5-10 minutes',
      description: 'Learn about fairness, listening, and problem-solving through fun, colorful cases!',
      features: [
        '🎨 Colorful, kid-friendly interface',
        '🏫 School and playground cases',
        '🎯 Simple drag-and-drop gameplay',
        '🏆 Achievement badges and rewards',
        '📖 Story-mode learning'
      ],
      color: 'from-pink-500 to-purple-500',
      icon: Heart,
      difficulty: 1
    },
    {
      id: 'standard' as GameMode,
      title: '⚖️ Virtual Courtroom',
      subtitle: 'Teen/Adult • 5-60 minutes',
      description: 'Master legal strategy through realistic courtroom scenarios with consequence-driven gameplay.',
      features: [
        '🎯 Strategic evidence presentation',
        '⚖️ Real-time case strength tracking',
        '🧠 AI jury evaluation system',
        '📊 Credibility and consequence mechanics',
        '🎓 Educational legal insights'
      ],
      color: 'from-gavel-blue to-mahogany',
      icon: Scale,
      difficulty: 3
    },
    {
      id: 'master' as GameMode,
      title: '🏛️ Legal Master Mode',
      subtitle: 'Professional • 60 minutes',
      description: 'Advanced legal training with complex procedures, appeals, and professional-grade simulation.',
      features: [
        '📚 Pre-trial research and motions',
        '🔍 Advanced evidence discovery',
        '👥 Strategic jury selection',
        '📋 Complex procedural challenges',
        '🎓 Law school level insights'
      ],
      color: 'from-amber-600 to-orange-700',
      icon: Trophy,
      difficulty: 5
    }
  ]

  return (
    <div className="min-h-screen relative p-4">
      {/* Courtroom Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/courtroom-background.jpg)',
        }}
      />
      
      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-gavel-blue/80 via-gavel-blue-700/85 to-mahogany/80" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gavel size={48} className="text-verdict-gold" />
            <h1 className="text-4xl font-serif font-bold text-parchment">
              Virtual Courtroom Platform
            </h1>
            <Gavel size={48} className="text-verdict-gold" />
          </div>
          <p className="text-xl text-parchment/80 max-w-3xl mx-auto mb-6">
            Choose your legal education experience - from learning about fairness as a child 
            to mastering advanced trial strategy as a professional.
          </p>
          
          {/* CRITICAL: How to Play Button */}
          <div className="flex justify-center gap-4 mb-4">
            <GavelButton
              variant="accent"
              onClick={() => setShowHowToPlay(true)}
              className="flex items-center gap-2 px-6 py-3"
            >
              <Book size={20} />
              How to Play
            </GavelButton>
            <GavelButton
              variant="secondary"
              onClick={() => {
                // Start with tutorial mode that leads to standard courtroom
                setShowHowToPlay(true)
              }}
              className="flex items-center gap-2 px-6 py-3"
            >
              <Play size={20} />
              Quick Start Tutorial
            </GavelButton>
          </div>
          
          <div className="text-sm text-parchment/60">
            🎆 New? Start with "How to Play" to learn the rules!
          </div>
        </motion.div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {modes.map((mode, index) => {
            const Icon = mode.icon
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="h-full"
              >
                <CourtroomCard 
                  className={`h-full transition-all duration-300 cursor-pointer hover:scale-105 ${
                    selectedMode === mode.id 
                      ? 'ring-4 ring-verdict-gold shadow-2xl' 
                      : 'hover:shadow-xl'
                  }`}
                  onClick={() => {
                    console.log('Mode card clicked:', mode.id)
                    setSelectedMode(mode.id)
                  }}
                >
                  <CourtroomCardHeader>
                    <div className={`w-full h-32 bg-gradient-to-r ${mode.color} rounded-lg mb-4 flex items-center justify-center`}>
                      <Icon size={64} className="text-white" />
                    </div>
                    
                    <CourtroomCardTitle className="text-2xl mb-2">
                      {mode.title}
                    </CourtroomCardTitle>
                    
                    <div className="text-verdict-gold font-medium mb-3">
                      {mode.subtitle}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < mode.difficulty 
                              ? 'text-verdict-gold fill-verdict-gold' 
                              : 'text-parchment/30'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-parchment/70 ml-2">
                        Difficulty Level
                      </span>
                    </div>
                  </CourtroomCardHeader>
                  
                  <CourtroomCardContent>
                    <p className="text-parchment/80 mb-4 leading-relaxed">
                      {mode.description}
                    </p>
                    
                    <div className="space-y-2">
                      {mode.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-parchment/70">
                          <div className="w-1.5 h-1.5 bg-verdict-gold rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {selectedMode === mode.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-3 bg-verdict-gold/10 rounded-lg border border-verdict-gold/30"
                      >
                        <div className="flex items-center gap-2 text-verdict-gold font-medium">
                          <Clock size={16} />
                          Selected Mode
                        </div>
                        <p className="text-sm text-parchment/80 mt-1">
                          Ready to begin your legal education journey!
                        </p>
                      </motion.div>
                    )}
                  </CourtroomCardContent>
                </CourtroomCard>
              </motion.div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-4"
        >
          {selectedMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <GavelButton
                onClick={() => {
                  console.log('Starting mode:', selectedMode)
                  if (selectedMode) {
                    onModeSelect(selectedMode)
                  }
                }}
                className="px-8 py-4 text-lg"
              >
                Start {modes.find(m => m.id === selectedMode)?.title} ⚖️
              </GavelButton>
              
              <div className="text-sm text-parchment/60">
                Begin your selected legal education experience
              </div>
            </motion.div>
          )}
          
          {!selectedMode && (
            <div className="text-parchment/60 space-y-2">
              <div>Select a mode above to begin your legal education journey</div>
              <div className="text-sm">
                Or{' '}
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="text-verdict-gold hover:text-verdict-gold/80 underline"
                >
                  browse premium landmark cases
                </button>
                {' '}for immediate access
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Learning Progression Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-12 text-center"
        >
          <CourtroomCard className="max-w-4xl mx-auto">
            <CourtroomCardHeader>
              <CourtroomCardTitle className="text-xl">
                🎓 Progressive Legal Education
              </CourtroomCardTitle>
            </CourtroomCardHeader>
            <CourtroomCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl mb-2">🌱</div>
                  <h3 className="font-medium text-verdict-gold mb-2">Start Young</h3>
                  <p className="text-sm text-parchment/70">
                    Children learn fairness, empathy, and problem-solving through engaging stories
                  </p>
                </div>
                <div>
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-medium text-verdict-gold mb-2">Build Skills</h3>
                  <p className="text-sm text-parchment/70">
                    Teens and adults master strategic thinking and legal reasoning
                  </p>
                </div>
                <div>
                  <div className="text-2xl mb-2">⚖️</div>
                  <h3 className="font-medium text-verdict-gold mb-2">Master Law</h3>
                  <p className="text-sm text-parchment/70">
                    Professionals refine advanced trial advocacy and complex legal analysis
                  </p>
                </div>
              </div>
            </CourtroomCardContent>
          </CourtroomCard>
        </motion.div>
      </div>
      
      {/* How to Play Guide */}
      <HowToPlayGuide
        isVisible={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        startTutorial={() => {
          setShowHowToPlay(false)
          // Start with standard mode for tutorial
          onModeSelect('standard')
        }}
      />
      
      {/* Premium Cases Modal */}
      <PremiumCasesModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onPurchase={(bundleId) => {
          console.log('Purchase bundle:', bundleId)
          // TODO: Implement actual payment processing
          alert(`Purchase initiated for bundle: ${bundleId}. Payment integration coming soon!`)
          setShowPremiumModal(false)
        }}
      />
    </div>
  )
}