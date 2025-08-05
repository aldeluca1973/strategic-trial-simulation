import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, FileText, Users, Scale, Search, Gavel, Brain, Target, ChevronRight, Home, Loader2 } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { useAuth } from '@/hooks/useAuth'
import { 
  fetchLegalMasterCases, 
  saveLegalMasterProgress, 
  getUserProfessionalStats,
  type MasterCase 
} from '@/lib/api/legalMasterApi'

type MasterPhase = 'overview' | 'research' | 'discovery' | 'jury-selection' | 'witness-prep' | 'trial' | 'analysis'

interface LegalMasterModeProps {
  onBackToMenu: () => void
}

export function LegalMasterMode({ onBackToMenu }: LegalMasterModeProps) {
  const { user } = useAuth()
  const [currentPhase, setCurrentPhase] = useState<MasterPhase>('overview')
  const [selectedCase, setSelectedCase] = useState<MasterCase | null>(null)
  const [phaseProgress, setPhaseProgress] = useState<Record<MasterPhase, number>>({
    overview: 0,
    research: 0,
    discovery: 0,
    'jury-selection': 0,
    'witness-prep': 0,
    trial: 0,
    analysis: 0
  })
  const [sessionTime, setSessionTime] = useState(0)
  const [professionalScore, setProfessionalScore] = useState(0)
  const [masterCases, setMasterCases] = useState<MasterCase[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load cases and user stats from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch cases from database
        const cases = await fetchLegalMasterCases()
        setMasterCases(cases)
        
        // Fetch user professional stats if authenticated
        if (user?.id) {
          const stats = await getUserProfessionalStats(user.id)
          setProfessionalScore(stats.averageScore)
        }
      } catch (error) {
        console.error('Error loading Legal Master data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [user?.id])

  const phases = [
    {
      id: 'overview' as MasterPhase,
      title: 'Case Overview & Strategy',
      duration: '5 min',
      icon: Target,
      description: 'Analyze case facts, identify key legal issues, and develop overall strategy'
    },
    {
      id: 'research' as MasterPhase,
      title: 'Legal Research & Analysis',
      duration: '15 min',
      icon: Search,
      description: 'Deep dive into relevant case law, statutes, and legal precedents'
    },
    {
      id: 'discovery' as MasterPhase,
      title: 'Evidence Discovery',
      duration: '10 min',
      icon: FileText,
      description: 'Investigate evidence, conduct depositions, and build factual foundation'
    },
    {
      id: 'jury-selection' as MasterPhase,
      title: 'Jury Selection',
      duration: '5 min',
      icon: Users,
      description: 'Strategic voir dire and jury selection based on case theory'
    },
    {
      id: 'witness-prep' as MasterPhase,
      title: 'Witness Preparation',
      duration: '5 min',
      icon: Brain,
      description: 'Prepare witnesses for direct examination and cross-examination'
    },
    {
      id: 'trial' as MasterPhase,
      title: 'Trial Advocacy',
      duration: '20 min',
      icon: Scale,
      description: 'Full trial simulation with opening statements, evidence presentation, and closing arguments'
    },
    {
      id: 'analysis' as MasterPhase,
      title: 'Post-Trial Analysis',
      duration: '5 min',
      icon: Gavel,
      description: 'Review performance, analyze decision outcomes, and identify learning opportunities'
    }
  ]

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentPhaseIndex = () => {
    return phases.findIndex(p => p.id === currentPhase)
  }

  const getOverallProgress = () => {
    const completed = Object.values(phaseProgress).reduce((sum, progress) => sum + progress, 0)
    return Math.round(completed / phases.length)
  }

  if (!selectedCase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-700 to-red-800 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale size={48} className="text-yellow-300" />
              <h1 className="text-4xl font-serif font-bold text-white">
                🏛️ Legal Master Mode
              </h1>
              <Scale size={48} className="text-yellow-300" />
            </div>
            <p className="text-xl text-white/90 max-w-4xl mx-auto">
              Advanced legal training with complex procedures, strategic analysis, and professional-grade simulation.
              Designed for law students, attorneys, and legal professionals.
            </p>
          </motion.div>

          <div className="flex justify-between items-center mb-8">
            <GavelButton
              onClick={onBackToMenu}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <Home size={20} className="mr-2" />
              Back to Menu
            </GavelButton>
            
            <div className="text-white/80">
              Session Time: {formatTime(sessionTime)}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-yellow-300 mx-auto mb-4" />
              <p className="text-white/90 text-lg">Loading professional legal cases...</p>
            </div>
          )}
          
          {/* Case Selection */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {masterCases.map((case_, index) => (
              <motion.div
                key={case_.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <CourtroomCard 
                  className="h-full cursor-pointer hover:scale-[1.02] transition-transform bg-white/95 hover:bg-white"
                  onClick={() => setSelectedCase(case_)}
                >
                  <CourtroomCardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        {case_.type}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: case_.complexity }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-red-500 rounded-full" />
                        ))}
                      </div>
                    </div>
                    
                    <CourtroomCardTitle className="text-xl text-gray-800 mb-2">
                      {case_.title}
                    </CourtroomCardTitle>
                    
                    <div className="text-gray-600 text-sm mb-4">
                      ⏱️ Estimated Duration: {case_.time_estimate}
                    </div>
                  </CourtroomCardHeader>
                  
                  <CourtroomCardContent>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {case_.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Key Legal Issues:</h4>
                        <div className="space-y-1">
                          {case_.legal_issues.slice(0, 3).map((issue, i) => (
                            <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                              {issue}
                            </div>
                          ))}
                          {case_.legal_issues.length > 3 && (
                            <div className="text-sm text-gray-500 italic">
                              +{case_.legal_issues.length - 3} more issues...
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Key Precedents:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {case_.precedents.slice(0, 2).map((precedent, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              {precedent}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium">
                        Begin Professional Training
                        <ChevronRight size={18} />
                      </span>
                    </div>
                  </CourtroomCardContent>
                </CourtroomCard>
              </motion.div>
            ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && masterCases.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <p className="text-white/90 text-lg">No legal cases available.</p>
              <p className="text-white/70">Please contact administrator to add cases.</p>
            </div>
          )}

          {/* Master Mode Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <CourtroomCard className="bg-white/95">
              <CourtroomCardHeader>
                <CourtroomCardTitle className="text-gray-800 text-center">
                  🎓 Professional Legal Training Features
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-3">📚</div>
                    <h3 className="font-medium text-gray-800 mb-2">Advanced Legal Research</h3>
                    <p className="text-sm text-gray-600">
                      Access comprehensive case law databases, statutory analysis, and precedent research tools
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">⚖️</div>
                    <h3 className="font-medium text-gray-800 mb-2">Complex Procedural Challenges</h3>
                    <p className="text-sm text-gray-600">
                      Navigate motions practice, discovery disputes, and procedural strategic decisions
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">🏆</div>
                    <h3 className="font-medium text-gray-800 mb-2">Professional Assessment</h3>
                    <p className="text-sm text-gray-600">
                      Receive detailed performance analytics and professional development recommendations
                    </p>
                  </div>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-700 to-red-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <GavelButton
                onClick={() => setSelectedCase(null)}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                ← Back to Cases
              </GavelButton>
              <div className="text-white">
                <h2 className="text-xl font-bold">{selectedCase.title}</h2>
                <p className="text-white/80 text-sm">{selectedCase.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">{getOverallProgress()}%</div>
                <div className="text-sm text-white/80">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(sessionTime)}</div>
                <div className="text-sm text-white/80">Session Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{professionalScore}</div>
                <div className="text-sm text-white/80">Score</div>
              </div>
            </div>
          </div>
          
          {/* Phase Progress Bar */}
          <div className="flex items-center gap-2">
            {phases.map((phase, index) => {
              const isActive = phase.id === currentPhase
              const isCompleted = phaseProgress[phase.id] === 100
              const isCurrent = getCurrentPhaseIndex() === index
              
              return (
                <div key={phase.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/20 text-white/60'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {index < phases.length - 1 && (
                    <div className={`w-8 h-1 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Phase Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <CourtroomCard className="bg-white/95">
              <CourtroomCardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const phase = phases.find(p => p.id === currentPhase)
                    const Icon = phase?.icon || Target
                    return <Icon size={32} className="text-amber-600" />
                  })()}
                  <div>
                    <CourtroomCardTitle className="text-gray-800">
                      {phases.find(p => p.id === currentPhase)?.title}
                    </CourtroomCardTitle>
                    <p className="text-gray-600 text-sm">
                      {phases.find(p => p.id === currentPhase)?.description}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-amber-600 font-medium">
                  Estimated Duration: {phases.find(p => p.id === currentPhase)?.duration}
                </div>
              </CourtroomCardHeader>
              
              <CourtroomCardContent>
                {/* Phase-specific content would go here */}
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Professional Training Module
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    This advanced training module is currently in development. It will include
                    sophisticated legal research tools, complex procedural challenges, and
                    professional-grade assessment systems.
                  </p>
                  
                  <div className="space-x-4">
                    <GavelButton
                      onClick={async () => {
                        setSaving(true)
                        try {
                          // Update phase progress
                          const updatedProgress = { ...phaseProgress, [currentPhase]: 100 }
                          setPhaseProgress(updatedProgress)
                          
                          const newScore = professionalScore + 15
                          setProfessionalScore(newScore)
                          
                          // Save progress to database if user is authenticated
                          if (user?.id && selectedCase) {
                            const isCompleted = Object.values(updatedProgress).every(p => p === 100)
                            await saveLegalMasterProgress(
                              user.id,
                              selectedCase.case_id,
                              updatedProgress,
                              newScore,
                              sessionTime,
                              isCompleted
                            )
                          }
                          
                          // Move to next phase
                          const currentIndex = getCurrentPhaseIndex()
                          if (currentIndex < phases.length - 1) {
                            setCurrentPhase(phases[currentIndex + 1].id)
                          }
                        } catch (error) {
                          console.error('Error saving progress:', error)
                        } finally {
                          setSaving(false)
                        }
                      }}
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Complete Phase'
                      )}
                    </GavelButton>
                    
                    <GavelButton
                      onClick={() => setSelectedCase(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      Return to Case Selection
                    </GavelButton>
                  </div>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}