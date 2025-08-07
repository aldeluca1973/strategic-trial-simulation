import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGameStore } from '@/stores/gameStore'
import { AuthPage } from '@/components/auth/AuthPage'
import { ConfirmationPage } from '@/components/auth/ConfirmationPage'
import { GameLobby } from '@/components/lobby/GameLobby'
import { StrategicCourtroom } from '@/components/game/StrategicCourtroom'
import { PlayerDashboard } from '@/components/profile/PlayerDashboard'
import { ModeSelection, GameMode } from '@/components/ModeSelection'
import { JuniorJusticeGame } from '@/components/junior/JuniorJusticeGame'
import { LegalMasterMode } from '@/components/master/LegalMasterMode'
import { TrainingAcademy, CareerProgression } from '@/components/career'

export function AppRouter() {
  const { user, loading, error } = useAuth()
  const { currentGame, currentView, selectedGameMode, setCurrentView, setSelectedGameMode, clearGame } = useGameStore()
  const [showCareerProgression, setShowCareerProgression] = useState(false)
  const [showTrainingAcademy, setShowTrainingAcademy] = useState(false)

  // Check if this is an email confirmation request
  const isConfirmationPage = window.location.pathname === '/auth/confirm' || window.location.search.includes('token=')

  // Handle authentication state and navigation
  useEffect(() => {
    if (!loading && !error) {
      console.log('Navigation check:', { user: !!user, selectedGameMode, currentGame: !!currentGame, currentView })
      
      if (!user) {
        console.log('No user, showing auth')
        setCurrentView('auth')
      } else if (!selectedGameMode) {
        console.log('No game mode selected, showing mode selection')
        setCurrentView('mode-selection')
      } else if (selectedGameMode === 'standard' && !currentGame) {
        console.log('Standard mode selected but no game, showing lobby')
        setCurrentView('lobby')
      } else if (selectedGameMode === 'training') {
        console.log('Training mode selected, showing training academy')
        setShowTrainingAcademy(true)
      } else if (selectedGameMode === 'career') {
        console.log('Career mode selected, showing career progression')
        setShowCareerProgression(true)
      } else if ((selectedGameMode === 'junior' || selectedGameMode === 'master') && currentView !== 'game') {
        console.log('Non-standard mode selected, showing game')
        setCurrentView('game')
      }
    }
  }, [user, loading, error, currentGame, selectedGameMode, currentView, setCurrentView])

  // Navigation handlers
  const handleGameEnd = () => {
    clearGame()
    if (selectedGameMode === 'standard') {
      setCurrentView('lobby')
    } else {
      setCurrentView('mode-selection')
    }
  }

  const handleModeSelect = (mode: GameMode) => {
    setSelectedGameMode(mode)
    if (mode === 'standard') {
      setCurrentView('lobby')
    } else if (mode === 'training') {
      setShowTrainingAcademy(true)
    } else if (mode === 'career') {
      setShowCareerProgression(true)
    } else {
      setCurrentView('game')
    }
  }

  const handleBackToModeSelection = () => {
    setSelectedGameMode(null)
    setCurrentView('mode-selection')
    setShowCareerProgression(false)
    setShowTrainingAcademy(false)
    clearGame()
  }

  const handleCloseCareer = () => {
    setShowCareerProgression(false)
    setCurrentView('mode-selection')
  }

  const handleCloseTraining = () => {
    setShowTrainingAcademy(false)
    setCurrentView('mode-selection')
  }

  const handleStartCase = (caseId: number) => {
    // TODO: Initialize game with specific career case
    console.log('Starting career case:', caseId)
    setCurrentView('game')
  }

  const handleStartGameFromTraining = (mode: string) => {
    if (mode === 'career') {
      setShowTrainingAcademy(false)
      setShowCareerProgression(true)
    } else {
      setShowTrainingAcademy(false)
      setSelectedGameMode('standard')
      setCurrentView('lobby')
    }
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-parchment mb-2">Connection Error</h2>
          <p className="text-parchment/80 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-verdict-gold hover:bg-verdict-gold/80 text-mahogany px-4 py-2 rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <svg className="w-12 h-12 text-verdict-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-parchment text-lg">Loading Legal Education Platform...</p>
          <p className="text-parchment/60 text-sm mt-2">This should only take a few seconds</p>
        </div>
      </div>
    )
  }

  // Handle email confirmation page first
  if (isConfirmationPage) {
    return <ConfirmationPage />
  }

  // Route rendering logic
  return (
    <>
      {/* Authentication View */}
      {currentView === 'auth' && (
        <AuthPage onAuthenticated={() => setCurrentView('mode-selection')} />
      )}
      
      {/* Mode Selection View */}
      {currentView === 'mode-selection' && (
        <ModeSelection onModeSelect={handleModeSelect} />
      )}
      
      {/* Standard Mode - Game Lobby */}
      {currentView === 'lobby' && selectedGameMode === 'standard' && (
        <GameLobby 
          onStartGame={() => setCurrentView('game')} 
          onBackToModeSelection={handleBackToModeSelection}
        />
      )}
      
      {/* Player Dashboard/Profile */}
      {currentView === 'profile' && (
        <PlayerDashboard onClose={() => setCurrentView('lobby')} />
      )}
      
      {/* Standard Mode - Strategic Courtroom Game */}
      {currentView === 'game' && selectedGameMode === 'standard' && currentGame && (
        <StrategicCourtroom onGameEnd={handleGameEnd} />
      )}
      
      {/* Junior Justice Mode */}
      {currentView === 'game' && selectedGameMode === 'junior' && (
        <JuniorJusticeGame onBackToMenu={handleBackToModeSelection} />
      )}
      
      {/* Legal Master Mode */}
      {currentView === 'game' && selectedGameMode === 'master' && (
        <LegalMasterMode onBackToMenu={handleBackToModeSelection} />
      )}
      
      {/* Training Academy */}
      {showTrainingAcademy && (
        <TrainingAcademy 
          onClose={handleCloseTraining}
          onStartGame={handleStartGameFromTraining}
        />
      )}
      
      {/* Career Progression */}
      {showCareerProgression && (
        <CareerProgression 
          onClose={handleCloseCareer}
          onStartCase={handleStartCase}
          onViewTraining={() => {
            setShowCareerProgression(false)
            setShowTrainingAcademy(true)
          }}
        />
      )}
    </>
  )
}