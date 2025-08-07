import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Image, Play, Package, Zap, Target, Link2 } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent } from '@/components/ui/courtroom-card'

interface EvidenceItem {
  id: string
  evidence_name: string
  evidence_type: string
  description: string
  impact_strength: number
  evidence_data: any
  unlock_requirements?: any
}

interface EvidenceCardProps {
  evidence: EvidenceItem
  isSelected: boolean
  isLocked: boolean
  canCombine: boolean
  combinationPartner?: EvidenceItem
  onSelect: (evidence: EvidenceItem) => void
  onPresent: (evidence: EvidenceItem) => void
  onCombine: (evidence: EvidenceItem) => void
  onExamine: (evidence: EvidenceItem) => void
  impactMeter?: number
}

const evidenceIcons = {
  document: FileText,
  photo: Image,
  audio: Play,
  video: Play,
  physical: Package
}

const impactColors = {
  low: 'text-blue-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
  critical: 'text-purple-400'
}

export function EvidenceCard({ 
  evidence, 
  isSelected, 
  isLocked, 
  canCombine, 
  combinationPartner,
  onSelect, 
  onPresent, 
  onCombine, 
  onExamine,
  impactMeter = 0
}: EvidenceCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  
  const Icon = evidenceIcons[evidence.evidence_type]
  const impactLevel = evidence.impact_strength > 80 ? 'critical' : 
                     evidence.impact_strength > 60 ? 'high' : 
                     evidence.impact_strength > 40 ? 'medium' : 'low'
  
  const handleDragStart = (e: React.DragEvent) => {
    if (isLocked) return
    setIsDragging(true)
    e.dataTransfer.setData('application/json', JSON.stringify(evidence))
    e.dataTransfer.effectAllowed = 'copy'
  }
  
  const handleDragEnd = () => {
    setIsDragging(false)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
    >
      <CourtroomCard 
        className={`cursor-pointer transition-all duration-300 ${isLocked ? 'opacity-50 grayscale' : ''} ${
          isSelected ? 'ring-2 ring-verdict-gold shadow-lg shadow-verdict-gold/20' : ''
        } ${canCombine ? 'ring-2 ring-blue-400 shadow-blue-400/20' : ''}`}
        onClick={() => !isLocked && onSelect(evidence)}
        draggable={!isLocked}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CourtroomCardContent className="p-4">
          {/* Lock overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Package className="mx-auto mb-2 text-parchment/60" size={24} />
                <p className="text-xs text-parchment/60">Locked</p>
              </div>
            </div>
          )}
          
          {/* Impact meter */}
          {impactMeter > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-verdict-gold text-gavel-blue rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
            >
              +{impactMeter}
            </motion.div>
          )}
          
          {/* Combination indicator */}
          {combinationPartner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-1 -left-1 text-blue-400"
            >
              <Link2 size={16} />
            </motion.div>
          )}
          
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Icon className={impactColors[impactLevel]} size={20} />
                <div className="text-xs">
                  <div className="text-verdict-gold font-medium">
                    {evidence.evidence_name}
                  </div>
                  <div className="text-parchment/60 capitalize">
                    {evidence.evidence_type}
                  </div>
                </div>
              </div>
              
              {/* Impact strength indicator */}
              <div className="text-right">
                <div className={`text-xs font-bold ${impactColors[impactLevel]}`}>
                  {evidence.impact_strength}%
                </div>
                <div className="text-xs text-parchment/50">Impact</div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-xs text-parchment/70 leading-tight line-clamp-2">
              {evidence.description}
            </p>
            
            {/* Power indicators */}
            <div className="flex items-center gap-1">
              {evidence.impact_strength > 70 && (
                <Zap className="text-yellow-400" size={12} />
              )}
              {evidence.evidence_data?.isKey && (
                <Target className="text-red-400" size={12} />
              )}
            </div>
            
            {/* Action buttons */}
            <AnimatePresence>
              {(isSelected || showDetails) && !isLocked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-1 text-xs"
                >
                  <GavelButton
                    variant="accent"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPresent(evidence)
                    }}
                    className="flex-1 text-xs py-1"
                  >
                    Present
                  </GavelButton>
                  
                  {canCombine && (
                    <GavelButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCombine(evidence)
                      }}
                      className="flex-1 text-xs py-1"
                    >
                      Combine
                    </GavelButton>
                  )}
                  
                  <GavelButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onExamine(evidence)
                    }}
                    className="text-xs py-1"
                  >
                    📋
                  </GavelButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CourtroomCardContent>
      </CourtroomCard>
    </motion.div>
  )
}