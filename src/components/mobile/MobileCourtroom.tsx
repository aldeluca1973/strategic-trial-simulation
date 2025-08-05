import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  Gavel, 
  Users, 
  Clock, 
  FileText, 
  Volume2, 
  VolumeX, 
  Settings,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Scale
} from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { MobileHeader, MobilePageWrapper } from './MobileHeader'
import { MobileEvidenceViewer } from './MobileEvidenceViewer'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSwipeGesture } from './SwipeableCard'

interface MobileCourtroomProps {
  onBack: () => void
  caseName: string
  currentPhase: string
  timeRemaining: number
  participants: any[]
  evidence: any[]
  onPresentEvidence: (evidence: any) => void
  onCastVote: (vote: string) => void
  userRole: string
}

export function MobileCourtroom({
  onBack,
  caseName,
  currentPhase,
  timeRemaining,
  participants,
  evidence,
  onPresentEvidence,
  onCastVote,
  userRole
}: MobileCourtroomProps) {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'evidence' | 'jury' | 'case'>('evidence')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [evidenceIndex, setEvidenceIndex] = useState(0)
  const [showVotingPanel, setShowVotingPanel] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  
  const controls = useAnimation()
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Handle evidence navigation with swipe
  const swipeGesture = useSwipeGesture({
    onSwipeLeft: () => {
      if (evidenceIndex < evidence.length - 1) {
        setEvidenceIndex(evidenceIndex + 1)
        if (navigator.vibrate) navigator.vibrate(10)
      }
    },
    onSwipeRight: () => {
      if (evidenceIndex > 0) {
        setEvidenceIndex(evidenceIndex - 1)
        if (navigator.vibrate) navigator.vibrate(10)
      }
    },
    onSwipeUp: () => {
      setShowVotingPanel(true)
    },
    threshold: 75
  })
  
  // Handle voting
  const handleVote = (vote: string) => {
    onCastVote(vote)
    setShowVotingPanel(false)
    // Haptic feedback for important action
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }
  
  const handleEvidencePresent = () => {
    if (evidence[evidenceIndex]) {
      onPresentEvidence(evidence[evidenceIndex])
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50])
      }
    }
  }
  
  if (!isMobile) {
    // Desktop fallback
    return null
  }
  
  return (
    <MobilePageWrapper
      variant="courtroom"
      showBottomNav={false}
      headerProps={{
        title: caseName,
        subtitle: `${currentPhase} • ${formatTime(timeRemaining)}`,
        showBack: true,
        onBack,
        rightAction: {
          icon: Settings,
          label: 'Settings',
          onClick: () => {}
        }
      }}
    >
      {/* Main courtroom content */}
      <div className="flex flex-col h-full">
        {/* Phase indicator */}
        <motion.div
          className="bg-mahogany/20 backdrop-blur-sm rounded-xl p-3 mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-verdict-gold rounded-full animate-pulse" />
              <span className="text-parchment font-medium text-sm">
                {currentPhase}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-parchment/80">
                <Users className="w-4 h-4" />
                <span className="text-xs">{participants.length}</span>
              </div>
              
              <div className="flex items-center gap-1 text-parchment/80">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-mono">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Tab navigation */}
        <div className="flex bg-parchment/10 backdrop-blur-sm rounded-xl p-1 mb-4">
          {[
            { id: 'evidence', label: 'Evidence', icon: FileText },
            { id: 'jury', label: 'Jury', icon: Users },
            { id: 'case', label: 'Case File', icon: Scale }
          ].map((tab) => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <motion.button
                key={tab.id}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-parchment text-gavel-blue shadow-sm' 
                    : 'text-parchment/70 hover:text-parchment'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
                whileTap={{ scale: 0.95 }}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
        
        {/* Content area with swipe gestures */}
        <div 
          className="flex-1 overflow-hidden"
          {...swipeGesture}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'evidence' && (
              <motion.div
                key="evidence"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="h-full"
              >
                <MobileEvidenceViewer
                  evidence={evidence}
                  currentIndex={evidenceIndex}
                  onIndexChange={setEvidenceIndex}
                  onPresent={handleEvidencePresent}
                  userRole={userRole}
                />
              </motion.div>
            )}
            
            {activeTab === 'jury' && (
              <motion.div
                key="jury"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="h-full"
              >
                {/* Jury panel - simplified for mobile */}
                <div className="bg-parchment/95 rounded-xl p-4 h-full">
                  <h3 className="font-semibold text-gavel-blue mb-4">Jury Panel</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {participants.map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        className="bg-white/50 rounded-lg p-3 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-8 h-8 bg-gavel-blue/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gavel-blue" />
                        </div>
                        <p className="text-xs font-medium text-mahogany">
                          {participant.name || `Juror ${index + 1}`}
                        </p>
                        <p className="text-xs text-mahogany/60">
                          {participant.role}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'case' && (
              <motion.div
                key="case"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="h-full"
              >
                {/* Case file viewer */}
                <div className="bg-parchment/95 rounded-xl p-4 h-full overflow-y-auto scroll-touch">
                  <h3 className="font-semibold text-gavel-blue mb-4">Case Details</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-mahogany/80 leading-relaxed">
                      Case details would be displayed here with all relevant information
                      formatted for mobile reading.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile action bar */}
      <div className="mobile-courtroom-actions">
        {/* Primary action button */}
        {currentPhase === 'deliberation' ? (
          <motion.button
            className="btn-mobile flex-1 haptic-medium"
            onClick={() => setShowVotingPanel(true)}
            whileTap={{ scale: 0.95 }}
          >
            <Gavel className="w-5 h-5" />
            Cast Vote
          </motion.button>
        ) : (
          <motion.button
            className="btn-mobile flex-1 haptic-medium"
            onClick={handleEvidencePresent}
            disabled={!evidence[evidenceIndex]}
            whileTap={{ scale: 0.95 }}
          >
            <FileText className="w-5 h-5" />
            Present Evidence
          </motion.button>
        )}
        
        {/* Secondary action */}
        <motion.button
          className="btn-mobile-ghost px-4"
          onClick={() => setAudioEnabled(!audioEnabled)}
          whileTap={{ scale: 0.95 }}
        >
          {audioEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </motion.button>
      </div>
      
      {/* Voting panel modal */}
      <AnimatePresence>
        {showVotingPanel && (
          <motion.div
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVotingPanel(false)}
          >
            <motion.div
              className="w-full bg-parchment rounded-t-3xl p-6 safe-bottom"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-mahogany/30 rounded-full mx-auto mb-6" />
              
              <h3 className="text-xl font-bold text-gavel-blue text-center mb-6">
                Cast Your Vote
              </h3>
              
              <div className="flex gap-3 mb-4">
                <motion.button
                  className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg"
                  onClick={() => handleVote('guilty')}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  Guilty
                </motion.button>
                
                <motion.button
                  className="flex-1 bg-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg"
                  onClick={() => handleVote('not_guilty')}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  Not Guilty
                </motion.button>
              </div>
              
              <motion.button
                className="w-full btn-mobile-ghost py-3"
                onClick={() => setShowVotingPanel(false)}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobilePageWrapper>
  )
}

// Mobile courtroom orientation handler
export function useMobileOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    window.addEventListener('resize', handleOrientationChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    // Initial check
    handleOrientationChange()
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])
  
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.log('Fullscreen not supported')
    }
  }
  
  const exitFullscreen = async () => {
    try {
      await document.exitFullscreen()
    } catch (error) {
      console.log('Exit fullscreen failed')
    }
  }
  
  return {
    orientation,
    isFullscreen,
    enterFullscreen,
    exitFullscreen
  }
}