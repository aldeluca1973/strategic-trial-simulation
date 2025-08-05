import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Zap, Users, AlertTriangle } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { supabase } from '@/lib/supabase'

interface JuryImpactEvent {
  id: string
  event_type: string
  event_data: any
  impact_score: number
  dramatic_value: number
  created_at: string
}

interface JuryImpactMeterProps {
  gameSessionId: string
  currentPhase: string
}

export function JuryImpactMeter({ gameSessionId, currentPhase }: JuryImpactMeterProps) {
  const [impactEvents, setImpactEvents] = useState<JuryImpactEvent[]>([])
  const [currentScore, setCurrentScore] = useState(0)
  const [prosecutionAdvantage, setProsecutionAdvantage] = useState(0)
  const [defenseAdvantage, setDefenseAdvantage] = useState(0)
  const [recentEvent, setRecentEvent] = useState<JuryImpactEvent | null>(null)
  const [dramaLevel, setDramaLevel] = useState(0)
  
  useEffect(() => {
    loadImpactEvents()
    subscribeToImpactEvents()
  }, [gameSessionId])
  
  useEffect(() => {
    calculateScores()
  }, [impactEvents])
  
  const loadImpactEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('jury_impact_events')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setImpactEvents(data || [])
    } catch (error) {
      console.error('Error loading impact events:', error)
    }
  }
  
  const subscribeToImpactEvents = () => {
    const channel = supabase
      .channel(`jury_impact_${gameSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jury_impact_events',
          filter: `game_session_id=eq.${gameSessionId}`
        },
        (payload) => {
          const newEvent = payload.new as JuryImpactEvent
          setImpactEvents(prev => [...prev, newEvent])
          setRecentEvent(newEvent)
          
          // Clear recent event after 3 seconds
          setTimeout(() => setRecentEvent(null), 3000)
        }
      )
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }
  
  const calculateScores = () => {
    if (impactEvents.length === 0) return
    
    let totalScore = 0
    let prosecutionScore = 0
    let defenseScore = 0
    let totalDrama = 0
    
    impactEvents.forEach(event => {
      totalScore += event.impact_score
      totalDrama += event.dramatic_value
      
      // Assign scores based on event context
      if (event.event_data?.role === 'prosecutor' || 
          event.event_data?.presentedBy === 'prosecutor') {
        prosecutionScore += event.impact_score
      } else if (event.event_data?.role === 'defense' || 
                 event.event_data?.presentedBy === 'defense') {
        defenseScore += event.impact_score
      }
    })
    
    setCurrentScore(totalScore)
    setProsecutionAdvantage(prosecutionScore)
    setDefenseAdvantage(defenseScore)
    setDramaLevel(Math.min(100, totalDrama / impactEvents.length))
  }
  
  const getScoreColor = (score: number) => {
    if (score > 50) return 'text-green-400'
    if (score > 0) return 'text-yellow-400'
    if (score > -50) return 'text-orange-400'
    return 'text-red-400'
  }
  
  const getAdvantageIndicator = () => {
    const diff = prosecutionAdvantage - defenseAdvantage
    if (Math.abs(diff) < 10) return { text: 'Balanced', color: 'text-verdict-gold' }
    if (diff > 30) return { text: 'Strong Prosecution', color: 'text-red-400' }
    if (diff > 10) return { text: 'Prosecution Ahead', color: 'text-orange-400' }
    if (diff < -30) return { text: 'Strong Defense', color: 'text-blue-400' }
    if (diff < -10) return { text: 'Defense Ahead', color: 'text-cyan-400' }
    return { text: 'Balanced', color: 'text-verdict-gold' }
  }
  
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'evidence_presented': return '📄'
      case 'witness_questioned': return '👤'
      case 'objection_made': return '⚖️'
      default: return '📊'
    }
  }
  
  const advantage = getAdvantageIndicator()
  
  return (
    <CourtroomCard className="relative overflow-hidden">
      <CourtroomCardHeader>
        <CourtroomCardTitle className="flex items-center gap-2">
          <Users className="text-verdict-gold" size={20} />
          Jury Impact Meter
        </CourtroomCardTitle>
        <div className={`text-sm ${advantage.color}`}>
          {advantage.text}
        </div>
      </CourtroomCardHeader>
      
      <CourtroomCardContent>
        {/* Main Impact Score */}
        <div className="text-center mb-4">
          <div className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>
            {currentScore > 0 ? '+' : ''}{currentScore}
          </div>
          <div className="text-xs text-parchment/60">Overall Impact</div>
        </div>
        
        {/* Prosecution vs Defense Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-400">Prosecution</span>
            <span className="text-blue-400">Defense</span>
          </div>
          <div className="relative h-4 bg-parchment/20 rounded-full overflow-hidden">
            {/* Prosecution side */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.max(0, Math.min(50, (prosecutionAdvantage / (Math.abs(prosecutionAdvantage) + Math.abs(defenseAdvantage) + 1)) * 50 + 25))}%` 
              }}
              className="absolute left-0 top-0 h-full bg-red-400/70"
            />
            
            {/* Defense side */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.max(0, Math.min(50, (defenseAdvantage / (Math.abs(prosecutionAdvantage) + Math.abs(defenseAdvantage) + 1)) * 50 + 25))}%` 
              }}
              className="absolute right-0 top-0 h-full bg-blue-400/70"
            />
            
            {/* Center line */}
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-verdict-gold transform -translate-x-1/2" />
          </div>
          
          <div className="flex justify-between text-xs mt-1">
            <span className="text-red-400">+{prosecutionAdvantage}</span>
            <span className="text-blue-400">+{defenseAdvantage}</span>
          </div>
        </div>
        
        {/* Drama Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-parchment/70">Courtroom Drama</span>
            <span className="text-verdict-gold">{Math.round(dramaLevel)}%</span>
          </div>
          <div className="h-2 bg-parchment/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dramaLevel}%` }}
              className="h-full bg-gradient-to-r from-verdict-gold to-orange-400"
            />
          </div>
        </div>
        
        {/* Recent Events */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-verdict-gold mb-2">
            Recent Events
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {impactEvents.slice(-5).reverse().map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 p-2 bg-gavel-blue/20 rounded text-xs"
              >
                <span className="text-lg">{getEventIcon(event.event_type)}</span>
                <div className="flex-1">
                  <div className="text-parchment/80 capitalize">
                    {event.event_type.replace('_', ' ')}
                  </div>
                </div>
                <div className={`font-bold ${getScoreColor(event.impact_score)}`}>
                  {event.impact_score > 0 ? '+' : ''}{event.impact_score}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Recent Event Popup */}
        <AnimatePresence>
          {recentEvent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute top-4 right-4 bg-verdict-gold text-gavel-blue px-3 py-2 rounded-lg shadow-lg"
            >
              <div className="flex items-center gap-2">
                {recentEvent.impact_score > 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span className="font-bold">
                  {recentEvent.impact_score > 0 ? '+' : ''}{recentEvent.impact_score}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Drama Alert */}
        {dramaLevel > 80 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-4 right-4 bg-orange-500/20 border border-orange-500/50 rounded-lg p-2 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-orange-400">
              <Zap size={16} />
              <span className="text-xs font-bold">HIGH DRAMA!</span>
            </div>
          </motion.div>
        )}
      </CourtroomCardContent>
    </CourtroomCard>
  )
}