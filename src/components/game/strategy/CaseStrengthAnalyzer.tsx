import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Scale, Target, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { supabase } from '@/lib/supabase'

interface CaseStrengthAnalyzerProps {
  gameSessionId: string
  userRole: string
  userId: string
}

interface CaseStrategy {
  legal_theory: string
  evidence_chain: any[]
  argument_consistency_score: number
  foundation_completeness: number
  narrative_coherence: number
  burden_met: boolean
}

interface AttorneyCredibility {
  current_credibility: number
  base_credibility: number
  credibility_events: any[]
  recovery_opportunities: number
}

interface StrengthMetrics {
  overallStrength: number
  evidenceStrength: number
  argumentQuality: number
  foundationSolidity: number
  narrativeCoherence: number
  credibilityFactor: number
  burdenProgress: number
}

export function CaseStrengthAnalyzer({ gameSessionId, userRole, userId }: CaseStrengthAnalyzerProps) {
  const [caseStrategy, setCaseStrategy] = useState<CaseStrategy | null>(null)
  const [credibility, setCredibility] = useState<AttorneyCredibility | null>(null)
  const [strengthMetrics, setStrengthMetrics] = useState<StrengthMetrics>({
    overallStrength: 50,
    evidenceStrength: 50,
    argumentQuality: 50,
    foundationSolidity: 50,
    narrativeCoherence: 50,
    credibilityFactor: 85,
    burdenProgress: 0
  })
  const [mistakes, setMistakes] = useState<any[]>([])
  const [recentDecisions, setRecentDecisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadCaseData()
    const interval = setInterval(loadCaseData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [gameSessionId, userId])
  
  const loadCaseData = async () => {
    try {
      // Load case strategy
      const { data: strategy } = await supabase
        .from('case_strategies')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .eq('user_id', userId)
        .maybeSingle()
      
      if (strategy) setCaseStrategy(strategy)
      
      // Load attorney credibility
      const { data: cred } = await supabase
        .from('attorney_credibility')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .eq('user_id', userId)
        .maybeSingle()
      
      if (cred) setCredibility(cred)
      
      // Load recent mistakes
      const { data: mistakeData } = await supabase
        .from('legal_mistakes')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (mistakeData) setMistakes(mistakeData)
      
      // Load recent decisions
      const { data: decisionData } = await supabase
        .from('legal_decisions')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (decisionData) setRecentDecisions(decisionData)
      
      // Calculate strength metrics
      calculateStrengthMetrics(strategy, cred, mistakeData, decisionData)
      
    } catch (error) {
      console.error('Error loading case data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const calculateStrengthMetrics = (
    strategy: CaseStrategy | null,
    cred: AttorneyCredibility | null,
    mistakeData: any[] | null,
    decisionData: any[] | null
  ) => {
    const avgDecisionQuality = decisionData?.length 
      ? decisionData.reduce((sum, d) => sum + d.legal_merit_score, 0) / decisionData.length
      : 50
    
    const mistakePenalty = (mistakeData?.length || 0) * 5
    const severeMistakes = mistakeData?.filter(m => m.severity === 'major' || m.severity === 'critical').length || 0
    
    const metrics: StrengthMetrics = {
      overallStrength: Math.max(0, Math.min(100, avgDecisionQuality - mistakePenalty)),
      evidenceStrength: strategy ? Math.min(100, strategy.evidence_chain.length * 15) : 0,
      argumentQuality: strategy?.argument_consistency_score || 50,
      foundationSolidity: strategy?.foundation_completeness || 0,
      narrativeCoherence: strategy?.narrative_coherence || 50,
      credibilityFactor: cred?.current_credibility || 85,
      burdenProgress: strategy?.burden_met ? 100 : (strategy?.foundation_completeness || 0)
    }
    
    setStrengthMetrics(metrics)
  }
  
  const getStrengthColor = (value: number) => {
    if (value >= 80) return 'text-green-400'
    if (value >= 60) return 'text-yellow-400'
    if (value >= 40) return 'text-orange-400'
    return 'text-red-400'
  }
  
  const getStrengthGradient = (value: number) => {
    if (value >= 80) return 'from-green-500 to-green-600'
    if (value >= 60) return 'from-yellow-500 to-yellow-600'
    if (value >= 40) return 'from-orange-500 to-orange-600'
    return 'from-red-500 to-red-600'
  }
  
  const getCaseAdvice = () => {
    const { overallStrength, evidenceStrength, foundationSolidity, burdenProgress } = strengthMetrics
    
    if (overallStrength < 40) {
      return {
        level: 'critical',
        message: 'Your case is in serious trouble. Consider defensive strategies.',
        icon: X,
        color: 'text-red-400'
      }
    } else if (foundationSolidity < 30) {
      return {
        level: 'warning',
        message: 'Weak foundations. Focus on establishing proper legal basis.',
        icon: AlertTriangle,
        color: 'text-orange-400'
      }
    } else if (evidenceStrength < 50) {
      return {
        level: 'warning',
        message: 'Need more evidence. Look for opportunities to strengthen your case.',
        icon: Target,
        color: 'text-yellow-400'
      }
    } else if (burdenProgress < 70 && userRole === 'prosecutor') {
      return {
        level: 'warning',
        message: 'Burden of proof not yet met. Focus on essential elements.',
        icon: Scale,
        color: 'text-orange-400'
      }
    } else if (overallStrength >= 80) {
      return {
        level: 'strong',
        message: 'Strong case position. Maintain momentum and avoid mistakes.',
        icon: CheckCircle,
        color: 'text-green-400'
      }
    } else {
      return {
        level: 'moderate',
        message: 'Decent position. Look for opportunities to strengthen further.',
        icon: TrendingUp,
        color: 'text-blue-400'
      }
    }
  }
  
  const advice = getCaseAdvice()
  const AdviceIcon = advice.icon
  
  if (loading) {
    return (
      <CourtroomCard>
        <CourtroomCardContent className="text-center py-4">
          <div className="animate-spin mb-2">
            <Scale size={24} className="text-verdict-gold mx-auto" />
          </div>
          <p className="text-sm text-parchment/60">Analyzing case strength...</p>
        </CourtroomCardContent>
      </CourtroomCard>
    )
  }
  
  return (
    <CourtroomCard>
      <CourtroomCardHeader>
        <CourtroomCardTitle className="flex items-center gap-2">
          <Scale className="text-verdict-gold" size={20} />
          Case Strength Analysis
        </CourtroomCardTitle>
        <div className="text-sm text-parchment/70 capitalize">
          {userRole} Case Building Progress
        </div>
      </CourtroomCardHeader>
      
      <CourtroomCardContent>
        {/* Overall Strength Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-parchment">Overall Case Strength</span>
            <span className={`text-lg font-bold ${getStrengthColor(strengthMetrics.overallStrength)}`}>
              {Math.round(strengthMetrics.overallStrength)}%
            </span>
          </div>
          <div className="h-3 bg-parchment/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${strengthMetrics.overallStrength}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${getStrengthGradient(strengthMetrics.overallStrength)}`}
            />
          </div>
        </div>
        
        {/* Strategic Advice */}
        <div className={`p-3 rounded-lg border mb-4 ${
          advice.level === 'critical' ? 'border-red-500/50 bg-red-500/10' :
          advice.level === 'warning' ? 'border-orange-500/50 bg-orange-500/10' :
          advice.level === 'strong' ? 'border-green-500/50 bg-green-500/10' :
          'border-blue-500/50 bg-blue-500/10'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <AdviceIcon className={advice.color} size={16} />
            <span className="font-semibold text-sm">Strategic Advice</span>
          </div>
          <p className="text-sm text-parchment/80">{advice.message}</p>
        </div>
        
        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Evidence Base', value: strengthMetrics.evidenceStrength, max: 100 },
            { label: 'Arguments', value: strengthMetrics.argumentQuality, max: 100 },
            { label: 'Foundations', value: strengthMetrics.foundationSolidity, max: 100 },
            { label: 'Narrative', value: strengthMetrics.narrativeCoherence, max: 100 },
            { label: 'Credibility', value: strengthMetrics.credibilityFactor, max: 100 },
            { label: userRole === 'prosecutor' ? 'Burden Met' : 'Defense Built', value: strengthMetrics.burdenProgress, max: 100 }
          ].map(({ label, value, max }) => (
            <div key={label} className="text-center">
              <div className="text-xs text-parchment/70 mb-1">{label}</div>
              <div className={`text-sm font-bold ${getStrengthColor(value)}`}>
                {Math.round(value)}%
              </div>
              <div className="h-1 bg-parchment/20 rounded-full mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full bg-gradient-to-r ${getStrengthGradient(value)} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent Performance Trend */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-verdict-gold">Recent Decisions</h4>
          {recentDecisions.slice(0, 3).map((decision, index) => (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between text-xs p-2 bg-gavel-blue/20 rounded"
            >
              <span className="text-parchment/70 capitalize">
                {decision.decision_type.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-2">
                <span className={getStrengthColor(decision.legal_merit_score)}>
                  {decision.legal_merit_score}% merit
                </span>
                {decision.legal_merit_score >= 70 ? (
                  <TrendingUp className="text-green-400" size={12} />
                ) : decision.legal_merit_score <= 40 ? (
                  <TrendingDown className="text-red-400" size={12} />
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Current Mistakes Warning */}
        {mistakes.length > 0 && (
          <div className="mt-4 p-3 border border-red-500/50 bg-red-500/10 rounded-lg">
            <h4 className="text-sm font-semibold text-red-400 mb-2">Active Issues</h4>
            <div className="space-y-1">
              {mistakes.slice(0, 2).map((mistake, index) => (
                <div key={mistake.id} className="text-xs text-parchment/70">
                  • {mistake.description}
                </div>
              ))}
              {mistakes.length > 2 && (
                <div className="text-xs text-red-400">+{mistakes.length - 2} more issues</div>
              )}
            </div>
          </div>
        )}
        
        {/* Case Strategy Summary */}
        {caseStrategy && (
          <div className="mt-4 p-3 border border-verdict-gold/30 bg-verdict-gold/10 rounded-lg">
            <h4 className="text-sm font-semibold text-verdict-gold mb-2">Legal Theory</h4>
            <p className="text-xs text-parchment/70">{caseStrategy.legal_theory}</p>
            <div className="mt-2 flex items-center gap-4 text-xs">
              <span>Evidence Chain: {caseStrategy.evidence_chain.length} items</span>
              <span className={getStrengthColor(caseStrategy.argument_consistency_score)}>Consistency: {caseStrategy.argument_consistency_score}%</span>
            </div>
          </div>
        )}
      </CourtroomCardContent>
    </CourtroomCard>
  )
}