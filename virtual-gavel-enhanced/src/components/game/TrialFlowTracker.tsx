import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Scale, 
  MessageSquare, 
  FileText, 
  Users, 
  Gavel,
  Eye,
  Target,
  CheckCircle,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'

interface TrialPhase {
  id: string
  title: string
  description: string
  icon: any
  duration: string
  keyActions: string[]
  tips: string[]
}

interface TrialFlowTrackerProps {
  currentPhase: string
  onPhaseInfo: (phase: string) => void
  timeRemaining: number
}

const trialPhases: TrialPhase[] = [
  {
    id: 'lobby',
    title: "Case Assignment",
    description: "Judge reviews case files and assigns roles to participants",
    icon: Scale,
    duration: "1-2 min",
    keyActions: ["Read case summary", "Understand your role", "Review evidence"],
    tips: ["Study the case facts carefully", "Note key evidence", "Plan your strategy"]
  },
  {
    id: 'opening_statements',
    title: "Opening Statements",
    description: "Each side presents their case overview to the jury",
    icon: MessageSquare,
    duration: "5 min each",
    keyActions: ["Present case theory", "Outline evidence", "Set expectations"],
    tips: ["Tell a compelling story", "Don't promise what you can't prove", "Connect with the jury"]
  },
  {
    id: 'evidence_presentation',
    title: "Evidence Presentation",
    description: "Physical evidence and documents are introduced to the court",
    icon: FileText,
    duration: "10 min",
    keyActions: ["Present exhibits", "Establish authenticity", "Object to inadmissible evidence"],
    tips: ["Foundation is key", "Watch for hearsay", "Use demonstrative aids effectively"]
  },
  {
    id: 'witness_examination',
    title: "Witness Examination",
    description: "Call and question witnesses including defendants and investigators",
    icon: Users,
    duration: "15 min",
    keyActions: ["Call witnesses", "Direct examination", "Cross-examination", "Make objections"],
    tips: ["Ask open questions on direct", "Use leading questions on cross", "Object strategically"]
  },
  {
    id: 'closing_arguments',
    title: "Closing Arguments",
    description: "Final persuasive arguments summarizing the case",
    icon: Target,
    duration: "5 min each",
    keyActions: ["Summarize evidence", "Address weaknesses", "Call for verdict"],
    tips: ["Reference specific testimony", "Appeal to justice", "Be passionate but logical"]
  },
  {
    id: 'deliberation',
    title: "Jury Deliberation",
    description: "AI jury considers all evidence and testimony presented",
    icon: Eye,
    duration: "2-3 min",
    keyActions: ["Wait for verdict", "Review performance", "Prepare for results"],
    tips: ["The jury weighs credibility", "Every objection matters", "Strong evidence wins"]
  },
  {
    id: 'verdict',
    title: "Verdict & Scoring",
    description: "Final decision with detailed feedback on performance",
    icon: Gavel,
    duration: "Final",
    keyActions: ["Receive verdict", "Review scores", "Learn from feedback"],
    tips: ["Win or lose, you learn", "Check detailed feedback", "Apply lessons to next case"]
  }
]

export function TrialFlowTracker({ currentPhase, onPhaseInfo, timeRemaining }: TrialFlowTrackerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  const currentPhaseIndex = trialPhases.findIndex(phase => phase.id === currentPhase)
  const currentPhaseData = trialPhases[currentPhaseIndex]
  const nextPhase = trialPhases[currentPhaseIndex + 1]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseStatus = (phaseIndex: number) => {
    if (phaseIndex < currentPhaseIndex) return 'completed'
    if (phaseIndex === currentPhaseIndex) return 'current'
    return 'upcoming'
  }

  return (
    <CourtroomCard className="mb-6">
      <CourtroomCardHeader>
        <div className="flex items-center justify-between">
          <CourtroomCardTitle className="flex items-center gap-2">
            <Scale size={20} className="text-verdict-gold" />
            Trial Progress
          </CourtroomCardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-parchment">
              <Clock size={16} />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <GavelButton
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info size={16} />
              {showDetails ? 'Hide' : 'Details'}
            </GavelButton>
          </div>
        </div>
      </CourtroomCardHeader>

      <CourtroomCardContent>
        {/* Current Phase Highlight */}
        <div className="mb-6 p-4 bg-gradient-to-r from-verdict-gold/20 to-amber-500/20 rounded-lg border border-verdict-gold/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-verdict-gold/20 flex items-center justify-center">
              {currentPhaseData && <currentPhaseData.icon size={20} className="text-verdict-gold" />}
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-verdict-gold mb-1">
                Current: {currentPhaseData?.title}
              </h3>
              <p className="text-parchment/80 text-sm mb-2">{currentPhaseData?.description}</p>
              {nextPhase && (
                <div className="flex items-center gap-2 text-parchment/60 text-sm">
                  <span>Next:</span>
                  <ChevronRight size={14} />
                  <span>{nextPhase.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-verdict-gold/20"></div>
          <div 
            className="absolute left-4 top-0 w-0.5 bg-verdict-gold transition-all duration-1000"
            style={{ height: `${(currentPhaseIndex / (trialPhases.length - 1)) * 100}%` }}
          ></div>

          <div className="space-y-4">
            {trialPhases.map((phase, index) => {
              const status = getPhaseStatus(index)
              const Icon = phase.icon
              
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    status === 'current' 
                      ? 'bg-verdict-gold/10 border border-verdict-gold/30' 
                      : status === 'completed'
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-gavel-blue/10 border border-gray-500/30 opacity-60'
                  }`}
                  onClick={() => setSelectedPhase(phase.id)}
                >
                  {/* Phase Icon */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    status === 'current' 
                      ? 'bg-verdict-gold text-gavel-blue' 
                      : status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-gray-300'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold ${
                        status === 'current' ? 'text-verdict-gold' : 
                        status === 'completed' ? 'text-green-400' : 'text-parchment/60'
                      }`}>
                        {phase.title}
                      </h4>
                      <span className="text-xs text-parchment/50">{phase.duration}</span>
                    </div>
                    <p className="text-sm text-parchment/70">{phase.description}</p>
                    
                    {status === 'current' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 text-xs text-verdict-gold/80"
                      >
                        💡 {phase.tips[0]}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Detailed Phase Information */}
        {showDetails && currentPhaseData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-gavel-blue/20 rounded-lg border border-verdict-gold/20"
          >
            <h4 className="font-semibold text-verdict-gold mb-3">Phase Guide: {currentPhaseData.title}</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-verdict-gold/80 mb-2">Key Actions:</h5>
                <ul className="space-y-1">
                  {currentPhaseData.keyActions.map((action, index) => (
                    <li key={index} className="text-sm text-parchment/70 flex items-center gap-2">
                      <ChevronRight size={12} className="text-verdict-gold" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-verdict-gold/80 mb-2">Strategy Tips:</h5>
                <ul className="space-y-1">
                  {currentPhaseData.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-parchment/70 flex items-start gap-2">
                      <Target size={12} className="text-verdict-gold mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </CourtroomCardContent>
    </CourtroomCard>
  )
}
