import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, 
  Star, 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  Users,
  X,
  Zap
} from 'lucide-react'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { GavelButton } from '@/components/ui/gavel-button'

interface PremiumBundle {
  id: string
  name: string
  description: string
  price: number
  case_count: number
  preview_cases: string[]
  is_purchased: boolean
}

interface PremiumCasesModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (bundleId: string) => void
}

export function PremiumCasesModal({ isOpen, onClose, onPurchase }: PremiumCasesModalProps) {
  const [bundles] = useState<PremiumBundle[]>([
    {
      id: 'supreme-court-classics',
      name: 'Supreme Court Classics',
      description: 'Historic Supreme Court cases that shaped American law',
      price: 9.99,
      case_count: 12,
      preview_cases: ['Brown v. Board of Education', 'Roe v. Wade', 'Miranda v. Arizona'],
      is_purchased: false
    },
    {
      id: 'famous-criminal-trials',
      name: 'Famous Criminal Trials',
      description: 'Notorious criminal cases from legal history',
      price: 7.99,
      case_count: 8,
      preview_cases: ['O.J. Simpson Trial', 'Scopes Monkey Trial', 'Watergate Hearings'],
      is_purchased: false
    },
    {
      id: 'constitutional-landmarks',
      name: 'Constitutional Landmarks',
      description: 'Cases that defined constitutional interpretation',
      price: 8.99,
      case_count: 10,
      preview_cases: ['Marbury v. Madison', 'McCulloch v. Maryland', 'Gibbons v. Ogden'],
      is_purchased: false
    }
  ])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <CourtroomCard>
          <CourtroomCardHeader>
            <div className="flex items-center justify-between">
              <CourtroomCardTitle className="flex items-center gap-2">
                <Crown className="text-verdict-gold" size={24} />
                Premium Legal Cases
              </CourtroomCardTitle>
              <GavelButton variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </GavelButton>
            </div>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-verdict-gold/10 to-amber-500/10 rounded-lg border border-verdict-gold/30">
              <div className="flex items-center gap-2 mb-2">
                <Star className="text-verdict-gold" size={20} />
                <span className="font-semibold text-verdict-gold">Premium Access</span>
              </div>
              <p className="text-sm text-parchment/80">
                Access famous landmark cases outside of career mode. Perfect for practicing specific legal scenarios
                or exploring historical cases at your own pace.
              </p>
            </div>
          </CourtroomCardHeader>
          
          <CourtroomCardContent className="max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle, index) => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <CourtroomCard className="h-full border border-verdict-gold/30 hover:border-verdict-gold/60 transition-colors">
                    <CourtroomCardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-verdict-gold mb-1">
                            {bundle.name}
                          </h3>
                          <p className="text-sm text-parchment/70 mb-2">
                            {bundle.description}
                          </p>
                        </div>
                        <Crown size={20} className="text-verdict-gold flex-shrink-0" />
                      </div>
                      
                      <div className="space-y-2 text-xs text-parchment/70">
                        <div className="flex items-center gap-2">
                          <Users size={12} />
                          {bundle.case_count} landmark cases
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={12} />
                          Unlimited access
                        </div>
                      </div>
                    </CourtroomCardHeader>
                    
                    <CourtroomCardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-verdict-gold mb-2">Featured Cases:</h4>
                          <div className="space-y-1">
                            {bundle.preview_cases.slice(0, 3).map((caseName, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-parchment/70">
                                <div className="w-1.5 h-1.5 bg-verdict-gold rounded-full" />
                                {caseName}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border-t border-verdict-gold/20 pt-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-verdict-gold">
                              ${bundle.price}
                            </span>
                            <span className="text-xs text-parchment/60">
                              One-time purchase
                            </span>
                          </div>
                          
                          {bundle.is_purchased ? (
                            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                              <CheckCircle size={16} />
                              Purchased
                            </div>
                          ) : (
                            <GavelButton
                              onClick={() => onPurchase(bundle.id)}
                              className="w-full flex items-center gap-2"
                              size="sm"
                            >
                              <ShoppingCart size={16} />
                              Purchase Bundle
                            </GavelButton>
                          )}
                        </div>
                      </div>
                    </CourtroomCardContent>
                  </CourtroomCard>
                </motion.div>
              ))}
            </div>
            
            {/* Benefits Section */}
            <div className="mt-8 p-6 bg-gavel-blue/10 rounded-lg border border-verdict-gold/20">
              <h3 className="font-semibold text-verdict-gold mb-4 flex items-center gap-2">
                <Zap size={20} />
                Why Premium Cases?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-parchment/80">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Access famous trials outside career progression</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Practice specific legal scenarios</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Historical legal education</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited replays and analysis</span>
                </div>
              </div>
            </div>
          </CourtroomCardContent>
        </CourtroomCard>
      </motion.div>
    </div>
  )
}
