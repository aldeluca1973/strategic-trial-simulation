import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, MessageSquare, FileText, Users, Clock, Gavel, Target, Zap, Brain } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { EvidenceCard } from './evidence/EvidenceCard'
import { EvidenceTimeline } from './evidence/EvidenceTimeline'
import { WitnessExamination } from './witness/WitnessExamination'
import { JuryImpactMeter } from './JuryImpactMeter'
import { useGameStore } from '@/stores/gameStore'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface EnhancedCourtroomProps {
  onGameEnd: () => void
}

interface EvidenceItem {
  id: string
  evidence_name: string
  evidence_type: string
  description: string
  impact_strength: number
  evidence_data: any
  unlock_requirements?: any
}

interface Witness {
  id: string
  witness_name: string
  witness_role: string
  personality_traits: any
  credibility_base: number
  testimony_data: any
  hidden_information: any
}

export function EnhancedCourtroom({ onGameEnd }: EnhancedCourtroomProps) {
  const { user } = useAuth()
  const {
    currentGame,
    participants,
    selectedCase,
    currentPhase,
    userRole,
    timeRemaining,
    setCurrentPhase,
    setTimeRemaining,
    addNotification
  } = useGameStore()
  
  // Evidence state
  const [availableEvidence, setAvailableEvidence] = useState<EvidenceItem[]>([])
  const [presentedEvidence, setPresentedEvidence] = useState<any[]>([])
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem[]>([])
  const [evidenceCombinations, setEvidenceCombinations] = useState<any[]>([])
  
  // Witness state
  const [availableWitnesses, setAvailableWitnesses] = useState<Witness[]>([])
  const [currentWitness, setCurrentWitness] = useState<Witness | null>(null)
  const [examinationType, setExaminationType] = useState<'direct' | 'cross' | 'redirect'>('direct')
  
  // UI state
  const [activeView, setActiveView] = useState<'evidence' | 'witness' | 'timeline' | 'jury'>('evidence')
  const [showEvidenceExaminer, setShowEvidenceExaminer] = useState(false)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [verdict, setVerdict] = useState<any>(null)
  const [juryDeliberating, setJuryDeliberating] = useState(false)
  
  useEffect(() => {
    if (currentGame && selectedCase) {
      loadGameData()
    }
  }, [currentGame, selectedCase])
  
  useEffect(() => {
    if (currentGame) {
      subscribeToGameEvents()
    }
  }, [currentGame])
  
  const loadGameData = async () => {
    try {
      // Load evidence for this case
      const { data: evidence, error: evidenceError } = await supabase
        .from('evidence_items')
        .select('*')
        .eq('case_id', selectedCase?.id)
        .order('impact_strength', { ascending: false })
      
      if (!evidenceError && evidence) {
        setAvailableEvidence(evidence)
      }
      
      // Load witnesses for this case
      const { data: witnesses, error: witnessError } = await supabase
        .from('case_witnesses')
        .select('*')
        .eq('case_id', selectedCase?.id)
        .order('witness_role')
      
      if (!witnessError && witnesses) {
        setAvailableWitnesses(witnesses)
      }
      
      // Load presented evidence
      const { data: presented, error: presentedError } = await supabase
        .from('game_evidence_state')
        .select(`
          *,
          evidence_items(*)
        `)
        .eq('game_session_id', currentGame?.id)
        .not('presented_at', 'is', null)
        .order('presentation_order')
      
      if (!presentedError && presented) {
        setPresentedEvidence(presented)
      }
      
      // Load evidence combinations
      const { data: combinations, error: combError } = await supabase
        .from('evidence_combinations')
        .select('*')
        .eq('case_id', selectedCase?.id)
      
      if (!combError && combinations) {
        setEvidenceCombinations(combinations)
      }
      
    } catch (error) {
      console.error('Error loading game data:', error)
    }
  }
  
  const subscribeToGameEvents = () => {
    const channel = supabase
      .channel(`enhanced_courtroom_${currentGame?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_jury_evaluations',
          filter: `game_session_id=eq.${currentGame?.id}`
        },
        (payload) => {
          const evaluation = payload.new
          if (evaluation.evaluation_phase === 'final_verdict') {
            setVerdict(evaluation.evaluation_data.fullResponse)
            setJuryDeliberating(false)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_evidence_state',
          filter: `game_session_id=eq.${currentGame?.id}`
        },
        (payload) => {
          loadGameData() // Refresh evidence state
        }
      )
      .subscribe()
    
    return () => channel.unsubscribe()
  }
  
  const handleEvidencePresent = async (evidence: EvidenceItem, timing: 'normal' | 'dramatic' = 'normal') => {
    if (!currentGame || !user || isSubmittingAction) return
    
    setIsSubmittingAction(true)
    try {
      // Evaluate evidence effectiveness
      const response = await supabase.functions.invoke('evidence-evaluation', {
        body: {
          gameSessionId: currentGame.id,
          evidenceId: evidence.id,
          presentationContext: {
            userId: user.id,
            timing,
            phase: currentPhase
          },
          evidenceCombination: selectedEvidence.map(e => e.id)
        }
      })
      
      if (response.error) throw response.error
      
      addNotification({
        type: 'success',
        message: response.data.message
      })
      
      // Clear selection
      setSelectedEvidence([])
      
    } catch (error) {
      console.error('Error presenting evidence:', error)
      addNotification({
        type: 'error',
        message: 'Failed to present evidence'
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }
  
  const handleEvidenceCombine = (evidence: EvidenceItem) => {
    if (selectedEvidence.includes(evidence)) {
      setSelectedEvidence(prev => prev.filter(e => e.id !== evidence.id))
    } else if (selectedEvidence.length < 3) {
      setSelectedEvidence(prev => [...prev, evidence])
    } else {
      addNotification({
        type: 'warning',
        message: 'Maximum 3 pieces of evidence can be combined'
      })
    }
  }
  
  const handleWitnessQuestion = async (question: string, questionType: string) => {
    // This will be handled by the WitnessExamination component
    addNotification({
      type: 'info',
      message: 'Question submitted to witness'
    })
  }
  
  const handleObjection = async (objectionType: string, reason: string) => {
    if (!currentGame || !user) return
    
    try {
      const response = await supabase.functions.invoke('objection-handler', {
        body: {
          gameSessionId: currentGame.id,
          objectionType,
          objectionReason: reason,
          targetActionType: 'question',
          targetActionId: '',
          objectingUserId: user.id
        }
      })
      
      if (response.error) throw response.error
      
      addNotification({
        type: response.data.ruling === 'SUSTAINED' ? 'success' : 'warning',
        message: `Objection ${response.data.ruling}: ${response.data.reason}`
      })
      
    } catch (error) {
      console.error('Error filing objection:', error)
      addNotification({
        type: 'error',
        message: 'Failed to file objection'
      })
    }
  }
  
  const requestJuryDeliberation = async () => {
    if (!currentGame || !selectedCase) return
    
    setJuryDeliberating(true)
    
    try {
      const response = await supabase.functions.invoke('ai-jury-deliberation', {
        body: {
          gameSessionId: currentGame.id,
          caseData: selectedCase,
          evidencePresented: presentedEvidence,
          witnessTestimonies: [] // TODO: Collect witness testimonies
        }
      })
      
      if (response.error) throw response.error
      
    } catch (error) {
      console.error('Error requesting jury deliberation:', error)
      setJuryDeliberating(false)
      addNotification({
        type: 'error',
        message: 'Failed to request jury deliberation'
      })
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'opening_statements': return 'Opening Statements'
      case 'evidence_presentation': return 'Evidence Presentation'
      case 'witness_examination': return 'Witness Examination'
      case 'closing_arguments': return 'Closing Arguments'
      case 'deliberation': return 'Jury Deliberation'
      case 'verdict': return 'Verdict'
      default: return 'Trial in Session'
    }
  }
  
  // Show verdict screen
  if (verdict) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <CourtroomCard>
            <CourtroomCardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mb-4"
              >
                <Scale size={64} className="text-verdict-gold mx-auto" />
              </motion.div>
              <CourtroomCardTitle className="text-2xl mb-2">Final Verdict</CourtroomCardTitle>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-serif font-bold text-verdict-gold"
              >
                {verdict.verdict}
              </motion.div>
            </CourtroomCardHeader>
            <CourtroomCardContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-semibold text-verdict-gold mb-2">Jury's Reasoning</h3>
                  <p className="text-parchment/80 leading-relaxed">{verdict.reasoning}</p>
                </div>
                
                {verdict.playerScores && (
                  <div>
                    <h3 className="font-semibold text-verdict-gold mb-2">Player Scores</h3>
                    <div className="space-y-2">
                      {Object.entries(verdict.playerScores).map(([role, score]) => (
                        <div key={role} className="flex justify-between items-center">
                          <span className="capitalize">{role}</span>
                          <span className="text-verdict-gold font-semibold">{score as number}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 mt-8">
                  <GavelButton
                    variant="accent"
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    Play Again
                  </GavelButton>
                  <GavelButton
                    variant="secondary"
                    onClick={onGameEnd}
                    className="flex-1"
                  >
                    Return to Lobby
                  </GavelButton>
                </div>
              </motion.div>
            </CourtroomCardContent>
          </CourtroomCard>
        </motion.div>
      </div>
    )
  }
  
  // Show jury deliberation screen
  if (juryDeliberating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-8"
          >
            <Scale size={96} className="text-verdict-gold mx-auto" />
          </motion.div>
          <h2 className="text-3xl font-serif font-bold text-verdict-gold mb-4">AI Jury Deliberation</h2>
          <p className="text-parchment/80 text-lg mb-6">The AI jury is analyzing all evidence, witness testimonies, and arguments...</p>
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, delay: i * 0.2, duration: 1 }}
                className="w-3 h-3 bg-verdict-gold rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany">
      {/* Header */}
      <div className="border-b border-verdict-gold/20 bg-gavel-blue/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-verdict-gold">
                {getPhaseTitle()}
              </h1>
              <p className="text-parchment/70 text-sm">
                {selectedCase?.case_name} • Room: {currentGame?.room_code}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-parchment">
                <Clock size={16} />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
              
              {/* View Toggle Buttons */}
              <div className="flex gap-1">
                {[
                  { id: 'evidence', icon: FileText, label: 'Evidence' },
                  { id: 'witness', icon: Users, label: 'Witness' },
                  { id: 'timeline', icon: Clock, label: 'Timeline' },
                  { id: 'jury', icon: Target, label: 'Jury' }
                ].map(({ id, icon: Icon, label }) => (
                  <GavelButton
                    key={id}
                    variant={activeView === id ? 'accent' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView(id as any)}
                  >
                    <Icon size={16} />
                    <span className="hidden md:inline ml-1">{label}</span>
                  </GavelButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeView === 'evidence' && (
                <motion.div
                  key="evidence"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Evidence Selection Header */}
                  <CourtroomCard>
                    <CourtroomCardHeader>
                      <CourtroomCardTitle className="flex items-center gap-2">
                        <FileText className="text-verdict-gold" size={20} />
                        Evidence Presentation
                        {selectedEvidence.length > 0 && (
                          <span className="text-sm bg-verdict-gold/20 text-verdict-gold px-2 py-1 rounded">
                            {selectedEvidence.length} selected
                          </span>
                        )}
                      </CourtroomCardTitle>
                      {selectedEvidence.length > 1 && (
                        <div className="flex gap-2 mt-2">
                          <GavelButton
                            variant="accent"
                            size="sm"
                            onClick={() => {
                              if (selectedEvidence.length > 0) {
                                handleEvidencePresent(selectedEvidence[0], 'dramatic')
                              }
                            }}
                            disabled={isSubmittingAction}
                          >
                            <Zap size={14} />
                            Present Combination
                          </GavelButton>
                          <GavelButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvidence([])}
                          >
                            Clear Selection
                          </GavelButton>
                        </div>
                      )}
                    </CourtroomCardHeader>
                  </CourtroomCard>
                  
                  {/* Evidence Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableEvidence.map(evidence => (
                      <EvidenceCard
                        key={evidence.id}
                        evidence={evidence}
                        isSelected={selectedEvidence.some(e => e.id === evidence.id)}
                        isLocked={false}
                        canCombine={selectedEvidence.length > 0 && !selectedEvidence.includes(evidence)}
                        onSelect={(evidence) => {
                          if (selectedEvidence.includes(evidence)) {
                            setSelectedEvidence(prev => prev.filter(e => e.id !== evidence.id))
                          } else {
                            setSelectedEvidence([evidence])
                          }
                        }}
                        onPresent={(evidence) => handleEvidencePresent(evidence, 'normal')}
                        onCombine={handleEvidenceCombine}
                        onExamine={(evidence) => {
                          setShowEvidenceExaminer(true)
                          // TODO: Show evidence examiner modal
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              
              {activeView === 'witness' && (
                <motion.div
                  key="witness"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Witness Selection */}
                  {!currentWitness ? (
                    <CourtroomCard>
                      <CourtroomCardHeader>
                        <CourtroomCardTitle className="flex items-center gap-2">
                          <Brain className="text-verdict-gold" size={20} />
                          Select Witness to Examine
                        </CourtroomCardTitle>
                      </CourtroomCardHeader>
                      <CourtroomCardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableWitnesses.map(witness => (
                            <motion.div
                              key={witness.id}
                              whileHover={{ scale: 1.02 }}
                              className="p-4 border border-verdict-gold/30 rounded-lg cursor-pointer hover:bg-verdict-gold/10 transition-colors"
                              onClick={() => setCurrentWitness(witness)}
                            >
                              <h3 className="font-semibold text-verdict-gold mb-2">
                                {witness.witness_name}
                              </h3>
                              <p className="text-sm text-parchment/70 capitalize mb-2">
                                {witness.witness_role}
                              </p>
                              <div className="text-xs text-parchment/60">
                                Base Credibility: {witness.credibility_base}%
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CourtroomCardContent>
                    </CourtroomCard>
                  ) : (
                    <WitnessExamination
                      gameSessionId={currentGame?.id || ''}
                      witness={currentWitness}
                      examinationType={examinationType}
                      userRole={userRole || ''}
                      onQuestionSubmit={handleWitnessQuestion}
                      onObjection={handleObjection}
                    />
                  )}
                  
                  {/* Examination Type Controls */}
                  {currentWitness && (
                    <CourtroomCard>
                      <CourtroomCardContent>
                        <div className="flex gap-2">
                          {(['direct', 'cross', 'redirect'] as const).map(type => (
                            <GavelButton
                              key={type}
                              variant={examinationType === type ? 'accent' : 'ghost'}
                              size="sm"
                              onClick={() => setExaminationType(type)}
                              className="capitalize"
                            >
                              {type} Examination
                            </GavelButton>
                          ))}
                          <GavelButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentWitness(null)}
                            className="ml-auto"
                          >
                            Switch Witness
                          </GavelButton>
                        </div>
                      </CourtroomCardContent>
                    </CourtroomCard>
                  )}
                </motion.div>
              )}
              
              {activeView === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <EvidenceTimeline
                    gameSessionId={currentGame?.id || ''}
                    presentedEvidence={presentedEvidence}
                    onReorderEvidence={(evidence) => {
                      // TODO: Update evidence timeline order
                    }}
                    onLinkEvidence={(id1, id2) => {
                      // TODO: Link evidence items
                    }}
                    onDetectContradiction={(evidenceId) => {
                      // TODO: Show contradiction details
                    }}
                  />
                </motion.div>
              )}
              
              {activeView === 'jury' && (
                <motion.div
                  key="jury"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <JuryImpactMeter
                    gameSessionId={currentGame?.id || ''}
                    currentPhase={currentPhase}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Controls */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>Game Controls</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-3">
                  {userRole === 'judge' && (
                    <GavelButton
                      variant="primary"
                      onClick={() => {
                        if (currentPhase === 'closing_arguments') {
                          requestJuryDeliberation()
                        } else {
                          // Advance to next phase
                        }
                      }}
                      className="w-full"
                    >
                      <Gavel size={16} />
                      {currentPhase === 'closing_arguments' ? 'Begin Deliberation' : 'Advance Phase'}
                    </GavelButton>
                  )}
                  
                  <GavelButton
                    variant="ghost"
                    onClick={onGameEnd}
                    className="w-full"
                  >
                    Leave Game
                  </GavelButton>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
            
            {/* Quick Stats */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>Trial Statistics</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-parchment/70">Evidence Presented:</span>
                    <span className="text-verdict-gold">{presentedEvidence.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-parchment/70">Available Evidence:</span>
                    <span className="text-verdict-gold">{availableEvidence.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-parchment/70">Witnesses:</span>
                    <span className="text-verdict-gold">{availableWitnesses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-parchment/70">Phase:</span>
                    <span className="text-verdict-gold capitalize">{currentPhase.replace('_', ' ')}</span>
                  </div>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
            
            {/* Players */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>Trial Participants</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 bg-gavel-blue/30 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-parchment capitalize">
                          {participant.role}
                          {participant.user_id === user?.id && ' (You)'}
                        </p>
                        <p className="text-xs text-parchment/60">
                          Score: {participant.score || 0}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        participant.is_connected ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                    </div>
                  ))}
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </div>
        </div>
      </div>
    </div>
  )
}