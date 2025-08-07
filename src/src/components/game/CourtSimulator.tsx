// FORCE REBUILD VERSION - COMPLETELY RENAMED COMPONENT
// This file has been renamed from StrategicCourtroom.tsx to CourtSimulator.tsx to bypass any caching issues
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Brain, Target, Shield, AlertTriangle, Clock, Gavel, MessageSquare, FileText, Users, Info, Briefcase, Award, ArrowRight, BookOpen, LogOut } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { CaseStrengthMeter } from './strategy/CaseStrengthMeter'
import { CredibilityTracker } from './strategy/CredibilityTracker'
import { CaseStrengthAnalyzer } from './strategy/CaseStrengthAnalyzer'
import { StrategicDecisionAdvisor } from './strategy/StrategicDecisionAdvisor'
import { EvidenceCard } from './evidence/EvidenceCard'
import { EvidenceTimeline } from './evidence/EvidenceTimeline'
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

export function CourtSimulator({ onGameEnd }: StrategicCourtroomProps) {
  // NUCLEAR DEBUG: Log that this component is rendering
  console.log('CourtSimulator (renamed from StrategicCourtroom) is rendering')

  // State management
  const { user } = useAuth()
  const { currentGame, currentView, setCurrentView } = useGameStore()
  const [isTrialStarted, setIsTrialStarted] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('pretrial')
  const [timeRemaining, setTimeRemaining] = useState(900) // 15 minutes in seconds
  const [gameData, setGameData] = useState<any>(null)
  const [caseData, setCaseData] = useState<any>(null)
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([])
  const [currentArgumentStage, setCurrentArgumentStage] = useState(0)
  const [juryScore, setJuryScore] = useState(50)
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [currentWitness, setCurrentWitness] = useState<any>(null)
  const [userActions, setUserActions] = useState<LegalAction[]>([])
  const [notifications, setNotifications] = useState<string[]>([])
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [trialEvents, setTrialEvents] = useState<any[]>([])
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null)
  const [argumentImpact, setArgumentImpact] = useState<number | null>(null)
  const [caseStrength, setCaseStrength] = useState(60)

  // Constants
  const TRIAL_TIME_LIMIT = 900 // 15 minutes in seconds
  const PHASES = ['opening', 'evidence', 'witness', 'closing', 'verdict']
  const MAX_SCORE = 100
  
  // Load game and case data
  useEffect(() => {
    console.log('CourtSimulator: useEffect for loading game data triggered', {currentGame})
    
    // Fallback to local data if no game session
    const loadFallbackData = async () => {
      try {
        console.log('Loading fallback data')
        // Create mock case data since this is a direct render
        const mockCase = {
          id: 'mock-case-1',
          title: 'The People v. John Doe',
          description: 'A case involving allegations of fraud and misrepresentation.',
          prosecution_summary: 'The prosecution alleges that the defendant knowingly misrepresented financial information.',
          defense_summary: 'The defense contends that any misrepresentations were unintentional and based on information provided by third parties.',
          key_facts: [
            'The defendant was CEO of TechCorp from 2023-2025',
            'Financial reports for Q2 2024 contained material misstatements',
            'Investors lost approximately $2.3 million'
          ],
          legal_context: 'This case examines corporate liability and the burden of proof for intent in financial fraud cases.',
          judge: 'Hon. Justice Bernard',
          evidence: [
            {
              id: 'ev-001',
              evidence_name: 'Financial Reports',
              evidence_type: 'document',
              description: 'Quarterly financial reports from 2023-2025',
              impact_strength: 75,
              evidence_data: {}
            },
            {
              id: 'ev-002',
              evidence_name: 'Email Correspondence',
              evidence_type: 'electronic',
              description: 'Emails between the defendant and CFO',
              impact_strength: 60,
              evidence_data: {}
            }
          ],
          witnesses: [
            {
              id: 'wit-001',
              name: 'Jane Smith',
              title: 'Former CFO',
              party: 'prosecution',
              testimony: 'The defendant instructed me to modify the financial reports.'
            },
            {
              id: 'wit-002',
              name: 'Robert Johnson',
              title: 'Financial Analyst',
              party: 'defense',
              testimony: 'The financial data provided by third-party vendors contained errors.'
            }
          ],
          prosecution_opening: 'Ladies and gentlemen of the jury, we will prove beyond reasonable doubt that the defendant knowingly misrepresented financial information, causing significant harm to investors.',
          defense_opening: 'The evidence will show that my client acted in good faith, relying on information that was provided by trusted third parties.',
          prosecution_closing: 'The evidence clearly demonstrates that the defendant was aware of the misrepresentations and chose to proceed anyway.',
          defense_closing: 'The prosecution has failed to prove intent, which is a necessary element of the crime charged.'
        }
        
        setCaseData(mockCase)
        setEvidenceItems(mockCase.evidence || [])
        generateTrialEvents(mockCase)
        console.log('Fallback data loaded successfully')
      } catch (error) {
        console.error('Error loading fallback data:', error)
        addNotification('Failed to load case data. Please try again.')
      }
    }
    
    // Always use fallback data for this nuclear option
    loadFallbackData()
  }, [])
  
  // Generate trial events based on case data
  const generateTrialEvents = (caseData: any) => {
    if (!caseData) return
    
    console.log('Generating trial events from case data')
    
    // Create trial flow based on case data
    const events = [
      {
        phase: 'opening',
        type: 'statement',
        speaker: 'prosecution',
        content: caseData.prosecution_opening || 'The prosecution presents their opening statement...',
        expectedDuration: 60
      },
      {
        phase: 'opening',
        type: 'statement',
        speaker: 'defense',
        content: caseData.defense_opening || 'The defense presents their opening statement...',
        expectedDuration: 60
      }
    ]
    
    // Add evidence presentations
    if (caseData.evidence && Array.isArray(caseData.evidence)) {
      caseData.evidence.forEach((item: any, index: number) => {
        events.push({
          phase: 'evidence',
          type: 'evidence_presentation',
          item: item,
          expectedDuration: 45,
          speaker: index % 2 === 0 ? 'prosecution' : 'defense'
        })
      })
    }
    
    // Add witness examinations
    if (caseData.witnesses && Array.isArray(caseData.witnesses)) {
      caseData.witnesses.forEach((witness: any) => {
        events.push({
          phase: 'witness',
          type: 'witness_examination',
          witness: witness,
          expectedDuration: 120,
          speaker: witness.party || 'prosecution'
        })
      })
    }
    
    // Add closing arguments
    events.push(
      {
        phase: 'closing',
        type: 'statement',
        speaker: 'prosecution',
        content: caseData.prosecution_closing || 'The prosecution presents their closing argument...',
        expectedDuration: 60
      },
      {
        phase: 'closing',
        type: 'statement',
        speaker: 'defense',
        content: caseData.defense_closing || 'The defense presents their closing argument...',
        expectedDuration: 60
      }
    )
    
    // Add verdict
    events.push({
      phase: 'verdict',
      type: 'jury_deliberation',
      content: 'The jury deliberates on the case...',
      expectedDuration: 30
    })
    
    setTrialEvents(events)
    console.log('Trial events generated successfully', events.length)
  }
  
  // Timer effect
  useEffect(() => {
    if (!isTrialStarted) return
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          handleTimeExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isTrialStarted])
  
  // Handle trial start
  const startTrial = () => {
    console.log('Starting trial')
    setIsTrialStarted(true)
    setTimeRemaining(TRIAL_TIME_LIMIT)
    setCurrentPhase(PHASES[0])
    setCurrentArgumentStage(0)
    addNotification('Trial has begun. Opening statements will now commence.')
    
    // Log action to database if connected
    logAction({
      type: 'trial_started',
      data: { timestamp: new Date().toISOString() },
      caseContext: { case_id: caseData?.id },
      userId: user?.id || 'anonymous'
    })
  }
  
  // Handle time expired
  const handleTimeExpired = () => {
    addNotification('Time has expired! The trial must conclude now.')
    if (currentPhase !== 'verdict') {
      setCurrentPhase('verdict')
      calculateVerdict()
    }
  }
  
  // Advance to next trial phase
  const advancePhase = () => {
    const currentIndex = PHASES.indexOf(currentPhase)
    if (currentIndex < PHASES.length - 1) {
      const nextPhase = PHASES[currentIndex + 1]
      setCurrentPhase(nextPhase)
      setCurrentArgumentStage(0)
      addNotification(`Moving to ${nextPhase} phase.`)
      
      // Log phase change
      logAction({
        type: 'phase_changed',
        data: { from: currentPhase, to: nextPhase },
        caseContext: { case_id: caseData?.id },
        userId: user?.id || 'anonymous'
      })
      
      // If advancing to verdict phase, calculate verdict
      if (nextPhase === 'verdict') {
        calculateVerdict()
      }
    }
  }
  
  // Advance to next argument or speaker within a phase
  const advanceArgument = () => {
    // Find relevant events for current phase
    const phaseEvents = trialEvents.filter(event => event.phase === currentPhase)
    
    if (currentArgumentStage < phaseEvents.length - 1) {
      setCurrentArgumentStage(currentArgumentStage + 1)
      const nextSpeaker = phaseEvents[currentArgumentStage + 1]?.speaker
      setActiveSpeaker(nextSpeaker)
      
      // Generate random impact between -10 and +10
      const impact = Math.floor(Math.random() * 21) - 10
      setArgumentImpact(impact)
      setJuryScore(prev => Math.max(0, Math.min(MAX_SCORE, prev + impact)))
      
      // Log argument advancement
      logAction({
        type: 'argument_advanced',
        data: { phase: currentPhase, stage: currentArgumentStage + 1 },
        caseContext: { case_id: caseData?.id },
        userId: user?.id || 'anonymous'
      })
    } else {
      // End of phase, move to next phase
      advancePhase()
    }
  }
  
  // Calculate final verdict
  const calculateVerdict = () => {
    // Simple algorithm based on jury score
    const finalVerdict = juryScore >= 50 ? 'guilty' : 'not guilty'
    const verdictStrength = Math.abs(juryScore - 50) // How strong the verdict is
    
    // Update game state
    addNotification(`The jury has reached a verdict: ${finalVerdict.toUpperCase()}`)
    
    // Log verdict
    logAction({
      type: 'verdict_reached',
      data: { verdict: finalVerdict, score: juryScore },
      caseContext: { case_id: caseData?.id },
      userId: user?.id || 'anonymous'
    })
    
    // Save to database if connected
    if (currentGame?.id && user?.id) {
      saveGameOutcome(finalVerdict, juryScore)
    }
  }
  
  // Save game outcome to database
  const saveGameOutcome = async (verdict: string, score: number) => {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          outcome: verdict,
          jury_score: score,
          completed_at: new Date().toISOString()
        })
        .eq('id', currentGame.id)
      
      if (error) throw error
    } catch (error) {
      console.error('Error saving game outcome:', error)
      addNotification('Failed to save game outcome.')
    }
  }
  
  // Handle evidence selection
  const handleEvidenceSelect = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence)
    
    // Log evidence selection
    logAction({
      type: 'evidence_selected',
      data: { evidence_id: evidence.id },
      caseContext: { case_id: caseData?.id },
      userId: user?.id || 'anonymous'
    })
  }
  
  // Handle witness selection
  const handleWitnessSelect = (witness: any) => {
    setCurrentWitness(witness)
    
    // Log witness selection
    logAction({
      type: 'witness_selected',
      data: { witness_id: witness.id },
      caseContext: { case_id: caseData?.id },
      userId: user?.id || 'anonymous'
    })
  }
  
  // Log user actions
  const logAction = (action: LegalAction) => {
    // Add to local state
    setUserActions(prev => [...prev, action])
    
    // Log to console for debugging
    console.log('User action:', action)
    
    // Save to database if connected
    if (currentGame?.id && user?.id) {
      saveActionToDatabase(action)
    }
  }
  
  // Save action to database
  const saveActionToDatabase = async (action: LegalAction) => {
    try {
      const { error } = await supabase
        .from('game_actions')
        .insert({
          game_id: currentGame.id,
          user_id: user?.id,
          action_type: action.type,
          action_data: action.data,
          case_context: action.caseContext
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Error saving action to database:', error)
    }
  }
  
  // Add notification
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message])
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message))
    }, 5000)
  }
  
  // Get AI suggestion
  const getAISuggestion = useCallback(async () => {
    setIsAiThinking(true)
    
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const suggestions = [
        "Consider highlighting the inconsistency in the witness testimony.",
        "The evidence regarding timeline could strengthen your case.",
        "Focus on the motive - it's your strongest argument.",
        "The jury seems responsive to emotional appeals in this case.",
        "Consider a more methodical approach to evidence presentation."
      ]
      
      const selectedSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
      setAiSuggestion(selectedSuggestion)
      
      // Log AI suggestion request
      logAction({
        type: 'ai_suggestion_requested',
        data: { suggestion: selectedSuggestion },
        caseContext: { case_id: caseData?.id },
        userId: user?.id || 'anonymous'
      })
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
      setAiSuggestion('Unable to provide a suggestion at this time.')
    } finally {
      setIsAiThinking(false)
    }
  }, [caseData?.id, user?.id])
  
  // Sign out user
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Navigation will be handled by Auth hook
    } catch (error) {
      console.error('Error signing out:', error)
      addNotification('Failed to sign out. Please try again.')
    }
  }
  
  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Get current trial event
  const getCurrentEvent = () => {
    const phaseEvents = trialEvents.filter(event => event.phase === currentPhase)
    return phaseEvents[currentArgumentStage] || null
  }
  
  // Render function for pretrial view
  if (!isTrialStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany overflow-auto">
        {/* NUCLEAR VERSION INDICATOR */}
        <div className="bg-red-600 text-white font-bold py-2 px-4 text-center">
          NUCLEAR FIX VERSION - 2025-08-08 02:45
        </div>
        
        {/* Header with sign out button */}
        <header className="bg-mahogany text-parchment p-4 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-serif">Strategic Trial Simulation</h1>
          <GavelButton 
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-parchment border-parchment/30 hover:bg-mahogany-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </GavelButton>
        </header>
        
        {/* Pre-trial content */}
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case Information */}
            <div className="lg:col-span-2">
              <CourtroomCard className="h-full">
                <CourtroomCardHeader>
                  <CourtroomCardTitle>
                    <Gavel className="w-5 h-5 mr-2" />
                    Case Overview
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{caseData?.title || 'Loading case...'}</h3>
                      <p className="text-parchment/80">{caseData?.description || 'Case details loading...'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="font-semibold mb-1">Prosecution</h4>
                        <p className="text-parchment/80">{caseData?.prosecution_summary || 'Prosecution details loading...'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Defense</h4>
                        <p className="text-parchment/80">{caseData?.defense_summary || 'Defense details loading...'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Key Facts</h4>
                      <ul className="list-disc list-inside text-parchment/80">
                        {caseData?.key_facts && Array.isArray(caseData.key_facts) ? (
                          caseData.key_facts.map((fact: string, index: number) => (
                            <li key={index}>{fact}</li>
                          ))
                        ) : (
                          <li>Key facts loading...</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Legal Background</h4>
                      <p className="text-parchment/80">{caseData?.legal_context || 'Legal background loading...'}</p>
                    </div>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </div>
            
            {/* Trial Information */}
            <div>
              <CourtroomCard className="h-full">
                <CourtroomCardHeader>
                  <CourtroomCardTitle>
                    <Info className="w-5 h-5 mr-2" />
                    Trial Information
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-1">Session Details</h3>
                      <p className="text-parchment/80">Trial ID: {currentGame?.id || 'Practice Session'}</p>
                      <p className="text-parchment/80">Presiding Judge: {caseData?.judge || 'Hon. Justice Bernard'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-bold mb-1">Time Allocation</h3>
                      <p className="text-parchment/80">Trial Time: 15 minutes</p>
                      <p className="text-parchment/80">Opening/Closing: 2 minutes each</p>
                      <p className="text-parchment/80">Evidence Presentation: 5 minutes</p>
                      <p className="text-parchment/80">Witness Examination: 6 minutes</p>
                    </div>
                    
                    <div>
                      <h3 className="font-bold mb-1">Strategic Elements</h3>
                      <ul className="list-disc list-inside text-parchment/80">
                        <li>Monitor jury impact for each action</li>
                        <li>Utilize evidence strategically</li>
                        <li>Adapt to opposing counsel's arguments</li>
                        <li>Maintain credibility with the court</li>
                      </ul>
                    </div>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </div>
            
            {/* Start Trial Button */}
            <div className="pt-6">
              <GavelButton 
                onClick={startTrial} 
                className="w-full py-4 text-lg"
              >
                <Gavel className="mr-2" />
                Begin Trial Proceedings
              </GavelButton>
              <div className="flex justify-between items-center mt-4">
                <GavelButton 
                  variant="ghost" 
                  size="sm"
                  onClick={onGameEnd}
                >
                  Return to Lobby
                </GavelButton>
                <GavelButton 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </GavelButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Main trial view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany overflow-auto">
      {/* NUCLEAR VERSION INDICATOR */}
      <div className="bg-red-600 text-white font-bold py-2 px-4 text-center">
        NUCLEAR FIX VERSION - 2025-08-08 02:45
      </div>
      
      {/* Header */}
      <header className="bg-mahogany text-parchment p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <h1 className="text-xl font-serif mr-4">Strategic Trial Simulation</h1>
          <div className="hidden md:block">
            <span className="text-sm mr-2">Phase:</span>
            <span className="font-medium capitalize">{currentPhase}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Timer */}
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-1" />
            <span className="font-mono">{formatTimeRemaining()}</span>
          </div>
          
          {/* Sign Out Button */}
          <GavelButton 
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-parchment border-parchment/30 hover:bg-mahogany-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </GavelButton>
        </div>
      </header>
      
      {/* Main content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trial Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Phase */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center">
                  {currentPhase === 'opening' && <MessageSquare className="w-5 h-5 mr-2" />}
                  {currentPhase === 'evidence' && <FileText className="w-5 h-5 mr-2" />}
                  {currentPhase === 'witness' && <Users className="w-5 h-5 mr-2" />}
                  {currentPhase === 'closing' && <MessageSquare className="w-5 h-5 mr-2" />}
                  {currentPhase === 'verdict' && <Gavel className="w-5 h-5 mr-2" />}
                  <span className="capitalize">{currentPhase} Phase</span>
                  {activeSpeaker && (
                    <span className="ml-2 text-sm px-2 py-0.5 bg-gavel-blue-500 rounded-full capitalize">
                      {activeSpeaker}
                    </span>
                  )}
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-4">
                  {/* Current Event Content */}
                  {getCurrentEvent() && (
                    <div>
                      <h3 className="font-bold mb-2">
                        {getCurrentEvent().type === 'statement' && 'Statement'}
                        {getCurrentEvent().type === 'evidence_presentation' && 'Evidence Presentation'}
                        {getCurrentEvent().type === 'witness_examination' && 'Witness Examination'}
                        {getCurrentEvent().type === 'jury_deliberation' && 'Jury Deliberation'}
                      </h3>
                      <p>{getCurrentEvent().content}</p>
                      
                      {/* Show impact if available */}
                      {argumentImpact !== null && (
                        <div className="mt-4 flex items-center">
                          <span className="mr-2">Impact on Jury:</span>
                          <span className={`font-medium ${argumentImpact > 0 ? 'text-green-400' : argumentImpact < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                            {argumentImpact > 0 ? '+' : ''}{argumentImpact} points
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between mt-4">
                    {currentPhase !== 'verdict' && (
                      <GavelButton onClick={advanceArgument}>
                        Advance Trial
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </GavelButton>
                    )}
                    
                    {currentPhase === 'verdict' && (
                      <GavelButton onClick={onGameEnd}>
                        Conclude Trial
                      </GavelButton>
                    )}
                    
                    <GavelButton
                      variant="outline"
                      onClick={getAISuggestion}
                      disabled={isAiThinking}
                    >
                      {isAiThinking ? 'Thinking...' : 'Get Strategy Advice'}
                      <Brain className="ml-2 w-4 h-4" />
                    </GavelButton>
                  </div>
                  
                  {/* AI Suggestion */}
                  {aiSuggestion && (
                    <div className="mt-4 p-3 bg-gavel-blue-600/50 rounded-md border border-gavel-blue-400">
                      <h4 className="font-medium mb-1 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Strategic Advice
                      </h4>
                      <p className="text-sm">{aiSuggestion}</p>
                    </div>
                  )}
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
            
            {/* Evidence Timeline */}
            {currentPhase === 'evidence' && (
              <CourtroomCard>
                <CourtroomCardHeader>
                  <CourtroomCardTitle>
                    <FileText className="w-5 h-5 mr-2" />
                    Evidence Timeline
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <EvidenceTimeline 
                    evidenceItems={evidenceItems}
                    onEvidenceSelect={handleEvidenceSelect}
                    selectedEvidence={selectedEvidence}
                  />
                </CourtroomCardContent>
              </CourtroomCard>
            )}
            
            {/* Witness Examination */}
            {currentPhase === 'witness' && (
              <CourtroomCard>
                <CourtroomCardHeader>
                  <CourtroomCardTitle>
                    <Users className="w-5 h-5 mr-2" />
                    Witness Examination
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <WitnessExamination
                    currentWitness={currentWitness || getCurrentEvent()?.witness}
                    phase={currentPhase}
                  />
                </CourtroomCardContent>
              </CourtroomCard>
            )}
            
            {/* Verdict Information */}
            {currentPhase === 'verdict' && (
              <CourtroomCard>
                <CourtroomCardHeader>
                  <CourtroomCardTitle>
                    <Gavel className="w-5 h-5 mr-2" />
                    Jury Verdict
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-center mb-4">
                      {juryScore >= 50 ? 'GUILTY' : 'NOT GUILTY'}
                    </h3>
                    
                    <div className="flex justify-center items-center">
                      <div className="w-full max-w-md bg-gavel-blue-700 h-4 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${juryScore >= 50 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${juryScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p>Jury Conviction Score: {juryScore}%</p>
                      <p className="mt-2">
                        {juryScore >= 50 
                          ? `The jury found the defendant guilty with ${juryScore - 50}% conviction strength.` 
                          : `The jury found the defendant not guilty with ${50 - juryScore}% acquittal strength.`
                        }
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-bold mb-2">Case Analysis</h4>
                      <p>Your performance throughout this trial demonstrated {juryScore > 70 ? 'excellent' : juryScore > 50 ? 'good' : juryScore > 30 ? 'fair' : 'poor'} strategic thinking and legal argumentation.</p>
                      <p className="mt-2">Key strengths and weaknesses in your approach:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>{juryScore > 50 ? 'Effective presentation of evidence' : 'Could improve evidence presentation'}</li>
                        <li>{juryScore > 60 ? 'Strong witness examination' : 'Witness testimonies could have been leveraged better'}</li>
                        <li>{juryScore > 40 ? 'Maintained good credibility with the court' : 'Credibility with the court was compromised'}</li>
                      </ul>
                    </div>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            )}
          </div>
          
          {/* Right Column - Strategic Elements */}
          <div className="space-y-6">
            {/* Jury Impact Meter */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>
                  <Scale className="w-5 h-5 mr-2" />
                  Jury Impact
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Defense</span>
                    <span>Prosecution</span>
                  </div>
                  <div className="w-full bg-gavel-blue-700 h-4 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-verdict-gold"
                      style={{ width: `${juryScore}%` }}
                    ></div>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-sm">Jury Inclination: {juryScore}%</span>
                  </div>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
            
            {/* Case Strength */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>
                  <Shield className="w-5 h-5 mr-2" />
                  Case Strength
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <CaseStrengthMeter strength={caseStrength} />
                <CaseStrengthAnalyzer 
                  caseData={caseData} 
                  phase={currentPhase}
                  selectedEvidence={selectedEvidence}
                />
              </CourtroomCardContent>
            </CourtroomCard>
            
            {/* Strategic Decision Advisor */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>
                  <Brain className="w-5 h-5 mr-2" />
                  Strategic Advisor
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <StrategicDecisionAdvisor 
                  phase={currentPhase}
                  caseData={caseData}
                  juryScore={juryScore}
                />
              </CourtroomCardContent>
            </CourtroomCard>
            
            {/* Credibility Tracker */}
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>
                  <Award className="w-5 h-5 mr-2" />
                  Credibility Tracker
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <CredibilityTracker
                  actions={userActions}
                  phase={currentPhase}
                />
              </CourtroomCardContent>
            </CourtroomCard>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      <div className="fixed bottom-0 right-0 p-4 space-y-2">
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={`${notification}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-mahogany text-parchment p-3 rounded-md shadow-lg max-w-md"
            >
              {notification}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}