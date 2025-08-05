// PWA utilities for Virtual Gavel mobile experience
import { useState, useEffect } from 'react'

// Register service worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', registration)
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              console.log('New app version available')
              showUpdateNotification()
            }
          })
        }
      })
      
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}

// Show update notification
function showUpdateNotification() {
  // You can integrate this with your notification system
  console.log('App update available - refresh to get the latest version')
}

// Install PWA prompt
export function usePWAInstall() {
  let deferredPrompt: any
  
  const setupPWAInstall = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      console.log('PWA install prompt available')
    })
  }
  
  const promptPWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA install prompt result:', outcome)
      deferredPrompt = null
      return outcome === 'accepted'
    }
    return false
  }
  
  const isPWAInstallable = () => {
    return !!deferredPrompt
  }
  
  const isPWAInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }
  
  return {
    setupPWAInstall,
    promptPWAInstall,
    isPWAInstallable,
    isPWAInstalled
  }
}

// Mobile-specific utilities
export function enableMobileOptimizations() {
  // Prevent zoom on input focus (iOS)
  const viewportMeta = document.querySelector('meta[name="viewport"]')
  if (viewportMeta) {
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    )
  }
  
  // Add mobile-specific classes to body
  document.body.classList.add('mobile-optimized')
  
  // Handle iOS safe areas
  if (CSS.supports('padding-top', 'env(safe-area-inset-top)')) {
    document.documentElement.style.setProperty('--safe-area-supported', '1')
  }
  
  // Disable pull-to-refresh on mobile
  document.body.style.overscrollBehavior = 'none'
  
  // Improve touch responsiveness
  const style = document.createElement('style')
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
    
    input, textarea, select {
      font-size: 16px !important; /* Prevent zoom on iOS */
    }
    
    .mobile-optimized {
      touch-action: manipulation;
      -webkit-overflow-scrolling: touch;
    }
  `
  document.head.appendChild(style)
}

// Haptic feedback utilities
export const haptics = {
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  },
  
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30])
    }
  },
  
  heavy: () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  },
  
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50])
    }
  },
  
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }
}

// Performance optimizations for mobile
export function optimizeForMobile() {
  // Lazy load images
  const images = document.querySelectorAll('img[data-src]')
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src!
        img.removeAttribute('data-src')
        imageObserver.unobserve(img)
      }
    })
  })
  
  images.forEach(img => imageObserver.observe(img))
  
  // Preload critical resources
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = '/data/cases.json'
  link.as = 'fetch'
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

// Battery and network awareness
export function useBatteryOptimization() {
  const [batteryLevel, setBatteryLevel] = useState(1)
  const [isCharging, setIsCharging] = useState(true)
  const [connectionType, setConnectionType] = useState<string>('4g')
  
  useEffect(() => {
    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level)
        setIsCharging(battery.charging)
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level)
        })
        
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging)
        })
      })
    }
    
    // Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection.effectiveType)
      
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType)
      })
    }
  }, [])
  
  const shouldReduceAnimations = () => {
    return batteryLevel < 0.2 || connectionType === 'slow-2g' || connectionType === '2g'
  }
  
  const shouldReduceQuality = () => {
    return connectionType === 'slow-2g' || connectionType === '2g'
  }
  
  return {
    batteryLevel,
    isCharging,
    connectionType,
    shouldReduceAnimations,
    shouldReduceQuality
  }
}

// Export types
export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Detect if running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}