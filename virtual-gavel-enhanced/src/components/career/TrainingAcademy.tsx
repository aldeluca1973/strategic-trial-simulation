import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Play, 
  Trophy, 
  Star, 
  ArrowRight,
  ChevronRight,
  Scale,
  Users,
  FileText,
  Target
} from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface TrainingModule {
  id: number
  title: string
  description: string
  content: string
  duration_minutes: number
  difficulty_level: number
  order_sequence: number
  prerequisites: string[]
  learning_objectives: string[]
  is_required: boolean
  category: string
}

interface PlayerProgress {
  module_id: number
  completed_at: string
  completion_time_minutes: number
  quiz_score?: number
}

interface TrainingAcademyProps {
  onClose: () => void
  onStartGame: (mode: string) => void
}

export function TrainingAcademy({ onClose, onStartGame }: TrainingAcademyProps) {
  const { user } = useAuth()
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([])
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadTrainingData()
  }, [user])

  const loadTrainingData = async () => {
    if (!user) return
    
    try {
      // Load training modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('training_modules')
        .select('*')
        .order('order_sequence')
      
      if (modulesError) throw modulesError

      // Load player progress
      const { data: progressData, error: progressError } = await supabase
        .from('player_training_progress')
        .select('*')
        .eq('player_id', user.id)
      
      if (progressError) throw progressError

      setModules(modulesData || [])
      setPlayerProgress(progressData || [])
    } catch (error) {
      console.error('Error loading training data:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeModule = async (moduleId: number) => {
    if (!user || completing) return
    
    setCompleting(true)
    try {
      const { error } = await supabase
        .from('player_training_progress')
        .upsert({
          player_id: user.id,
          module_id: moduleId,
          completed_at: new Date().toISOString(),
          completion_time_minutes: Math.floor(Math.random() * 10) + 5, // Simulated completion time
          quiz_score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
        })
      
      if (error) throw error
      
      // Reload progress
      await loadTrainingData()
      
      // Close module view
      setSelectedModule(null)
    } catch (error) {
      console.error('Error completing module:', error)
    } finally {
      setCompleting(false)
    }
  }

  const isModuleCompleted = (moduleId: number) => {
    return playerProgress.some(p => p.module_id === moduleId)
  }

  const canAccessModule = (module: TrainingModule) => {
    if (module.prerequisites.length === 0) return true
    
    return module.prerequisites.every(prereqTitle => {
      const prereqModule = modules.find(m => m.title === prereqTitle)
      return prereqModule && isModuleCompleted(prereqModule.id)
    })
  }

  const getModuleIcon = (category: string) => {
    switch (category) {
      case 'basics': return BookOpen
      case 'evidence': return FileText
      case 'strategy': return Target
      case 'courtroom': return Scale
      case 'roles': return Users
      default: return GraduationCap
    }
  }

  const categories = [
    { id: 'all', label: 'All Modules', icon: GraduationCap },
    { id: 'basics', label: 'Legal Basics', icon: BookOpen },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'strategy', label: 'Strategy', icon: Target },
    { id: 'courtroom', label: 'Courtroom', icon: Scale },
    { id: 'roles', label: 'Roles', icon: Users }
  ]

  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(m => m.category === selectedCategory)

  const completedCount = modules.filter(m => isModuleCompleted(m.id)).length
  const completionPercentage = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin">
          <GraduationCap size={48} className="text-verdict-gold" />
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
                <GraduationCap className="text-verdict-gold" size={24} />
                Legal Training Academy
              </CourtroomCardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-parchment/70">
                  Progress: {completedCount}/{modules.length} ({completionPercentage}%)
                </div>
                <GavelButton variant="ghost" size="sm" onClick={onClose}>
                  ×
                </GavelButton>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gavel-blue/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-verdict-gold to-amber-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map(({ id, label, icon: Icon }) => (
                <GavelButton
                  key={id}
                  variant={selectedCategory === id ? 'accent' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(id)}
                  className="flex items-center gap-2"
                >
                  <Icon size={16} />
                  {label}
                </GavelButton>
              ))}
            </div>
          </CourtroomCardHeader>
          
          <CourtroomCardContent className="max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {!selectedModule ? (
                <motion.div
                  key="modules-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filteredModules.map((module, index) => {
                    const Icon = getModuleIcon(module.category)
                    const completed = isModuleCompleted(module.id)
                    const accessible = canAccessModule(module)
                    
                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                          completed 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : accessible
                            ? 'border-verdict-gold/30 hover:border-verdict-gold/60 hover:bg-verdict-gold/5'
                            : 'border-gray-500/30 bg-gray-500/5 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => accessible && setSelectedModule(module)}
                      >
                        {/* Completion Badge */}
                        {completed && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle size={20} className="text-green-500" />
                          </div>
                        )}
                        
                        {/* Required Badge */}
                        {module.is_required && (
                          <div className="absolute top-2 left-2">
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                          </div>
                        )}
                        
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            completed ? 'bg-green-500/20' : 'bg-verdict-gold/20'
                          }`}>
                            <Icon size={20} className={completed ? 'text-green-500' : 'text-verdict-gold'} />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-verdict-gold mb-1 text-sm">
                              {module.title}
                            </h3>
                            <p className="text-xs text-parchment/70 line-clamp-2">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-parchment/60">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {module.duration_minutes}m
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: module.difficulty_level }).map((_, i) => (
                              <Star key={i} size={10} className="text-verdict-gold fill-verdict-gold" />
                            ))}
                          </div>
                        </div>
                        
                        {!accessible && module.prerequisites.length > 0 && (
                          <div className="mt-2 text-xs text-orange-400">
                            Complete: {module.prerequisites.join(', ')}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="module-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Back Button */}
                  <GavelButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedModule(null)}
                    className="flex items-center gap-2"
                  >
                    ← Back to Modules
                  </GavelButton>
                  
                  {/* Module Header */}
                  <div className="text-center">
                    <h2 className="text-2xl font-serif text-verdict-gold mb-2">
                      {selectedModule.title}
                    </h2>
                    <p className="text-parchment/80 max-w-2xl mx-auto">
                      {selectedModule.description}
                    </p>
                    
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm text-parchment/70">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {selectedModule.duration_minutes} minutes
                      </div>
                      <div className="flex items-center gap-1">
                        <Target size={16} />
                        Level {selectedModule.difficulty_level}
                      </div>
                    </div>
                  </div>
                  
                  {/* Learning Objectives */}
                  <div>
                    <h3 className="font-semibold text-verdict-gold mb-3">Learning Objectives</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedModule.learning_objectives.map((objective, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-parchment/80">
                          <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {objective}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Module Content */}
                  <div>
                    <h3 className="font-semibold text-verdict-gold mb-3">Module Content</h3>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-parchment/80 leading-relaxed whitespace-pre-line">
                        {selectedModule.content}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4 pt-4">
                    {!isModuleCompleted(selectedModule.id) ? (
                      <GavelButton
                        onClick={() => completeModule(selectedModule.id)}
                        disabled={completing}
                        className="flex items-center gap-2 px-6"
                      >
                        {completing ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Mark as Complete
                          </>
                        )}
                      </GavelButton>
                    ) : (
                      <div className="flex items-center gap-2 text-green-500 font-medium">
                        <CheckCircle size={20} />
                        Module Completed!
                      </div>
                    )}
                    
                    <GavelButton
                      variant="secondary"
                      onClick={() => onStartGame('practice')}
                      className="flex items-center gap-2"
                    >
                      <Play size={16} />
                      Practice Now
                    </GavelButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CourtroomCardContent>
          
          {/* Footer Actions */}
          {!selectedModule && (
            <div className="border-t border-verdict-gold/20 p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-parchment/70">
                  Complete all modules to unlock advanced features and career mode bonuses!
                </div>
                <div className="flex gap-2">
                  <GavelButton
                    variant="secondary"
                    onClick={() => onStartGame('standard')}
                    className="flex items-center gap-2"
                  >
                    <Play size={16} />
                    Practice Game
                  </GavelButton>
                  {completionPercentage >= 50 && (
                    <GavelButton
                      onClick={() => onStartGame('career')}
                      className="flex items-center gap-2"
                    >
                      <Trophy size={16} />
                      Start Career
                      <ArrowRight size={16} />
                    </GavelButton>
                  )}
                </div>
              </div>
            </div>
          )}
        </CourtroomCard>
      </motion.div>
    </div>
  )
}
