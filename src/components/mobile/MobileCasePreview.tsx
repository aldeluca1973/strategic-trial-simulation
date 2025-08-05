import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Search,
  Shuffle,
  ChevronRight,
  Play,
  Eye,
  BookOpen
} from 'lucide-react'
import { MobilePageWrapper } from './MobileHeader'
import { MobileCaseList } from './MobileCaseCard'
import { SwipeableCard } from './SwipeableCard'
import { useIsMobile } from '@/hooks/use-mobile'
import { LegalCase } from '@/lib/supabase'

interface MobileCasePreviewProps {
  cases: LegalCase[]
  gameSettings?: {
    playerMode: string
    timeLimit: number
    allowRandom: boolean
  }
  onCaseSelect: (selectedCase: LegalCase, gameSettings?: any) => void
  onBack: () => void
}

export function MobileCasePreview({ cases, gameSettings, onCaseSelect, onBack }: MobileCasePreviewProps) {
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'difficulty' | 'duration' | 'popularity'>('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [favoritedCases, setFavoritedCases] = useState<string[]>([])
  
  // Filter and sort cases
  const filteredCases = cases
    .filter(case_ => 
      !searchQuery || 
      case_.case_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.case_background?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          return a.difficulty_level - b.difficulty_level
        case 'duration':
          return 0 // All cases have same default duration
        case 'popularity':
        default:
          return cases.indexOf(b) - cases.indexOf(a)
      }
    })
  
  const handleCaseSelect = (selectedCase: LegalCase) => {
    onCaseSelect(selectedCase, gameSettings)
    // Haptic feedback for case selection
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }
  }
  
  const handleFavoriteCase = (case_: LegalCase) => {
    setFavoritedCases(prev => 
      prev.includes(case_.id)
        ? prev.filter(id => id !== case_.id)
        : [...prev, case_.id]
    )
    // Light haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }
  
  const getGameModeLabel = () => {
    switch (gameSettings?.playerMode) {
      case 'solo': return 'Solo Practice'
      case '2player': return 'Head-to-Head'
      case '3player': return 'Full Trial'
      default: return 'Custom'
    }
  }
  
  if (!isMobile) {
    // Desktop fallback
    return null
  }
  
  return (
    <MobilePageWrapper
      headerProps={{
        title: "Select Your Case",
        subtitle: `${filteredCases.length} cases available`,
        showBack: true,
        onBack,
        rightAction: {
          icon: Filter,
          label: 'Filters',
          onClick: () => setShowFilters(!showFilters)
        }
      }}
      showBottomNav={false}
      className="bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany"
    >
      {/* Game settings summary */}
      <motion.div
        className="card-mobile p-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gavel-blue">Game Setup</h3>
            <p className="text-sm text-mahogany/70">
              {getGameModeLabel()} • {gameSettings?.timeLimit} min
            </p>
          </div>
          <div className="text-right">
            <div className="text-verdict-gold font-bold text-lg">
              {filteredCases.length}
            </div>
            <div className="text-xs text-mahogany/60">cases found</div>
          </div>
        </div>
      </motion.div>
      
      {/* Search and filters */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mahogany/40" />
          <input
            type="text"
            placeholder="Search cases by name or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-parchment/95 border border-gavel-blue/20 rounded-xl text-gavel-blue placeholder-mahogany/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold focus:border-transparent"
          />
        </div>
        
        {/* Sort options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-parchment/95 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-gavel-blue mb-3">Sort by:</h4>
                <div className="flex gap-2">
                  {[
                    { value: 'popularity', label: 'Popular', icon: Star },
                    { value: 'difficulty', label: 'Difficulty', icon: Users },
                    { value: 'duration', label: 'Duration', icon: Clock }
                  ].map(option => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={option.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          sortBy === option.value
                            ? 'bg-gavel-blue text-parchment'
                            : 'bg-gavel-blue/10 text-gavel-blue hover:bg-gavel-blue/20'
                        }`}
                        onClick={() => setSortBy(option.value as any)}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Cases list */}
      {filteredCases.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MobileCaseList
            cases={filteredCases}
            onSelectCase={handleCaseSelect}
            onFavoriteCase={handleFavoriteCase}
            favoritedCases={favoritedCases}
            variant="default"
          />
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-parchment mb-2">
            No Cases Found
          </h3>
          <p className="text-parchment/70 mb-6">
            Try adjusting your search or filters
          </p>
          <motion.button
            className="btn-mobile-secondary"
            onClick={() => {
              setSearchQuery('')
              setShowFilters(false)
            }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Filters
          </motion.button>
        </motion.div>
      )}
      
      {/* Quick action - Random case */}
      {filteredCases.length > 0 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 p-4 bg-parchment/95 backdrop-blur-lg border-t border-gavel-blue/20"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="w-full btn-mobile-secondary haptic-medium"
            onClick={() => {
              const randomCase = filteredCases[Math.floor(Math.random() * filteredCases.length)]
              handleCaseSelect(randomCase)
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Shuffle className="w-5 h-5" />
            Surprise Me with a Random Case!
          </motion.button>
        </motion.div>
      )}
    </MobilePageWrapper>
  )
}