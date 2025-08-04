import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, TrendingUp, TrendingDown, AlertTriangle, Award, Clock, Eye } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { supabase } from '@/lib/supabase'

interface CredibilityTrackerProps {
  gameSessionId: string
  userId: string
  userRole: string
}

interface CredibilityData {
  current: number
  base: number
  peak: number
  lowest: number
  trend: 'rising' | 'falling' | 'stable'
  recentChange: number
  recoveryOpportunities: number
  lastUpdate: string
}

interface CredibilityEvent {
  id: string
  event_type: string
  impact: number
  description: string
  recoverable: boolean
  created_at: string
}

interface JuryPerception {
  trustworthiness: number
  competence: number
  respect: number
  overall_impression: number
}

export function CredibilityTracker({ gameSessionId, userId, userRole }: CredibilityTrackerProps) {
  const [credibilityData, setCredibilityData] = useState<CredibilityData>({
    current: 85,
    base: 85,
    peak: 85,
    lowest: 85,
    trend: 'stable',
    recentChange: 0,
    recoveryOpportunities: 3,
    lastUpdate: new Date().toISOString()
  })
  const [recentEvents, setRecentEvents] = useState<CredibilityEvent[]>([])
  const [juryPerception, setJuryPerception] = useState<JuryPerception>({
    trustworthiness: 85,
    competence: 85,
    respect: 85,
    overall_impression: 85
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showEventHistory, setShowEventHistory] = useState(false)

  useEffect(() => {
    loadCredibilityData()
    const interval = setInterval(loadCredibilityData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [gameSessionId, userId])

  const loadCredibilityData = async () => {
    try {
      // Load attorney credibility
      const { data: credibility } = await supabase
        .from('attorney_credibility')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .eq('user_id', userId)
        .maybeSingle()

      if (credibility) {
        // Load credibility events
        const { data: events } = await supabase
          .from('credibility_events')
          .select('*')
          .eq('game_session_id', gameSessionId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)

        if (events) {
          setRecentEvents(events)
          calculateCredibilityMetrics(credibility, events)
        }

        // Update jury perception
        setJuryPerception({
          trustworthiness: credibility.trustworthiness || 85,
          competence: credibility.competence || 85,
          respect: credibility.respect || 85,
          overall_impression: credibility.current_credibility || 85
        })
      }
    } catch (error) {
      console.error('Error loading credibility data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateCredibilityMetrics = (credibility: any, events: CredibilityEvent[]) => {
    const recentChange = events.slice(0, 3).reduce((sum, event) => sum + event.impact, 0)
    const trend = recentChange > 2 ? 'rising' : recentChange < -2 ? 'falling' : 'stable'
    
    // Calculate peak and lowest from events
    let peak = credibility.base_credibility || 85
    let lowest = credibility.base_credibility || 85
    
    events.forEach(event => {
      const momentaryCredibility = credibility.current_credibility + event.impact
      peak = Math.max(peak, momentaryCredibility)
      lowest = Math.min(lowest, momentaryCredibility)
    })

    setCredibilityData({
      current: credibility.current_credibility || 85,
      base: credibility.base_credibility || 85,
      peak: Math.min(100, peak),
      lowest: Math.max(0, lowest),
      trend,
      recentChange,
      recoveryOpportunities: credibility.recovery_opportunities || 3,
      lastUpdate: new Date().toISOString()
    })
  }

  const getCredibilityLevel = (credibility: number) => {
    if (credibility >= 90) return { label: 'Exceptional', color: 'text-green-400', bg: 'bg-green-500/20' }
    if (credibility >= 80) return { label: 'High', color: 'text-green-300', bg: 'bg-green-500/15' }
    if (credibility >= 70) return { label: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    if (credibility >= 60) return { label: 'Moderate', color: 'text-orange-400', bg: 'bg-orange-500/20' }
    if (credibility >= 50) return { label: 'Weak', color: 'text-red-400', bg: 'bg-red-500/20' }
    return { label: 'Damaged', color: 'text-red-500', bg: 'bg-red-500/30' }
  }

  const getCredibilityColor = (value: number) => {
    if (value >= 90) return 'text-green-400'
    if (value >= 80) return 'text-green-300'
    if (value >= 70) return 'text-yellow-400'
    if (value >= 60) return 'text-orange-400'
    if (value >= 50) return 'text-red-400'
    return 'text-red-500'
  }

  const getCredibilityGradient = (value: number) => {
    if (value >= 90) return 'from-green-500 to-green-600'
    if (value >= 80) return 'from-green-400 to-green-500'
    if (value >= 70) return 'from-yellow-500 to-yellow-600'
    if (value >= 60) return 'from-orange-500 to-orange-600'
    if (value >= 50) return 'from-red-500 to-red-600'
    return 'from-red-600 to-red-700'
  }

  const getTrendIcon = () => {
    switch (credibilityData.trend) {
      case 'rising': return TrendingUp
      case 'falling': return TrendingDown
      default: return User
    }
  }

  const getTrendColor = () => {
    switch (credibilityData.trend) {
      case 'rising': return 'text-green-400'
      case 'falling': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const currentLevel = getCredibilityLevel(credibilityData.current)
  const TrendIcon = getTrendIcon()

  if (isLoading) {
    return (
      <CourtroomCard>
        <CourtroomCardContent className="text-center py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-2"
          >
            <User size={24} className="text-verdict-gold mx-auto" />
          </motion.div>
          <p className="text-sm text-parchment/60">Analyzing credibility...</p>
        </CourtroomCardContent>
      </CourtroomCard>
    )
  }

  return (
    <CourtroomCard>
      <CourtroomCardHeader>
        <CourtroomCardTitle className="flex items-center gap-2">
          <User className="text-verdict-gold" size={20} />
          Your Credibility
          <motion.div className={getTrendColor()}>
            <TrendIcon size={16} />
          </motion.div>
        </CourtroomCardTitle>
        <div className="text-xs text-parchment/70 capitalize">
          {userRole} • Jury Perception Tracker
        </div>
      </CourtroomCardHeader>

      <CourtroomCardContent>
        {/* Current Credibility Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-parchment">Current Standing</span>
              {credibilityData.recentChange !== 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-sm px-2 py-1 rounded-full ${
                    credibilityData.recentChange > 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {credibilityData.recentChange > 0 ? '+' : ''}{credibilityData.recentChange.toFixed(1)}
                </motion.span>
              )}
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getCredibilityColor(credibilityData.current)}`}>
                {Math.round(credibilityData.current)}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${currentLevel.bg} ${currentLevel.color}`}>
                {currentLevel.label}
              </div>
            </div>
          </div>

          {/* Credibility Bar */}
          <div className="relative">
            <div className="h-4 bg-parchment/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${credibilityData.current}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${getCredibilityGradient(credibilityData.current)}`}
              />
            </div>
            
            {/* Peak and Low markers */}
            <div className="absolute -top-1 h-6 w-0.5 bg-green-400/60" style={{ left: `${credibilityData.peak}%` }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-green-400">Peak</div>
            </div>
            {credibilityData.lowest < credibilityData.peak && (
              <div className="absolute -top-1 h-6 w-0.5 bg-red-400/60" style={{ left: `${credibilityData.lowest}%` }}>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-red-400">Low</div>
              </div>
            )}
          </div>
        </div>

        {/* Jury Perception Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Trustworthy', value: juryPerception.trustworthiness, icon: Eye },
            { label: 'Competent', value: juryPerception.competence, icon: Award },
            { label: 'Respectful', value: juryPerception.respect, icon: User },
            { label: 'Overall', value: juryPerception.overall_impression, icon: TrendingUp }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center p-3 bg-parchment/10 rounded-lg">
              <Icon className={getCredibilityColor(value)} size={16} />
              <div className={`text-sm font-bold ${getCredibilityColor(value)}`}>
                {Math.round(value)}
              </div>
              <div className="text-xs text-parchment/70">{label}</div>
            </div>
          ))}
        </div>

        {/* Recovery Opportunities */}
        {credibilityData.recoveryOpportunities > 0 && credibilityData.current < 70 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="text-yellow-400" size={16} />
              <span className="font-semibold text-yellow-400 text-sm">Recovery Opportunities</span>
            </div>
            <p className="text-xs text-parchment/80">
              You have {credibilityData.recoveryOpportunities} chances to rebuild credibility through strong legal work.
            </p>
          </div>
        )}

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div>
            <button
              onClick={() => setShowEventHistory(!showEventHistory)}
              className="text-xs text-verdict-gold hover:text-verdict-gold/80 transition-colors mb-2"
            >
              {showEventHistory ? 'Hide' : 'Show'} Recent Credibility Events ({recentEvents.length})
            </button>
            
            <AnimatePresence>
              {showEventHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 max-h-40 overflow-y-auto"
                >
                  {recentEvents.slice(0, 5).map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-2 rounded-lg border text-xs ${
                        event.impact > 0 
                          ? 'border-green-500/30 bg-green-500/10' 
                          : 'border-red-500/30 bg-red-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-parchment">{event.event_type}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full ${
                            event.impact > 0 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {event.impact > 0 ? '+' : ''}{event.impact}
                          </span>
                          {event.recoverable && event.impact < 0 && (
                            <span className="text-xs text-yellow-400">
                              <Clock size={12} />
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-parchment/70">{event.description}</p>
                      {event.recoverable && event.impact < 0 && (
                        <p className="text-xs text-yellow-400 mt-1">This can be recovered with good performance</p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Warning for Low Credibility */}
        {credibilityData.current < 50 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-400" size={16} />
              <span className="font-semibold text-red-400 text-sm">Credibility Crisis</span>
            </div>
            <p className="text-xs text-parchment/80">
              Your credibility is severely damaged. The jury may doubt your arguments. 
              Focus on precise, well-founded legal work to recover.
            </p>
          </motion.div>
        )}
      </CourtroomCardContent>
    </CourtroomCard>
  )
}

export default CredibilityTracker