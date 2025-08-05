import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, MessageSquare, FileText, Users, Clock, Gavel } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { useGameStore } from '@/stores/gameStore'
import { useAuth } from '@/hooks/useAuth'
import { useWebRTC } from '@/hooks/useWebRTC'
import { supabase } from '@/lib/supabase'
import { TrialFlowTracker } from './TrialFlowTracker'
import { WitnessExamination } from './WitnessExamination'
import GameHUD from './GameHUD'
import InstantFeedback from './InstantFeedback'
import PowerUpManager, { PowerUp } from './PowerUpManager'

interface CourtroomProps {
  onGameEnd: () => void
}

export function Courtroom({ onGameEnd }: CourtroomProps) {
  const { user } = useAuth()
  const {
    currentGame,
    participants,
    selectedCase,
    currentPhase,
    userRole,
    timeRemaining,
    showChat,
    showEvidence,
    playerArguments,
    presentedEvidence,
    setShowChat,
    setShowEvidence,
    addPlayerArgument,
    addPresentedEvidence,
    setCurrentPhase,
    setTimeRemaining,
    addNotification
  } = useGameStore()
  
  const { initializeWebRTC } = useWebRTC()
  
  const [currentArgument, setCurrentArgument] = useState('')
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null)
  const [isSubmittingArgument, setIsSubmittingArgument] = useState(false)
  const [juryDeliberating, setJuryDeliberating] = useState(false)
  const [verdict, setVerdict] = useState<any>(null)
  const [objectionHistory, setObjectionHistory] = useState<any[]>([])
  const [phaseInstructions, setPhaseInstructions] = useState<string>('')

  // 🎮 GAMIFICATION STATE
  const [currentScore, setCurrentScore] = useState(0)
  const [comboMultiplier, setComboMultiplier] = useState(1.0)
  const [powerUpCharge, setPowerUpCharge] = useState(0)
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([])
  const [availablePowerUps, setAvailablePowerUps] = useState<PowerUp[]>([])
  const [recentEvents, setRecentEvents] = useState<Array<{type: string; points: number; timestamp: number}>>([])
  const [feedbackEvents, setFeedbackEvents] = useState<Array<any>>([])
  const [gameSessionId] = useState(() => crypto.randomUUID())

  // Initialize WebRTC when entering courtroom
  useEffect(() => {
    if (participants.length > 1) {
      initializeWebRTC()
    }
  }, [participants, initializeWebRTC])

  // Request jury deliberation function
  const requestJuryDeliberation = useCallback(async () => {
    if (!currentGame || !selectedCase) return

    setJuryDeliberating(true)
    setCurrentPhase('deliberation')
    
    try {
      const response = await supabase.functions.invoke('ai-jury-deliberation', {
        body: {
          gameSessionId: currentGame.id,
          arguments: playerArguments,
          evidence: presentedEvidence.map(e => ({
            presented_by: e.presented_by,
            evidence_name: e.evidence.evidence_name || e.evidence.description,
            description: e.evidence.description
          })),
          caseData: selectedCase
        }
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      // Verdict will be received via real-time subscription
    } catch (error) {
      console.error('Error requesting jury deliberation:', error)
      setJuryDeliberating(false)
      addNotification({
        type: 'error',
        message: 'Failed to request jury deliberation'
      })
    }
  }, [currentGame, selectedCase, setCurrentPhase, playerArguments, presentedEvidence, addNotification])

  // Advance phase function
  const advancePhase = useCallback(async () => {
    if (!currentGame || !user || userRole !== 'judge') return

    try {
      // Check if this is the last phase - time for AI jury
      if (currentPhase === 'closing_arguments') {
        await requestJuryDeliberation()
        return
      }

      const response = await supabase.functions.invoke('game-session-manager', {
        body: {
          action: 'advance_phase',
          gameSessionId: currentGame.id,
          userId: user.id,
          data: { currentPhase }
        }
      })

      if (response.error) {
        throw new Error(response.error.message)
      }
    } catch (error) {
      console.error('Error advancing phase:', error)
      addNotification({
        type: 'error',
        message: 'Failed to advance phase'
      })
    }
  }, [currentGame, user, userRole, currentPhase, addNotification, requestJuryDeliberation])

  // Phase timer
  useEffect(() => {
    if (currentPhase === 'completed' || currentPhase === 'verdict') return
    
    const timer = setInterval(() => {
      const currentTime = timeRemaining
      if (currentTime <= 1) {
        // Auto-advance phase when timer runs out
        advancePhase()
        setTimeRemaining(0)
      } else {
        setTimeRemaining(currentTime - 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [currentPhase, timeRemaining, setTimeRemaining, advancePhase])

  // Real-time subscriptions for game events
  useEffect(() => {
    if (!currentGame) return

    const channel = supabase
      .channel(`courtroom_${currentGame.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_actions',
          filter: `game_session_id=eq.${currentGame.id}`
        },
        (payload) => {
          const action = payload.new
          handleGameAction(action)
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
          if (evaluation.evaluation_phase === 'final_verdict') {
            setVerdict(evaluation.evaluation_data.fullResponse)
            setJuryDeliberating(false)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentGame])

  const handleGameAction = (action: any) => {
    switch (action.action_type) {
      case 'argument_submitted':
        addPlayerArgument(action.action_data.role, action.action_data.argument)
        break
      case 'evidence_presented':
        addPresentedEvidence({
          id: action.id,
          presented_by: action.action_data.role,
          evidence: action.action_data.evidence,
          timestamp: action.timestamp
        })
        break
      case 'phase_advanced':
        setCurrentPhase(action.action_data.newPhase)
        setTimeRemaining(action.action_data.timeLimit || 300)
        break
    }
  }

  const submitArgument = async () => {
    if (!currentArgument.trim() || !currentGame || !user || !userRole) return

    setIsSubmittingArgument(true)
    try {
      // Save argument to database
      const { error } = await supabase
        .from('game_actions')
        .insert({
          game_session_id: currentGame.id,
          user_id: user.id,
          action_type: 'argument_submitted',
          action_data: {
            role: userRole,
            argument: currentArgument,
            phase: currentPhase
          },
          game_phase: currentPhase
        })

      if (error) throw error

      addPlayerArgument(userRole, currentArgument)
      setCurrentArgument('')
      
      addNotification({
        type: 'success',
        message: 'Argument submitted successfully!'
      })
    } catch (error) {
      console.error('Error submitting argument:', error)
      addNotification({
        type: 'error',
        message: 'Failed to submit argument'
      })
    } finally {
      setIsSubmittingArgument(false)
    }
  }

  const presentEvidence = async (evidence: any) => {
    if (!currentGame || !user || !userRole) return

    try {
      const { error } = await supabase
        .from('evidence_presentations')
        .insert({
          game_session_id: currentGame.id,
          presented_by_user_id: user.id,
          evidence_data: evidence,
          presentation_phase: currentPhase
        })

      if (error) throw error

      addPresentedEvidence({
        id: Date.now().toString(),
        presented_by: userRole,
        evidence,
        timestamp: new Date().toISOString()
      })
      
      addNotification({
        type: 'success',
        message: 'Evidence presented to the court!'
      })
    } catch (error) {
      console.error('Error presenting evidence:', error)
      addNotification({
        type: 'error',
        message: 'Failed to present evidence'
      })
    }
  }

  const handleObjection = (objectionType: string, context: string) => {
    const objection = {
      type: objectionType,
      context,
      objectedBy: userRole,
      timestamp: new Date().toISOString()
    }
    
    setObjectionHistory(prev => [...prev, objection])
    
    addNotification({
      type: 'info',
      message: `Objection made: ${objectionType}`
    })
  }

  const handleWitnessQuestion = (witnessId: string, question: string) => {
    addNotification({
      type: 'info',
      message: 'Question asked to witness'
    })
  }

  const handlePhaseInfo = (phase: string) => {
    // Handle phase information requests
    setPhaseInstructions(`Information about ${phase} phase`)
  }

  // 🎮 GAMIFICATION FUNCTIONS
  const triggerGameEvent = useCallback(async (eventType: string, eventData: any = {}) => {
    if (!user || !currentGame) return

    try {
      const response = await supabase.functions.invoke('game-event-processor', {
        body: {
          event_type: eventType,
          event_data: eventData,
          user_id: user.id,
          session_id: gameSessionId
        }
      })

      if (response.data && !response.error) {
        const { points_awarded, combo_multiplier, new_achievements, powerups_awarded, total_score } = response.data

        // Update score and combo
        setCurrentScore(total_score)
        setComboMultiplier(combo_multiplier)

        // Add to recent events for UI display
        setRecentEvents(prev => [...prev.slice(-9), {
          type: eventType,
          points: points_awarded,
          timestamp: Date.now()
        }])

        // Update power-up charge
        setPowerUpCharge(prev => Math.min(100, prev + (points_awarded / 10)))

        // Show feedback for the event
        addFeedbackEvent({
          id: crypto.randomUUID(),
          type: points_awarded > 0 ? 'success' : 'failure',
          subtype: eventType,
          message: getEventMessage(eventType, points_awarded),
          intensity: getEventIntensity(points_awarded, combo_multiplier)
        })

        // Handle achievements
        if (new_achievements?.length > 0) {
          new_achievements.forEach((achievement: string) => {
            addFeedbackEvent({
              id: crypto.randomUUID(),
              type: 'achievement',
              subtype: 'achievement_unlocked',
              message: `Achievement Unlocked: ${achievement}!`,
              intensity: 'extreme'
            })
          })
        }

        // Handle powerup rewards
        if (powerups_awarded?.length > 0) {
          powerups_awarded.forEach((powerup: string) => {
            addFeedbackEvent({
              id: crypto.randomUUID(),
              type: 'powerup',
              subtype: 'powerup_activated',
              message: `Power-up Earned: ${powerup}!`,
              intensity: 'high'
            })
          })
        }
      }
    } catch (error) {
      console.error('Error triggering game event:', error)
    }
  }, [user, currentGame, gameSessionId])

  const addFeedbackEvent = (event: any) => {
    setFeedbackEvents(prev => [...prev, event])
  }

  const getEventMessage = (eventType: string, points: number): string => {
    const messages = {
      'successful_objection': 'OBJECTION SUSTAINED!',
      'sustained_objection': 'EXCELLENT OBJECTION!',
      'evidence_presented': 'EVIDENCE ACCEPTED!',
      'witness_questioned': 'GREAT QUESTIONING!',
      'strong_argument': 'COMPELLING ARGUMENT!',
      'dramatic_moment': 'DRAMATIC MOMENT!',
      'perfect_opening': 'PERFECT OPENING!',
      'objection_overruled': 'OBJECTION OVERRULED'
    }
    return messages[eventType as keyof typeof messages] || `+${points} POINTS!`
  }

  const getEventIntensity = (points: number, combo: number): 'low' | 'medium' | 'high' | 'extreme' => {
    if (combo >= 2.5 || points >= 400) return 'extreme'
    if (combo >= 2.0 || points >= 250) return 'high' 
    if (combo >= 1.5 || points >= 150) return 'medium'
    return 'low'
  }

  const handlePowerUpActivation = (powerUpId: string) => {
    // Logic to activate power-up
    triggerGameEvent('powerup_activated', { powerup_id: powerUpId })
    setPowerUpCharge(0) // Reset charge after use
  }

  const handleFeedbackEventComplete = (eventId: string) => {
    setFeedbackEvents(prev => prev.filter(e => e.id !== eventId))
  }

  // Enhanced action handlers with gamification
  const handleEnhancedObjection = (objectionType: string, context: string = '') => {
    handleObjection(objectionType, context)
    triggerGameEvent('successful_objection', { objection_type: objectionType })
  }

  const handleEnhancedEvidencePresentation = (evidence: any) => {
    presentEvidence(evidence)
    triggerGameEvent('evidence_presented', { evidence_complexity: evidence.complexity || 1 })
  }

  const handleEnhancedArgumentSubmission = async () => {
    if (!currentArgument.trim()) return
    
    setIsSubmittingArgument(true)
    await submitArgument()
    
    // Determine argument quality for scoring
    const argumentLength = currentArgument.length
    const argumentQuality = argumentLength > 200 ? 'strong_argument' : 'evidence_presented'
    
    triggerGameEvent(argumentQuality, { 
      argument_length: argumentLength,
      phase: currentPhase 
    })
    
    setIsSubmittingArgument(false)
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
                
                <div>
                  <h3 className="font-semibold text-verdict-gold mb-2">Educational Insights</h3>
                  <p className="text-parchment/80 leading-relaxed">{verdict.educationalInsights}</p>
                </div>
                
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
          <h2 className="text-3xl font-serif font-bold text-verdict-gold mb-4">Jury Deliberation</h2>
          <p className="text-parchment/80 text-lg mb-6">The AI jury is carefully considering all evidence and arguments...</p>
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
      {/* 🎮 GAMIFICATION OVERLAY */}
      <GameHUD
        currentScore={currentScore}
        comboMultiplier={comboMultiplier}
        powerUpCharge={powerUpCharge}
        activePowerUps={activePowerUps}
        recentEvents={recentEvents}
        onActivatePowerUp={handlePowerUpActivation}
      />
      
      <InstantFeedback
        events={feedbackEvents}
        onEventComplete={handleFeedbackEventComplete}
      />
      
      <PowerUpManager
        activePowerUps={activePowerUps}
        availablePowerUps={availablePowerUps}
        onActivatePowerUp={handlePowerUpActivation}
        onPowerUpExpired={(id) => setActivePowerUps(prev => prev.filter(p => p.id !== id))}
        gamePhase={currentPhase}
        canUsePowerUps={true}
      />
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
              
              <div className="flex gap-2">
                <GavelButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEvidence(!showEvidence)}
                >
                  <FileText size={16} />
                  Evidence
                </GavelButton>
                <GavelButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageSquare size={16} />
                  Chat
                </GavelButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Trial Flow Tracker */}
        <TrialFlowTracker 
          currentPhase={currentPhase}
          onPhaseInfo={handlePhaseInfo}
          timeRemaining={timeRemaining}
        />

        {/* Witness Examination (only visible during witness examination phase) */}
        {currentPhase === 'witness_examination' && (
          <WitnessExamination
            caseData={selectedCase}
            userRole={userRole}
            onObjection={handleEnhancedObjection}
            onQuestionAsked={handleWitnessQuestion}
            currentPhase={currentPhase}
          />
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Role-specific Interface */}
            {userRole && (
              <CourtroomCard>
                <CourtroomCardHeader>
                  <CourtroomCardTitle className="capitalize">
                    {userRole} Interface
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  {/* Argument Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-parchment mb-2">
                        Your {currentPhase === 'opening_statements' ? 'Opening Statement' : 
                               currentPhase === 'closing_arguments' ? 'Closing Argument' : 'Argument'}
                      </label>
                      <textarea
                        value={currentArgument}
                        onChange={(e) => setCurrentArgument(e.target.value)}
                        className="w-full h-32 px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment placeholder-parchment/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold resize-none"
                        placeholder={`Present your ${userRole === 'prosecutor' ? 'prosecution' : userRole === 'defense' ? 'defense' : 'judicial'} argument...`}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <GavelButton
                        variant="accent"
                        onClick={handleEnhancedArgumentSubmission}
                        disabled={!currentArgument.trim() || isSubmittingArgument}
                        className="flex-1"
                      >
                        {isSubmittingArgument ? 'Submitting...' : 'Submit Argument'}
                      </GavelButton>
                      
                      {userRole === 'judge' && (
                        <GavelButton
                          variant="primary"
                          onClick={advancePhase}
                        >
                          <Gavel size={16} />
                          Advance Phase
                        </GavelButton>
                      )}
                    </div>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            )}

            {/* Arguments Display */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>Arguments Presented</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-4">
                  {Object.entries(playerArguments).length === 0 ? (
                    <p className="text-parchment/60 text-center py-4">
                      No arguments presented yet.
                    </p>
                  ) : (
                    Object.entries(playerArguments).map(([role, args]) => (
                      <div key={role} className="border-l-4 border-verdict-gold pl-4">
                        <h4 className="font-semibold text-verdict-gold capitalize mb-2">
                          {role} Arguments
                        </h4>
                        <div className="space-y-2">
                          {args.map((argument, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-gavel-blue/30 p-3 rounded-lg"
                            >
                              <p className="text-parchment/80">{argument}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Evidence Panel */}
            <AnimatePresence>
              {showEvidence && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <CourtroomCard>
                    <CourtroomCardHeader>
                      <CourtroomCardTitle>Evidence</CourtroomCardTitle>
                    </CourtroomCardHeader>
                    <CourtroomCardContent>
                      <div className="space-y-3">
                        {selectedCase?.key_evidence.map((evidence, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            className="p-3 bg-gavel-blue/30 rounded-lg cursor-pointer"
                            onClick={() => handleEnhancedEvidencePresentation(evidence)}
                          >
                            <h5 className="font-medium text-verdict-gold text-sm mb-1">
                              {evidence.evidence_name || `Evidence ${index + 1}`}
                            </h5>
                            <p className="text-parchment/70 text-xs">
                              {evidence.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CourtroomCardContent>
                  </CourtroomCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Participants */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>Participants</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-2 p-2 rounded"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        participant.is_connected ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-parchment capitalize">
                          {participant.role}
                        </p>
                        <p className="text-xs text-parchment/60">
                          {participant.user_id === user?.id ? 'You' : `Player ${participant.join_order}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </div>
        </div>
      </div>

      {/* Audio Elements for WebRTC */}
      <audio id="local-audio" autoPlay muted />
      {participants.map(participant => (
        participant.user_id !== user?.id && (
          <audio
            key={participant.user_id}
            id={`audio-${participant.user_id}`}
            autoPlay
          />
        )
      ))}
    </div>
  )
}