import { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Clock, Link2, AlertTriangle, CheckCircle } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'

interface TimelineEvidence {
  id: string
  evidence_name: string
  evidence_type: string
  timeline_position: number
  connected_evidence_ids: string[]
  contradiction_flags: any[]
  impact_score: number
  presented_at: string
}

interface EvidenceTimelineProps {
  gameSessionId: string
  presentedEvidence: TimelineEvidence[]
  onReorderEvidence: (evidence: TimelineEvidence[]) => void
  onLinkEvidence: (evidenceId1: string, evidenceId2: string) => void
  onDetectContradiction: (evidenceId: string) => void
}

export function EvidenceTimeline({
  gameSessionId,
  presentedEvidence,
  onReorderEvidence,
  onLinkEvidence,
  onDetectContradiction
}: EvidenceTimelineProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineEvidence[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showConnections, setShowConnections] = useState(true)
  
  useEffect(() => {
    setTimelineItems(presentedEvidence.sort((a, b) => a.timeline_position - b.timeline_position))
  }, [presentedEvidence])
  
  const handleReorder = (newOrder: TimelineEvidence[]) => {
    const updatedOrder = newOrder.map((item, index) => ({
      ...item,
      timeline_position: index + 1
    }))
    setTimelineItems(updatedOrder)
    onReorderEvidence(updatedOrder)
  }
  
  const handleItemSelect = (evidenceId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(evidenceId)) {
        return prev.filter(id => id !== evidenceId)
      } else if (prev.length < 2) {
        return [...prev, evidenceId]
      } else {
        return [evidenceId]
      }
    })
  }
  
  const handleLinkSelected = () => {
    if (selectedItems.length === 2) {
      onLinkEvidence(selectedItems[0], selectedItems[1])
      setSelectedItems([])
    }
  }
  
  const getContradictionScore = (evidence: TimelineEvidence) => {
    return evidence.contradiction_flags?.length || 0
  }
  
  const getImpactColor = (score: number) => {
    if (score > 15) return 'text-green-400'
    if (score > 5) return 'text-yellow-400'
    if (score < -15) return 'text-red-400'
    if (score < -5) return 'text-orange-400'
    return 'text-parchment/60'
  }
  
  return (
    <CourtroomCard className="h-full">
      <CourtroomCardHeader>
        <CourtroomCardTitle className="flex items-center gap-2">
          <Clock className="text-verdict-gold" size={20} />
          Evidence Timeline
        </CourtroomCardTitle>
        <div className="flex gap-2 mt-2">
          <GavelButton
            variant="ghost"
            size="sm"
            onClick={() => setShowConnections(!showConnections)}
          >
            <Link2 size={14} />
            {showConnections ? 'Hide' : 'Show'} Links
          </GavelButton>
          {selectedItems.length === 2 && (
            <GavelButton
              variant="accent"
              size="sm"
              onClick={handleLinkSelected}
            >
              Link Evidence
            </GavelButton>
          )}
        </div>
      </CourtroomCardHeader>
      
      <CourtroomCardContent className="flex-1 overflow-y-auto">
        {timelineItems.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="text-parchment/30 mx-auto mb-4" />
            <p className="text-parchment/60">No evidence presented yet</p>
            <p className="text-xs text-parchment/40 mt-1">Evidence will appear here as it's presented</p>
          </div>
        ) : (
          <Reorder.Group
            values={timelineItems}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {timelineItems.map((evidence, index) => {
              const isSelected = selectedItems.includes(evidence.id)
              const contradictionCount = getContradictionScore(evidence)
              const isLinked = evidence.connected_evidence_ids.length > 0
              
              return (
                <Reorder.Item
                  key={evidence.id}
                  value={evidence}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    layout
                    className={`relative p-3 border rounded-lg transition-all duration-200 ${
                      isSelected ? 'border-verdict-gold bg-verdict-gold/10' : 'border-parchment/20 bg-gavel-blue/20'
                    }`}
                    onClick={() => handleItemSelect(evidence.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Timeline position indicator */}
                    <div className="absolute -left-2 top-3 w-4 h-4 bg-verdict-gold rounded-full border-2 border-gavel-blue flex items-center justify-center">
                      <span className="text-xs font-bold text-gavel-blue">{index + 1}</span>
                    </div>
                    
                    {/* Connection lines */}
                    {showConnections && isLinked && index < timelineItems.length - 1 && (
                      <div className="absolute left-1 top-8 w-0.5 h-8 bg-verdict-gold/50" />
                    )}
                    
                    <div className="ml-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-verdict-gold text-sm">
                            {evidence.evidence_name}
                          </h4>
                          <p className="text-xs text-parchment/60 capitalize">
                            {evidence.evidence_type}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Impact score */}
                          <div className={`text-xs font-bold ${getImpactColor(evidence.impact_score)}`}>
                            {evidence.impact_score > 0 ? '+' : ''}{evidence.impact_score}
                          </div>
                          
                          {/* Status indicators */}
                          {contradictionCount > 0 && (
                            <AlertTriangle 
                              className="text-red-400" 
                              size={14}
                            />
                          )}
                          
                          {isLinked && (
                            <Link2 
                              className="text-blue-400" 
                              size={14}
                            />
                          )}
                          
                          {evidence.impact_score > 20 && (
                            <CheckCircle 
                              className="text-green-400" 
                              size={14}
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Presented time */}
                      <div className="text-xs text-parchment/50">
                        Presented: {new Date(evidence.presented_at).toLocaleTimeString()}
                      </div>
                      
                      {/* Connected evidence */}
                      {showConnections && evidence.connected_evidence_ids.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="text-blue-400">Connected to:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {evidence.connected_evidence_ids.map(connectedId => {
                              const connectedEvidence = timelineItems.find(e => e.id === connectedId)
                              return connectedEvidence ? (
                                <span 
                                  key={connectedId}
                                  className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs"
                                >
                                  {connectedEvidence.evidence_name}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Contradiction warnings */}
                      {contradictionCount > 0 && (
                        <div className="mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDetectContradiction(evidence.id)
                            }}
                            className="text-xs text-red-400 hover:text-red-300 underline"
                          >
                            View {contradictionCount} contradiction(s)
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        )}
        
        {/* Instructions */}
        <div className="mt-4 p-3 bg-gavel-blue/30 rounded-lg">
          <p className="text-xs text-parchment/70">
            💡 <strong>Timeline Tips:</strong><br />
            • Drag to reorder evidence chronologically<br />
            • Click two items to link related evidence<br />
            • Higher impact scores = more effective presentation
          </p>
        </div>
      </CourtroomCardContent>
    </CourtroomCard>
  )
}