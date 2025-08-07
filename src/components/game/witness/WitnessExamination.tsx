import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Brain, AlertTriangle, TrendingUp, MessageSquare, Zap, Target } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'
import { supabase } from '@/lib/supabase'

interface Witness {
  id: string
  witness_name: string
  witness_role: string
  personality_traits: any
  credibility_base: number
  testimony_data: any
  hidden_information: any
}

interface WitnessExaminationProps {
  gameSessionId: string
  witness: Witness
  examinationType: 'direct' | 'cross' | 'redirect'
  userRole: string
  onQuestionSubmit: (question: string, questionType: string) => void
  onObjection: (objectionType: string, reason: string) => void
}

interface ExaminationState {
  currentStress: number
  currentCredibility: number
  questionsAsked: any[]
  witnessResponses: any[]
  contradictionsFound: any[]
}

interface QuestionTemplate {
  id: string
  template_name: string
  question_type: string
  template_text: string
  effectiveness_modifiers: any
  legal_risk: number
  stress_impact: number
}

export function WitnessExamination({
  gameSessionId,
  witness,
  examinationType,
  userRole,
  onQuestionSubmit,
  onObjection
}: WitnessExaminationProps) {
  const [examinationState, setExaminationState] = useState<ExaminationState>({
    currentStress: 0,
    currentCredibility: witness.credibility_base,
    questionsAsked: [],
    witnessResponses: [],
    contradictionsFound: []
  })
  
  const [customQuestion, setCustomQuestion] = useState('')
  const [selectedQuestionType, setSelectedQuestionType] = useState('open_ended')
  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showObjectionPanel, setShowObjectionPanel] = useState(false)
  const [recentResponse, setRecentResponse] = useState<any>(null)
  
  useEffect(() => {
    loadQuestionTemplates()
    loadExaminationState()
  }, [gameSessionId, witness.id])
  
  const loadQuestionTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .order('template_name')
      
      if (error) throw error
      setQuestionTemplates(data || [])
    } catch (error) {
      console.error('Error loading question templates:', error)
    }
  }
  
  const loadExaminationState = async () => {
    try {
      const { data, error } = await supabase
        .from('witness_examinations')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .eq('witness_id', witness.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (data && !error) {
        setExaminationState({
          currentStress: data.current_stress_level || 0,
          currentCredibility: data.current_credibility || witness.credibility_base,
          questionsAsked: data.questions_asked || [],
          witnessResponses: data.witness_responses || [],
          contradictionsFound: data.contradictions_found || []
        })
      }
    } catch (error) {
      console.error('Error loading examination state:', error)
    }
  }
  
  const handleQuestionSubmit = async () => {
    if (!customQuestion.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      const response = await supabase.functions.invoke('ai-witness-interaction', {
        body: {
          witnessId: witness.id,
          question: customQuestion,
          questionType: selectedQuestionType,
          examinationType,
          currentStress: examinationState.currentStress,
          gameSessionId
        }
      })
      
      if (response.error) throw response.error
      
      const result = response.data
      setRecentResponse(result.response)
      
      // Update local state
      setExaminationState(prev => ({
        ...prev,
        currentStress: result.newStressLevel,
        currentCredibility: result.newCredibility,
        questionsAsked: [...prev.questionsAsked, { question: customQuestion, questionType: selectedQuestionType, timestamp: new Date().toISOString() }],
        witnessResponses: [...prev.witnessResponses, { ...result.response, timestamp: new Date().toISOString() }]
      }))
      
      onQuestionSubmit(customQuestion, selectedQuestionType)
      setCustomQuestion('')
      
    } catch (error) {
      console.error('Error submitting question:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleTemplateQuestion = (template: QuestionTemplate) => {
    setCustomQuestion(template.template_text)
    setSelectedQuestionType(template.question_type)
  }
  
  const getStressColor = (stress: number) => {
    if (stress > 80) return 'text-red-500'
    if (stress > 60) return 'text-orange-500'
    if (stress > 40) return 'text-yellow-500'
    return 'text-green-500'
  }
  
  const getCredibilityColor = (credibility: number) => {
    if (credibility > 80) return 'text-green-500'
    if (credibility > 60) return 'text-yellow-500'
    if (credibility > 40) return 'text-orange-500'
    return 'text-red-500'
  }
  
  const questionTypes = [
    { value: 'open_ended', label: 'Open-Ended', risk: 'Low', stress: 5 },
    { value: 'leading', label: 'Leading', risk: 'Medium', stress: 10 },
    { value: 'impeachment', label: 'Impeachment', risk: 'High', stress: 15 },
    { value: 'foundational', label: 'Foundation', risk: 'Low', stress: 3 }
  ]
  
  return (
    <div className="space-y-4">
      {/* Witness Status Panel */}
      <CourtroomCard>
        <CourtroomCardHeader>
          <CourtroomCardTitle className="flex items-center gap-2">
            <User className="text-verdict-gold" size={20} />
            {witness.witness_name} - {examinationType} Examination
          </CourtroomCardTitle>
        </CourtroomCardHeader>
        
        <CourtroomCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Stress Meter */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-parchment/20"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(examinationState.currentStress / 100) * 175.9} 175.9`}
                    className={getStressColor(examinationState.currentStress)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${getStressColor(examinationState.currentStress)}`}>
                    {examinationState.currentStress}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-parchment/70">Stress Level</p>
            </div>
            
            {/* Credibility Meter */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-parchment/20"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(examinationState.currentCredibility / 100) * 175.9} 175.9`}
                    className={getCredibilityColor(examinationState.currentCredibility)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${getCredibilityColor(examinationState.currentCredibility)}`}>
                    {examinationState.currentCredibility}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-parchment/70">Credibility</p>
            </div>
            
            {/* Questions Asked */}
            <div className="text-center">
              <div className="text-2xl font-bold text-verdict-gold mb-1">
                {examinationState.questionsAsked.length}
              </div>
              <p className="text-xs text-parchment/70">Questions</p>
            </div>
            
            {/* Contradictions */}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {examinationState.contradictionsFound.length}
              </div>
              <p className="text-xs text-parchment/70">Contradictions</p>
            </div>
          </div>
          
          {/* Personality Traits */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-verdict-gold mb-2">Witness Traits:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(witness.personality_traits || {}).map(([trait, value]) => (
                <span 
                  key={trait}
                  className="px-2 py-1 bg-gavel-blue/30 text-parchment rounded text-xs"
                >
                  {trait}: {String(value)}
                </span>
              ))}
            </div>
          </div>
        </CourtroomCardContent>
      </CourtroomCard>
      
      {/* Recent Response */}
      <AnimatePresence>
        {recentResponse && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-2">
                  <MessageSquare className="text-blue-400" size={16} />
                  Witness Response
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-3">
                  <p className="text-parchment italic">"{recentResponse.response}"</p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-parchment/60">Emotion: <span className="text-verdict-gold capitalize">{recentResponse.emotional_state}</span></span>
                    {recentResponse.contradiction && (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Contradiction Detected!
                      </span>
                    )}
                    {recentResponse.revealed_info && (
                      <span className="text-green-400 flex items-center gap-1">
                        <Zap size={12} />
                        New Information
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-parchment/60">
                    <strong>Body Language:</strong> {recentResponse.body_language}
                  </p>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Question Input Panel */}
      <CourtroomCard>
        <CourtroomCardHeader>
          <CourtroomCardTitle className="flex items-center gap-2">
            <Brain className="text-verdict-gold" size={20} />
            Question Builder
          </CourtroomCardTitle>
        </CourtroomCardHeader>
        
        <CourtroomCardContent>
          <div className="space-y-4">
            {/* Question Type Selection */}
            <div>
              <label className="block text-sm font-medium text-parchment mb-2">
                Question Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {questionTypes.map(type => (
                  <GavelButton
                    key={type.value}
                    variant={selectedQuestionType === type.value ? 'accent' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedQuestionType(type.value)}
                    className="text-xs flex flex-col items-center p-2"
                  >
                    <span>{type.label}</span>
                    <span className="text-xs opacity-70">Risk: {type.risk}</span>
                  </GavelButton>
                ))}
              </div>
            </div>
            
            {/* Question Templates */}
            {questionTemplates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-parchment mb-2">
                  Quick Templates
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {questionTemplates
                    .filter(t => t.question_type === selectedQuestionType)
                    .map(template => (
                    <GavelButton
                      key={template.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTemplateQuestion(template)}
                      className="text-xs text-left p-2 h-auto whitespace-normal"
                    >
                      {template.template_name}
                    </GavelButton>
                  ))}
                </div>
              </div>
            )}
            
            {/* Custom Question Input */}
            <div>
              <label className="block text-sm font-medium text-parchment mb-2">
                Your Question
              </label>
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment placeholder-parchment/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold resize-none"
                placeholder="Type your question for the witness..."
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <GavelButton
                variant="accent"
                onClick={handleQuestionSubmit}
                disabled={!customQuestion.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Asking...' : 'Ask Question'}
              </GavelButton>
              
              {userRole !== examinationType.split('_')[0] && (
                <GavelButton
                  variant="secondary"
                  onClick={() => setShowObjectionPanel(!showObjectionPanel)}
                >
                  <Target size={16} />
                  Object
                </GavelButton>
              )}
            </div>
          </div>
        </CourtroomCardContent>
      </CourtroomCard>
      
      {/* Objection Panel */}
      <AnimatePresence>
        {showObjectionPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>File Objection</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Leading', 'Relevance', 'Foundation', 'Hearsay', 'Speculation', 'Argumentative'].map(objType => (
                    <GavelButton
                      key={objType}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onObjection(objType.toLowerCase(), `${objType} objection raised`)
                        setShowObjectionPanel(false)
                      }}
                      className="text-xs"
                    >
                      {objType}
                    </GavelButton>
                  ))}
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}