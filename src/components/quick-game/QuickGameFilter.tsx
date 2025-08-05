import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gavel, Filter, Clock, Search, ArrowLeft, Users } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { supabase, LegalCase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'

interface QuickGameFilterProps {
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
  { value: 'criminal', label: 'Criminal Law', icon: '🕵️', description: 'Murder, assault, and criminal charges' },
  { value: 'civil', label: 'Civil Law', icon: '🏛️', description: 'Private disputes and claims' },
  { value: 'contract_law', label: 'Contract Law', icon: '📋', description: 'Agreements and contracts' },
  { value: 'constitutional', label: 'Constitutional Law', icon: '🏛️', description: 'Constitutional rights and powers' },
  { value: 'tort', label: 'Tort Law', icon: '⚡', description: 'Personal injury and damages' },
  { value: 'employment', label: 'Employment Law', icon: '💼', description: 'Workplace disputes' },
  { value: 'traffic', label: 'Traffic Law', icon: '🚗', description: 'Traffic violations and disputes' },
  { value: 'general', label: 'General Cases', icon: '📚', description: 'Various legal matters' },
  { value: 'landmark', label: 'Landmark Cases', icon: '⭐', description: 'Historic legal precedents' }
]

const TIME_OPTIONS = {
  fast: [
    { value: 5, label: '5 min', description: 'Lightning round' },
    { value: 8, label: '8 min', description: 'Quick match' },
    { value: 10, label: '10 min', description: 'Speed trial' }
  ],
  standard: [
    { value: 15, label: '15 min', description: 'Classic match' },
    { value: 20, label: '20 min', description: 'Standard trial' },
    { value: 30, label: '30 min', description: 'Full session' }
  ],
  extended: [
    { value: 30, label: '30 min', description: 'Deep dive' },
    { value: 45, label: '45 min', description: 'Complex trial' },
    { value: 60, label: '60 min', description: 'Epic showdown' }
  ]
}

const PLAYER_MODES = [
  { 
    value: 'solo', 
    label: 'Solo Play', 
    description: 'You vs AI Judge & Jury',
    playerCount: 1,
    icon: '🎭'
  },
  { 
    value: '2player', 
    label: '2 Player Duel', 
    description: 'Head-to-head legal battle',
    playerCount: 2,
    icon: '⚔️'
  },
  { 
    value: '3player', 
    label: '3 Player Trial', 
    description: 'Full courtroom experience',
    playerCount: 3,
    icon: '👥'
  }
]

export function QuickGameFilter({ onCasesFiltered, onRandomGameStart, onBack }: QuickGameFilterProps) {
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 6])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [gameLength, setGameLength] = useState<'fast' | 'standard' | 'extended'>('standard')
  const [timeLimit, setTimeLimit] = useState<number>(20)
  const [playerMode, setPlayerMode] = useState<string>('solo')
  const [loading, setLoading] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const { addNotification } = useGameStore()

  // Load available categories from database
  useEffect(() => {
    async function loadAvailableCategories() {
      try {
        console.log('Loading available categories from database...')
        const { data, error } = await supabase
          .from('legal_cases')
          .select('case_category')
          .eq('is_active', true)
        
        if (error) {
          console.error('Supabase error loading categories:', error)
          throw error
        }
        
        console.log('Raw category data from database:', data)
        const categories = [...new Set(data.map(case_ => case_.case_category))]
        console.log('Processed available categories:', categories)
        setAvailableCategories(categories)
      } catch (error) {
        console.error('Error loading categories:', error)
        addNotification({ type: 'error', message: 'Failed to load case categories' })
        // Fallback: show all predefined categories if database fails
        const fallbackCategories = LEGAL_CATEGORIES.map(cat => cat.value)
        console.log('Using fallback categories:', fallbackCategories)
        setAvailableCategories(fallbackCategories)
      }
    }
    
    loadAvailableCategories()
  }, [])

  const handleCategoryToggle = (category: string) => {
    console.log('=== CATEGORY TOGGLE DEBUG ===')
    console.log('Clicking category:', category)
    console.log('Current selectedCategories before:', selectedCategories)
    
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
      
      console.log('Previous categories:', prev)
      console.log('New categories after toggle:', newCategories)
      console.log('=== CATEGORY TOGGLE DEBUG END ===')
      
      return newCategories
    })
  }
  


  const handleFindCases = async () => {
    setLoading(true)
    try {
      console.log('=== CRIMINAL LAW FIX - DETAILED DEBUG ===')
      console.log('Selected categories:', selectedCategories)
      console.log('Difficulty range:', difficultyRange)
      console.log('Available categories from DB:', availableCategories)
      
      // Debug: Test criminal cases specifically
      if (selectedCategories.includes('criminal')) {
        console.log('🔍 CRIMINAL LAW SELECTED - Testing direct query...')
        const { data: criminalTest, error: criminalError } = await supabase
          .from('legal_cases')
          .select('case_name, case_category, difficulty_level')
          .eq('case_category', 'criminal')
          .eq('is_active', true)
        
        console.log('Direct criminal query result:', criminalTest)
        if (criminalError) console.error('Criminal query error:', criminalError)
      }
      
      // Use the same working pattern as the backup filter
      let query = supabase
        .from('legal_cases')
        .select('*')
        .eq('is_active', true)
        .gte('difficulty_level', difficultyRange[0])
        .lte('difficulty_level', difficultyRange[1])
        .order('created_at', { ascending: false })
      
      // Apply category filter if any selected (using the working pattern)
      if (selectedCategories.length > 0) {
        console.log('Applying category filter for:', selectedCategories)
        query = query.in('case_category', selectedCategories)
      }
      
      console.log('Executing main query...')
      const { data, error } = await query
      
      if (error) {
        console.error('Query error:', error)
        throw error
      }
      
      console.log('Query successful. Found', data?.length || 0, 'cases')
      console.log('Cases found:', data?.map(c => ({ name: c.case_name, category: c.case_category, difficulty: c.difficulty_level })))
      
      // Special debug for criminal cases
      const criminalCases = data?.filter(c => c.case_category === 'criminal')
      if (criminalCases && criminalCases.length > 0) {
        console.log('✅ CRIMINAL CASES FOUND:', criminalCases.map(c => c.case_name))
      } else if (selectedCategories.includes('criminal')) {
        console.log('❌ NO CRIMINAL CASES RETURNED despite filter')
      }
      
      if (!data || data.length === 0) {
        const message = selectedCategories.length > 0 
          ? `No ${selectedCategories.join(', ')} cases found for difficulty ${difficultyRange[0]}-${difficultyRange[1]}. Try different filters.`
          : 'No cases match your criteria. Try broadening your search.'
        
        addNotification({ 
          type: 'warning', 
          message 
        })
        return
      }
      
      // Shuffle and limit to 3 cases for preview
      const shuffled = data.sort(() => 0.5 - Math.random())
      const previewCases = shuffled.slice(0, 3)
      
      console.log('Sending', previewCases.length, 'preview cases')
      
      onCasesFiltered(previewCases, {
        playerMode,
        timeLimit,
        allowRandom: false
      })
      
    } catch (error) {
      console.error('Filter error:', error)
      addNotification({ type: 'error', message: 'Failed to filter cases: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyIcon = (level: number) => {
    if (level <= 2) return '⚖️'
    if (level <= 4) return '⚖️⚖️'
    return '⚖️⚖️⚖️'
  }

  const getGameLengthInfo = () => {
    const timeOption = TIME_OPTIONS[gameLength].find(t => t.value === timeLimit)
    return timeOption ? `${timeOption.label} - ${timeOption.description}` : `${timeLimit} minutes`
  }
  
  const handleRandomCase = async () => {
    setLoading(true)
    try {
      console.log('=== SURPRISE ME! - DIRECT TO GAME ===')
      
      let query = supabase
        .from('legal_cases')
        .select('*')
        .eq('is_active', true)
        .gte('difficulty_level', difficultyRange[0])
        .lte('difficulty_level', difficultyRange[1])
      
      // Apply category filter if any selected
      if (selectedCategories.length > 0) {
        query = query.in('case_category', selectedCategories)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        addNotification({ 
          type: 'warning', 
          message: 'No cases match your criteria for random selection.' 
        })
        return
      }
      
      // Pick one random case
      const randomCase = data[Math.floor(Math.random() * data.length)]
      console.log('Selected random case:', randomCase.case_name)
      
      const gameSettings = {
        playerMode,
        timeLimit,
        allowRandom: true
      }
      
      // If onRandomGameStart is provided, go DIRECTLY to game (bypass all menus)
      if (onRandomGameStart) {
        console.log('Using direct game start - bypassing all menus!')
        addNotification({ 
          type: 'success', 
          message: `🎉 Surprise! Starting ${randomCase.case_name} now!` 
        })
        onRandomGameStart(randomCase, gameSettings)
      } else {
        // Fallback to normal preview flow
        console.log('Using normal preview flow')
        onCasesFiltered([randomCase], gameSettings)
      }
      
    } catch (error) {
      console.error('Error selecting random case:', error)
      addNotification({ type: 'error', message: 'Failed to select random case' })
    } finally {
      setLoading(false)
    }
  }

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
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Filter size={40} className="text-verdict-gold" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-parchment">
              Quick Game Setup
            </h1>
            <Gavel size={40} className="text-verdict-gold" />
          </div>
          <p className="text-lg text-parchment/80 max-w-2xl mx-auto">
            Filter cases by difficulty and legal area to find the perfect match for your experience level and interests.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Filters Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Difficulty Slider */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-2">
                  <Gavel size={20} className="text-verdict-gold" />
                  Difficulty Level
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-parchment/70">Beginner</span>
                    <span className="text-sm text-parchment/70">Expert</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Fixed difficulty range selectors - separate controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-parchment/70 mb-2">Minimum Difficulty</label>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          value={difficultyRange[0]}
                          onChange={(e) => {
                            const newMin = parseInt(e.target.value)
                            const newMax = Math.max(newMin, difficultyRange[1])
                            setDifficultyRange([newMin, newMax])
                          }}
                          className="w-full h-3 bg-gavel-blue/30 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${((difficultyRange[0] - 1) / 5) * 100}%, #1e3a8a ${((difficultyRange[0] - 1) / 5) * 100}%, #1e3a8a 100%)`
                          }}
                        />
                        <div className="text-center text-xs text-verdict-gold mt-1">
                          Level {difficultyRange[0]}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-parchment/70 mb-2">Maximum Difficulty</label>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          value={difficultyRange[1]}
                          onChange={(e) => {
                            const newMax = parseInt(e.target.value)
                            const newMin = Math.min(difficultyRange[0], newMax)
                            setDifficultyRange([newMin, newMax])
                          }}
                          className="w-full h-3 bg-gavel-blue/30 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${((difficultyRange[1] - 1) / 5) * 100}%, #1e3a8a ${((difficultyRange[1] - 1) / 5) * 100}%, #1e3a8a 100%)`
                          }}
                        />
                        <div className="text-center text-xs text-verdict-gold mt-1">
                          Level {difficultyRange[1]}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                      <div key={level} className="text-center">
                        <div className={`text-xs ${
                          level >= difficultyRange[0] && level <= difficultyRange[1]
                            ? 'text-verdict-gold'
                            : 'text-parchment/40'
                        }`}>
                          {getDifficultyIcon(level)}
                        </div>
                        <div className={`text-xs ${
                          level >= difficultyRange[0] && level <= difficultyRange[1]
                            ? 'text-verdict-gold'
                            : 'text-parchment/40'
                        }`}>
                          {level}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center text-sm text-parchment/70">
                    Selected Range: {difficultyRange[0]} - {difficultyRange[1]}
                  </div>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
            


            {/* Legal Categories */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-2">
                  <Search size={20} className="text-verdict-gold" />
                  Legal Areas
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-3">
                  <p className="text-sm text-parchment/70 mb-3">
                    Select one or more legal areas (leave empty for all types)
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(() => {
                      const filteredCategories = LEGAL_CATEGORIES.filter(cat => availableCategories.includes(cat.value))
                      console.log('Available categories from DB:', availableCategories)
                      console.log('All predefined categories:', LEGAL_CATEGORIES.map(c => c.value))
                      console.log('Filtered categories to show:', filteredCategories.map(c => c.value))
                      return filteredCategories
                    })().map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryToggle(category.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedCategories.includes(category.value)
                            ? 'border-verdict-gold bg-verdict-gold/10 text-verdict-gold'
                            : 'border-gavel-blue/50 bg-gavel-blue/20 text-parchment/80 hover:border-verdict-gold/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-sm">{category.label}</span>
                        </div>
                        <div className="text-xs opacity-80">{category.description}</div>
                      </button>
                    ))}
                  </div>
                  
                  {selectedCategories.length > 0 && (
                    <div className="mt-3 p-2 bg-verdict-gold/10 rounded-lg">
                      <div className="text-xs text-verdict-gold font-medium mb-1">Selected:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedCategories.map((cat) => {
                          const category = LEGAL_CATEGORIES.find(c => c.value === cat)
                          return (
                            <span key={cat} className="text-xs bg-verdict-gold/20 text-verdict-gold px-2 py-1 rounded">
                              {category?.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CourtroomCardContent>
            </CourtroomCard>

            {/* Player Mode Selection */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-2">
                  <Users size={20} className="text-verdict-gold" />
                  Player Setup
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-3">
                  {PLAYER_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setPlayerMode(mode.value)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        playerMode === mode.value
                          ? 'border-verdict-gold bg-verdict-gold/10 text-verdict-gold'
                          : 'border-gavel-blue/50 bg-gavel-blue/20 text-parchment/80 hover:border-verdict-gold/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{mode.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{mode.label}</div>
                          <div className="text-xs opacity-80">{mode.description}</div>
                        </div>
                        <div className="text-xs bg-gavel-blue/30 px-2 py-1 rounded">
                          {mode.playerCount}P
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CourtroomCardContent>
            </CourtroomCard>

            {/* Game Length Preference */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-2">
                  <Clock size={20} className="text-verdict-gold" />
                  Game Duration
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'fast', label: 'Fast', desc: '5-10 min' },
                      { value: 'standard', label: 'Standard', desc: '15-30 min' },
                      { value: 'extended', label: 'Extended', desc: '30-60 min' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setGameLength(option.value as any)
                          // Set default time for category
                          const defaultTime = TIME_OPTIONS[option.value as keyof typeof TIME_OPTIONS][1].value
                          setTimeLimit(defaultTime)
                        }}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          gameLength === option.value
                            ? 'border-verdict-gold bg-verdict-gold/10 text-verdict-gold'
                            : 'border-gavel-blue/50 bg-gavel-blue/20 text-parchment/80 hover:border-verdict-gold/50'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs opacity-80">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Specific Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-parchment/70 mb-2">
                      Exact Duration:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_OPTIONS[gameLength].map((timeOption) => (
                        <button
                          key={timeOption.value}
                          onClick={() => setTimeLimit(timeOption.value)}
                          className={`p-2 rounded border text-center text-sm transition-all ${
                            timeLimit === timeOption.value
                              ? 'border-verdict-gold bg-verdict-gold/20 text-verdict-gold'
                              : 'border-gavel-blue/30 bg-gavel-blue/10 text-parchment/70 hover:border-verdict-gold/30'
                          }`}
                        >
                          <div className="font-medium">{timeOption.label}</div>
                          <div className="text-xs opacity-80">{timeOption.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center text-xs text-parchment/60">
                    Selected: {getGameLengthInfo()}
                  </div>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CourtroomCard className="h-full">
              <CourtroomCardHeader>
                <CourtroomCardTitle>Filter Summary</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-verdict-gold mb-2">Current Filters:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Gavel size={14} className="text-verdict-gold" />
                        <span>Difficulty: {difficultyRange[0]} - {difficultyRange[1]}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Search size={14} className="text-verdict-gold" />
                        <span>
                          Legal Areas: {selectedCategories.length > 0 
                            ? `${selectedCategories.length} selected`
                            : 'All types'
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-verdict-gold" />
                        <span>Players: {PLAYER_MODES.find(m => m.value === playerMode)?.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-verdict-gold" />
                        <span>Duration: {getGameLengthInfo()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gavel-blue/30 space-y-3">
                    <p className="text-sm text-parchment/70">
                      Ready to find your perfect case?
                    </p>
                    
                    {/* Surprise Me Button - Prominent */}
                    <GavelButton
                      onClick={handleRandomCase}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Finding Surprise...
                        </>
                      ) : (
                        <>
                          <span className="text-lg">🎲</span>
                          Surprise Me!
                          <span className="text-lg">✨</span>
                        </>
                      )}
                    </GavelButton>
                    
                    <div className="text-center text-xs text-parchment/50">
                      or
                    </div>
                    
                    <GavelButton
                      onClick={handleFindCases}
                      disabled={loading}
                      className="w-full"
                      variant="secondary"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-parchment border-t-transparent rounded-full" />
                          Finding Cases...
                        </>
                      ) : (
                        <>
                          <Search size={16} />
                          Browse Matching Cases
                        </>
                      )}
                    </GavelButton>
                  </div>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <GavelButton
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back to Mode Selection
          </GavelButton>
        </motion.div>
      </div>
    </div>
  )
}