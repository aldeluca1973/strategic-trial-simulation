import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  disabled?: boolean
  className?: string
  swipeThreshold?: number
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  disabled = false,
  className = '',
  swipeThreshold = 100
}: SwipeableCardProps) {
  const isMobile = useIsMobile()
  const controls = useAnimation()
  const x = useMotionValue(0)
  const [isSwipping, setIsSwipping] = useState(false)
  
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10])
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9])
  
  const handleDragStart = () => {
    setIsSwipping(true)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }
  
  const handleDragEnd = async (event: any, info: PanInfo) => {
    setIsSwipping(false)
    
    const swipeDistance = info.offset.x
    const swipeVelocity = info.velocity.x
    
    // Determine if swipe was significant enough
    const shouldSwipe = Math.abs(swipeDistance) > swipeThreshold || Math.abs(swipeVelocity) > 500
    
    if (shouldSwipe && !disabled) {
      if (swipeDistance > 0 && onSwipeRight) {
        // Swipe right
        await controls.start({ x: 300, opacity: 0, scale: 0.8 })
        onSwipeRight()
        // Haptic feedback for successful action
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 50])
        }
      } else if (swipeDistance < 0 && onSwipeLeft) {
        // Swipe left
        await controls.start({ x: -300, opacity: 0, scale: 0.8 })
        onSwipeLeft()
        // Haptic feedback for successful action
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 50])
        }
      } else {
        // Return to center
        await controls.start({ x: 0, opacity: 1, scale: 1 })
      }
    } else {
      // Return to center
      await controls.start({ x: 0, opacity: 1, scale: 1 })
    }
  }
  
  const handleTap = () => {
    if (!isSwipping && onTap && !disabled) {
      // Light haptic feedback for tap
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
      onTap()
    }
  }
  
  return (
    <motion.div
      className={`swipe-area ${className}`}
      style={{ x, opacity, rotate, scale }}
      animate={controls}
      drag={isMobile && !disabled ? "x" : false}
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileHover={!isMobile ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
      
      {/* Swipe indicators - only show when swiping */}
      {isSwipping && (
        <>
          {onSwipeLeft && (
            <motion.div 
              className="swipe-indicator-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          {onSwipeRight && (
            <motion.div 
              className="swipe-indicator-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </>
      )}
    </motion.div>
  )
}

// Hook for swipe gestures on any element
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}) {
  const startTouch = useRef<{ x: number; y: number } | null>(null)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    startTouch.current = { x: touch.clientX, y: touch.clientY }
  }
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startTouch.current) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startTouch.current.x
    const deltaY = touch.clientY - startTouch.current.y
    
    // Determine primary direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    }
    
    startTouch.current = null
  }
  
  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  }
}