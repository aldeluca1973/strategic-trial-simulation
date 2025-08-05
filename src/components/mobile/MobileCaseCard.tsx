import { motion } from 'framer-motion'
import { Clock, Users, Star, ChevronRight, Scale, Gavel } from 'lucide-react'
import { SwipeableCard } from './SwipeableCard'
import { LegalCase } from '@/lib/supabase'
import { useIsMobile } from '@/hooks/use-mobile'

interface MobileCaseCardProps {
  case: LegalCase
  onSelect: (selectedCase: LegalCase) => void
  onFavorite?: (selectedCase: LegalCase) => void
  isFavorited?: boolean
  index?: number
  variant?: 'default' | 'compact' | 'featured'
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  disabled?: boolean
}

export function MobileCaseCard({ 
  case: legalCase, 
  onSelect, 
  onFavorite, 
  isFavorited = false, 
  index = 0,
  variant = 'default',
  className = '',
  onSwipeLeft,
  onSwipeRight,
  disabled = false
}: MobileCaseCardProps) {
  const isMobile = useIsMobile()
  
  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'text-green-600 bg-green-100'
      case 'intermediate':
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'advanced':
      case 'hard':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gavel-blue bg-gavel-blue/10'
    }
  }
  
  const getCaseTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'criminal':
        return Gavel
      case 'civil':
        return Scale
      default:
        return Scale
    }
  }
  
  const TypeIcon = getCaseTypeIcon(legalCase.case_category)
  
  const cardContent = (
    <motion.div
      className={`card-mobile-interactive p-4 ${
        variant === 'featured' 
          ? 'bg-gradient-to-br from-verdict-gold/10 to-gavel-blue/5 border-verdict-gold/30' 
          : ''
      } ${
        variant === 'compact' ? 'p-3' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
    >
      {/* Case header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-2 bg-gavel-blue/10 rounded-lg">
            <TypeIcon className="w-5 h-5 text-gavel-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gavel-blue text-base leading-tight truncate">
              {legalCase.case_name}
            </h3>
            <p className="text-sm text-mahogany/70">
              {legalCase.case_category}
            </p>
          </div>
        </div>
        
        {/* Favorite button */}
        {onFavorite && (
          <motion.button
            className="p-2 touch-target"
            onClick={(e) => {
              e.stopPropagation()
              onFavorite(legalCase)
              if (navigator.vibrate) navigator.vibrate(10)
            }}
            whileTap={{ scale: 0.9 }}
          >
            <Star 
              className={`w-5 h-5 ${
                isFavorited 
                  ? 'text-verdict-gold fill-verdict-gold' 
                  : 'text-mahogany/40'
              }`} 
            />
          </motion.button>
        )}
      </div>
      
      {/* Case description */}
      {variant !== 'compact' && (
        <p className="text-sm text-mahogany/80 mb-4 line-clamp-2 leading-relaxed">
          {legalCase.case_background}
        </p>
      )}
      
      {/* Case metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getDifficultyColor(legalCase.difficulty_level.toString())
            }`}>
              Level {legalCase.difficulty_level}
            </span>
          </div>
          
          {/* Duration */}
          <div className="flex items-center gap-1 text-mahogany/60">
            <Clock className="w-4 h-4" />
            <span className="text-xs">
              30m
            </span>
          </div>
          
          {/* Players */}
          <div className="flex items-center gap-1 text-mahogany/60">
            <Users className="w-4 h-4" />
            <span className="text-xs">
              4
            </span>
          </div>
        </div>
        
        {/* Select indicator */}
        <motion.div
          className="flex items-center gap-1 text-gavel-blue"
          whileHover={{ x: 2 }}
        >
          <span className="text-sm font-medium">Play</span>
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </div>
      
      {/* Featured badge */}
      {variant === 'featured' && (
        <motion.div
          className="absolute top-3 right-3 bg-verdict-gold text-gavel-blue px-2 py-1 rounded-full text-xs font-bold"
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: -12 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          FEATURED
        </motion.div>
      )}
    </motion.div>
  )
  
  if (!isMobile) {
    // Desktop version - simple card with hover effects
    return (
      <motion.div
        className={`cursor-pointer ${className}`}
        onClick={() => onSelect(legalCase)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {cardContent}
      </motion.div>
    )
  }
  
  // Mobile version - swipeable card
  return (
    <SwipeableCard
      className={className}
      onTap={() => onSelect(legalCase)}
      onSwipeLeft={onSwipeLeft ? () => onSwipeLeft() : undefined}
      onSwipeRight={onSwipeRight ? () => onSwipeRight() : undefined}
      disabled={disabled}
    >
      {cardContent}
    </SwipeableCard>
  )
}

// List wrapper for mobile case cards
interface MobileCaseListProps {
  cases: LegalCase[]
  onSelectCase: (selectedCase: LegalCase) => void
  onFavoriteCase?: (selectedCase: LegalCase) => void
  favoritedCases?: string[]
  className?: string
  variant?: 'default' | 'compact'
}

export function MobileCaseList({ 
  cases, 
  onSelectCase, 
  onFavoriteCase, 
  favoritedCases = [], 
  className = '',
  variant = 'default'
}: MobileCaseListProps) {
  const isMobile = useIsMobile()
  
  return (
    <div className={`spacing-mobile ${className}`}>
      {cases.map((legalCase, index) => (
        <MobileCaseCard
          key={legalCase.id}
          case={legalCase}
          onSelect={onSelectCase}
          onFavorite={onFavoriteCase}
          isFavorited={favoritedCases.includes(legalCase.id)}
          index={index}
          variant={index === 0 ? 'featured' : variant}
        />
      ))}
      
      {/* Loading placeholder for infinite scroll */}
      {cases.length === 0 && (
        <div className="spacing-mobile">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-mobile p-4">
              <div className="skeleton-mobile h-4 w-3/4 mb-2" />
              <div className="skeleton-mobile h-3 w-full mb-3" />
              <div className="flex gap-2">
                <div className="skeleton-mobile h-6 w-16 rounded-full" />
                <div className="skeleton-mobile h-6 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}