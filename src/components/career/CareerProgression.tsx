import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  TrendingUp, 
  Star, 
  Lock, 
  Unlock,
  Crown,
  Target,
  Clock,
  Users,
  BookOpen,
  Award,
  ChevronRight,
  Play,
  ShoppingCart,
  Zap,
  BarChart3
} from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface PlayerProfile {
  id: string
  full_name?: string
  career_rank: number
  experience_points: number
  total_cases_won: number
  total_cases_played: number
  current_level_xp: number
  next_level_xp: number
  specialization?: string
  career_start_date: string
  reputation_score: number
}

interface CareerCase {
  id: number
  title: string
  description: string
  difficulty_level: number
  required_rank: number
  experience_reward: number
  case_type: string
  estimated_duration_minutes: number
  is_unlocked: boolean
  is_completed: boolean
  completion_date?: string
  player_score?: number
}

interface Achievement {
  id: number
  title: string
  description: string
  badge_icon: string
  category: string
  progress_current: number
  progress_target: number
  is_unlocked: boolean
  unlock_date?: string
}

interface PremiumBundle {
  id: string
  name: string
  description: string
  price: number
  currency: string
  case_count: number
  preview_cases: string[]
  is_purchased: boolean
}

interface CareerProgressionProps {
  onClose: () => void
  onStartCase: (caseId: number) => void
  onViewTraining: () => void
}

export function CareerProgression({ onClose, onStartCase, onViewTraining }: CareerProgressionProps) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [availableCases, setAvailableCases] = useState<CareerCase[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [premiumBundles, setPremiumBundles] = useState<PremiumBundle[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cases' | 'achievements' | 'premium'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCareerData()
    }
  }, [user])

  const loadCareerData = async () => {
    if (!user) return
    
    try {
      // Load player profile with career data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // Create default profile if none exists or error
      let finalProfileData = profileData
      if (profileError || !profileData) {
        finalProfileData = {
          id: user.id,
          full_name: user.email?.split('@')[0] || 'Anonymous Attorney',
          career_rank: 1,
          experience_points: 0,
          total_cases_won: 0,
          total_cases_played: 0,
          current_level_xp: 0,
          next_level_xp: 1000,
          career_start_date: new Date().toISOString(),
          reputation_score: 50
        }
      }

      // Load available cases based on player rank
      const { data: casesData, error: casesError } = await supabase
        .from('legal_cases')
        .select('*')
        .order('id')
        .limit(10)
      
      // Create default cases if error or no data
      let finalCasesData = casesData || []
      if (casesError || !casesData?.length) {
        finalCasesData = [
          {
            id: 1,
            title: "The People vs. Smith",
            description: "A criminal case involving theft allegations",
            difficulty_level: 1,
            required_rank: 1,
            experience_reward: 100,
            case_type: "criminal",
            estimated_duration_minutes: 30,
            is_unlocked: true,
            is_completed: false
          },
          {
            id: 2,
            title: "Johnson vs. Corporation Inc.",
            description: "A civil case involving contract disputes",
            difficulty_level: 2,
            required_rank: 3,
            experience_reward: 200,
            case_type: "civil",
            estimated_duration_minutes: 45,
            is_unlocked: false,
            is_completed: false
          }
        ]
      }

      // Load achievements
      const { data: achievementsData } = await supabase
        .from('player_achievements')
        .select('*')
        .eq('player_id', user.id)
      
      // Create default achievements if no data
      const finalAchievementsData = achievementsData || [
        {
          id: 1,
          title: "First Case",
          description: "Complete your first trial",
          category: "beginner",
          progress_current: 0,
          progress_target: 1,
          is_unlocked: false
        },
        {
          id: 2,
          title: "Winning Streak",
          description: "Win 5 cases in a row",
          category: "performance",
          progress_current: 0,
          progress_target: 5,
          is_unlocked: false
        }
      ]

      // Load premium bundles
      const { data: bundlesData } = await supabase
        .from('content_bundles')
        .select('*')
        .limit(5)
      
      // Create default bundles if no data
      const finalBundlesData = bundlesData || [
        {
          id: "premium1",
          name: "Criminal Defense Master Pack",
          description: "Advanced criminal cases with complex evidence",
          price: 9.99,
          currency: "USD",
          case_count: 10,
          preview_cases: ["Murder Mystery", "White Collar Crime", "Drug Case"],
          is_purchased: false
        }
      ]

      setProfile(finalProfileData)
      setAvailableCases(finalCasesData)
      setAchievements(finalAchievementsData)
      setPremiumBundles(finalBundlesData)
    } catch (error) {
      console.error('Error loading career data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankTitle = (rank: number): string => {
    const ranks = [
      { min: 1, max: 5, title: 'Junior Associate' },
      { min: 6, max: 10, title: 'Associate Attorney' },
      { min: 11, max: 20, title: 'Senior Attorney' },
      { min: 21, max: 35, title: 'Partner Track' },
      { min: 36, max: 50, title: 'Senior Partner' },
      { min: 51, max: 75, title: 'Managing Partner' },
      { min: 76, max: 100, title: 'Legal Master' }
    ]
    
    const currentRank = ranks.find(r => rank >= r.min && rank <= r.max)
    return currentRank?.title || 'Legal Legend'
  }

  const getXPProgress = () => {
    if (!profile) return 0
    const current = profile.current_level_xp
    const next = profile.next_level_xp
    return next > 0 ? (current / next) * 100 : 0
  }

  const getCaseTypeIcon = (type: string) => {
    switch (type) {
      case 'civil': return Users
      case 'criminal': return Target
      case 'corporate': return BarChart3
      case 'family': return Users
      default: return BookOpen
    }
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'text-green-400'
      case 2: return 'text-blue-400'
      case 3: return 'text-yellow-400'
      case 4: return 'text-orange-400'
      case 5: return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (loading || !profile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin">
          <Crown size={48} className="text-verdict-gold" />
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
        className="w-full max-w-6xl max-h-[95vh] overflow-hidden"
      >
        <CourtroomCard>
          <CourtroomCardHeader>
            <div className="flex items-center justify-between">
              <CourtroomCardTitle className="flex items-center gap-2">
                <Crown className="text-verdict-gold" size={24} />
                Legal Career Progression
              </CourtroomCardTitle>
              <GavelButton variant="ghost" size="sm" onClick={onClose}>
                ×
              </GavelButton>
            </div>
            
            {/* Player Career Summary */}
            <div className="mt-4 p-4 bg-gradient-to-r from-verdict-gold/10 to-amber-500/10 rounded-lg border border-verdict-gold/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-serif text-verdict-gold">
                    {profile.full_name || 'Anonymous Attorney'}
                  </h2>
                  <p className="text-parchment/70">
                    {getRankTitle(profile.career_rank)} • Rank {profile.career_rank}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-verdict-gold">
                    {profile.experience_points.toLocaleString()} XP
                  </div>
                  <div className="text-sm text-parchment/70">
                    {profile.current_level_xp}/{profile.next_level_xp} to next rank
                  </div>
                </div>
              </div>
              
              {/* XP Progress Bar */}
              <div className="w-full bg-gavel-blue/20 rounded-full h-3 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getXPProgress()}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-verdict-gold to-amber-500 h-3 rounded-full"
                />
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-verdict-gold">
                    {profile.total_cases_played}
                  </div>
                  <div className="text-xs text-parchment/70">Cases Played</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-verdict-gold">
                    {profile.total_cases_won}
                  </div>
                  <div className="text-xs text-parchment/70">Cases Won</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-verdict-gold">
                    {profile.total_cases_played > 0 ? Math.round((profile.total_cases_won / profile.total_cases_played) * 100) : 0}%
                  </div>
                  <div className="text-xs text-parchment/70">Win Rate</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-verdict-gold">
                    {profile.reputation_score}
                  </div>
                  <div className="text-xs text-parchment/70">Reputation</div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mt-4">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'cases', label: 'Available Cases', icon: BookOpen },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'premium', label: 'Premium Cases', icon: Crown }
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
            <AnimatePresence mode="wait">
              {selectedTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Next Rank Preview */}
                  <div className="p-4 border border-verdict-gold/30 rounded-lg">
                    <h3 className="font-semibold text-verdict-gold mb-3 flex items-center gap-2">
                      <Target size={18} />
                      Next Rank: {getRankTitle(profile.career_rank + 1)}
                    </h3>
                    <div className="text-sm text-parchment/80 mb-3">
                      Reach {profile.next_level_xp} XP to unlock new cases and features!
                    </div>
                    <div className="text-xs text-parchment/60">
                      • Access to higher difficulty cases
                      • Increased XP multipliers
                      • Exclusive achievements
                      • Special case types
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="font-semibold text-verdict-gold mb-3">Career Highlights</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gavel-blue/10 rounded-lg">
                        <Award size={20} className="text-green-500" />
                        <div>
                          <div className="font-medium">Career Started</div>
                          <div className="text-sm text-parchment/70">
                            {new Date(profile.career_start_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {profile.specialization && (
                        <div className="flex items-center gap-3 p-3 bg-gavel-blue/10 rounded-lg">
                          <Star size={20} className="text-verdict-gold" />
                          <div>
                            <div className="font-medium">Specialization</div>
                            <div className="text-sm text-parchment/70 capitalize">
                              {profile.specialization}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <GavelButton
                      onClick={onViewTraining}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <BookOpen size={16} />
                      Training Academy
                    </GavelButton>
                    <GavelButton
                      onClick={() => setSelectedTab('cases')}
                      className="flex items-center gap-2"
                    >
                      <Play size={16} />
                      Start New Case
                      <ChevronRight size={16} />
                    </GavelButton>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'cases' && (
                <motion.div
                  key="cases"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCases.map((case_, index) => {
                      const Icon = getCaseTypeIcon(case_.case_type)
                      const canPlay = case_.required_rank <= profile.career_rank
                      
                      return (
                        <motion.div
                          key={case_.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 border rounded-lg transition-all duration-300 ${
                            canPlay 
                              ? 'border-verdict-gold/30 hover:border-verdict-gold/60 cursor-pointer hover:bg-verdict-gold/5'
                              : 'border-gray-500/30 bg-gray-500/5 cursor-not-allowed opacity-60'
                          }`}
                          onClick={() => canPlay && onStartCase(case_.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                canPlay ? 'bg-verdict-gold/20' : 'bg-gray-500/20'
                              }`}>
                                <Icon size={20} className={canPlay ? 'text-verdict-gold' : 'text-gray-500'} />
                              </div>
                              <div className="flex-grow">
                                <h3 className="font-semibold text-verdict-gold mb-1">
                                  {case_.title}
                                </h3>
                                <p className="text-sm text-parchment/70 line-clamp-2">
                                  {case_.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {!canPlay && <Lock size={16} className="text-gray-500" />}
                              {case_.is_completed && <Award size={16} className="text-green-500" />}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                {case_.estimated_duration_minutes}m
                              </div>
                              <div className={`flex items-center gap-1 ${getDifficultyColor(case_.difficulty_level)}`}>
                                {Array.from({ length: case_.difficulty_level }).map((_, i) => (
                                  <Star key={i} size={10} className="fill-current" />
                                ))}
                              </div>
                              <div className="flex items-center gap-1 text-verdict-gold">
                                <Zap size={12} />
                                {case_.experience_reward} XP
                              </div>
                            </div>
                            {!canPlay && (
                              <div className="text-orange-400">
                                Rank {case_.required_rank} required
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {selectedTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-verdict-gold">
                      Career Achievements ({achievements.filter(a => a.is_unlocked).length}/{achievements.length})
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 border rounded-lg ${
                          achievement.is_unlocked 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : 'border-gray-500/30 bg-gray-500/5'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`text-2xl ${achievement.is_unlocked ? '' : 'grayscale opacity-50'}`}>
                            {achievement.badge_icon}
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-semibold text-verdict-gold mb-1">
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-parchment/70 mb-2">
                              {achievement.description}
                            </p>
                            
                            {!achievement.is_unlocked && (
                              <div className="w-full bg-gray-500/20 rounded-full h-2 mb-2">
                                <div 
                                  className="bg-verdict-gold h-2 rounded-full"
                                  style={{ 
                                    width: `${Math.min((achievement.progress_current / achievement.progress_target) * 100, 100)}%` 
                                  }}
                                />
                              </div>
                            )}
                            
                            <div className="text-xs text-parchment/60">
                              {achievement.is_unlocked 
                                ? `Unlocked: ${new Date(achievement.unlock_date!).toLocaleDateString()}`
                                : `Progress: ${achievement.progress_current}/${achievement.progress_target}`
                              }
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedTab === 'premium' && (
                <motion.div
                  key="premium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-verdict-gold mb-2">
                      Premium Case Collections
                    </h3>
                    <p className="text-sm text-parchment/70">
                      Unlock famous landmark cases and special challenges
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {premiumBundles.map((bundle, index) => (
                      <motion.div
                        key={bundle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-verdict-gold/30 rounded-lg bg-gradient-to-br from-verdict-gold/5 to-amber-500/5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-verdict-gold mb-1">
                              {bundle.name}
                            </h4>
                            <p className="text-sm text-parchment/70 mb-2">
                              {bundle.description}
                            </p>
                          </div>
                          <Crown size={20} className="text-verdict-gold" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-parchment/80">
                            📚 {bundle.case_count} landmark cases included
                          </div>
                          <div className="text-xs text-parchment/60">
                            Preview: {bundle.preview_cases.slice(0, 2).join(', ')}
                            {bundle.preview_cases.length > 2 && '...'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-verdict-gold">
                            ${bundle.price}
                          </div>
                          <GavelButton
                            variant={bundle.is_purchased ? "ghost" : "accent"}
                            size="sm"
                            disabled={bundle.is_purchased}
                            className="flex items-center gap-2"
                          >
                            {bundle.is_purchased ? (
                              <>
                                <Award size={16} />
                                Owned
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                Purchase
                              </>
                            )}
                          </GavelButton>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CourtroomCardContent>
        </CourtroomCard>
      </motion.div>
    </div>
  )
}
