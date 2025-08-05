import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Book, 
  Play, 
  Users, 
  FileText, 
  Scale, 
  Target, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  Award
} from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'

interface HowToPlayGuideProps {
  isVisible: boolean
  onClose: () => void
  startTutorial?: () => void
}

type Section = 'overview' | 'roles' | 'phases' | 'strategies' | 'tips'

export function HowToPlayGuide({ isVisible, onClose, startTutorial }: HowToPlayGuideProps) {
  const [currentSection, setCurrentSection] = useState<Section>('overview')
  
  const sections = [
    { id: 'overview' as Section, title: 'Game Overview', icon: Book },
    { id: 'roles' as Section, title: 'Your Role', icon: Users },
    { id: 'phases' as Section, title: 'Trial Phases', icon: Clock },
    { id: 'strategies' as Section, title: 'Legal Strategy', icon: Target },
    { id: 'tips' as Section, title: 'Pro Tips', icon: Lightbulb }
  ]
  
  const currentIndex = sections.findIndex(s => s.id === currentSection)
  
  const nextSection = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id)
    }
  }
  
  const prevSection = () => {
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1].id)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />
          
          {/* Guide Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 bg-gradient-to-br from-gavel-blue-900 to-mahogany z-50 rounded-lg shadow-2xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-parchment/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scale className="text-verdict-gold" size={32} />
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-verdict-gold">How to Play</h2>
                      <p className="text-parchment/70">Master the art of legal advocacy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {startTutorial && (
                      <GavelButton variant="accent" onClick={startTutorial}>
                        <Play size={16} />
                        Start Tutorial
                      </GavelButton>
                    )}
                    <GavelButton variant="ghost" size="sm" onClick={onClose}>
                      <X size={20} />
                    </GavelButton>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* Section Navigation */}
                <div className="w-64 border-r border-parchment/20 p-4">
                  <nav className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon
                      return (
                        <button
                          key={section.id}
                          onClick={() => setCurrentSection(section.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            currentSection === section.id
                              ? 'bg-verdict-gold text-gavel-blue'
                              : 'text-parchment/70 hover:text-parchment hover:bg-parchment/10'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="font-medium">{section.title}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>
                
                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Game Overview */}
                        {currentSection === 'overview' && (
                          <div className="space-y-6">
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <Scale className="text-verdict-gold" size={20} />
                                  Welcome to Virtual Gavel
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <p className="text-parchment/90 leading-relaxed mb-4">
                                  Virtual Gavel is a strategic legal simulation where you take on the role of either a <strong>Prosecutor</strong> or <strong>Defense Attorney</strong> in realistic court cases.
                                </p>
                                <p className="text-parchment/90 leading-relaxed">
                                  Your goal is to present compelling arguments, use evidence effectively, and convince an AI jury of your position through strategic legal advocacy.
                                </p>
                              </CourtroomCardContent>
                            </CourtroomCard>
                            
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle>Game Flow</CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3 p-3 bg-parchment/10 rounded-lg">
                                    <CheckCircle className="text-green-400" size={20} />
                                    <div>
                                      <p className="font-medium text-parchment">1. Review Case File</p>
                                      <p className="text-sm text-parchment/70">Study the case background, evidence, and witnesses</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-parchment/10 rounded-lg">
                                    <CheckCircle className="text-green-400" size={20} />
                                    <div>
                                      <p className="font-medium text-parchment">2. Present Your Case</p>
                                      <p className="text-sm text-parchment/70">Go through trial phases: Opening → Evidence → Closing</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-parchment/10 rounded-lg">
                                    <CheckCircle className="text-green-400" size={20} />
                                    <div>
                                      <p className="font-medium text-parchment">3. Jury Deliberation</p>
                                      <p className="text-sm text-parchment/70">AI jury evaluates arguments and delivers verdict</p>
                                    </div>
                                  </div>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                          </div>
                        )}
                        
                        {/* Roles */}
                        {currentSection === 'roles' && (
                          <div className="space-y-6">
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <Target className="text-red-400" size={20} />
                                  Prosecutor
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <p className="text-parchment/90 leading-relaxed mb-4">
                                  <strong>Your Mission:</strong> Prove the defendant is guilty beyond a reasonable doubt.
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <ChevronRight className="text-red-400 mt-1" size={16} />
                                    <span className="text-parchment/80">Present evidence that supports guilt</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <ChevronRight className="text-red-400 mt-1" size={16} />
                                    <span className="text-parchment/80">Challenge defense arguments and evidence</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <ChevronRight className="text-red-400 mt-1" size={16} />
                                    <span className="text-parchment/80">Build a logical chain of evidence</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <ChevronRight className="text-red-400 mt-1" size={16} />
                                    <span className="text-parchment/80">Address potential reasonable doubt</span>
                                  </div>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                            
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <Users className="text-blue-400" size={20} />
                                  Defense Attorney
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <p className="text-parchment/90 leading-relaxed mb-4">
                                  <strong>Your Mission:</strong> Create reasonable doubt or prove innocence.
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <ChevronRight className="text-blue-400 mt-1" size={16} />
                                    <span className="text-parchment/80">Challenge prosecution evidence</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <ChevronRight className="text-blue-400 mt-1" size={16} />
                                    <span className="text-parchment/80">Present alternative explanations</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <ChevronRight className="text-blue-400 mt-1" size={16} />
                                    <span className="text-parchment/80">Highlight inconsistencies</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <ChevronRight className="text-blue-400 mt-1" size={16} />
                                    <span className="text-parchment/80">Establish reasonable doubt</span>
                                  </div>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                          </div>
                        )}
                        
                        {/* Trial Phases */}
                        {currentSection === 'phases' && (
                          <div className="space-y-6">
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <FileText className="text-verdict-gold" size={20} />
                                  Opening Statements
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <p className="text-parchment/90 leading-relaxed mb-3">
                                  <strong>What to do:</strong> Write a compelling 2-3 paragraph argument outlining your case.
                                </p>
                                <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                                  <p className="text-parchment font-medium mb-2">💡 Template for Success:</p>
                                  <ul className="text-sm text-parchment/80 space-y-1">
                                    <li>• State your position clearly</li>
                                    <li>• Preview key evidence you'll present</li>
                                    <li>• Outline your main arguments</li>
                                    <li>• Tell a story that makes sense</li>
                                  </ul>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                            
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <AlertCircle className="text-verdict-gold" size={20} />
                                  Evidence Presentation
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <p className="text-parchment/90 leading-relaxed mb-3">
                                  <strong>What to do:</strong> Click evidence cards to present them. The AI evaluates their impact.
                                </p>
                                <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                                  <p className="text-parchment font-medium mb-2">💡 Evidence Strategy:</p>
                                  <ul className="text-sm text-parchment/80 space-y-1">
                                    <li>• Present strongest evidence first</li>
                                    <li>• Explain why each piece matters</li>
                                    <li>• Connect evidence to your arguments</li>
                                    <li>• Use objections strategically</li>
                                  </ul>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                            
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <Scale className="text-verdict-gold" size={20} />
                                  Closing Arguments
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <p className="text-parchment/90 leading-relaxed mb-3">
                                  <strong>What to do:</strong> Summarize your case and make final persuasive arguments.
                                </p>
                                <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                                  <p className="text-parchment font-medium mb-2">💡 Closing Power Move:</p>
                                  <ul className="text-sm text-parchment/80 space-y-1">
                                    <li>• Recap your strongest evidence</li>
                                    <li>• Address opposing arguments</li>
                                    <li>• Make emotional appeal</li>
                                    <li>• End with clear call to action</li>
                                  </ul>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                          </div>
                        )}
                        
                        {/* Strategies */}
                        {currentSection === 'strategies' && (
                          <div className="space-y-6">
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <Target className="text-verdict-gold" size={20} />
                                  Building Strong Arguments
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <div className="space-y-4">
                                  <div>
                                    <p className="font-semibold text-verdict-gold mb-2">The Evidence Chain</p>
                                    <p className="text-parchment/90 text-sm leading-relaxed">
                                      Connect evidence pieces to build a logical story. Each piece of evidence should support your main argument.
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-verdict-gold mb-2">Address Weaknesses</p>
                                    <p className="text-parchment/90 text-sm leading-relaxed">
                                      Acknowledge potential problems with your case and explain why they don't matter.
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-verdict-gold mb-2">Use Legal Language</p>
                                    <p className="text-parchment/90 text-sm leading-relaxed">
                                      The AI jury responds well to proper legal terminology and structured arguments.
                                    </p>
                                  </div>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                            
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <Award className="text-verdict-gold" size={20} />
                                  Credibility System
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <p className="text-parchment/90 leading-relaxed mb-4">
                                  Your credibility score affects how the jury views your arguments. Maintain high credibility by:
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                    <p className="font-medium text-green-400 mb-2">Increases Credibility</p>
                                    <ul className="text-sm text-parchment/80 space-y-1">
                                      <li>• Strong logical arguments</li>
                                      <li>• Relevant evidence presentation</li>
                                      <li>• Professional language</li>
                                      <li>• Addressing counterarguments</li>
                                    </ul>
                                  </div>
                                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <p className="font-medium text-red-400 mb-2">Decreases Credibility</p>
                                    <ul className="text-sm text-parchment/80 space-y-1">
                                      <li>• Weak or irrelevant arguments</li>
                                      <li>• Frivolous objections</li>
                                      <li>• Contradicting yourself</li>
                                      <li>• Poor evidence selection</li>
                                    </ul>
                                  </div>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                          </div>
                        )}
                        
                        {/* Pro Tips */}
                        {currentSection === 'tips' && (
                          <div className="space-y-6">
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle className="flex items-center gap-2">
                                  <Lightbulb className="text-verdict-gold" size={20} />
                                  Expert Strategies
                                </CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <div className="space-y-4">
                                  <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                                    <p className="font-semibold text-verdict-gold mb-2">🎯 Start Strong</p>
                                    <p className="text-parchment/90 text-sm">
                                      Your opening statement sets the tone. Make it count with a clear thesis and compelling preview.
                                    </p>
                                  </div>
                                  
                                  <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                                    <p className="font-semibold text-verdict-gold mb-2">📋 Study the Case File</p>
                                    <p className="text-parchment/90 text-sm">
                                      Always review the complete case file before starting. Understanding witness testimonies and evidence is crucial.
                                    </p>
                                  </div>
                                  
                                  <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                                    <p className="font-semibold text-verdict-gold mb-2">⚡ Time Your Evidence</p>
                                    <p className="text-parchment/90 text-sm">
                                      Present your strongest evidence early to establish momentum, but save a powerful piece for your closing.
                                    </p>
                                  </div>
                                  
                                  <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                                    <p className="font-semibold text-verdict-gold mb-2">🛡️ Object Strategically</p>
                                    <p className="text-parchment/90 text-sm">
                                      Don't object to everything. Choose your battles wisely - frivolous objections hurt your credibility.
                                    </p>
                                  </div>
                                  
                                  <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                                    <p className="font-semibold text-verdict-gold mb-2">🎭 Tell a Story</p>
                                    <p className="text-parchment/90 text-sm">
                                      The best lawyers are storytellers. Create a narrative that makes your version of events feel inevitable.
                                    </p>
                                  </div>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                            
                            <CourtroomCard>
                              <CourtroomCardHeader>
                                <CourtroomCardTitle>Ready to Practice?</CourtroomCardTitle>
                              </CourtroomCardHeader>
                              <CourtroomCardContent>
                                <p className="text-parchment/90 leading-relaxed mb-4">
                                  Now that you understand the fundamentals, it's time to put your skills to the test. Remember: every great lawyer started with their first case.
                                </p>
                                <div className="flex gap-3">
                                  {startTutorial && (
                                    <GavelButton variant="accent" onClick={startTutorial}>
                                      <Play size={16} />
                                      Start Interactive Tutorial
                                    </GavelButton>
                                  )}
                                  <GavelButton variant="secondary" onClick={onClose}>
                                    Begin First Case
                                  </GavelButton>
                                </div>
                              </CourtroomCardContent>
                            </CourtroomCard>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  {/* Navigation Footer */}
                  <div className="border-t border-parchment/20 p-4">
                    <div className="flex justify-between items-center">
                      <GavelButton
                        variant="ghost"
                        onClick={prevSection}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </GavelButton>
                      
                      <div className="flex items-center gap-2">
                        {sections.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentIndex ? 'bg-verdict-gold' : 'bg-parchment/30'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <GavelButton
                        variant="ghost"
                        onClick={nextSection}
                        disabled={currentIndex === sections.length - 1}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight size={16} />
                      </GavelButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
