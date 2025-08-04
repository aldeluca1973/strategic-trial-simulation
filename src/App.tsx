import { AppRouter } from './AppRouter'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany">
        <AppRouter />
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2c1810',
              color: '#f4f1eb',
              border: '1px solid #8b4513'
            }
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App