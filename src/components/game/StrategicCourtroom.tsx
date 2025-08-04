import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Brain, Target, Shield, AlertTriangle, Clock, Gavel, MessageSquare, FileText, Users } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { CaseStrengthMeter } from './strategy/CaseStrengthMeter'
import { CredibilityTracker } from './strategy/CredibilityTracker'
import { CaseStrengthAnalyzer } from './strategy/CaseStrengthAnalyzer'
import { StrategicDecisionAdvisor } from './strategy/StrategicDecisionAdvisor'
import { EvidenceCard } from './evidence/EvidenceCard'
import { WitnessExamination } from './witness/WitnessExamination'
import { useGameStore } from '@/stores/gameStore'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface StrategicCourtroomProps {
  onGameEnd: () => void
}

interface LegalAction {
  type: string
  data: any
  caseContext: any
  userId: string
}

interface EvidenceItem {
  id: string
  evidence_name: string
  evidence_type: string
  description: string
  impact_strength: number
  evidence_data: any
  legal_foundation?: string
  presentation_risks?: string[]
  unlock_requirements?: any
}

export function StrategicCourtroom({ onGameEnd }: StrategicCourtroomProps) {
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
  
  // Strategic state
  const [pendingDecision, setPendingDecision] = useState<LegalAction | null>(null)
  const [showDecisionAdvisor, setShowDecisionAdvisor] = useState(false)
  const [lastEvaluation, setLastEvaluation] = useState<any>(null)
  const [userCredibility, setUserCredibility] = useState(85)
  const [caseStrength, setCaseStrength] = useState({ prosecution: 50, defense: 50 })
  
  // Game state
  const [gameDataLoaded, setGameDataLoaded] = useState(false)
  const [availableEvidence, setAvailableEvidence] = useState<EvidenceItem[]>([])
  const [presentedEvidence, setPresentedEvidence] = useState<any[]>([])
  const [currentArgument, setCurrentArgument] = useState('')
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [activeView, setActiveView] = useState<'evidence' | 'witness' | 'strategy'>('strategy')
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [verdict, setVerdict] = useState<any>(null)
  const [juryDeliberating, setJuryDeliberating] = useState(false)
  
  const loadGameData = useCallback(async () => {
    // Early return if required data is missing
    if (!currentGame?.id || !selectedCase?.id || !user?.id) {
      setGameDataLoaded(true) // Allow game to continue with limited functionality
      return
    }
    
    try {
      // Load evidence for this case
      const { data: evidence, error: evidenceError } = await supabase
        .from('evidence_items')
        .select('*')
        .eq('case_id', selectedCase.id)
        .order('impact_strength', { ascending: false })
      
      if (evidenceError) {
        console.error('Error loading evidence:', evidenceError)
      } else if (evidence) {
        setAvailableEvidence(evidence)
      }
      
      // Load current credibility
      const { data: credibility, error: credibilityError } = await supabase
        .from('attorney_credibility')
        .select('current_credibility')
        .eq('game_session_id', currentGame.id)
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (credibilityError) {
        console.error('Error loading credibility:', credibilityError)
      } else if (credibility) {
        setUserCredibility(credibility.current_credibility)
      }
      
    } catch (error) {
      console.error('Error loading game data:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load game data'
      })
    } finally {
      setGameDataLoaded(true)
    }
  }, [currentGame?.id, selectedCase?.id, user?.id, addNotification])
  
  const subscribeToGameEvents = useCallback(() => {
    if (!currentGame?.id || !user?.id) {
      return () => {}
    }
    
    const channel = supabase
      .channel(`strategic_courtroom_${currentGame.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'case_events',
          filter: `game_session_id=eq.${currentGame.id}`
        },
        () => {
          // Real-time updates will be handled by child components
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'attorney_credibility',
          filter: `game_session_id=eq.${currentGame.id}`
        },
        (payload) => {
          if (payload.new?.user_id === user.id) {
            setUserCredibility(payload.new.current_credibility || 85)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_jury_evaluations',
          filter: `game_session_id=eq.${currentGame.id}`
        },
        (payload) => {
          const evaluation = payload.new
          if (evaluation?.evaluation_phase === 'final_verdict' && evaluation.evaluation_data?.fullResponse) {
            setVerdict(evaluation.evaluation_data.fullResponse)
            setJuryDeliberating(false)
          }
        }
      )
      .subscribe()
    
    return () => {
      try {
        channel.unsubscribe()
      } catch (error) {
        console.error('Error unsubscribing from channel:', error)
      }
    }
  }, [currentGame?.id, user?.id])
  
  const evaluateAndExecuteAction = async (action: LegalAction) => {
    if (!currentGame || !user) return
    
    setIsSubmittingAction(true)
    try {
      // First evaluate the action for consequences
      const response = await supabase.functions.invoke('evaluate-legal-argument', {
        body: {
          gameSessionId: currentGame.id,
          userId: user.id,
          action: action,
          currentPhase,
          userRole
        }
      })
      
      if (response.error) throw response.error
      
      const evaluation = response.data
      setLastEvaluation(evaluation)
      
      // Show consequences to user
      if (evaluation.identifiedMistakes.length > 0 || evaluation.consequences.caseStrengthChange < -5) {
        addNotification({
          type: 'warning',
          message: evaluation.overallAssessment
        })
      } else if (evaluation.consequences.caseStrengthChange > 5) {
        addNotification({
          type: 'success',
          message: evaluation.overallAssessment
        })
      }
      
      // Execute the actual action
      await executeGameAction(action)
      
    } catch (error) {
      console.error('Error evaluating action:', error)
      addNotification({
        type: 'error',
        message: 'Failed to evaluate action'
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }
  
  const executeGameAction = async (action: LegalAction) => {
    try {
      const { error } = await supabase
        .from('game_actions')
        .insert({
          game_session_id: currentGame?.id,
          user_id: user?.id,
          action_type: action.type,
          action_data: action.data,
          game_phase: currentPhase
        })
      
      if (error) throw error
      
    } catch (error) {
      console.error('Error executing action:', error)
      throw error
    }
  }
  
  const handleArgumentSubmit = async () => {
    if (!currentArgument.trim()) {
      addNotification({
        type: 'warning',
        message: 'Please enter an argument before submitting'
      })
      return
    }
    
    console.log('Submitting argument:', currentArgument)
    setIsSubmittingAction(true)
    
    try {
      // Simplified direct submission without complex evaluation
      const actionData = {
        game_session_id: currentGame?.id,
        user_id: user?.id,
        action_type: 'argument_submission',
        action_data: {
          argument: currentArgument,
          phase: currentPhase,
          role: userRole
        },
        game_phase: currentPhase
      }
      
      const { error } = await supabase
        .from('game_actions')
        .insert(actionData)
      
      if (error) throw error
      
      // Update case strength based on argument quality (simple logic)
      const argumentStrength = Math.min(currentArgument.length / 10, 15) // Basic scoring
      const newStrength = { ...caseStrength }
      
      if (userRole === 'prosecutor') {
        newStrength.prosecution = Math.min(100, newStrength.prosecution + argumentStrength)
        newStrength.defense = Math.max(0, newStrength.defense - argumentStrength / 2)
      } else if (userRole === 'defense') {
        newStrength.defense = Math.min(100, newStrength.defense + argumentStrength)
        newStrength.prosecution = Math.max(0, newStrength.prosecution - argumentStrength / 2)
      }
      
      setCaseStrength(newStrength)
      
      // Update credibility based on argument quality
      const credibilityChange = argumentStrength > 10 ? 2 : -1
      setUserCredibility(prev => Math.max(0, Math.min(100, prev + credibilityChange)))
      
      addNotification({
        type: 'success',
        message: `Argument submitted successfully! Case strength updated.`
      })
      
      setCurrentArgument('')
      
    } catch (error) {
      console.error('Error submitting argument:', error)
      addNotification({
        type: 'error',
        message: 'Failed to submit argument. Please try again.'
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }
  
  const handleEvidencePresent = async (evidence: EvidenceItem) => {
    console.log('Presenting evidence:', evidence.evidence_name)
    setIsSubmittingAction(true)
    
    try {
      // Add evidence to presented evidence list
      const newEvidence = {
        id: evidence.id,
        evidence_name: evidence.evidence_name,
        presented_by: userRole || 'unknown',
        impact_strength: evidence.impact_strength,
        timestamp: new Date().toISOString()
      }
      
      setPresentedEvidence(prev => [...prev, newEvidence])
      
      // Record action in database
      const actionData = {
        game_session_id: currentGame?.id,
        user_id: user?.id,
        action_type: 'evidence_presentation',
        action_data: {
          evidence_id: evidence.id,
          evidence_name: evidence.evidence_name,
          phase: currentPhase,
          role: userRole
        },
        game_phase: currentPhase
      }
      
      const { error } = await supabase
        .from('game_actions')
        .insert(actionData)
      
      if (error) throw error
      
      // Update case strength based on evidence impact
      const strengthChange = evidence.impact_strength || 5
      const newStrength = { ...caseStrength }
      
      if (userRole === 'prosecutor') {
        newStrength.prosecution = Math.min(100, newStrength.prosecution + strengthChange)
        newStrength.defense = Math.max(0, newStrength.defense - strengthChange / 3)
      } else if (userRole === 'defense') {
        newStrength.defense = Math.min(100, newStrength.defense + strengthChange)
        newStrength.prosecution = Math.max(0, newStrength.prosecution - strengthChange / 3)
      }
      
      setCaseStrength(newStrength)
      
      addNotification({
        type: 'success',
        message: `Evidence "${evidence.evidence_name}" presented successfully!`
      })
      
    } catch (error) {
      console.error('Error presenting evidence:', error)
      addNotification({
        type: 'error',
        message: 'Failed to present evidence. Please try again.'
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }
  
  const handleObjection = (objectionType: string, reasoning: string) => {
    const action: LegalAction = {
      type: 'objection',
      data: {
        objectionType,
        reasoning,
        targetAction: 'last_action' // Reference to what is being objected to
      },
      caseContext: {
        presentedEvidence,
        userCredibility,
        casePhase: currentPhase
      },
      userId: user?.id || ''
    }
    
    evaluateAndExecuteAction(action)
  }
  
  const handleDecisionConfirm = () => {
    if (pendingDecision) {
      evaluateAndExecuteAction(pendingDecision)
      setPendingDecision(null)
      setShowDecisionAdvisor(false)
    }
  }
  
  const handleDecisionCancel = () => {
    setPendingDecision(null)
    setShowDecisionAdvisor(false)
    addNotification({
      type: 'info',
      message: 'Action cancelled after strategic review'
    })
  }
  
  const requestJuryDeliberation = async () => {
    if (!currentGame || !selectedCase) return
    
    setJuryDeliberating(true)
    setCurrentPhase('deliberation')
    
    try {
      const response = await supabase.functions.invoke('ai-jury-deliberation', {
        body: {
          gameSessionId: currentGame.id,
          caseData: selectedCase,
          evidencePresented: presentedEvidence,
          finalCredibilityScores: {
            prosecution: userRole === 'prosecutor' ? userCredibility : 85,
            defense: userRole === 'defense' ? userCredibility : 85
          }
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
  
  // Load game data when component mounts or key dependencies change
  useEffect(() => {
    if (user?.id && currentGame?.id) {
      loadGameData()
    } else if (user === null) {
      // User is confirmed null (not loading), set game as loaded
      setGameDataLoaded(true)
    }
  }, [loadGameData, user?.id, currentGame?.id])
  
  // Subscribe to real-time game events
  useEffect(() => {
    if (user?.id && currentGame?.id) {
      const unsubscribe = subscribeToGameEvents()
      return unsubscribe
    }
  }, [subscribeToGameEvents, user?.id, currentGame?.id])
  
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
      default: return 'Strategic Trial Session'
    }
  }
  
  // Show verdict screen
  if (verdict) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full"
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
              <CourtroomCardTitle className="text-3xl mb-2">Final Verdict</CourtroomCardTitle>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-serif font-bold text-verdict-gold mb-4"
              >
                {verdict.verdict}
              </motion.div>
              <div className="text-lg text-parchment/80 mb-4">
                Final Credibility: <span className={userCredibility >= 70 ? 'text-green-400' : userCredibility >= 50 ? 'text-yellow-400' : 'text-red-400'}>{userCredibility}/100</span>
              </div>
            </CourtroomCardHeader>
            <CourtroomCardContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-verdict-gold">Jury's Reasoning</h3>
                  <p className="text-parchment/90 leading-relaxed">{verdict.reasoning}</p>
                </div>
                
                {verdict.educationalInsights && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-verdict-gold">Legal Insights</h3>
                    <p className="text-parchment/90 leading-relaxed">{verdict.educationalInsights}</p>
                  </div>
                )}
                
                {lastEvaluation && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-verdict-gold">Strategic Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-parchment/10 rounded-lg">
                        <div className="text-2xl font-bold text-verdict-gold">
                          {lastEvaluation.legalMerit || 0}%
                        </div>
                        <div className="text-sm text-parchment/70">Legal Merit</div>
                      </div>
                      <div className="text-center p-3 bg-parchment/10 rounded-lg">
                        <div className="text-2xl font-bold text-verdict-gold">
                          {lastEvaluation.strategicValue || 0}%
                        </div>
                        <div className="text-sm text-parchment/70">Strategic Value</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center pt-4"
                >
                  <GavelButton onClick={onGameEnd} className="px-8 py-3">
                    Return to Lobby
                  </GavelButton>
                </motion.div>
              </motion.div>
            </CourtroomCardContent>
          </CourtroomCard>
        </motion.div>
      </div>
    )
  }
  
  // Show loading screen while game data is loading
  if (!gameDataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-4"
          >
            <Scale size={64} className="text-verdict-gold mx-auto" />
          </motion.div>
          <p className="text-parchment text-lg mb-2">Entering the Courtroom...</p>
          <p className="text-parchment/60 text-sm">Loading strategic legal systems</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany">
      {/* Strategic Decision Advisor Modal */}
      <AnimatePresence>
        {showDecisionAdvisor && pendingDecision && (
          <StrategicDecisionAdvisor
            gameSessionId={currentGame?.id || ''}
            userRole={userRole || ''}
            currentDecision={pendingDecision}
            onDecisionEvaluated={(evaluation) => setLastEvaluation(evaluation)}
            onProceedWithDecision={handleDecisionConfirm}
            onCancelDecision={handleDecisionCancel}
          />
        )}
      </AnimatePresence>
      
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <CourtroomCard>
            <CourtroomCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CourtroomCardTitle className="text-2xl mb-1">
                    {getPhaseTitle()}
                  </CourtroomCardTitle>
                  <div className="flex items-center gap-4 text-sm text-parchment/70">
                    <span className="capitalize">{userRole}</span>
                    <span>•</span>
                    <span>{selectedCase?.case_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userCredibility >= 80 ? 'bg-green-500/20 text-green-400' :
                      userCredibility >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}
                  >
                    Credibility: {userCredibility}/100
                  </motion.div>
                  {userRole === 'judge' && currentPhase === 'closing_arguments' && (
                    <GavelButton onClick={requestJuryDeliberation} disabled={juryDeliberating}>
                      {juryDeliberating ? 'Jury Deliberating...' : 'Call for Verdict'}
                    </GavelButton>
                  )}
                </div>
              </div>
            </CourtroomCardHeader>
          </CourtroomCard>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Strategic Feedback */}
          <div className="col-span-3 space-y-4">
            <CaseStrengthMeter 
              gameSessionId={currentGame?.id || ''}
              userRole={userRole || ''}
              userId={user?.id || ''}
            />
            
            <CredibilityTracker 
              gameSessionId={currentGame?.id || ''}
              userId={user?.id || ''}
              userRole={userRole || ''}
            />
          </div>
          
          {/* Main Courtroom Area */}
          <div className="col-span-6 space-y-4">
            {/* Action Area */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <div className="flex items-center justify-between">
                  <CourtroomCardTitle>Courtroom Actions</CourtroomCardTitle>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveView('evidence')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeView === 'evidence' 
                          ? 'bg-verdict-gold text-gavel-blue' 
                          : 'text-parchment/70 hover:text-parchment'
                      }`}
                    >
                      Evidence
                    </button>
                    <button
                      onClick={() => setActiveView('witness')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeView === 'witness' 
                          ? 'bg-verdict-gold text-gavel-blue' 
                          : 'text-parchment/70 hover:text-parchment'
                      }`}
                    >
                      Witness
                    </button>
                    <button
                      onClick={() => setActiveView('strategy')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeView === 'strategy' 
                          ? 'bg-verdict-gold text-gavel-blue' 
                          : 'text-parchment/70 hover:text-parchment'
                      }`}
                    >
                      Strategy
                    </button>
                  </div>
                </div>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                {activeView === 'evidence' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {availableEvidence.slice(0, 6).map((evidence) => (
                        <EvidenceCard
                          key={evidence.id}
                          evidence={evidence}
                          isSelected={selectedEvidence?.id === evidence.id}
                          isLocked={false}
                          canCombine={false}
                          onSelect={(ev) => setSelectedEvidence(ev)}
                          onPresent={() => handleEvidencePresent(evidence)}
                          onCombine={() => handleEvidencePresent(evidence)}
                          onExamine={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {activeView === 'witness' && (
                  <div className="text-center py-8 text-parchment/60">
                    <Users size={48} className="mx-auto mb-4" />
                    <p>Witness examination system will be available in this phase</p>
                  </div>
                )}
                
                {activeView === 'strategy' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Submit Legal Argument</label>
                      <textarea
                        value={currentArgument}
                        onChange={(e) => setCurrentArgument(e.target.value)}
                        className="w-full p-3 bg-parchment/10 border border-parchment/30 rounded-lg text-parchment focus:ring-2 focus:ring-verdict-gold focus:border-verdict-gold"
                        rows={4}
                        placeholder="Present your legal argument to the court..."
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-parchment/60">
                          Arguments are evaluated for legal merit and strategic impact
                        </span>
                        <GavelButton 
                          onClick={handleArgumentSubmit}
                          disabled={!currentArgument.trim() || isSubmittingAction}
                          size="sm"
                        >
                          Submit Argument
                        </GavelButton>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleObjection('relevance', 'This evidence is not relevant to the case at hand')}
                        className="p-2 bg-red-500/20 border border-red-500/50 rounded text-sm hover:bg-red-500/30 transition-colors"
                        disabled={isSubmittingAction}
                      >
                        Object: Relevance
                      </button>
                      <button
                        onClick={() => handleObjection('hearsay', 'This statement constitutes inadmissible hearsay')}
                        className="p-2 bg-red-500/20 border border-red-500/50 rounded text-sm hover:bg-red-500/30 transition-colors"
                        disabled={isSubmittingAction}
                      >
                        Object: Hearsay
                      </button>
                      <button
                        onClick={() => handleObjection('foundation', 'Insufficient foundation has been laid for this evidence')}
                        className="p-2 bg-red-500/20 border border-red-500/50 rounded text-sm hover:bg-red-500/30 transition-colors"
                        disabled={isSubmittingAction}
                      >
                        Object: Foundation
                      </button>
                    </div>
                  </div>
                )}
              </CourtroomCardContent>
            </CourtroomCard>
          </div>
          
          {/* Right Sidebar - Case Analysis */}
          <div className="col-span-3 space-y-4">
            <CaseStrengthAnalyzer 
              gameSessionId={currentGame?.id || ''}
              userRole={userRole || ''}
              userId={user?.id || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrategicCourtroom