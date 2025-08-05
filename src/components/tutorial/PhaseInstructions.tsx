import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  AlertCircle, 
  Scale, 
  Users, 
  Clock, 
  Target, 
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent } from '@/components/ui/courtroom-card'

interface PhaseInstructionsProps {
  currentPhase: string
  userRole: string
  isVisible?: boolean
}

interface PhaseGuide {
  title: string
  icon: React.ComponentType<any>
  color: string
  instruction: string
  whatToDo: string[]
  tips: string[]
  example?: string
}

const phaseGuides: Record<string, PhaseGuide> = {
  opening_statements: {
    title: 'Opening Statements',
    icon: FileText,
    color: 'text-blue-400',
    instruction: 'Present your roadmap to the jury - tell them what you will prove.',
    whatToDo: [
      'Write 2-3 paragraphs in the Strategy tab',
      'State your position clearly (guilty/not guilty)',
      'Preview the key evidence you will present',
      'Outline your main arguments',
      'Tell a compelling story'
    ],
    tips: [
      'Start with a strong hook or theme',
      'Be confident but not arrogant',
      'Promise only what you can deliver',
      'Make it memorable and logical'
    ],
    example: 'Example start: "Ladies and gentlemen of the jury, the evidence will show that the defendant...".'
  },
  evidence_presentation: {
    title: 'Evidence Presentation',
    icon: AlertCircle,
    color: 'text-yellow-400',
    instruction: 'Click evidence cards to present them. Build your case piece by piece.',
    whatToDo: [
      'Review available evidence in the Evidence tab',
      'Click evidence cards to present them',
      'Explain how each piece supports your case',
      'Use objections strategically against opponent',
      'Present evidence in logical order'
    ],
    tips: [
      'Present strongest evidence first',
      'Connect each piece to your main argument',
      'Save a powerful piece for closing',
      'Object only when you have good grounds'
    ]
  },
  witness_examination: {
    title: 'Witness Examination',
    icon: Users,
    color: 'text-green-400',
    instruction: 'Question witnesses to support your case or challenge opposing testimony.',
    whatToDo: [
      'Review witness statements in the Case File',
      'Prepare questions that help your case',
      'For your witnesses: ask leading questions',
      'For opposing witnesses: find inconsistencies',
      'Listen carefully to responses'
    ],
    tips: [
      'Never ask a question you don\'t know the answer to',
      'Keep questions short and clear',
      'Build to important revelations',
      'Know when to stop questioning'
    ]
  },
  closing_arguments: {
    title: 'Closing Arguments',
    icon: Scale,
    color: 'text-purple-400',
    instruction: 'This is your final chance to persuade the jury. Make it count.',
    whatToDo: [
      'Summarize your strongest evidence',
      'Address weaknesses in opposing case',
      'Remind jury of burden of proof',
      'Make emotional appeal for justice',
      'End with clear call to action'
    ],
    tips: [
      'Recap your opening promises',
      'Use the evidence presented',
      'Appeal to both logic and emotion',
      'End with conviction and clarity'
    ],
    example: 'End with power: "The evidence is clear, the law is settled, and justice demands a verdict of..."'
  },
  deliberation: {
    title: 'Jury Deliberation',
    icon: Clock,
    color: 'text-orange-400',
    instruction: 'The AI jury is now evaluating your arguments and evidence.',
    whatToDo: [
      'Wait for the jury to deliberate',
      'Review your performance metrics',
      'Consider what you could improve',
      'Prepare for the verdict'
    ],
    tips: [
      'Strong arguments carry more weight',
      'Credibility affects jury perception',
      'Evidence relevance matters most',
      'Consistent narrative wins cases'
    ]
  }
}

const roleSpecificTips: Record<string, string[]> = {
  prosecutor: [
    'Your job is to prove guilt beyond reasonable doubt',
    'Present evidence that builds a strong chain of guilt',
    'Address potential defense arguments preemptively',
    'Focus on facts, evidence, and logical conclusions'
  ],
  defense: [
    'You only need to create reasonable doubt',
    'Challenge prosecution evidence and arguments',
    'Present alternative explanations for events',
    'Highlight inconsistencies in the prosecution case'
  ],
  judge: [
    'Ensure fair proceedings for both sides',
    'Rule on objections based on legal merit',
    'Guide the trial process smoothly',
    'Maintain courtroom decorum and order'
  ]
}

export function PhaseInstructions({ currentPhase, userRole, isVisible = true }: PhaseInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const guide = phaseGuides[currentPhase]
  const roleSpecificAdvice = roleSpecificTips[userRole] || []
  
  if (!guide || !isVisible) {
    return null
  }
  
  const Icon = guide.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <CourtroomCard className="border-l-4 border-l-verdict-gold">
        <CourtroomCardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={guide.color} size={24} />
              <div>
                <h3 className="font-semibold text-verdict-gold">{guide.title}</h3>
                <p className="text-sm text-parchment/80">{guide.instruction}</p>
              </div>
            </div>
            <GavelButton
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isExpanded ? 'Hide' : 'Help'}
            </GavelButton>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-parchment/20"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* What to Do */}
                  <div>
                    <h4 className="font-medium text-verdict-gold mb-2 flex items-center gap-2">
                      <Target size={16} />
                      What to Do:
                    </h4>
                    <ul className="space-y-1 text-sm text-parchment/80">
                      {guide.whatToDo.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-verdict-gold mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Tips */}
                  <div>
                    <h4 className="font-medium text-verdict-gold mb-2 flex items-center gap-2">
                      <Lightbulb size={16} />
                      Pro Tips:
                    </h4>
                    <ul className="space-y-1 text-sm text-parchment/80">
                      {guide.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-verdict-gold mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Role-Specific Advice */}
                {roleSpecificAdvice.length > 0 && (
                  <div className="mt-4 p-3 bg-verdict-gold/10 rounded-lg">
                    <h4 className="font-medium text-verdict-gold mb-2 capitalize">
                      {userRole} Strategy:
                    </h4>
                    <ul className="space-y-1 text-sm text-parchment/80">
                      {roleSpecificAdvice.map((advice, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-verdict-gold mt-1">•</span>
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Example */}
                {guide.example && (
                  <div className="mt-4 p-3 bg-parchment/10 rounded-lg">
                    <h4 className="font-medium text-verdict-gold mb-2">Example:</h4>
                    <p className="text-sm text-parchment/80 italic">{guide.example}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CourtroomCardContent>
      </CourtroomCard>
    </motion.div>
  )
}
