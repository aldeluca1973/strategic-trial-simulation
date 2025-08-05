import { motion } from 'framer-motion'
import { Home, Briefcase, Trophy, User, Gavel } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

type PageType = 'auth' | 'mode-selection' | 'quick-game-setup' | 'case-preview' | 'role-selection' | 'game' | 'career' | 'training'

interface MobileBottomNavProps {
  currentPage: PageType | string
  onNavigate: (page: string) => void
  inGame?: boolean
}

export function MobileBottomNav({ currentPage, onNavigate, inGame = false }: MobileBottomNavProps) {
  const isMobile = useIsMobile()
  
  // Don't show bottom nav on desktop or when in active game
  if (!isMobile || inGame) {
    return null
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      page: 'mode-selection'
    },
    {
      id: 'cases',
      label: 'My Cases',
      icon: Briefcase,
      page: 'quick-game-setup'
    },
    {
      id: 'courtroom',
      label: 'Courtroom',
      icon: Gavel,
      page: 'game'
    },
    {
      id: 'leaderboard',
      label: 'Rankings',
      icon: Trophy,
      page: 'career'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      page: 'training'
    }
  ]

  const handleNavClick = (page: string, itemId: string) => {
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    
    onNavigate(page)
  }

  return (
    <motion.nav 
      className="mobile-bottom-nav"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentPage === item.page
        
        return (
          <motion.button
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : 'inactive'}`}
            onClick={() => handleNavClick(item.page, item.id)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="mobile-nav-icon"
              animate={{
                scale: isActive ? 1.1 : 1,
                color: isActive ? '#0A2240' : '#4A2C2A99'
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-full h-full" />
            </motion.div>
            <motion.span
              className="mobile-nav-label"
              animate={{
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#0A2240' : '#4A2C2A99'
              }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.span>
            
            {/* Active indicator */}
            {isActive && (
              <motion.div
                className="absolute -top-1 left-1/2 w-1 h-1 bg-verdict-gold rounded-full"
                initial={{ scale: 0, x: '-50%' }}
                animate={{ scale: 1, x: '-50%' }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </motion.nav>
  )
}

// Hook for managing bottom nav state
export function useMobileNavigation() {
  const isMobile = useIsMobile()
  
  const getContentPadding = (inGame: boolean = false) => {
    if (!isMobile) return ''
    if (inGame) return 'pb-4' // No bottom nav in game
    return 'pb-24' // Account for bottom nav
  }
  
  const getContentClasses = (inGame: boolean = false) => {
    if (!isMobile) return 'min-h-screen'
    
    const baseClasses = 'mobile-content'
    if (inGame) {
      return `${baseClasses} pb-4` // No bottom nav in game
    }
    return baseClasses // Standard spacing with bottom nav
  }
  
  return {
    isMobile,
    getContentPadding,
    getContentClasses
  }
}