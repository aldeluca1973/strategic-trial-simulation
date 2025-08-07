import { AppRouter } from './AppRouter'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import { CourtSimulator } from '@/components/game/CourtSimulator'

// NUCLEAR OPTION - BYPASS ALL ROUTING
// This version bypasses the router completely and directly renders the courtroom component
function App() {
  // The function that would normally be provided by the router
  const handleGameEnd = () => {
    console.log('Game ended - this is a direct render bypass of router')
    alert('You exited the trial. Please refresh the page to continue.')
  }

  console.log('DIRECT RENDER MODE - Bypassing router')
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany">
        {/* FORCE DIRECT RENDERING: Comment out normal router */}
        {/* <AppRouter /> */}
        
        {/* FORCE DIRECT RENDERING: Directly render our component */}
        <CourtSimulator onGameEnd={handleGameEnd} />
        
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