import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, TrendingUp, TrendingDown, AlertTriangle, Crown } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { supabase } from '@/lib/supabase'

interface CaseStrengthMeterProps {
  gameSessionId: string
  userRole: string
  userId: string
}

interface StrengthData {
  prosecution: {
    overall: number
    momentum: number
    trend: 'up' | 'down' | 'stable'
    recentChange: number
  }
  defense: {
    overall: number
    momentum: number
    trend: 'up' | 'down' | 'stable'
    recentChange: number
  }
  lastUpdate: string
}

interface CaseEvent {
  id: string
  event_type: string
  impact_prosecution: number
  impact_defense: number
  description: string
  created_at: string
}

export function CaseStrengthMeter({ gameSessionId, userRole, userId }: CaseStrengthMeterProps) {
  const [strengthData, setStrengthData] = useState<StrengthData>({
    prosecution: { overall: 50, momentum: 0, trend: 'stable', recentChange: 0 },
    defense: { overall: 50, momentum: 0, trend: 'stable', recentChange: 0 },
    lastUpdate: new Date().toISOString()
  })
  const [recentEvents, setRecentEvents] = useState<CaseEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMomentumDetails, setShowMomentumDetails] = useState(false)

  useEffect(() => {
    loadStrengthData()
    const interval = setInterval(loadStrengthData, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [gameSessionId])

  const loadStrengthData = async () => {
    try {
      // Get recent case events to calculate momentum
      const { data: events } = await supabase
        .from('case_events')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (events) {
        setRecentEvents(events)
        calculateStrengthMetrics(events)
      }
    } catch (error) {
      console.error('Error loading strength data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStrengthMetrics = (events: CaseEvent[]) => {
    if (events.length === 0) return

    // Calculate overall strength based on cumulative impact
    let prosecutionStrength = 50
    let defenseStrength = 50
    
    events.reverse().forEach(event => {
      prosecutionStrength += event.impact_prosecution
      defenseStrength += event.impact_defense
    })

    // Normalize to 0-100 range
    prosecutionStrength = Math.max(0, Math.min(100, prosecutionStrength))
    defenseStrength = Math.max(0, Math.min(100, defenseStrength))

    // Calculate momentum based on recent events (last 5 minutes)
    const recentCutoff = new Date(Date.now() - 5 * 60 * 1000)
    const recentEvents = events.filter(event => new Date(event.created_at) > recentCutoff)
    
    const prosecutionMomentum = recentEvents.reduce((sum, event) => sum + event.impact_prosecution, 0)
    const defenseMomentum = recentEvents.reduce((sum, event) => sum + event.impact_defense, 0)

    // Determine trends
    const prosecutionTrend = prosecutionMomentum > 2 ? 'up' : prosecutionMomentum < -2 ? 'down' : 'stable'
    const defenseTrend = defenseMomentum > 2 ? 'up' : defenseMomentum < -2 ? 'down' : 'stable'

    setStrengthData({
      prosecution: {
        overall: prosecutionStrength,
        momentum: prosecutionMomentum,
        trend: prosecutionTrend,
        recentChange: prosecutionMomentum
      },
      defense: {
        overall: defenseStrength,
        momentum: defenseMomentum,
        trend: defenseTrend,
        recentChange: defenseMomentum
      },
      lastUpdate: new Date().toISOString()
    })
  }

  const getStrengthColor = (strength: number, side: 'prosecution' | 'defense') => {
    const baseColor = side === 'prosecution' ? 'red' : 'blue'
    
    if (strength >= 75) return `text-${baseColor}-400`
    if (strength >= 50) return `text-${baseColor}-300`
    if (strength >= 25) return `text-${baseColor}-200`
    return `text-gray-400`
  }

  const getStrengthGradient = (strength: number, side: 'prosecution' | 'defense') => {
    const baseColor = side === 'prosecution' ? 'red' : 'blue'
    
    if (strength >= 75) return `from-${baseColor}-500 to-${baseColor}-600`
    if (strength >= 50) return `from-${baseColor}-400 to-${baseColor}-500`
    if (strength >= 25) return `from-${baseColor}-300 to-${baseColor}-400`
    return 'from-gray-400 to-gray-500'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Scale
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getLeadingSide = () => {
    const prosecutionLead = strengthData.prosecution.overall - strengthData.defense.overall
    if (Math.abs(prosecutionLead) < 5) return 'tied'
    return prosecutionLead > 0 ? 'prosecution' : 'defense'
  }

  const leadingSide = getLeadingSide()

  if (isLoading) {
    return (
      <CourtroomCard>
        <CourtroomCardContent className="text-center py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-2"
          >
            <Scale size={24} className="text-verdict-gold mx-auto" />
          </motion.div>
          <p className="text-sm text-parchment/60">Measuring case strength...</p>
        </CourtroomCardContent>
      </CourtroomCard>
    )
  }

  return (
    <CourtroomCard>
      <CourtroomCardHeader>
        <CourtroomCardTitle className="flex items-center gap-2">
          <Scale className="text-verdict-gold" size={20} />
          Case Strength Battle
          {leadingSide !== 'tied' && (
            <Crown className={leadingSide === 'prosecution' ? 'text-red-400' : 'text-blue-400'} size={16} />
          )}
        </CourtroomCardTitle>
        <div className="text-xs text-parchment/70">
          Real-time momentum tracking • Last updated: {new Date(strengthData.lastUpdate).toLocaleTimeString()}
        </div>
      </CourtroomCardHeader>

      <CourtroomCardContent>
        {/* Strength Comparison */}
        <div className="space-y-4">
          {/* Prosecution Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-300">Prosecution</span>
                {strengthData.prosecution.trend !== 'stable' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={getTrendColor(strengthData.prosecution.trend)}
                  >
                    {React.createElement(getTrendIcon(strengthData.prosecution.trend), { size: 14 })}
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getStrengthColor(strengthData.prosecution.overall, 'prosecution')}`}>
                  {Math.round(strengthData.prosecution.overall)}%
                </span>
                {strengthData.prosecution.recentChange !== 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    strengthData.prosecution.recentChange > 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {strengthData.prosecution.recentChange > 0 ? '+' : ''}{strengthData.prosecution.recentChange.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="h-4 bg-parchment/20 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strengthData.prosecution.overall}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${getStrengthGradient(strengthData.prosecution.overall, 'prosecution')}`}
              />
              {/* Momentum pulse effect */}
              {strengthData.prosecution.momentum > 0 && (
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400/30 to-red-600/30"
                  style={{ width: `${strengthData.prosecution.overall}%` }}
                />
              )}
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-parchment/30 flex-1" />
              <motion.div
                animate={{ 
                  scale: leadingSide !== 'tied' ? [1, 1.1, 1] : 1,
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-verdict-gold font-bold text-lg"
              >
                VS
              </motion.div>
              <div className="h-px bg-parchment/30 flex-1" />
            </div>
            {leadingSide !== 'tied' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-parchment/60 mt-1"
              >
                {leadingSide === 'prosecution' ? 'Prosecution' : 'Defense'} is leading
              </motion.div>
            )}
          </div>

          {/* Defense Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-300">Defense</span>
                {strengthData.defense.trend !== 'stable' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={getTrendColor(strengthData.defense.trend)}
                  >
                    {React.createElement(getTrendIcon(strengthData.defense.trend), { size: 14 })}
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getStrengthColor(strengthData.defense.overall, 'defense')}`}>
                  {Math.round(strengthData.defense.overall)}%
                </span>
                {strengthData.defense.recentChange !== 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    strengthData.defense.recentChange > 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {strengthData.defense.recentChange > 0 ? '+' : ''}{strengthData.defense.recentChange.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="h-4 bg-parchment/20 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strengthData.defense.overall}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${getStrengthGradient(strengthData.defense.overall, 'defense')}`}
              />
              {/* Momentum pulse effect */}
              {strengthData.defense.momentum > 0 && (
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400/30 to-blue-600/30"
                  style={{ width: `${strengthData.defense.overall}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Recent Events Toggle */}
        {recentEvents.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowMomentumDetails(!showMomentumDetails)}
              className="text-xs text-verdict-gold hover:text-verdict-gold/80 transition-colors"
            >
              {showMomentumDetails ? 'Hide' : 'Show'} Recent Game Events ({recentEvents.length})
            </button>
            
            <AnimatePresence>
              {showMomentumDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-1 max-h-32 overflow-y-auto"
                >
                  {recentEvents.slice(0, 5).map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-xs p-2 bg-parchment/10 rounded flex items-center justify-between"
                    >
                      <span className="text-parchment/70">{event.description}</span>
                      <div className="flex gap-2">
                        {event.impact_prosecution !== 0 && (
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            event.impact_prosecution > 0 ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-300'
                          }`}>
                            P: {event.impact_prosecution > 0 ? '+' : ''}{event.impact_prosecution}
                          </span>
                        )}
                        {event.impact_defense !== 0 && (
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            event.impact_defense > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-300'
                          }`}>
                            D: {event.impact_defense > 0 ? '+' : ''}{event.impact_defense}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CourtroomCardContent>
    </CourtroomCard>
  )
}

export default CaseStrengthMeter