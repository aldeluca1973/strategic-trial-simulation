import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Clock, Trophy, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { supabase, LegalCase, CaseStatistics as CaseStatsType } from '@/lib/supabase'

interface CaseStatisticsProps {
  selectedCase: LegalCase
}

export function CaseStatistics({ selectedCase }: CaseStatisticsProps) {
  const [stats, setStats] = useState<CaseStatsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCaseStatistics()
  }, [selectedCase.id])

  const loadCaseStatistics = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('case_statistics')
        .select('*')
        .eq('case_id', selectedCase.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading case statistics:', error)
        return
      }
      
      setStats(data || {
        id: '',
        case_id: selectedCase.id,
        total_games_played: 0,
        prosecution_wins: 0,
        defense_wins: 0,
        average_game_duration_minutes: 0,
        created_at: '',
        updated_at: ''
      })
    } catch (error) {
      console.error('Error loading case statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProsecutionWinRate = () => {
    if (!stats || stats.total_games_played === 0) return 50
    return Math.round((stats.prosecution_wins / stats.total_games_played) * 100)
  }

  const getDefenseWinRate = () => {
    if (!stats || stats.total_games_played === 0) return 50
    return Math.round((stats.defense_wins / stats.total_games_played) * 100)
  }

  const getDifficultyLevel = () => {
    if (!stats || stats.total_games_played < 5) return 'Unknown'
    
    const prosecutionWinRate = getProsecutionWinRate()
    
    if (prosecutionWinRate >= 70 || prosecutionWinRate <= 30) {
      return 'Challenging'
    } else if (prosecutionWinRate >= 60 || prosecutionWinRate <= 40) {
      return 'Moderate'
    } else {
      return 'Balanced'
    }
  }

  const getChallengeIndicator = () => {
    if (!stats || stats.total_games_played < 3) return null
    
    const prosecutionWinRate = getProsecutionWinRate()
    
    if (prosecutionWinRate >= 75) {
      return {
        type: 'prosecution-favored',
        message: 'Prosecution typically wins this case',
        icon: TrendingUp,
        color: 'text-red-400'
      }
    } else if (prosecutionWinRate <= 25) {
      return {
        type: 'defense-favored',
        message: 'Defense typically wins this case',
        icon: TrendingUp,
        color: 'text-blue-400'
      }
    } else if (prosecutionWinRate >= 65 || prosecutionWinRate <= 35) {
      return {
        type: 'challenging',
        message: 'One side has a significant advantage',
        icon: Target,
        color: 'text-orange-400'
      }
    }
    
    return null
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <CourtroomCard>
        <CourtroomCardContent className="flex items-center justify-center py-8">
          <div className="animate-spin">
            <BarChart3 size={32} className="text-verdict-gold" />
          </div>
        </CourtroomCardContent>
      </CourtroomCard>
    )
  }

  const challengeIndicator = getChallengeIndicator()

  return (
    <CourtroomCard>
      <CourtroomCardHeader>
        <CourtroomCardTitle className="flex items-center gap-2">
          <BarChart3 className="text-verdict-gold" size={20} />
          Case Statistics
        </CourtroomCardTitle>
        <p className="text-parchment/70 text-sm">
          Historical performance data for {selectedCase.case_name}
        </p>
      </CourtroomCardHeader>
      
      <CourtroomCardContent>
        {stats && stats.total_games_played === 0 ? (
          <div className="text-center py-6">
            <Target size={48} className="text-parchment/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-parchment mb-2">Uncharted Territory</h3>
            <p className="text-parchment/70 text-sm">
              This case hasn't been played yet. You could be the first to set the precedent!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Challenge Indicator */}
            {challengeIndicator && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${
                  challengeIndicator.type === 'prosecution-favored' ? 'bg-red-500/10 border-red-500/30' :
                  challengeIndicator.type === 'defense-favored' ? 'bg-blue-500/10 border-blue-500/30' :
                  'bg-orange-500/10 border-orange-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <challengeIndicator.icon size={16} className={challengeIndicator.color} />
                  <span className="text-sm font-semibold">Challenge Mode</span>
                </div>
                <p className="text-xs text-parchment/70 mt-1">
                  {challengeIndicator.message}
                </p>
              </motion.div>
            )}
            
            {/* Win Rate Comparison */}
            <div>
              <h4 className="font-semibold text-verdict-gold mb-3">Win Rate Comparison</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-400">Prosecution</span>
                    <span className="text-red-400 font-semibold">{getProsecutionWinRate()}%</span>
                  </div>
                  <div className="w-full bg-parchment/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProsecutionWinRate()}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="bg-red-400 h-2 rounded-full"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-400">Defense</span>
                    <span className="text-blue-400 font-semibold">{getDefenseWinRate()}%</span>
                  </div>
                  <div className="w-full bg-parchment/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getDefenseWinRate()}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="bg-blue-400 h-2 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gavel-blue/20 rounded-lg">
                <div className="text-lg font-bold text-verdict-gold">
                  {stats?.total_games_played || 0}
                </div>
                <div className="text-xs text-parchment/70">Games Played</div>
              </div>
              
              <div className="text-center p-3 bg-gavel-blue/20 rounded-lg">
                <div className="text-lg font-bold text-verdict-gold">
                  {getDifficultyLevel()}
                </div>
                <div className="text-xs text-parchment/70">Difficulty</div>
              </div>
              
              <div className="text-center p-3 bg-gavel-blue/20 rounded-lg">
                <Clock size={16} className="text-verdict-gold mx-auto mb-1" />
                <div className="text-lg font-bold text-verdict-gold">
                  {stats?.average_game_duration_minutes ? formatDuration(stats.average_game_duration_minutes) : 'N/A'}
                </div>
                <div className="text-xs text-parchment/70">Avg Duration</div>
              </div>
              
              <div className="text-center p-3 bg-gavel-blue/20 rounded-lg">
                <Trophy size={16} className="text-verdict-gold mx-auto mb-1" />
                <div className="text-lg font-bold text-verdict-gold">
                  {selectedCase.difficulty_level}/5
                </div>
                <div className="text-xs text-parchment/70">Base Difficulty</div>
              </div>
            </div>
            
            {/* Last Played */}
            {stats?.last_played_at && (
              <div className="text-center text-xs text-parchment/60">
                Last played: {new Date(stats.last_played_at).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </CourtroomCardContent>
    </CourtroomCard>
  )
}
