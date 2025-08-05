import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gavel, ArrowLeft, Clock, Star, Users } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { LegalCase } from '@/lib/supabase'

interface CasePreviewProps {
  cases: LegalCase[]
  gameSettings?: {
    playerMode: string
    timeLimit: number
    allowRandom: boolean
  }
  onCaseSelect: (caseData: LegalCase, gameSettings?: any) => void
  onBack: () => void
}

export function CasePreview({ cases, gameSettings, onCaseSelect, onBack }: CasePreviewProps) {
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null)

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 6 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < level 
            ? 'text-verdict-gold fill-verdict-gold' 
            : 'text-parchment/30'
        }`}
      />
    ))
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'criminal': '⚖️',
      'civil': '🏛️',
      'contract_law': '📋',
      'constitutional': '🏛️',
      'tort': '⚡',
      'employment': '💼',
      'traffic': '🚗',
      'general': '📚',
      'landmark': '⭐'
    }
    return icons[category] || '📚'
  }

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getEstimatedDuration = (difficulty: number) => {
    if (difficulty <= 2) return '15-20 minutes'
    if (difficulty <= 4) return '20-30 minutes'
    return '30-45 minutes'
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
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gavel size={40} className="text-verdict-gold" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-parchment">
              Choose Your Case
            </h1>
            <Gavel size={40} className="text-verdict-gold" />
          </div>
          <p className="text-lg text-parchment/80 max-w-2xl mx-auto">
            {gameSettings?.allowRandom 
              ? 'Surprise! Here\'s a randomly selected case perfect for your criteria.' 
              : `We found ${cases.length} cases matching your criteria. Select one to begin your trial simulation.`
            }
          </p>
          
          {gameSettings && (
            <div className="flex justify-center gap-4 mt-4 text-sm text-parchment/70">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{gameSettings.playerMode.charAt(0).toUpperCase() + gameSettings.playerMode.slice(1)} Mode</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{gameSettings.timeLimit} minutes</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Case Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cases.map((case_, index) => (
            <motion.div
              key={case_.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <CourtroomCard 
                className={`h-full transition-all duration-300 cursor-pointer hover:scale-105 ${
                  selectedCase?.id === case_.id 
                    ? 'ring-4 ring-verdict-gold shadow-2xl' 
                    : 'hover:shadow-xl'
                }`}
                onClick={() => setSelectedCase(case_)}
              >
                <CourtroomCardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getCategoryIcon(case_.case_category)}</span>
                    <div className="flex-1">
                      <div className="text-xs text-verdict-gold font-medium">
                        {formatCategoryName(case_.case_category)}
                      </div>
                      <div className="text-xs text-parchment/60">
                        {case_.year} • {case_.location}
                      </div>
                    </div>
                  </div>
                  
                  <CourtroomCardTitle className="text-lg leading-tight mb-3">
                    {case_.case_name}
                  </CourtroomCardTitle>
                  
                  <div className="space-y-2">
                    {/* Difficulty */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {getDifficultyStars(case_.difficulty_level)}
                      </div>
                      <span className="text-xs text-parchment/70">
                        Difficulty {case_.difficulty_level}/6
                      </span>
                    </div>
                    
                    {/* Duration Estimate */}
                    <div className="flex items-center gap-2 text-xs text-parchment/70">
                      <Clock size={12} />
                      <span>{getEstimatedDuration(case_.difficulty_level)}</span>
                    </div>
                  </div>
                </CourtroomCardHeader>
                
                <CourtroomCardContent>
                  <p className="text-sm text-parchment/80 leading-relaxed mb-4 line-clamp-4">
                    {case_.case_background}
                  </p>
                  
                  {/* Key Information */}
                  <div className="space-y-2 text-xs">
                    {case_.key_evidence && case_.key_evidence.length > 0 && (
                      <div className="flex items-center gap-2 text-parchment/60">
                        <span className="font-medium">Evidence:</span>
                        <span>{case_.key_evidence.length} pieces</span>
                      </div>
                    )}
                    
                    {case_.witness_testimonies && case_.witness_testimonies.length > 0 && (
                      <div className="flex items-center gap-2 text-parchment/60">
                        <Users size={12} />
                        <span>{case_.witness_testimonies.length} witnesses</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedCase?.id === case_.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-3 bg-verdict-gold/10 rounded-lg border border-verdict-gold/30"
                    >
                      <div className="flex items-center gap-2 text-verdict-gold font-medium text-sm mb-2">
                        <Gavel size={14} />
                        Case Selected
                      </div>
                      <p className="text-xs text-parchment/80">
                        Ready to begin this trial simulation. Click "Select This Case" below to continue.
                      </p>
                    </motion.div>
                  )}
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {selectedCase && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="order-1 sm:order-2"
            >
              <GavelButton
                onClick={() => onCaseSelect(selectedCase, gameSettings)}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                <Gavel size={20} />
                {gameSettings?.allowRandom ? 'Start This Surprise Case!' : 'Select This Case'} ⚖️
              </GavelButton>
            </motion.div>
          )}
          
          <div className="order-2 sm:order-1">
            <GavelButton
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Refine Search
            </GavelButton>
          </div>
        </motion.div>
        
        {!selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <div className="text-parchment/60 space-y-2">
              <div>{gameSettings?.allowRandom ? 'Like this case? Click "Start This Surprise Case!" above!' : 'Select a case above to continue'}</div>
              <div className="text-sm">
                Each case offers unique challenges and learning opportunities
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}