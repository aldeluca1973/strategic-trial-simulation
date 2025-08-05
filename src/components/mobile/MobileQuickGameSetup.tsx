import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gavel, 
  Filter, 
  Clock, 
  Search, 
  Users, 
  Shuffle, 
  ChevronRight,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { MobilePageWrapper } from './MobileHeader'
import { SwipeableCard } from './SwipeableCard'
import { useIsMobile } from '@/hooks/use-mobile'
import { supabase, LegalCase } from '@/lib/supabase'

interface MobileQuickGameSetupProps {
  onCasesFiltered: (cases: LegalCase[], gameSettings?: {
    playerMode: string
    timeLimit: number
    allowRandom: boolean
  }) => void
  onRandomGameStart?: (randomCase: LegalCase, gameSettings: {
    playerMode: string
    timeLimit: number
    allowRandom: boolean
  }) => void
  onBack: () => void
}

const LEGAL_CATEGORIES = [
  { value: 'criminal', label: 'Criminal Law', icon: '🕵️', description: 'Murder, assault, theft' },
  { value: 'civil', label: 'Civil Law', icon: '🏛️', description: 'Private disputes' },
  { value: 'contract_law', label: 'Contract Law', icon: '📋', description: 'Agreements & deals' },
  { value: 'constitutional', label: 'Constitutional', icon: '🗽', description: 'Rights & freedoms' },
  { value: 'tort', label: 'Tort Law', icon: '⚡', description: 'Personal injury' },
  { value: 'employment', label: 'Employment', icon: '💼', description: 'Workplace issues' },
  { value: 'traffic', label: 'Traffic Law', icon: '🚗', description: 'Traffic violations' },
  { value: 'general', label: 'General Cases', icon: '📚', description: 'Mixed legal topics' }
]

const PLAYER_MODES = [
  { 
    value: 'solo', 
    label: 'Solo Practice', 
    description: 'You vs AI',
    icon: '🎭',
    recommended: true
  },
  { 
    value: '2player', 
    label: 'Head-to-Head', 
    description: 'Attorney duel',
    icon: '⚔️'
  },
  { 
    value: '3player', 
    label: 'Full Trial', 
    description: 'Complete courtroom',
    icon: '👥'
  }
]

const TIME_OPTIONS = [
  { value: 5, label: '5 min', description: 'Quick round', icon: '⚡' },
  { value: 10, label: '10 min', description: 'Speed trial', icon: '🏃' },
  { value: 15, label: '15 min', description: 'Standard', icon: '⏰', recommended: true },
  { value: 20, label: '20 min', description: 'Extended', icon: '🕐' },
  { value: 30, label: '30 min', description: 'Deep dive', icon: '🕰️' }
]

export function MobileQuickGameSetup({ onCasesFiltered, onRandomGameStart, onBack }: MobileQuickGameSetupProps) {
  const isMobile = useIsMobile()
  const [currentStep, setCurrentStep] = useState<'mode' | 'time' | 'category' | 'search'>('mode')
  const [selectedPlayerMode, setSelectedPlayerMode] = useState('solo')
  const [selectedTime, setSelectedTime] = useState(15)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  
  // Load available categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('legal_cases')
          .select('case_category')
          .eq('is_active', true)
        
        if (error) throw error
        
        const categories = [...new Set(data.map(case_ => case_.case_category))]
        setAvailableCategories(categories)
      } catch (error) {
        console.error('Error loading categories:', error)
        setAvailableCategories(LEGAL_CATEGORIES.map(cat => cat.value))
      }
    }
    
    loadCategories()
  }, [])
  
  const handleNext = () => {
    if (currentStep === 'mode') {
      setCurrentStep('time')
    } else if (currentStep === 'time') {
      setCurrentStep('category')
    } else if (currentStep === 'category') {
      setCurrentStep('search')
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }
  
  const handleBack = () => {
    if (currentStep === 'search') {
      setCurrentStep('category')
    } else if (currentStep === 'category') {
      setCurrentStep('time')
    } else if (currentStep === 'time') {
      setCurrentStep('mode')
    } else {
      onBack()
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }
  
  const handleRandomGame = async () => {
    if (!onRandomGameStart) return
    
    setLoading(true)
    try {
      // Get a random case
      const { data: cases, error } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('is_active', true)
        .limit(50)
      
      if (error) throw error
      
      if (cases && cases.length > 0) {
        const randomCase = cases[Math.floor(Math.random() * cases.length)]
        const gameSettings = {
          playerMode: selectedPlayerMode,
          timeLimit: selectedTime,
          allowRandom: true
        }
        
        // Strong haptic feedback for starting game
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
        
        onRandomGameStart(randomCase, gameSettings)
      }
    } catch (error) {
      console.error('Error starting random game:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearch = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('legal_cases')
        .select('*')
        .eq('is_active', true)
      
      // Apply filters
      if (selectedCategories.length > 0) {
        query = query.in('case_category', selectedCategories)
      }
      
      if (searchQuery.trim()) {
        query = query.or(`case_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }
      
      const { data: cases, error } = await query.limit(20)
      
      if (error) throw error
      
      const gameSettings = {
        playerMode: selectedPlayerMode,
        timeLimit: selectedTime,
        allowRandom: false
      }
      
      onCasesFiltered(cases || [], gameSettings)
      
    } catch (error) {
      console.error('Error filtering cases:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }
  
  const getStepTitle = () => {
    switch (currentStep) {
      case 'mode': return 'Game Mode'
      case 'time': return 'Time Limit'
      case 'category': return 'Legal Areas'
      case 'search': return 'Find Cases'
      default: return 'Setup Game'
    }
  }
  
  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'mode': return 'How many players?'
      case 'time': return 'How long to play?'
      case 'category': return 'What interests you?'
      case 'search': return 'Ready to play?'
      default: return ''
    }
  }
  
  const canProceed = () => {
    switch (currentStep) {
      case 'mode': return !!selectedPlayerMode
      case 'time': return !!selectedTime
      case 'category': return true // Categories are optional
      case 'search': return true
      default: return false
    }
  }
  
  const getProgress = () => {
    const steps = ['mode', 'time', 'category', 'search']
    const currentIndex = steps.indexOf(currentStep)
    return ((currentIndex + 1) / steps.length) * 100
  }
  
  if (!isMobile) {
    // Desktop fallback - use existing component
    return null
  }
  
  return (
    <MobilePageWrapper
      headerProps={{
        title: getStepTitle(),
        subtitle: getStepSubtitle(),
        showBack: true,
        onBack: handleBack
      }}
      showBottomNav={false}
      className="bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany"
    >
      {/* Progress indicator */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-parchment/20 rounded-full h-2 mb-2">
          <motion.div
            className="bg-verdict-gold h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-parchment/70 text-sm text-center">
          Step {['mode', 'time', 'category', 'search'].indexOf(currentStep) + 1} of 4
        </p>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {/* Step 1: Player Mode Selection */}
        {currentStep === 'mode' && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="spacing-mobile"
          >
            <div className="text-center mb-6">
              <h2 className="title-mobile-responsive text-parchment font-bold mb-2">
                Choose Your Battle
              </h2>
              <p className="text-mobile-responsive text-parchment/80">
                Select how you want to experience the courtroom
              </p>
            </div>
            
            <div className="space-y-3">
              {PLAYER_MODES.map((mode, index) => (
                <SwipeableCard
                  key={mode.value}
                  onTap={() => setSelectedPlayerMode(mode.value)}
                >
                  <motion.div
                    className={`card-mobile-interactive p-4 ${
                      selectedPlayerMode === mode.value ? 'ring-2 ring-verdict-gold bg-verdict-gold/5' : ''
                    } ${
                      mode.recommended ? 'bg-gradient-to-r from-verdict-gold/10 to-gavel-blue/5' : ''
                    }`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{mode.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gavel-blue">{mode.label}</h3>
                          {mode.recommended && (
                            <span className="bg-verdict-gold text-gavel-blue px-2 py-0.5 rounded-full text-xs font-bold">
                              POPULAR
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-mahogany/70 mb-1">{mode.description}</p>
                        <div className="flex items-center gap-1 text-xs text-mahogany/60">
                          <Users className="w-3 h-3" />
                          <span>{mode.value === 'solo' ? '1' : mode.value === '2player' ? '2' : '3'} player{mode.value !== 'solo' ? 's' : ''}</span>
                        </div>
                      </div>
                      {selectedPlayerMode === mode.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <CheckCircle className="w-6 h-6 text-verdict-gold" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </SwipeableCard>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Step 2: Time Selection */}
        {currentStep === 'time' && (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="spacing-mobile"
          >
            <div className="text-center mb-6">
              <h2 className="title-mobile-responsive text-parchment font-bold mb-2">
                Set Your Time Limit
              </h2>
              <p className="text-mobile-responsive text-parchment/80">
                How long do you want to play?
              </p>
            </div>
            
            <div className="mobile-grid-dense">
              {[5, 10, 15, 20, 30].map((time, index) => (
                <SwipeableCard
                  key={time}
                  onTap={() => setSelectedTime(time)}
                >
                  <motion.div
                    className={`card-mobile-interactive p-4 text-center ${
                      selectedTime === time ? 'ring-2 ring-verdict-gold bg-verdict-gold/5' : ''
                    } ${
                      time === 15 ? 'bg-gradient-to-br from-verdict-gold/10 to-gavel-blue/5' : ''
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="mb-2">
                      {time === 5 && <Zap className="w-6 h-6 text-gavel-blue mx-auto" />}
                      {time === 10 && <Clock className="w-6 h-6 text-gavel-blue mx-auto" />}
                      {time === 15 && <Star className="w-6 h-6 text-verdict-gold mx-auto" />}
                      {time === 20 && <Clock className="w-6 h-6 text-gavel-blue mx-auto" />}
                      {time === 30 && <Clock className="w-6 h-6 text-gavel-blue mx-auto" />}
                    </div>
                    <div className="font-semibold text-gavel-blue text-lg">{time} min</div>
                    <div className="text-xs text-mahogany/60">
                      {time === 5 && 'Lightning'}
                      {time === 10 && 'Quick'}
                      {time === 15 && 'Perfect'}
                      {time === 20 && 'Standard'}
                      {time === 30 && 'Deep'}
                    </div>
                    {time === 15 && (
                      <div className="text-xs text-verdict-gold font-medium mt-1">
                        RECOMMENDED
                      </div>
                    )}
                    {selectedTime === time && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle className="w-4 h-4 text-verdict-gold" />
                      </motion.div>
                    )}
                  </motion.div>
                </SwipeableCard>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Step 3: Category Selection */}
        {currentStep === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="spacing-mobile"
          >
            <div className="text-center mb-6">
              <h2 className="title-mobile-responsive text-parchment font-bold mb-2">
                Legal Interests
              </h2>
              <p className="text-mobile-responsive text-parchment/80">
                Select areas of law that interest you (optional)
              </p>
            </div>
            
            <div className="mobile-grid">
              {LEGAL_CATEGORIES.filter(cat => 
                availableCategories.length === 0 || availableCategories.includes(cat.value)
              ).map((category, index) => (
                <SwipeableCard
                  key={category.value}
                  onTap={() => toggleCategory(category.value)}
                >
                  <motion.div
                    className={`card-mobile-interactive p-4 ${
                      selectedCategories.includes(category.value) 
                        ? 'ring-2 ring-verdict-gold bg-verdict-gold/5' 
                        : ''
                    }`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold text-gavel-blue text-sm mb-1">
                        {category.label}
                      </h3>
                      <p className="text-xs text-mahogany/70 leading-relaxed">
                        {category.description}
                      </p>
                      
                      {selectedCategories.includes(category.value) && (
                        <motion.div
                          className="absolute top-2 right-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <CheckCircle className="w-4 h-4 text-verdict-gold" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </SwipeableCard>
              ))}
            </div>
            
            {selectedCategories.length > 0 && (
              <motion.div
                className="text-center mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-parchment/70 text-sm">
                  {selectedCategories.length} area{selectedCategories.length !== 1 ? 's' : ''} selected
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
        
        {/* Step 4: Search & Launch */}
        {currentStep === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="spacing-mobile"
          >
            <div className="text-center mb-6">
              <h2 className="title-mobile-responsive text-parchment font-bold mb-2">
                Ready to Play!
              </h2>
              <p className="text-mobile-responsive text-parchment/80">
                Search for specific cases or start randomly
              </p>
            </div>
            
            {/* Game summary */}
            <motion.div
              className="card-mobile p-4 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="font-semibold text-gavel-blue mb-3">Your Game Setup</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mahogany/70">Mode:</span>
                  <span className="text-gavel-blue font-medium">
                    {PLAYER_MODES.find(m => m.value === selectedPlayerMode)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mahogany/70">Duration:</span>
                  <span className="text-gavel-blue font-medium">{selectedTime} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mahogany/70">Categories:</span>
                  <span className="text-gavel-blue font-medium">
                    {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'All areas'}
                  </span>
                </div>
              </div>
            </motion.div>
            
            {/* Search input */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mahogany/40" />
                <input
                  type="text"
                  placeholder="Search for specific cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-parchment/95 border border-gavel-blue/20 rounded-xl text-gavel-blue placeholder-mahogany/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </motion.div>
            
            {/* Action buttons */}
            <div className="space-y-3">
              {/* Search for cases */}
              <motion.button
                className="w-full btn-mobile haptic-medium"
                onClick={handleSearch}
                disabled={loading}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find My Cases
                  </>
                )}
              </motion.button>
              
              {/* Random game */}
              {onRandomGameStart && (
                <motion.button
                  className="w-full btn-mobile-secondary haptic-medium"
                  onClick={handleRandomGame}
                  disabled={loading}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Shuffle className="w-5 h-5" />
                  Surprise Me!
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation buttons */}
      {currentStep !== 'search' && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 p-4 bg-parchment/95 backdrop-blur-lg border-t border-gavel-blue/20"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.button
            className="w-full btn-mobile haptic-medium"
            onClick={handleNext}
            disabled={!canProceed()}
            whileTap={{ scale: 0.95 }}
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </MobilePageWrapper>
  )
}