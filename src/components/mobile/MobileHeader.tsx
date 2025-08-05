import { motion } from 'framer-motion'
import { ArrowLeft, Settings, Menu, Gavel } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { useIsMobile } from '@/hooks/use-mobile'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: {
    icon: React.ComponentType<any>
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'courtroom' | 'game'
}

export function MobileHeader({ 
  title, 
  subtitle, 
  showBack = false, 
  onBack, 
  rightAction,
  variant = 'default'
}: MobileHeaderProps) {
  const isMobile = useIsMobile()
  
  if (!isMobile) {
    return null // Only show on mobile
  }
  
  const headerClass = variant === 'courtroom' ? 'mobile-courtroom-header' : 'mobile-header'
  const textColor = variant === 'courtroom' ? 'text-parchment' : 'text-gavel-blue'
  
  return (
    <motion.header 
      className={headerClass}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Left side - Back button or logo */}
      <div className="flex items-center gap-3">
        {showBack && onBack ? (
          <motion.button
            className={`p-2 rounded-lg ${textColor} touch-target`}
            onClick={onBack}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        ) : (
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Gavel className={`w-8 h-8 ${variant === 'courtroom' ? 'text-verdict-gold' : 'text-verdict-gold'}`} />
          </motion.div>
        )}
        
        <div className="flex flex-col">
          <motion.h1 
            className={`text-lg font-bold ${textColor} leading-tight`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              className={`text-sm ${variant === 'courtroom' ? 'text-parchment/80' : 'text-mahogany/70'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Right side - Action button */}
      {rightAction && (
        <motion.button
          className={`p-2 rounded-lg ${textColor} touch-target`}
          onClick={rightAction.onClick}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          title={rightAction.label}
        >
          <rightAction.icon className="w-6 h-6" />
        </motion.button>
      )}
    </motion.header>
  )
}

// Mobile page wrapper component
interface MobilePageWrapperProps {
  children: React.ReactNode
  headerProps?: Omit<MobileHeaderProps, 'variant'>
  showBottomNav?: boolean
  variant?: 'default' | 'courtroom' | 'game'
  className?: string
}

export function MobilePageWrapper({ 
  children, 
  headerProps, 
  showBottomNav = true, 
  variant = 'default',
  className = ''
}: MobilePageWrapperProps) {
  const isMobile = useIsMobile()
  
  if (!isMobile) {
    // Desktop layout
    return (
      <div className={`min-h-screen ${className}`}>
        {children}
      </div>
    )
  }
  
  return (
    <div className={`mobile-${variant === 'courtroom' ? 'courtroom' : 'page'} ${className}`}>
      {headerProps && (
        <MobileHeader {...headerProps} variant={variant} />
      )}
      
      <main className={variant === 'courtroom' ? 'mobile-courtroom-content' : 'mobile-content'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}