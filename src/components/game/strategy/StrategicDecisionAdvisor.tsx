import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, XCircle, Brain, Target, Scale } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'
import { supabase } from '@/lib/supabase'

interface StrategicDecisionAdvisorProps {
  gameSessionId: string
  userRole: string
  currentDecision: any
  onDecisionEvaluated: (evaluation: any) => void
  onProceedWithDecision: () => void
  onCancelDecision: () => void
}

interface LegalEvaluation {
  legalMerit: number
  strategicValue: number
  timingScore: number
  riskLevel: number
  consistencyCheck: {
    isConsistent: boolean
    contradictions: string[]
  }
  foundationAnalysis: {
    isProperlyFounded: boolean
    missingFoundation?: string
  }
  identifiedMistakes: Array<{
    type: string
    severity: 'minor' | 'moderate' | 'major' | 'critical'
    description: string
    reversible: boolean
  }>
  consequences: {
    caseStrengthChange: number
    credibilityImpact: number
    juryPerceptionChange: number
    strategicLimitations: string[]
  }
  recommendations: {
    shouldProceed: boolean
    alternativeApproach?: string
    recovery?: string
  }
  overallAssessment: string
}

export function StrategicDecisionAdvisor({
  gameSessionId,
  userRole,
  currentDecision,
  onDecisionEvaluated,
  onProceedWithDecision,
  onCancelDecision
}: StrategicDecisionAdvisorProps) {
  const [evaluation, setEvaluation] = useState<LegalEvaluation | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)
  const [userCredibility, setUserCredibility] = useState(85)
  
  useEffect(() => {
    if (currentDecision) {
      evaluateDecision()
    }
  }, [currentDecision])
  
  const evaluateDecision = async () => {
    if (!currentDecision || isEvaluating) return
    
    setIsEvaluating(true)
    try {
      const response = await supabase.functions.invoke('legal-strategy-evaluator', {
        body: {
          gameSessionId,
          userId: currentDecision.userId,
          decisionType: currentDecision.type,
          decisionData: currentDecision.data,
          caseContext: currentDecision.caseContext
        }
      })
      
      if (response.error) throw response.error
      
      const result = response.data
      setEvaluation(result.evaluation)
      setUserCredibility(result.currentCredibility)
      onDecisionEvaluated(result)
      
    } catch (error) {
      console.error('Error evaluating decision:', error)
    } finally {
      setIsEvaluating(false)
    }
  }
  
  const getRiskColor = (level: number) => {
    if (level > 80) return 'text-red-500'
    if (level > 60) return 'text-orange-500'
    if (level > 40) return 'text-yellow-500'
    return 'text-green-500'
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle
      case 'major': return AlertTriangle
      case 'moderate': return AlertTriangle
      case 'minor': return AlertTriangle
      default: return AlertTriangle
    }
  }
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500'
      case 'major': return 'text-red-400'
      case 'moderate': return 'text-orange-400'
      case 'minor': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }
  
  if (!currentDecision) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <CourtroomCard>
          <CourtroomCardHeader>
            <CourtroomCardTitle className="flex items-center gap-2">
              <Brain className="text-verdict-gold" size={24} />
              Strategic Decision Analysis
            </CourtroomCardTitle>
            <div className="text-sm text-parchment/70">
              Evaluating: {currentDecision.type} • Your Credibility: 
              <span className={getScoreColor(userCredibility)}>
                {userCredibility}/100
              </span>
            </div>
          </CourtroomCardHeader>
          
          <CourtroomCardContent className="max-h-[60vh] overflow-y-auto">
            {isEvaluating ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mb-4"
                >
                  <Scale size={48} className="text-verdict-gold mx-auto" />
                </motion.div>
                <p className="text-parchment/80">Analyzing legal strategy and potential consequences...</p>
              </div>
            ) : evaluation ? (
              <div className="space-y-6">
                {/* Overall Assessment */}
                <div className={`p-4 rounded-lg border-2 ${
                  evaluation.recommendations.shouldProceed 
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {evaluation.recommendations.shouldProceed ? (
                      <CheckCircle className="text-green-400" size={20} />
                    ) : (
                      <XCircle className="text-red-400" size={20} />
                    )}
                    <span className="font-semibold">
                      {evaluation.recommendations.shouldProceed ? 'RECOMMENDED' : 'NOT RECOMMENDED'}
                    </span>
                  </div>
                  <p className="text-sm text-parchment/80">{evaluation.overallAssessment}</p>
                </div>
                
                {/* Critical Mistakes Warning */}
                {evaluation.identifiedMistakes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-400 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Legal Issues Identified
                    </h3>
                    {evaluation.identifiedMistakes.map((mistake, index) => {
                      const SeverityIcon = getSeverityIcon(mistake.severity)
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg border ${mistake.severity === 'critical' ? 'border-red-500/50 bg-red-500/10' : 'border-orange-500/50 bg-orange-500/10'}`}
                        >
                          <div className="flex items-start gap-2">
                            <SeverityIcon className={getSeverityColor(mistake.severity)} size={16} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityColor(mistake.severity)}`}>
                                  {mistake.severity.toUpperCase()}
                                </span>
                                {!mistake.reversible && (
                                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                    IRREVERSIBLE
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-parchment/80">{mistake.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
                
                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Legal Merit', value: evaluation.legalMerit, icon: Scale },
                    { label: 'Strategic Value', value: evaluation.strategicValue, icon: Target },
                    { label: 'Timing', value: evaluation.timingScore, icon: AlertTriangle },
                    { label: 'Risk Level', value: evaluation.riskLevel, icon: AlertTriangle }
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="text-center p-3 bg-gavel-blue/20 rounded-lg">
                      <Icon className={getScoreColor(label === 'Risk Level' ? 100 - value : value)} size={20} />
                      <div className={`text-lg font-bold ${getScoreColor(label === 'Risk Level' ? 100 - value : value)}`}>
                        {value}%
                      </div>
                      <div className="text-xs text-parchment/70">{label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Foundation Issues */}
                {!evaluation.foundationAnalysis.isProperlyFounded && (
                  <div className="p-3 border border-orange-500/50 bg-orange-500/10 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">Foundation Issue</h4>
                    <p className="text-sm text-parchment/80">
                      {evaluation.foundationAnalysis.missingFoundation}
                    </p>
                  </div>
                )}
                
                {/* Consistency Problems */}
                {!evaluation.consistencyCheck.isConsistent && (
                  <div className="p-3 border border-red-500/50 bg-red-500/10 rounded-lg">
                    <h4 className="font-semibold text-red-400 mb-2">Argument Inconsistency</h4>
                    <ul className="text-sm text-parchment/80 space-y-1">
                      {evaluation.consistencyCheck.contradictions.map((contradiction, index) => (
                        <li key={index}>• {contradiction}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Consequences Preview */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-verdict-gold">Expected Consequences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gavel-blue/20 rounded-lg">
                      <div className={`text-lg font-bold ${getScoreColor(50 + evaluation.consequences.caseStrengthChange)}`}>
                        {evaluation.consequences.caseStrengthChange > 0 ? '+' : ''}{evaluation.consequences.caseStrengthChange}
                      </div>
                      <div className="text-xs text-parchment/70">Case Strength</div>
                    </div>
                    <div className="text-center p-3 bg-gavel-blue/20 rounded-lg">
                      <div className={`text-lg font-bold ${getScoreColor(50 + evaluation.consequences.credibilityImpact)}`}>
                        {evaluation.consequences.credibilityImpact > 0 ? '+' : ''}{evaluation.consequences.credibilityImpact}
                      </div>
                      <div className="text-xs text-parchment/70">Credibility</div>
                    </div>
                    <div className="text-center p-3 bg-gavel-blue/20 rounded-lg">
                      <div className={`text-lg font-bold ${getScoreColor(50 + evaluation.consequences.juryPerceptionChange)}`}>
                        {evaluation.consequences.juryPerceptionChange > 0 ? '+' : ''}{evaluation.consequences.juryPerceptionChange}
                      </div>
                      <div className="text-xs text-parchment/70">Jury Perception</div>
                    </div>
                  </div>
                </div>
                
                {/* Alternative Recommendation */}
                {evaluation.recommendations.alternativeApproach && (
                  <div className="p-3 border border-blue-500/50 bg-blue-500/10 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">Better Strategy Available</h4>
                    <p className="text-sm text-parchment/80">
                      {evaluation.recommendations.alternativeApproach}
                    </p>
                  </div>
                )}
                
                {/* Recovery Options */}
                {evaluation.recommendations.recovery && (
                  <div className="p-3 border border-green-500/50 bg-green-500/10 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">Recovery Strategy</h4>
                    <p className="text-sm text-parchment/80">
                      {evaluation.recommendations.recovery}
                    </p>
                  </div>
                )}
                
                {/* Strategic Limitations */}
                {evaluation.consequences.strategicLimitations.length > 0 && (
                  <div className="p-3 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2">Future Limitations</h4>
                    <ul className="text-sm text-parchment/80 space-y-1">
                      {evaluation.consequences.strategicLimitations.map((limitation, index) => (
                        <li key={index}>• {limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-parchment/60">No evaluation available</p>
              </div>
            )}
          </CourtroomCardContent>
          
          {evaluation && (
            <div className="border-t border-verdict-gold/20 p-4">
              <div className="flex gap-3">
                <GavelButton
                  variant={evaluation.recommendations.shouldProceed ? 'accent' : 'secondary'}
                  onClick={onProceedWithDecision}
                  className="flex-1"
                >
                  {evaluation.recommendations.shouldProceed ? 'Proceed (Recommended)' : 'Proceed Anyway (Risky)'}
                </GavelButton>
                <GavelButton
                  variant="ghost"
                  onClick={onCancelDecision}
                  className="flex-1"
                >
                  Reconsider Strategy
                </GavelButton>
              </div>
              
              <div className="mt-2 text-center">
                <button
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="text-xs text-verdict-gold hover:text-verdict-gold/80 underline"
                >
                  {showDetailedAnalysis ? 'Hide' : 'Show'} Detailed Analysis
                </button>
              </div>
            </div>
          )}
        </CourtroomCard>
      </motion.div>
    </div>
  )
}