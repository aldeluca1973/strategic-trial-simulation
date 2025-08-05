import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Scale, 
  Eye,
  UserCheck,
  Clock,
  Target,
  Shield,
  Search,
  FileText,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'
import { supabase } from '@/lib/supabase'

interface Witness {
  id: string
  name: string
  role: string
  background: string
  keyFacts: string[]
  credibility: number
  bias?: string
  available: boolean
  avatar?: string
}

interface Question {
  id: string
  text: string
  category: 'direct' | 'cross' | 'redirect'
  objectionRisk: number
  expectedResponse: string
}

interface Objection {
  type: string
  label: string
  description: string
  validScenarios: string[]
}

interface WitnessExaminationProps {
  caseData: any
  userRole: string
  onObjection: (type: string, context: string) => void
  onQuestionAsked: (witnessId: string, question: string) => void
  currentPhase: string
}

const objectionTypes: Objection[] = [
  {
    type: 'leading',
    label: 'Leading Question',
    description: 'Question suggests the answer or puts words in witness mouth',
    validScenarios: ['direct examination', 'hostile witness situations']
  },
  {
    type: 'relevance',
    label: 'Irrelevant',
    description: 'Question is not related to the case or material facts',
    validScenarios: ['any examination']
  },
  {
    type: 'hearsay',
    label: 'Hearsay',
    description: 'Asking about statements made by others outside of court',
    validScenarios: ['secondhand information', 'rumors', 'what someone else said']
  },
  {
    type: 'speculation',
    label: 'Calls for Speculation',
    description: 'Asking witness to guess or speculate about facts',
    validScenarios: ['hypothetical questions', 'asking for conclusions']
  },
  {
    type: 'argumentative',
    label: 'Argumentative',
    description: 'Question is meant to argue rather than elicit facts',
    validScenarios: ['cross examination gone too far']
  },
  {
    type: 'compound',
    label: 'Compound Question',
    description: 'Asking multiple questions at once',
    validScenarios: ['complex multi-part questions']
  }
]

export function WitnessExamination({ caseData, userRole, onObjection, onQuestionAsked, currentPhase }: WitnessExaminationProps) {
  const [availableWitnesses, setAvailableWitnesses] = useState<Witness[]>([])
  const [selectedWitness, setSelectedWitness] = useState<Witness | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [questionHistory, setQuestionHistory] = useState<any[]>([])
  const [showObjections, setShowObjections] = useState(false)
  const [examinationType, setExaminationType] = useState<'direct' | 'cross'>('direct')
  const [suggestedQuestions, setSuggestedQuestions] = useState<Question[]>([])
  const [witnessResponse, setWitnessResponse] = useState<string>('')
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    if (caseData) {
      generateWitnesses()
    }
  }, [caseData])

  const generateWitnesses = () => {
    const witnesses: Witness[] = [
      {
        id: 'defendant',
        name: caseData.defendant || 'John Defendant',
        role: 'Defendant',
        background: 'The person accused in this case',
        keyFacts: [
          'Can testify about their actions and intent',
          'May provide alibi or explanation',
          'Has constitutional right to remain silent'
        ],
        credibility: 60,
        bias: 'Obviously biased - fighting for their freedom',
        available: true
      },
      {
        id: 'detective',
        name: 'Detective Sarah Johnson',
        role: 'Lead Investigator',
        background: '15-year veteran detective who investigated this case',
        keyFacts: [
          'Can testify about evidence collection',
          'Describes crime scene and investigation',
          'May discuss witness interviews and procedures'
        ],
        credibility: 85,
        available: true
      },
      {
        id: 'forensic',
        name: 'Dr. Michael Chen',
        role: 'Forensic Expert',
        background: 'Forensic scientist who analyzed physical evidence',
        keyFacts: [
          'Can explain scientific evidence',
          'Discusses lab procedures and findings',
          'Provides expert opinion on evidence meaning'
        ],
        credibility: 90,
        available: true
      }
    ]

    // Add case-specific witnesses
    if (caseData.case_type === 'criminal') {
      witnesses.push({
        id: 'victim',
        name: 'Victim/Complainant',
        role: 'Victim',
        background: 'The person alleging they were harmed',
        keyFacts: [
          'Can describe what happened to them',
          'May identify the defendant',
          'Can discuss impact of the alleged crime'
        ],
        credibility: 75,
        bias: 'May be emotional or traumatized',
        available: true
      })
    }

    if (caseData.key_evidence?.some((e: any) => e.type === 'witness')) {
      witnesses.push({
        id: 'eyewitness',
        name: 'Maria Rodriguez',
        role: 'Eyewitness',
        background: 'Bystander who claims to have seen the incident',
        keyFacts: [
          'Can describe what they observed',
          'May identify people involved',
          'Observed conditions and circumstances'
        ],
        credibility: 70,
        bias: 'May have imperfect memory or limited view',
        available: true
      })
    }

    setAvailableWitnesses(witnesses)
  }

  const generateSuggestedQuestions = (witness: Witness, examType: 'direct' | 'cross') => {
    const questions: Question[] = []
    
    if (examType === 'direct' && userRole !== 'defense') {
      // Prosecution direct examination
      if (witness.id === 'detective') {
        questions.push(
          {
            id: '1',
            text: 'Detective Johnson, please tell the court about your investigation of this case.',
            category: 'direct',
            objectionRisk: 10,
            expectedResponse: 'I was assigned this case on [date] and began a thorough investigation...'
          },
          {
            id: '2',
            text: 'What evidence did you collect at the crime scene?',
            category: 'direct',
            objectionRisk: 5,
            expectedResponse: 'We collected physical evidence including...'
          }
        )
      }
      
      if (witness.id === 'victim') {
        questions.push(
          {
            id: '3',
            text: 'Can you tell us what happened on the night of [date]?',
            category: 'direct',
            objectionRisk: 15,
            expectedResponse: 'I was walking home when the defendant approached me...'
          }
        )
      }
    }
    
    if (examType === 'cross') {
      // Cross examination questions
      questions.push(
        {
          id: '4',
          text: `Isn't it true that you have a bias against my client?`,
          category: 'cross',
          objectionRisk: 40,
          expectedResponse: 'No, I was just doing my job/telling the truth.'
        },
        {
          id: '5',
          text: 'You didn\'t actually see what happened, did you?',
          category: 'cross',
          objectionRisk: 25,
          expectedResponse: 'Well, I saw some of it, but...'
        }
      )
    }

    setSuggestedQuestions(questions)
  }

  const callWitness = (witness: Witness) => {
    setSelectedWitness(witness)
    setExaminationType(userRole === 'prosecutor' ? 'direct' : 'cross')
    generateSuggestedQuestions(witness, userRole === 'prosecutor' ? 'direct' : 'cross')
    setQuestionHistory([])
    
    // Simulate calling witness to stand
    setQuestionHistory([{
      type: 'system',
      text: `${witness.name} takes the witness stand and is sworn in.`,
      timestamp: new Date().toISOString()
    }])
  }

  const askQuestion = async (question: string) => {
    if (!selectedWitness || !question.trim()) return
    
    setResponding(true)
    
    // Add question to history
    const newQuestion = {
      type: 'question',
      text: question,
      askedBy: userRole,
      timestamp: new Date().toISOString()
    }
    
    setQuestionHistory(prev => [...prev, newQuestion])
    setCurrentQuestion('')
    
    try {
      // Generate AI witness response
      const response = await generateWitnessResponse(selectedWitness, question)
      
      // Add response to history
      const witnessReply = {
        type: 'response',
        text: response,
        witness: selectedWitness.name,
        timestamp: new Date().toISOString()
      }
      
      setQuestionHistory(prev => [...prev, witnessReply])
      onQuestionAsked(selectedWitness.id, question)
      
    } catch (error) {
      console.error('Error getting witness response:', error)
    } finally {
      setResponding(false)
    }
  }

  const generateWitnessResponse = async (witness: Witness, question: string): Promise<string> => {
    // Simulate AI witness response based on witness background and question
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate thinking time
    
    const responses = [
      `Yes, that's correct. ${witness.keyFacts[0]}`,
      `Well, from what I remember, ${witness.keyFacts[1]?.toLowerCase()}`,
      `I can confirm that based on my experience...`,
      `To the best of my recollection, yes.`,
      `I'm not entirely certain about that detail.`,
      `Yes, I documented that in my report.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const makeObjection = (objectionType: string) => {
    const objection = objectionTypes.find(o => o.type === objectionType)
    if (!objection) return
    
    // Add objection to history
    const objectionEntry = {
      type: 'objection',
      text: `OBJECTION! ${objection.label} - ${objection.description}`,
      objectedBy: userRole,
      timestamp: new Date().toISOString()
    }
    
    setQuestionHistory(prev => [...prev, objectionEntry])
    
    // Simulate judge ruling
    setTimeout(() => {
      const rulings = ['Sustained. Please rephrase the question.', 'Overruled. You may answer.']
      const ruling = rulings[Math.floor(Math.random() * rulings.length)]
      
      const judgeRuling = {
        type: 'ruling',
        text: `JUDGE: ${ruling}`,
        timestamp: new Date().toISOString()
      }
      
      setQuestionHistory(prev => [...prev, judgeRuling])
    }, 1500)
    
    setShowObjections(false)
    onObjection(objectionType, questionHistory[questionHistory.length - 1]?.text || '')
  }

  if (currentPhase !== 'witness_examination') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Available Witnesses */}
      <CourtroomCard>
        <CourtroomCardHeader>
          <CourtroomCardTitle className="flex items-center gap-2">
            <Users className="text-verdict-gold" size={20} />
            Available Witnesses
          </CourtroomCardTitle>
        </CourtroomCardHeader>
        <CourtroomCardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableWitnesses.map((witness) => (
              <motion.div
                key={witness.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedWitness?.id === witness.id
                    ? 'border-verdict-gold bg-verdict-gold/10'
                    : 'border-verdict-gold/30 hover:border-verdict-gold/60'
                }`}
                onClick={() => callWitness(witness)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-verdict-gold/20 flex items-center justify-center">
                    <UserCheck size={20} className="text-verdict-gold" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-verdict-gold">{witness.name}</h4>
                    <p className="text-sm text-parchment/70 mb-2">{witness.role}</p>
                    <p className="text-xs text-parchment/60">{witness.background}</p>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Scale size={12} className="text-verdict-gold" />
                        <span className="text-xs text-verdict-gold">
                          Credibility: {witness.credibility}%
                        </span>
                      </div>
                    </div>
                    
                    {witness.bias && (
                      <div className="mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} className="text-amber-500" />
                        <span className="text-xs text-amber-400">{witness.bias}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CourtroomCardContent>
      </CourtroomCard>

      {/* Witness Examination Interface */}
      {selectedWitness && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Questioning Panel */}
          <div className="lg:col-span-2">
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-2">
                  <MessageSquare className="text-verdict-gold" size={20} />
                  Examining: {selectedWitness.name}
                </CourtroomCardTitle>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    examinationType === 'direct' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {examinationType === 'direct' ? 'Direct Examination' : 'Cross Examination'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-verdict-gold/20 text-verdict-gold">
                    {userRole}
                  </span>
                </div>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                {/* Question History */}
                <div className="h-64 overflow-y-auto bg-gavel-blue/20 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    {questionHistory.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-2 rounded ${
                          entry.type === 'question' 
                            ? 'bg-blue-500/20 border-l-4 border-blue-500' 
                            : entry.type === 'response'
                            ? 'bg-green-500/20 border-l-4 border-green-500'
                            : entry.type === 'objection'
                            ? 'bg-red-500/20 border-l-4 border-red-500'
                            : 'bg-verdict-gold/20 border-l-4 border-verdict-gold'
                        }`}
                      >
                        <div className="text-xs text-parchment/60 mb-1">
                          {entry.type === 'question' && `${entry.askedBy} asks:`}
                          {entry.type === 'response' && `${entry.witness} responds:`}
                          {entry.type === 'objection' && `${entry.objectedBy} objects:`}
                          {entry.type === 'system' && 'Court Reporter:'}
                          {entry.type === 'ruling' && 'Judge Rules:'}
                        </div>
                        <div className="text-sm text-parchment">{entry.text}</div>
                      </motion.div>
                    ))}
                    {responding && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-parchment/60"
                      >
                        <div className="animate-spin w-4 h-4 border-2 border-verdict-gold border-t-transparent rounded-full"></div>
                        <span>{selectedWitness.name} is thinking...</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Question Input */}
                <div className="space-y-3">
                  <textarea
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder={`Ask ${selectedWitness.name} a question...`}
                    className="w-full h-24 px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment placeholder-parchment/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <GavelButton
                      variant="accent"
                      onClick={() => askQuestion(currentQuestion)}
                      disabled={!currentQuestion.trim() || responding}
                      className="flex-grow"
                    >
                      Ask Question
                    </GavelButton>
                    
                    <GavelButton
                      variant="secondary"
                      onClick={() => setShowObjections(true)}
                      disabled={questionHistory.length === 0}
                    >
                      <AlertTriangle size={16} />
                      Object!
                    </GavelButton>
                  </div>
                </div>

                {/* Suggested Questions */}
                {suggestedQuestions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-verdict-gold mb-2">Suggested Questions:</h4>
                    <div className="space-y-2">
                      {suggestedQuestions.map((q) => (
                        <motion.div
                          key={q.id}
                          whileHover={{ scale: 1.01 }}
                          className="p-2 border border-verdict-gold/20 rounded cursor-pointer hover:bg-verdict-gold/5"
                          onClick={() => setCurrentQuestion(q.text)}
                        >
                          <div className="text-sm text-parchment">{q.text}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              q.objectionRisk < 20 ? 'bg-green-500/20 text-green-400' :
                              q.objectionRisk < 40 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {q.objectionRisk < 20 ? 'Safe' : q.objectionRisk < 40 ? 'Risky' : 'High Risk'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CourtroomCardContent>
            </CourtroomCard>
          </div>

          {/* Witness Info & Strategy */}
          <div>
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-2">
                  <Eye className="text-verdict-gold" size={20} />
                  Witness Intel
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-verdict-gold mb-2">Key Facts:</h4>
                    <ul className="space-y-1">
                      {selectedWitness.keyFacts.map((fact, index) => (
                        <li key={index} className="text-sm text-parchment/70 flex items-start gap-2">
                          <ChevronRight size={12} className="text-verdict-gold mt-0.5 flex-shrink-0" />
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-verdict-gold mb-2">Strategy Tips:</h4>
                    <div className="space-y-2 text-sm text-parchment/70">
                      {examinationType === 'direct' ? (
                        <>
                          <p>• Use open-ended questions</p>
                          <p>• Let the witness tell their story</p>
                          <p>• Avoid leading questions</p>
                        </>
                      ) : (
                        <>
                          <p>• Use leading questions</p>
                          <p>• Challenge inconsistencies</p>
                          <p>• Expose bias or motive</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </div>
        </div>
      )}

      {/* Objection Modal */}
      <AnimatePresence>
        {showObjections && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <CourtroomCard>
                <CourtroomCardHeader>
                  <CourtroomCardTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={20} />
                    Choose Your Objection
                  </CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {objectionTypes.map((objection) => (
                      <motion.button
                        key={objection.type}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 border border-red-500/30 rounded-lg hover:bg-red-500/10 text-left"
                        onClick={() => makeObjection(objection.type)}
                      >
                        <h4 className="font-semibold text-red-400 mb-1">{objection.label}</h4>
                        <p className="text-xs text-parchment/70">{objection.description}</p>
                      </motion.button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <GavelButton
                      variant="ghost"
                      onClick={() => setShowObjections(false)}
                      className="flex-grow"
                    >
                      Cancel
                    </GavelButton>
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
