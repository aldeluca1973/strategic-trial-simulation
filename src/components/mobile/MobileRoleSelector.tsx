import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Gavel, Users, ShieldCheck, Sword, CheckCircle, Clock } from 'lucide-react'
import { MobilePageWrapper } from './MobileHeader'
import { SwipeableCard } from './SwipeableCard'
import { useIsMobile } from '@/hooks/use-mobile'
import { LegalCase } from '@/lib/supabase'

interface MobileRoleSelectorProps {
  selectedCase: LegalCase
  gameSettings: {
    playerMode: string
    timeLimit: number
    allowRandom: boolean
  }
  selectedRole: string | null
  onRoleSelect: (role: string) => void
  onBack: () => void
}

const ROLES = [
  {
    id: 'prosecutor',
    name: 'Prosecutor',
    description: 'Present the case against the defendant. Build a compelling argument using evidence.',
    icon: Sword,
    color: 'from-red-600 to-red-700',
    difficulty: 'Intermediate',
    responsibilities: [
      'Present evidence against defendant',
      'Build compelling arguments',
      'Question witnesses',
      'Convince the jury of guilt'
    ],
    tips: [
      'Focus on strong evidence',
      'Maintain logical flow',
      'Address counterarguments'
    ]
  },
  {
    id: 'defense',
    name: 'Defense Attorney',
    description: 'Defend your client and create reasonable doubt. Challenge the prosecution\'s case.',
    icon: ShieldCheck,
    color: 'from-blue-600 to-blue-700',
    difficulty: 'Intermediate',
    responsibilities: [
      'Defend the accused',
      'Create reasonable doubt',
      'Cross-examine witnesses',
      'Present alternative theories'
    ],
    tips: [
      'Question evidence validity',
      'Highlight inconsistencies',
      'Protect client\'s rights'
    ]
  },
  {
    id: 'judge',
    name: 'Judge',
    description: 'Maintain order, rule on objections, and ensure fair proceedings.',
    icon: Scale,
    color: 'from-purple-600 to-purple-700',
    difficulty: 'Advanced',
    responsibilities: [
      'Maintain courtroom order',
      'Rule on objections',
      'Ensure fair proceedings',
      'Guide the trial process'
    ],
    tips: [
      'Stay impartial',
      'Know the rules',
      'Control the pace'
    ]
  }
]

export function MobileRoleSelector({ 
  selectedCase, 
  gameSettings, 
  selectedRole, 
  onRoleSelect, 
  onBack 
}: MobileRoleSelectorProps) {
  const isMobile = useIsMobile()
  const [showRoleDetails, setShowRoleDetails] = useState<string | null>(null)
  
  const handleRoleSelect = (roleId: string) => {
    onRoleSelect(roleId)
    // Haptic feedback for role selection
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }
  }
  
  const getGameModeLabel = () => {
    switch (gameSettings.playerMode) {
      case 'solo': return 'Solo Practice'
      case '2player': return 'Head-to-Head'
      case '3player': return 'Full Trial'
      default: return 'Custom'
    }
  }
  
  if (!isMobile) {
    return null // Use desktop version
  }
  
  return (
    <MobilePageWrapper
      headerProps={{
        title: "Choose Your Role",
        subtitle: selectedCase.case_name,
        showBack: true,
        onBack
      }}
      showBottomNav={false}
      className="bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany"
    >
      {/* Case and game info */}
      <motion.div
        className="card-mobile p-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <h3 className="font-bold text-gavel-blue text-lg mb-2">
            {selectedCase.case_name}
          </h3>
          <div className="flex items-center justify-center gap-4 text-sm text-mahogany/70">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{getGameModeLabel()}</span>
            </div>
            <div className="w-1 h-1 bg-mahogany/30 rounded-full" />
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{gameSettings.timeLimit} min</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Role selection */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="title-mobile-responsive text-parchment font-bold mb-2">
            Select Your Role
          </h2>
          <p className="text-mobile-responsive text-parchment/80">
            Each role offers a unique strategic challenge
          </p>
        </motion.div>
        
        {ROLES.map((role, index) => {
          const Icon = role.icon
          const isSelected = selectedRole === role.id
          
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <SwipeableCard
                onTap={() => handleRoleSelect(role.id)}
                className={isSelected ? 'ring-2 ring-verdict-gold' : ''}
              >
                <motion.div
                  className={`card-mobile-interactive p-5 relative overflow-hidden ${
                    isSelected ? 'bg-verdict-gold/5 border-verdict-gold/30' : ''
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {/* Role header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gavel-blue text-lg">
                          {role.name}
                        </h3>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <CheckCircle className="w-5 h-5 text-verdict-gold" />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-sm text-mahogany/60">
                        {role.difficulty} Level
                      </span>
                    </div>
                  </div>
                  
                  {/* Role description */}
                  <p className="text-sm text-mahogany/80 mb-4 leading-relaxed">
                    {role.description}
                  </p>
                  
                  {/* Key responsibilities */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-gavel-blue mb-2">Key Responsibilities:</h4>
                    {role.responsibilities.slice(0, 2).map((responsibility, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-mahogany/70">
                        <div className="w-1 h-1 bg-verdict-gold rounded-full mt-2 flex-shrink-0" />
                        <span>{responsibility}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* More info button */}
                  <div className="text-center mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowRoleDetails(role.id)
                      }}
                      className="text-xs text-gavel-blue underline"
                    >
                      View detailed role info
                    </button>
                  </div>
                </motion.div>
              </SwipeableCard>
            </motion.div>
          )
        })}
      </div>
      
      {/* Continue button */}
      {selectedRole && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 p-4 bg-parchment/95 backdrop-blur-lg border-t border-gavel-blue/20"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.button
            className="w-full btn-mobile haptic-medium"
            onClick={() => handleRoleSelect(selectedRole)}
            whileTap={{ scale: 0.95 }}
          >
            <Gavel className="w-5 h-5" />
            Start as {ROLES.find(r => r.id === selectedRole)?.name}
          </motion.button>
        </motion.div>
      )}
      
      {/* Role details modal */}
      <AnimatePresence>
        {showRoleDetails && (
          <motion.div
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRoleDetails(null)}
          >
            <motion.div
              className="w-full bg-parchment rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto scroll-touch safe-bottom"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const role = ROLES.find(r => r.id === showRoleDetails)
                if (!role) return null
                const Icon = role.icon
                
                return (
                  <>
                    <div className="w-12 h-1 bg-mahogany/30 rounded-full mx-auto mb-6" />
                    
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gavel-blue mb-2">
                        {role.name}
                      </h3>
                      <p className="text-mahogany/70">
                        {role.difficulty} Level Role
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gavel-blue mb-3">All Responsibilities:</h4>
                        <div className="space-y-2">
                          {role.responsibilities.map((responsibility, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-verdict-gold mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-mahogany/80">{responsibility}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gavel-blue mb-3">Strategic Tips:</h4>
                        <div className="space-y-2">
                          {role.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-verdict-gold rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-mahogany/80">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      className="w-full btn-mobile mt-6"
                      onClick={() => {
                        handleRoleSelect(role.id)
                        setShowRoleDetails(null)
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                      Select {role.name}
                    </motion.button>
                  </>
                )
              })()
            }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobilePageWrapper>
  )
}