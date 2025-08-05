import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gavel, Scale, Sword, Shield, Crown } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'

interface EnhancedRoleSelectorProps {
  selectedRole: string | null
  onRoleSelect: (role: string) => void
  userPreferences?: {
    preferred_role_1?: string
    preferred_role_2?: string
    preferred_role_3?: string
  }
  gameMode?: string
}

const ROLES = [
  {
    id: 'prosecutor',
    title: 'Prosecutor',
    subtitle: 'State Attorney',
    description: 'Present the case against the defendant. Build a compelling argument using evidence and witness testimony.',
    icon: Sword,
    color: 'from-red-600 to-red-700',
    iconColor: 'text-red-100',
    skills: ['Evidence Presentation', 'Cross-Examination', 'Legal Argument'],
    difficulty: 'Medium',
    emoji: '⚔️'
  },
  {
    id: 'defense',
    title: 'Defense Attorney',
    subtitle: 'Public Defender',
    description: 'Defend your client and challenge the prosecution\'s case. Find weaknesses and create reasonable doubt.',
    icon: Shield,
    color: 'from-blue-600 to-blue-700',
    iconColor: 'text-blue-100',
    skills: ['Client Advocacy', 'Evidence Challenge', 'Constitutional Rights'],
    difficulty: 'Medium',
    emoji: '🛡️'
  },
  {
    id: 'judge',
    title: 'Presiding Judge',
    subtitle: 'The Honorable',
    description: 'Maintain order in the courtroom and ensure fair proceedings. Make critical rulings on evidence and procedure.',
    icon: Crown,
    color: 'from-purple-600 to-purple-700',
    iconColor: 'text-purple-100',
    skills: ['Legal Procedure', 'Evidence Rulings', 'Jury Management'],
    difficulty: 'Hard',
    emoji: '⚖️'
  }
]

export function EnhancedRoleSelector({ selectedRole, onRoleSelect, userPreferences, gameMode }: EnhancedRoleSelectorProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  const getRecommendationBadge = (roleId: string) => {
    if (userPreferences?.preferred_role_1 === roleId) {
      return { text: 'Top Choice', color: 'bg-verdict-gold text-mahogany' }
    }
    if (userPreferences?.preferred_role_2 === roleId) {
      return { text: 'Preferred', color: 'bg-verdict-gold/70 text-mahogany' }
    }
    if (userPreferences?.preferred_role_3 === roleId) {
      return { text: 'Liked', color: 'bg-verdict-gold/50 text-mahogany' }
    }
    return null
  }

  const getAvailableRoles = () => {
    if (gameMode === 'solo') {
      // In solo mode, only prosecutor and defense are available (judge is AI)
      return ROLES.filter(role => role.id !== 'judge')
    }
    return ROLES
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-serif font-bold text-verdict-gold mb-2">
          Choose Your Role
        </h3>
        <p className="text-parchment/70">
          {gameMode === 'solo' 
            ? 'Select your role - the AI will handle the Judge and Jury'
            : 'Select your preferred role in this trial simulation'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {getAvailableRoles().map((role, index) => {
          const Icon = role.icon
          const recommendation = getRecommendationBadge(role.id)
          const isSelected = selectedRole === role.id
          const isHovered = hoveredRole === role.id

          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CourtroomCard 
                className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  isSelected 
                    ? 'ring-4 ring-verdict-gold shadow-2xl transform scale-105' 
                    : isHovered
                    ? 'shadow-xl transform scale-102'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => onRoleSelect(role.id)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                {/* Background Gradient */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${role.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
                
                {/* Recommendation Badge */}
                {recommendation && (
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${recommendation.color}`}>
                    {recommendation.text}
                  </div>
                )}
                
                <CourtroomCardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color} shadow-lg`}>
                      <Icon size={32} className={role.iconColor} />
                    </div>
                    <div className="flex-1">
                      <CourtroomCardTitle className="text-xl mb-1 flex items-center gap-2">
                        {role.title}
                        <span className="text-lg">{role.emoji}</span>
                      </CourtroomCardTitle>
                      <div className="text-sm text-verdict-gold font-medium">
                        {role.subtitle}
                      </div>
                    </div>
                  </div>
                </CourtroomCardHeader>
                
                <CourtroomCardContent>
                  <p className="text-sm text-parchment/80 leading-relaxed mb-4">
                    {role.description}
                  </p>
                  
                  {/* Skills */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-verdict-gold mb-2">Key Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.skills.map((skill, i) => (
                          <span key={i} className="text-xs bg-gavel-blue/30 text-parchment/80 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-parchment/60">Difficulty:</span>
                      <span className={`font-medium ${
                        role.difficulty === 'Easy' ? 'text-green-400' :
                        role.difficulty === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {role.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-3 bg-verdict-gold/10 rounded-lg border border-verdict-gold/30"
                    >
                      <div className="flex items-center gap-2 text-verdict-gold font-medium text-sm">
                        <Gavel size={14} />
                        Role Selected
                      </div>
                      <p className="text-xs text-parchment/80 mt-1">
                        Ready to begin as {role.title}!
                      </p>
                    </motion.div>
                  )}
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          )
        })}
      </div>
      
      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-sm text-parchment/70 mb-3">
            Selected: <span className="text-verdict-gold font-medium">
              {ROLES.find(r => r.id === selectedRole)?.title}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}