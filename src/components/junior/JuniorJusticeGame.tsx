import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, Trophy, ArrowRight, Home, Volume2, Loader2 } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { useAuth } from '@/hooks/useAuth'
import { 
  fetchJuniorJusticeCases, 
  saveJuniorProgress, 
  getUserBadges,
  type JuniorCase 
} from '@/lib/api/juniorJusticeApi'



interface JuniorJusticeGameProps {
  onBackToMenu: () => void
}

export function JuniorJusticeGame({ onBackToMenu }: JuniorJusticeGameProps) {
  const { user } = useAuth()
  const [currentCase, setCurrentCase] = useState<JuniorCase | null>(null)
  const [gamePhase, setGamePhase] = useState<'case-select' | 'story' | 'evidence' | 'decision' | 'result'>('case-select')
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
  const [badges, setBadges] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [juniorCases, setJuniorCases] = useState<JuniorCase[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load cases and user badges from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch cases from database
        const cases = await fetchJuniorJusticeCases()
        setJuniorCases(cases)
        
        // Fetch user badges if authenticated
        if (user?.id) {
          const userBadges = await getUserBadges(user.id)
          setBadges(userBadges)
        }
      } catch (error) {
        console.error('Error loading Junior Justice data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [user?.id])

  const selectCase = (caseId: string) => {
    const selected = juniorCases.find(c => c.id === caseId)
    if (selected) {
      setCurrentCase(selected)
      setGamePhase('story')
      setSelectedEvidence([])
    }
  }

  const handleEvidenceToggle = (evidenceId: string) => {
    setSelectedEvidence(prev => 
      prev.includes(evidenceId) 
        ? prev.filter(id => id !== evidenceId)
        : [...prev, evidenceId]
    )
  }

  const makeDecision = async () => {
    setGamePhase('result')
    setSaving(true)
    
    try {
      // Award badges based on evidence selection
      const newBadges = []
      if (selectedEvidence.length >= 2) {
        newBadges.push('🔍 Truth Detective')
      }
      if (currentCase && selectedEvidence.every(id => 
        currentCase.evidence.find(e => e.evidence_id === id)?.helpful
      )) {
        newBadges.push('⭐ Smart Chooser')
      }
      newBadges.push('❤️ Fair Judge')
      
      const allBadges = [...new Set([...badges, ...newBadges])]
      setBadges(allBadges)
      
      // Calculate score based on performance
      const score = selectedEvidence.length * 10 + newBadges.length * 5
      
      // Save progress to database if user is authenticated
      if (user?.id && currentCase) {
        await saveJuniorProgress(
          user.id,
          currentCase.case_id,
          selectedEvidence,
          newBadges,
          score
        )
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setSaving(false)
    }
  }

  const speakText = (text: string) => {
    if (soundEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1.2
      speechSynthesis.speak(utterance)
    }
  }

  if (!currentCase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart size={48} className="text-white" />
              <h1 className="text-4xl font-bold text-white">
                🌈 Junior Justice
              </h1>
              <Heart size={48} className="text-white" />
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Help solve problems fairly and learn about listening, sharing, and being kind!
            </p>
          </motion.div>

          {/* Sound Toggle */}
          <div className="flex justify-between items-center mb-6">
            <GavelButton
              onClick={onBackToMenu}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <Home size={20} className="mr-2" />
              Back to Menu
            </GavelButton>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}
            >
              <Volume2 size={20} />
              Sound {soundEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
              <p className="text-white/90 text-lg">Loading fun cases for you...</p>
            </div>
          )}
          
          {/* Case Selection */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {juniorCases.map((case_, index) => (
              <motion.div
                key={case_.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <CourtroomCard 
                  className="h-full cursor-pointer hover:scale-105 transition-transform bg-white/90 hover:bg-white"
                  onClick={() => {
                    selectCase(case_.id)
                    speakText(`Let\'s solve ${case_.title}!`)
                  }}
                >
                  <CourtroomCardHeader>
                    <div className="text-6xl mb-4 text-center">
                      {case_.emoji}
                    </div>
                    <CourtroomCardTitle className="text-xl text-center text-gray-800">
                      {case_.title}
                    </CourtroomCardTitle>
                  </CourtroomCardHeader>
                  <CourtroomCardContent>
                    <div className="text-center text-gray-600 mb-4">
                      📍 {case_.setting}
                    </div>
                    <p className="text-gray-700 text-center">
                      {case_.problem}
                    </p>
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        <Star size={16} />
                        Click to Help!
                      </span>
                    </div>
                  </CourtroomCardContent>
                </CourtroomCard>
              </motion.div>
            ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && juniorCases.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😔</div>
              <p className="text-white/90 text-lg">No cases available right now.</p>
              <p className="text-white/70">Please try again later!</p>
            </div>
          )}

          {/* Badges Display */}
          {badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <CourtroomCard className="max-w-2xl mx-auto bg-white/90">
                <CourtroomCardHeader>
                  <CourtroomCardTitle className="text-gray-800">
                    🏆 Your Achievement Badges
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full font-medium"
                      >
                        {badge}
                      </motion.div>
                    ))}
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <GavelButton
            onClick={() => {
              setCurrentCase(null)
              setGamePhase('case-select')
            }}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            ← Back to Cases
          </GavelButton>
          
          <div className="text-2xl font-bold text-white text-center">
            {currentCase.emoji} {currentCase.title}
          </div>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-500 text-white'
            }`}
          >
            <Volume2 size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {gamePhase === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <CourtroomCard className="bg-white/95">
                <CourtroomCardHeader>
                  <CourtroomCardTitle className="text-gray-800 text-center">
                    📖 What Happened?
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="text-center mb-6">
                    <p className="text-lg text-gray-700 mb-4">
                      📍 <strong>{currentCase.setting}</strong>
                    </p>
                    <p className="text-xl text-gray-800">
                      {currentCase.problem}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {currentCase.characters.map((character, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.3 }}
                        className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg"
                      >
                        <div className="text-4xl">{character.emoji}</div>
                        <div>
                          <h3 className="font-bold text-gray-800 mb-2">
                            {character.name} ({character.side})
                          </h3>
                          <p className="text-gray-700 italic">
                            "{character.story}"
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center mt-6">
                    <GavelButton
                      onClick={() => {
                        setGamePhase('evidence')
                        speakText('Now let\'s look for clues to help solve this problem!')
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Look for Clues! 🔍
                      <ArrowRight size={20} className="ml-2" />
                    </GavelButton>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          )}

          {gamePhase === 'evidence' && (
            <motion.div
              key="evidence"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <CourtroomCard className="bg-white/95">
                <CourtroomCardHeader>
                  <CourtroomCardTitle className="text-gray-800 text-center">
                    🔍 Find the Helpful Clues!
                  </CourtroomCardTitle>
                  <p className="text-center text-gray-600">
                    Click on the clues that might help solve this problem fairly!
                  </p>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {currentCase.evidence.map((evidence) => (
                      <motion.div
                        key={evidence.evidence_id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                          selectedEvidence.includes(evidence.evidence_id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        onClick={() => {
                          handleEvidenceToggle(evidence.evidence_id)
                          speakText(`${evidence.name}: ${evidence.description}`)
                        }}
                      >
                        <div className="text-4xl text-center mb-3">
                          {evidence.emoji}
                        </div>
                        <h3 className="font-bold text-gray-800 text-center mb-2">
                          {evidence.name}
                        </h3>
                        <p className="text-gray-600 text-center text-sm">
                          {evidence.description}
                        </p>
                        {selectedEvidence.includes(evidence.evidence_id) && (
                          <div className="text-center mt-2">
                            <span className="inline-block bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                              ✓ Selected
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <GavelButton
                      onClick={() => {
                        setGamePhase('decision')
                        speakText('Great! Now let\'s think about the best solution!')
                      }}
                      disabled={selectedEvidence.length === 0}
                      className="bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400"
                    >
                      Make My Decision! ⚖️
                      <ArrowRight size={20} className="ml-2" />
                    </GavelButton>
                    <p className="text-sm text-gray-500 mt-2">
                      Selected {selectedEvidence.length} clues
                    </p>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          )}

          {gamePhase === 'decision' && (
            <motion.div
              key="decision"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <CourtroomCard className="bg-white/95">
                <CourtroomCardHeader>
                  <CourtroomCardTitle className="text-gray-800 text-center">
                    🤔 What\'s the Best Solution?
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="text-center mb-6">
                    <p className="text-lg text-gray-700 mb-4">
                      You looked at these clues:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {selectedEvidence.map(id => {
                        const evidence = currentCase.evidence.find(e => e.id === id)
                        return evidence ? (
                          <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {evidence.emoji} {evidence.name}
                          </span>
                        ) : null
                      })}
                    </div>
                    
                    <p className="text-lg text-gray-700 mb-6">
                      What do you think is the fairest way to solve this problem?
                    </p>
                    
                    <GavelButton
                      onClick={() => {
                        makeDecision()
                        speakText('Let me tell you the fairest solution!')
                      }}
                      disabled={saving}
                      className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving Progress...
                        </>
                      ) : (
                        'Show Me the Fair Solution! ✨'
                      )}
                    </GavelButton>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          )}

          {gamePhase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <CourtroomCard className="bg-white/95">
                <CourtroomCardHeader>
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <CourtroomCardTitle className="text-gray-800">
                      The Fair Solution!
                    </CourtroomCardTitle>
                  </div>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="text-center mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                      <p className="text-lg text-gray-800">
                        {currentCase.solution}
                      </p>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      🏆 You Earned New Badges!
                    </h3>
                    
                    <div className="flex flex-wrap gap-3 justify-center mb-6">
                      {badges.slice(-3).map((badge, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold"
                        >
                          {badge}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <GavelButton
                        onClick={() => {
                          setCurrentCase(null)
                          setGamePhase('case-select')
                          speakText('Great job! Let\'s try another case!')
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                      >
                        Try Another Case! 🌟
                      </GavelButton>
                      
                      <GavelButton
                        onClick={onBackToMenu}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Back to Main Menu
                      </GavelButton>
                    </div>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}