import { AppRouter } from './AppRouter'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import { useIsMobile } from '@/hooks/use-mobile'

function App() {
  const isMobile = useIsMobile()
  
  return (
    <ErrorBoundary>
      <div className={`${
        isMobile 
          ? 'min-h-screen min-h-dvh bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany'
          : 'min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany'
      }`}>
        <AppRouter />
        
        <Toaster 
          position={isMobile ? "top-center" : "top-right"}
          toastOptions={{
            duration: isMobile ? 3000 : 4000,
            style: {
              background: '#2c1810',
              color: '#f4f1eb',
              border: '1px solid #8b4513',
              borderRadius: isMobile ? '12px' : '8px',
              padding: isMobile ? '12px 16px' : '16px',
              fontSize: isMobile ? '14px' : '16px',
              marginTop: isMobile ? 'env(safe-area-inset-top)' : '0'
            }
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App