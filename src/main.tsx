import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, enableMobileOptimizations, optimizeForMobile } from './utils/pwa.ts'

// Initialize PWA and mobile optimizations
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker()
    enableMobileOptimizations()
    optimizeForMobile()
  })
}

// Create root and render app
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Add mobile-specific event listeners
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('PWA features available')
}

// Handle orientation changes for mobile
if (window.screen && window.screen.orientation) {
  window.screen.orientation.addEventListener('change', () => {
    console.log('Orientation changed to:', window.screen.orientation.angle)
    // Dispatch custom event for components to handle orientation changes
    window.dispatchEvent(new CustomEvent('orientationchange', {
      detail: { angle: window.screen.orientation.angle }
    }))
  })
}

// Performance monitoring for mobile
if ('performance' in window && 'PerformanceObserver' in window) {
  const perfObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'paint') {
        console.log(`${entry.name}: ${entry.startTime}ms`)
      }
    })
  })
  
  perfObserver.observe({ entryTypes: ['paint', 'navigation'] })
}

// Add error boundary for mobile crashes
window.addEventListener('error', (event) => {
  console.error('Mobile app error:', event.error)
  // You could send this to analytics or error reporting service
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // You could send this to analytics or error reporting service
})