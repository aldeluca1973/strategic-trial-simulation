import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, Shield, Sword, Users } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'

interface RoleSelectorProps {
  selectedRole: string | null
  onRoleSelect: (role: 'judge' | 'prosecutor' | 'defense' | null) => void
  availableRoles?: string[]
  userPreferences?: {
    preferred_role_1?: string
    preferred_role_2?: string
    preferred_role_3?: string
  }
}

const roleDetails = {
  judge: {
    icon: Scale,
    title: 'Judge',
    description: 'Oversee the trial, manage proceedings, and ensure fair play',
    color: 'text-verdict-gold',
    bgColor: 'bg-verdict-gold/10',
    borderColor: 'border-verdict-gold/30'
  },
  prosecutor: {
    icon: Sword,
    title: 'Prosecutor',
    description: 'Present the case against the defendant and seek justice',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  defense: {
    icon: Shield,
    title: 'Defense Attorney',
    description: 'Defend the accused and protect their rights',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  }
}

export function RoleSelector({ selectedRole, onRoleSelect, availableRoles = [], userPreferences }: RoleSelectorProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  const getRolePreferenceIndex = (role: string) => {
    if (userPreferences?.preferred_role_1 === role) return 1
    if (userPreferences?.preferred_role_2 === role) return 2
    if (userPreferences?.preferred_role_3 === role) return 3
    return null
  }

  return (
    <CourtroomCard>
      <CourtroomCardHeader>
        <CourtroomCardTitle className="flex items-center gap-2">
          <Users className="text-verdict-gold" size={20} />
          Select Your Role
        </CourtroomCardTitle>
        <p className="text-parchment/70 text-sm">
          Choose your preferred role for this trial. Your preferences are saved for future games.
        </p>
      </CourtroomCardHeader>
      
      <CourtroomCardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(roleDetails).map(([role, details]) => {
            const isSelected = selectedRole === role
            const isAvailable = availableRoles.length === 0 || availableRoles.includes(role)
            const preferenceIndex = getRolePreferenceIndex(role)
            const Icon = details.icon
            
            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Object.keys(roleDetails).indexOf(role) * 0.1 }}
                className="relative"
                onMouseEnter={() => setHoveredRole(role)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                <motion.div
                  whileHover={{ scale: isAvailable ? 1.02 : 1 }}
                  whileTap={{ scale: isAvailable ? 0.98 : 1 }}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? `${details.bgColor} ${details.borderColor} shadow-lg` 
                      : 'border-parchment/20 hover:border-parchment/40'
                    }
                    ${!isAvailable && 'opacity-50 cursor-not-allowed'}
                  `}
                  onClick={() => isAvailable && onRoleSelect(isSelected ? null : role as any)}
                >
                  {/* Preference Badge */}
                  {preferenceIndex && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-verdict-gold text-gavel-blue rounded-full text-xs font-bold flex items-center justify-center">
                      {preferenceIndex}
                    </div>
                  )}
                  
                  {/* Unavailable Overlay */}
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <span className="text-parchment/60 text-sm font-semibold">Taken</span>
                    </div>
                  )}
                  
                  <div className="text-center space-y-3">
                    <motion.div
                      animate={{
                        scale: isSelected ? 1.1 : hoveredRole === role ? 1.05 : 1,
                        rotate: isSelected ? 5 : 0
                      }}
                      className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                        isSelected ? details.bgColor : 'bg-parchment/10'
                      }`}
                    >
                      <Icon 
                        size={24} 
                        className={isSelected ? details.color : 'text-parchment/60'} 
                      />
                    </motion.div>
                    
                    <div>
                      <h3 className={`font-semibold ${
                        isSelected ? details.color : 'text-parchment'
                      }`}>
                        {details.title}
                      </h3>
                      <p className="text-xs text-parchment/70 mt-1 leading-relaxed">
                        {details.description}
                      </p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 border-2 border-verdict-gold rounded-lg pointer-events-none"
                      style={{
                        boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
        
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-verdict-gold/10 rounded-lg border border-verdict-gold/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${roleDetails[selectedRole as keyof typeof roleDetails].color.replace('text-', 'bg-')}`} />
                <span className="text-sm font-medium text-parchment">
                  Selected: {roleDetails[selectedRole as keyof typeof roleDetails].title}
                </span>
              </div>
              <GavelButton
                variant="ghost"
                size="sm"
                onClick={() => onRoleSelect(null)}
                className="text-xs"
              >
                Clear
              </GavelButton>
            </div>
          </motion.div>
        )}
        
        <div className="mt-4 text-xs text-parchment/60">
          💡 Tip: Numbers on roles show your saved preferences. Set these in your profile!
        </div>
      </CourtroomCardContent>
    </CourtroomCard>
  )
}
