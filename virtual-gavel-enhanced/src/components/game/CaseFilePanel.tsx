import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Users, 
  Scale, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Gavel,
  Eye,
  X,
  ChevronRight,
  Book,
  Shield,
  Target
} from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { LegalCase } from '@/lib/supabase'

interface CaseFilePanelProps {
  selectedCase: LegalCase
  isVisible: boolean
  onClose: () => void
}

type TabType = 'synopsis' | 'investigation' | 'witnesses' | 'evidence' | 'arguments'

export function CaseFilePanel({ selectedCase, isVisible, onClose }: CaseFilePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('synopsis')

  const tabs = [
    { id: 'synopsis' as TabType, label: 'Case Synopsis', icon: FileText },
    { id: 'investigation' as TabType, label: 'Investigation', icon: AlertCircle },
    { id: 'witnesses' as TabType, label: 'Witnesses', icon: Users },
    { id: 'evidence' as TabType, label: 'Evidence', icon: Eye },
    { id: 'arguments' as TabType, label: 'Legal Arguments', icon: Scale }
  ]

  const formatCaseBackground = (background: string) => {
    // Try to parse JSON format first
    try {
      const parsed = JSON.parse(background)
      if (parsed.summary) return parsed
    } catch {}
    
    // Fallback: treat as plain text and structure it
    const paragraphs = background.split('\n\n').filter(p => p.trim())
    return {
      summary: paragraphs[0] || background.substring(0, 200) + '...',
      details: paragraphs.slice(1).join('\n\n') || background
    }
  }

  const caseData = formatCaseBackground(selectedCase.case_background)

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          
          {/* Case File Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-2/3 max-w-4xl bg-gradient-to-br from-gavel-blue-900 to-mahogany z-50 shadow-2xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-parchment/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Gavel className="text-verdict-gold" size={32} />
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-verdict-gold">Case File</h2>
                      <p className="text-parchment/70 text-sm">Complete Case Documentation</p>
                    </div>
                  </div>
                  <GavelButton variant="ghost" size="sm" onClick={onClose}>
                    <X size={20} />
                  </GavelButton>
                </div>
                
                {/* Case Title */}
                <div className="bg-parchment/10 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-parchment mb-2">{selectedCase.case_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-parchment/70">
                    {selectedCase.year && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {selectedCase.year}
                      </span>
                    )}
                    {selectedCase.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {selectedCase.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Target size={14} />
                      Difficulty: {selectedCase.difficulty_level}/10
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex border-b border-parchment/20">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-verdict-gold border-b-2 border-verdict-gold bg-verdict-gold/5'
                          : 'text-parchment/70 hover:text-parchment hover:bg-parchment/5'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Synopsis Tab */}
                    {activeTab === 'synopsis' && (
                      <div className="space-y-6">
                        <CourtroomCard>
                          <CourtroomCardHeader>
                            <CourtroomCardTitle className="flex items-center gap-2">
                              <Book className="text-verdict-gold" size={20} />
                              Case Summary
                            </CourtroomCardTitle>
                          </CourtroomCardHeader>
                          <CourtroomCardContent>
                            <p className="text-parchment/90 leading-relaxed">
                              {caseData.summary}
                            </p>
                            {caseData.details && caseData.details !== caseData.summary && (
                              <div className="mt-4 pt-4 border-t border-parchment/20">
                                <h4 className="font-semibold text-verdict-gold mb-2">Detailed Background</h4>
                                <p className="text-parchment/80 leading-relaxed whitespace-pre-line">
                                  {caseData.details}
                                </p>
                              </div>
                            )}
                          </CourtroomCardContent>
                        </CourtroomCard>
                        
                        <CourtroomCard>
                          <CourtroomCardHeader>
                            <CourtroomCardTitle className="flex items-center gap-2">
                              <Scale className="text-verdict-gold" size={20} />
                              Central Legal Question
                            </CourtroomCardTitle>
                          </CourtroomCardHeader>
                          <CourtroomCardContent>
                            <div className="bg-verdict-gold/10 border border-verdict-gold/30 rounded-lg p-4">
                              <p className="text-parchment font-medium">
                                You must determine: <span className="text-verdict-gold">Was the defendant's actions legally justified under the circumstances presented?</span>
                              </p>
                              <p className="text-parchment/70 text-sm mt-2">
                                Consider all evidence, witness testimony, and applicable legal precedents.
                              </p>
                            </div>
                          </CourtroomCardContent>
                        </CourtroomCard>
                      </div>
                    )}
                    
                    {/* Investigation Tab */}
                    {activeTab === 'investigation' && (
                      <div className="space-y-6">
                        <CourtroomCard>
                          <CourtroomCardHeader>
                            <CourtroomCardTitle className="flex items-center gap-2">
                              <AlertCircle className="text-verdict-gold" size={20} />
                              Investigation Report
                            </CourtroomCardTitle>
                          </CourtroomCardHeader>
                          <CourtroomCardContent>
                            {selectedCase.court_proceedings ? (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-verdict-gold">Court Proceedings</h4>
                                <p className="text-parchment/90 leading-relaxed whitespace-pre-line">
                                  {selectedCase.court_proceedings}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-verdict-gold">Initial Investigation Findings</h4>
                                <p className="text-parchment/90 leading-relaxed">
                                  Investigation conducted by {selectedCase.location ? `${selectedCase.location} authorities` : 'law enforcement'}. 
                                  This case involves complex legal questions that require careful analysis of evidence and testimony.
                                </p>
                                <div className="bg-parchment/10 rounded-lg p-4">
                                  <h5 className="font-medium text-parchment mb-2">Key Investigation Points:</h5>
                                  <ul className="list-disc list-inside space-y-1 text-parchment/80 text-sm">
                                    <li>Initial crime scene analysis completed</li>
                                    <li>All relevant witnesses interviewed</li>
                                    <li>Physical evidence collected and catalogued</li>
                                    <li>Legal precedents researched and documented</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                          </CourtroomCardContent>
                        </CourtroomCard>
                      </div>
                    )}
                    
                    {/* Witnesses Tab */}
                    {activeTab === 'witnesses' && (
                      <div className="space-y-4">
                        {selectedCase.witness_testimonies?.map((witness, index) => (
                          <CourtroomCard key={index}>
                            <CourtroomCardHeader>
                              <CourtroomCardTitle className="flex items-center gap-2">
                                <Users className="text-verdict-gold" size={20} />
                                {witness.witness_name || `Witness ${index + 1}`}
                              </CourtroomCardTitle>
                            </CourtroomCardHeader>
                            <CourtroomCardContent>
                              <div className="bg-parchment/10 rounded-lg p-4">
                                <h5 className="font-medium text-verdict-gold mb-2">Testimony:</h5>
                                <p className="text-parchment/90 leading-relaxed italic">
                                  "{witness.testimony}"
                                </p>
                              </div>
                            </CourtroomCardContent>
                          </CourtroomCard>
                        )) || (
                          <CourtroomCard>
                            <CourtroomCardContent>
                              <p className="text-parchment/60 text-center py-8">
                                Witness testimonies will be revealed during the trial proceedings.
                              </p>
                            </CourtroomCardContent>
                          </CourtroomCard>
                        )}
                      </div>
                    )}
                    
                    {/* Evidence Tab */}
                    {activeTab === 'evidence' && (
                      <div className="space-y-4">
                        {selectedCase.key_evidence?.map((evidence, index) => (
                          <CourtroomCard key={index}>
                            <CourtroomCardHeader>
                              <CourtroomCardTitle className="flex items-center gap-2">
                                <Eye className="text-verdict-gold" size={20} />
                                {evidence.evidence_name || `Evidence Item ${index + 1}`}
                              </CourtroomCardTitle>
                            </CourtroomCardHeader>
                            <CourtroomCardContent>
                              <p className="text-parchment/90 leading-relaxed">
                                {evidence.description}
                              </p>
                            </CourtroomCardContent>
                          </CourtroomCard>
                        )) || (
                          <CourtroomCard>
                            <CourtroomCardContent>
                              <p className="text-parchment/60 text-center py-8">
                                Evidence details will be available during evidence presentation phase.
                              </p>
                            </CourtroomCardContent>
                          </CourtroomCard>
                        )}
                      </div>
                    )}
                    
                    {/* Legal Arguments Tab */}
                    {activeTab === 'arguments' && (
                      <div className="space-y-6">
                        {/* Prosecution Arguments */}
                        {selectedCase.legal_arguments?.prosecution && (
                          <CourtroomCard>
                            <CourtroomCardHeader>
                              <CourtroomCardTitle className="flex items-center gap-2">
                                <Target className="text-red-400" size={20} />
                                Prosecution Strategy
                              </CourtroomCardTitle>
                            </CourtroomCardHeader>
                            <CourtroomCardContent>
                              <ul className="space-y-2">
                                {selectedCase.legal_arguments.prosecution.map((arg, index) => (
                                  <li key={index} className="flex items-start gap-2 text-parchment/90">
                                    <ChevronRight className="text-red-400 mt-1 flex-shrink-0" size={16} />
                                    {arg}
                                  </li>
                                ))}
                              </ul>
                            </CourtroomCardContent>
                          </CourtroomCard>
                        )}
                        
                        {/* Defense Arguments */}
                        {selectedCase.legal_arguments?.defense && (
                          <CourtroomCard>
                            <CourtroomCardHeader>
                              <CourtroomCardTitle className="flex items-center gap-2">
                                <Shield className="text-blue-400" size={20} />
                                Defense Strategy
                              </CourtroomCardTitle>
                            </CourtroomCardHeader>
                            <CourtroomCardContent>
                              <ul className="space-y-2">
                                {selectedCase.legal_arguments.defense.map((arg, index) => (
                                  <li key={index} className="flex items-start gap-2 text-parchment/90">
                                    <ChevronRight className="text-blue-400 mt-1 flex-shrink-0" size={16} />
                                    {arg}
                                  </li>
                                ))}
                              </ul>
                            </CourtroomCardContent>
                          </CourtroomCard>
                        )}
                        
                        {/* General Arguments */}
                        {selectedCase.legal_arguments?.general && (
                          <CourtroomCard>
                            <CourtroomCardHeader>
                              <CourtroomCardTitle className="flex items-center gap-2">
                                <Scale className="text-verdict-gold" size={20} />
                                Key Legal Considerations
                              </CourtroomCardTitle>
                            </CourtroomCardHeader>
                            <CourtroomCardContent>
                              <p className="text-parchment/90 leading-relaxed">
                                {selectedCase.legal_arguments.general}
                              </p>
                            </CourtroomCardContent>
                          </CourtroomCard>
                        )}
                        
                        {/* Legal Precedents */}
                        {selectedCase.notable_precedents && selectedCase.notable_precedents.length > 0 && (
                          <CourtroomCard>
                            <CourtroomCardHeader>
                              <CourtroomCardTitle className="flex items-center gap-2">
                                <Gavel className="text-verdict-gold" size={20} />
                                Notable Legal Precedents
                              </CourtroomCardTitle>
                            </CourtroomCardHeader>
                            <CourtroomCardContent>
                              <ul className="space-y-2">
                                {selectedCase.notable_precedents.map((precedent, index) => (
                                  <li key={index} className="flex items-start gap-2 text-parchment/90">
                                    <ChevronRight className="text-verdict-gold mt-1 flex-shrink-0" size={16} />
                                    {precedent}
                                  </li>
                                ))}
                              </ul>
                            </CourtroomCardContent>
                          </CourtroomCard>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
