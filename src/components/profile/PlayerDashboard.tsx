import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Target, Clock, Star, Award, TrendingUp, Scale } from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'
import { supabase, Profile, PlayerAchievement } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface PlayerDashboardProps {
  onClose: () => void
}

export function PlayerDashboard({ onClose }: PlayerDashboardProps) {
  const { user, profile } = useAuth()
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'preferences'>('overview')

  useEffect(() => {
    if (user) {
      loadAchievements()
    }
  }, [user])

  const loadAchievements = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('player_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
      
      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWinRate = (wins: number, games: number) => {
    return games > 0 ? Math.round((wins / games) * 100) : 0
  }

  const getOverallWinRate = () => {
    if (!profile) return 0
    const totalWins = (profile.judge_wins || 0) + (profile.prosecutor_wins || 0) + (profile.defense_wins || 0)
    const totalGames = profile.games_played || 0
    return calculateWinRate(totalWins, totalGames)
  }

  const getBestRole = () => {
    if (!profile) return 'None'
    
    const roles = [
      { name: 'Judge', winRate: calculateWinRate(profile.judge_wins || 0, profile.judge_games_played || 0) },
      { name: 'Prosecutor', winRate: calculateWinRate(profile.prosecutor_wins || 0, profile.prosecutor_games_played || 0) },
      { name: 'Defense', winRate: calculateWinRate(profile.defense_wins || 0, profile.defense_games_played || 0) }
    ]
    
    const bestRole = roles.reduce((best, current) => 
      current.winRate > best.winRate ? current : best
    )
    
    return bestRole.winRate > 0 ? bestRole.name : 'None'
  }

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'milestone': return Trophy
      case 'performance': return Star
      case 'streak': return TrendingUp
      case 'special': return Award
      default: return Target
    }
  }

  if (loading || !profile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin">
          <Scale size={48} className="text-verdict-gold" />
        </div>
      </div>
    )
  }

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
            <div className="flex items-center justify-between">
              <CourtroomCardTitle className="flex items-center gap-2">
                <Trophy className="text-verdict-gold" size={24} />
                Legal Career Dashboard
              </CourtroomCardTitle>
              <GavelButton variant="ghost" size="sm" onClick={onClose}>
                ×
              </GavelButton>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-1 mt-4">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'preferences', label: 'Preferences', icon: Target }
              ].map(({ id, label, icon: Icon }) => (
                <GavelButton
                  key={id}
                  variant={selectedTab === id ? 'accent' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTab(id as any)}
                  className="flex items-center gap-2"
                >
                  <Icon size={16} />
                  {label}
                </GavelButton>
              ))}
            </div>
          </CourtroomCardHeader>
          
          <CourtroomCardContent className="max-h-[60vh] overflow-y-auto">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Player Info */}
                <div className="text-center">
                  <h2 className="text-2xl font-serif text-verdict-gold mb-2">
                    {profile.full_name || 'Anonymous Attorney'}
                  </h2>
                  <p className="text-parchment/70">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gavel-blue/20 rounded-lg">
                    <div className="text-2xl font-bold text-verdict-gold">
                      {profile.games_played || 0}
                    </div>
                    <div className="text-sm text-parchment/70">Games Played</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gavel-blue/20 rounded-lg">
                    <div className="text-2xl font-bold text-verdict-gold">
                      {getOverallWinRate()}%
                    </div>
                    <div className="text-sm text-parchment/70">Win Rate</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gavel-blue/20 rounded-lg">
                    <div className="text-2xl font-bold text-verdict-gold">
                      {profile.current_win_streak || 0}
                    </div>
                    <div className="text-sm text-parchment/70">Current Streak</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gavel-blue/20 rounded-lg">
                    <div className="text-2xl font-bold text-verdict-gold">
                      {Math.round(profile.average_score || 0)}
                    </div>
                    <div className="text-sm text-parchment/70">Avg Score</div>
                  </div>
                </div>
                
                {/* Role Performance */}
                <div>
                  <h3 className="text-lg font-semibold text-verdict-gold mb-4">Performance by Role</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { 
                        role: 'Judge', 
                        games: profile.judge_games_played || 0, 
                        wins: profile.judge_wins || 0,
                        icon: Scale
                      },
                      { 
                        role: 'Prosecutor', 
                        games: profile.prosecutor_games_played || 0, 
                        wins: profile.prosecutor_wins || 0,
                        icon: Trophy
                      },
                      { 
                        role: 'Defense', 
                        games: profile.defense_games_played || 0, 
                        wins: profile.defense_wins || 0,
                        icon: Award
                      }
                    ].map(({ role, games, wins, icon: Icon }) => {
                      const winRate = calculateWinRate(wins, games)
                      return (
                        <div key={role} className="p-4 border border-verdict-gold/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon size={20} className="text-verdict-gold" />
                            <span className="font-semibold">{role}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-parchment/70">Games: {games}</div>
                            <div className="text-sm text-parchment/70">Wins: {wins}</div>
                            <div className="text-sm text-parchment/70">Win Rate: {winRate}%</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-verdict-gold/20 rounded-lg">
                    <Clock size={24} className="text-verdict-gold mx-auto mb-2" />
                    <div className="font-semibold">{formatPlayTime(profile.total_play_time_minutes || 0)}</div>
                    <div className="text-sm text-parchment/70">Total Play Time</div>
                  </div>
                  
                  <div className="text-center p-4 border border-verdict-gold/20 rounded-lg">
                    <TrendingUp size={24} className="text-verdict-gold mx-auto mb-2" />
                    <div className="font-semibold">{profile.longest_win_streak || 0}</div>
                    <div className="text-sm text-parchment/70">Longest Streak</div>
                  </div>
                  
                  <div className="text-center p-4 border border-verdict-gold/20 rounded-lg">
                    <Star size={24} className="text-verdict-gold mx-auto mb-2" />
                    <div className="font-semibold">{getBestRole()}</div>
                    <div className="text-sm text-parchment/70">Best Role</div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedTab === 'achievements' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-verdict-gold">
                  Achievements ({achievements.length})
                </h3>
                
                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Award size={48} className="text-parchment/30 mx-auto mb-4" />
                    <p className="text-parchment/60">No achievements yet. Keep playing to earn your first badge!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                      const Icon = getAchievementIcon(achievement.achievement_type)
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border border-verdict-gold/20 rounded-lg bg-gavel-blue/10"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-verdict-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Icon size={20} className="text-verdict-gold" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-semibold text-verdict-gold mb-1">
                                {achievement.achievement_name}
                              </h4>
                              <p className="text-sm text-parchment/70 mb-2">
                                {achievement.achievement_description}
                              </p>
                              <p className="text-xs text-parchment/50">
                                Earned {new Date(achievement.earned_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
            {selectedTab === 'preferences' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-verdict-gold mb-4">
                  Role Preferences
                </h3>
                
                <div className="space-y-4">
                  <div className="text-sm text-parchment/70 mb-4">
                    Set your preferred roles in order of preference. These will be used when joining games.
                  </div>
                  
                  {/* Role Preferences Display */}
                  <div className="space-y-2">
                    {[
                      { label: 'First Choice', value: profile.preferred_role_1 },
                      { label: 'Second Choice', value: profile.preferred_role_2 },
                      { label: 'Third Choice', value: profile.preferred_role_3 }
                    ].map(({ label, value }, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-verdict-gold/20 rounded-lg">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm text-verdict-gold capitalize">
                          {value || 'Not set'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-parchment/60 mt-4">
                    💡 Role preferences can be updated when creating or joining games.
                  </div>
                </div>
              </div>
            )}
          </CourtroomCardContent>
        </CourtroomCard>
      </motion.div>
    </div>
  )
}
