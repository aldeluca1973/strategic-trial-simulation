import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gavel, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGameStore } from '@/stores/gameStore'
import { useIsMobile } from '@/hooks/use-mobile'
import { LegalCase, supabase } from '@/lib/supabase'
import { AuthPage } from '@/components/auth/AuthPage'
import { ConfirmationPage } from '@/components/auth/ConfirmationPage'
import { GameLobby } from '@/components/lobby/GameLobby'
import { StrategicCourtroom } from '@/components/game/StrategicCourtroom'
import { PlayerDashboard } from '@/components/profile/PlayerDashboard'
import { ModeSelection, GameMode } from '@/components/ModeSelection'
import { JuniorJusticeGame } from '@/components/junior/JuniorJusticeGame'
import { LegalMasterMode } from '@/components/master/LegalMasterMode'
import { TrainingAcademy, CareerProgression } from '@/components/career'
import { QuickGameFilter, CasePreview } from '@/components/quick-game'
import { EnhancedRoleSelector } from '@/components/lobby/EnhancedRoleSelector'
import { GavelButton } from '@/components/ui/gavel-button'
// Mobile-first components
import { 
  MobileBottomNav, 
  MobileHeader, 
  MobilePageWrapper, 
  MobileGameModes,
  MobileCaseList,
  MobileCourtroom,
  useMobileNavigation
} from '@/components/mobile'
import { MobileQuickGameSetup } from '@/components/mobile/MobileQuickGameSetup'
import { MobileCasePreview } from '@/components/mobile/MobileCasePreview'
import { MobileAuthPage } from '@/components/mobile/MobileAuthPage'
import { MobileRoleSelector } from '@/components/mobile/MobileRoleSelector'

export function AppRouter() {
  const { user, loading, error } = useAuth()
  const isMobile = useIsMobile()
  const { getContentClasses } = useMobileNavigation()
  const { 
    currentGame, 
    currentView, 
    selectedGameMode, 
    hasHydrated,
    setCurrentView, 
    setSelectedGameMode, 
    clearGame, 
    resetToAuth,
    setCurrentGame,
    setSelectedCase,
    addNotification
  } = useGameStore()

  const [navigationTimeout, setNavigationTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Separate page state management - REAL PAGE SEPARATION
  const [currentPage, setCurrentPage] = useState<'auth' | 'mode-selection' | 'quick-game-setup' | 'case-preview' | 'role-selection' | 'game' | 'career' | 'training'>('auth')
  
  // Quick Game filtering state
  const [filteredCases, setFilteredCases] = useState<LegalCase[]>([])
  const [selectedCaseForQuickGame, setSelectedCaseForQuickGame] = useState<LegalCase | null>(null)
  const [selectedRoleForQuickGame, setSelectedRoleForQuickGame] = useState<string | null>(null)
  const [quickGameSettings, setQuickGameSettings] = useState<{
    playerMode: string
    timeLimit: number
    allowRandom: boolean
  } | null>(null)

  // Check if this is an email confirmation request
  const isConfirmationPage = window.location.pathname === '/auth/confirm' || window.location.search.includes('token=')
  
  // Debug mode bypass for testing (check for ?debug=filter parameter)
  const isDebugMode = window.location.search.includes('debug=filter')
  const [debugModeActive, setDebugModeActive] = useState(false)

  // Handle debug mode activation
  useEffect(() => {
    if (isDebugMode && !debugModeActive) {
      console.log('Debug mode activated - bypassing authentication')
      setDebugModeActive(true)
      setSelectedGameMode('standard')
      setCurrentPage('quick-game-setup')
    }
  }, [isDebugMode, debugModeActive])
  
  // REAL PAGE NAVIGATION SYSTEM
  useEffect(() => {
    // Skip auth checks in debug mode
    if (debugModeActive) {
      return
    }
    
    // Wait for both auth and store hydration before making navigation decisions
    if (!loading && hasHydrated && !error) {
      console.log('=== REAL PAGE NAVIGATION ===', { 
        user: !!user, 
        selectedGameMode, 
        currentGame: !!currentGame, 
        currentPage,
        hasHydrated 
      })
      
      // Clear any existing navigation timeout
      if (navigationTimeout) {
        clearTimeout(navigationTimeout)
        setNavigationTimeout(null)
      }
      
      if (!user) {
        console.log('No user, showing auth PAGE')
        setCurrentPage('auth')
      } else if (!selectedGameMode && currentPage === 'auth') {
        console.log('User authenticated, showing mode selection PAGE')
        setCurrentPage('mode-selection')
      } else if (selectedGameMode === 'standard' && currentPage === 'mode-selection') {
        console.log('Virtual Courtroom selected, showing quick game setup PAGE')
        setCurrentPage('quick-game-setup')
      } else if (selectedGameMode === 'training' && currentPage === 'mode-selection') {
        console.log('Training mode selected, showing training PAGE')
        setCurrentPage('training')
      } else if (selectedGameMode === 'career' && currentPage === 'mode-selection') {
        console.log('Career mode selected, showing career PAGE')
        setCurrentPage('career')
      } else if ((selectedGameMode === 'junior' || selectedGameMode === 'master') && currentPage === 'mode-selection') {
        console.log('Non-standard mode selected, showing game PAGE')
        setCurrentPage('game')
      }
    }
  }, [user, loading, error, currentGame, selectedGameMode, currentPage, hasHydrated, navigationTimeout])

  // Fallback navigation timeout to prevent infinite loading
  useEffect(() => {
    if (loading || !hasHydrated) {
      const timeout = setTimeout(() => {
        console.log('Navigation timeout reached, forcing fallback navigation')
        if (!user) {
          setCurrentPage('auth')
        } else {
          setCurrentPage('mode-selection')
        }
      }, 20000) // 20 second fallback timeout (increased from 15)
      
      setNavigationTimeout(timeout)
      
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [loading, hasHydrated, user])

  // Cleanup navigation timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeout) {
        clearTimeout(navigationTimeout)
      }
    }
  }, [navigationTimeout])

  // Navigation handlers
  const handleGameEnd = () => {
    console.log('=== GAME END - RETURNING TO MAIN MENU ===')
    clearGame()
    // Always return to main menu (mode selection) regardless of game mode
    // This provides a consistent exit experience
    setCurrentPage('mode-selection')
    setSelectedGameMode(null)
    
    // Clear all quick game states
    setSelectedCaseForQuickGame(null)
    setSelectedRoleForQuickGame(null)
    setQuickGameSettings(null)
    setFilteredCases([])
    
    addNotification({ 
      type: 'info', 
      message: '🏠 Returned to main menu' 
    })
  }

  const handleModeSelect = (mode: GameMode) => {
    console.log('=== MODE SELECTED ===', mode)
    setSelectedGameMode(mode)
    
    if (mode === 'standard') {
      console.log('Going to QUICK GAME SETUP PAGE')
      setCurrentPage('quick-game-setup')
    } else if (mode === 'training') {
      console.log('Going to TRAINING PAGE')
      setCurrentPage('training')
    } else if (mode === 'career') {
      console.log('Going to CAREER PAGE')
      setCurrentPage('career')
    } else {
      console.log('Going to GAME PAGE')
      setCurrentPage('game')
    }
  }

  const handleBackToModeSelection = () => {
    console.log('=== BACK TO MODE SELECTION PAGE ===')
    setSelectedGameMode(null)
    setCurrentPage('mode-selection')
    // Clear all game state
    setFilteredCases([])
    setSelectedCaseForQuickGame(null)
    setQuickGameSettings(null)
    clearGame()
  }

  const handleCloseCareer = () => {
    console.log('=== CLOSING CAREER PAGE ===')
    setCurrentPage('mode-selection')
  }

  const handleCloseTraining = () => {
    console.log('=== CLOSING TRAINING PAGE ===')
    setCurrentPage('mode-selection')
  }

  const handleStartCase = (caseId: number) => {
    // TODO: Initialize game with specific career case
    console.log('Starting career case:', caseId)
    setCurrentView('game')
  }

  const handleStartGameFromTraining = (mode: string) => {
    if (mode === 'career') {
      setCurrentPage('career')
    } else {
      setSelectedGameMode('standard')
      setCurrentPage('quick-game-setup')
    }
  }
  
  // Quick Game filter handlers
  const handleCasesFiltered = (cases: LegalCase[], gameSettings?: {
    playerMode: string
    timeLimit: number
    allowRandom: boolean
  }) => {
    console.log('=== CASES FILTERED - GOING TO CASE PREVIEW PAGE ===')
    setFilteredCases(cases)
    setQuickGameSettings(gameSettings || null)
    setCurrentPage('case-preview')
  }
  
  const handleRandomGameStart = (randomCase: LegalCase, gameSettings: {
    playerMode: string
    timeLimit: number
    allowRandom: boolean
  }) => {
    console.log('=== DIRECT RANDOM GAME START - SKIPPING TO GAME PAGE ===')
    console.log('Random case:', randomCase.case_name)
    
    // Skip all previews and role selection - go straight to game
    setSelectedCaseForQuickGame(randomCase)
    setQuickGameSettings(gameSettings)
    
    // Auto-assign prosecutor role for instant play
    const quickRole = 'prosecutor'
    setSelectedRoleForQuickGame(quickRole)
    
    addNotification({ 
      type: 'info', 
      message: `🎲 Random case selected! Starting as Prosecutor...` 
    })
    
    // Create game immediately
    handleAutoCreateGame(randomCase, gameSettings, quickRole)
  }
  
  const handleCaseSelect = (selectedCase: LegalCase, gameSettings?: any) => {
    console.log('=== CASE SELECTED - GOING TO ROLE SELECTION PAGE ===')
    setSelectedCaseForQuickGame(selectedCase)
    setQuickGameSettings(gameSettings || quickGameSettings)
    setCurrentPage('role-selection')
  }
  
  const handleBackToFilter = () => {
    console.log('=== BACK TO QUICK GAME SETUP PAGE ===')
    setCurrentPage('quick-game-setup')
    setFilteredCases([])
  }
  
  const handleBackToFilterFromLobby = () => {
    console.log('=== BACK TO MODE SELECTION FROM LOBBY ===')
    setCurrentPage('mode-selection')
    setSelectedCaseForQuickGame(null)
    setSelectedRoleForQuickGame(null)
    setQuickGameSettings(null)
    setFilteredCases([])
    clearGame()
  }
  
  const handleRoleSelect = (role: string) => {
    console.log('=== ROLE SELECTED - CREATING GAME ===')
    setSelectedRoleForQuickGame(role)
    // Now create the game with the selected role
    handleAutoCreateGame(selectedCaseForQuickGame, quickGameSettings, role)
  }
  
  const handleBackToCase = () => {
    console.log('=== BACK TO CASE PREVIEW PAGE ===')
    setCurrentPage('case-preview')
    setSelectedRoleForQuickGame(null)
  }
  
  // Auto-create game with pre-selected settings
  const handleAutoCreateGame = async (selectedCase?: LegalCase, gameSettings?: any, selectedRole?: string) => {
    const caseToUse = selectedCase || selectedCaseForQuickGame
    const settingsToUse = gameSettings || quickGameSettings
    
    if (!caseToUse || !settingsToUse || !user) return
    
    const maxPlayers = settingsToUse.playerMode === 'solo' ? 1 : 
                      settingsToUse.playerMode === '2player' ? 2 : 3
    
    try {
      
      const response = await supabase.functions.invoke('game-session-manager', {
        body: {
          action: 'create_game',
          userId: user.id,
          data: {
            maxPlayers,
            allowSpectators: false,
            timeLimit: settingsToUse.timeLimit,
            preferredRole: selectedRole || selectedRoleForQuickGame || (settingsToUse.playerMode === 'solo' ? 'prosecutor' : null),
            selectedCaseId: caseToUse.id,
            preSelectedCase: caseToUse
          }
        }
      })
      
      if (response.error) {
        throw new Error(response.error.message)
      }
      
      const { gameSession } = response.data.data
      setCurrentGame(gameSession)
      setSelectedCase(caseToUse)
      
      // Go directly to game
      setCurrentPage('game')
      
    } catch (error) {
      console.error('Auto game creation failed:', error)
      console.error('Error details:', error)
      
      // Try simplified direct game creation without edge function
      try {
        console.log('Attempting simplified game creation...')
        
        // Create game session directly in database
        const gameSessionData = {
          room_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          host_user_id: user.id,
          case_id: caseToUse.id,
          current_phase: 'lobby',
          max_players: maxPlayers,
          is_active: true,
          game_settings: {
            selectedCase: caseToUse,
            allowSpectators: false,
            timeLimit: settingsToUse.timeLimit,
            playerMode: settingsToUse.playerMode
          }
        }
        
        const { data: gameSession, error: createError } = await supabase
          .from('game_sessions')
          .insert([gameSessionData])
          .select()
          .single()
        
        if (createError) throw createError
        
        console.log('Direct game creation successful:', gameSession)
        setCurrentGame(gameSession)
        setSelectedCase(caseToUse)
        setCurrentPage('game')
        
        addNotification({ 
          type: 'success', 
          message: 'Game created successfully! Starting trial...' 
        })
        
      } catch (fallbackError) {
        console.error('Simplified game creation also failed:', fallbackError)
        addNotification({ 
          type: 'error', 
          message: 'Unable to create game. Please try again.' 
        })
        
        // Stay on role selection page so user can try again
        // Don't navigate away - this was causing the bug!
        console.log('Staying on role selection page for retry')
      }
    }
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Courtroom Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/courtroom-background.jpg)',
          }}
        />
        
        {/* Dark Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gavel-blue/80 via-gavel-blue-700/85 to-mahogany/80" />
        
        <div className="text-center max-w-md mx-auto p-6 relative z-10">
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

  // Loading state - wait for both auth and store hydration
  if (loading || !hasHydrated) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Courtroom Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/courtroom-background.jpg)',
          }}
        />
        
        {/* Dark Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gavel-blue/80 via-gavel-blue-700/85 to-mahogany/80" />
        
        <div className="text-center relative z-10">
          <div className="animate-spin mb-4">
            <svg className="w-12 h-12 text-verdict-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-parchment text-lg">Loading Strategic Trial Simulation...</p>
          <p className="text-parchment/60 text-sm mt-2">
            {!hasHydrated ? 'Restoring your session...' : 'This should only take a few seconds'}
          </p>
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
      {/* Debug Mode - Direct Access to Filter */}
      {debugModeActive && currentPage === 'quick-game-setup' && (
        isMobile ? (
          <MobileQuickGameSetup 
            onCasesFiltered={handleCasesFiltered}
            onRandomGameStart={handleRandomGameStart}
            onBack={() => {
              setDebugModeActive(false)
              setCurrentPage('mode-selection')
              window.location.href = window.location.pathname // Remove debug parameter
            }}
          />
        ) : (
          <QuickGameFilter 
            onCasesFiltered={handleCasesFiltered}
            onRandomGameStart={handleRandomGameStart}
            onBack={() => {
              setDebugModeActive(false)
              setCurrentPage('mode-selection')
              window.location.href = window.location.pathname // Remove debug parameter
            }}
          />
        )
      )}
      
      {/* Debug Mode - Case Preview */}
      {debugModeActive && currentPage === 'case-preview' && (
        isMobile ? (
          <MobileCasePreview 
            cases={filteredCases}
            gameSettings={quickGameSettings || undefined}
            onCaseSelect={() => {
              alert('Debug mode: Case selection successful! In real mode, this would start the game.')
            }}
            onBack={handleBackToFilter}
          />
        ) : (
          <CasePreview 
            cases={filteredCases}
            gameSettings={quickGameSettings || undefined}
            onCaseSelect={() => {
              alert('Debug mode: Case selection successful! In real mode, this would start the game.')
            }}
            onBack={handleBackToFilter}
          />
        )
      )}
      
      {/* Skip all other views if in debug mode */}
      {!debugModeActive && (
        <>
          {/* REAL PAGE SYSTEM - Authentication Page */}
          {currentPage === 'auth' && (
            isMobile ? (
              <MobileAuthPage onAuthenticated={() => setCurrentPage('mode-selection')} />
            ) : (
              <AuthPage onAuthenticated={() => setCurrentPage('mode-selection')} />
            )
          )}
      
      {/* REAL PAGE SYSTEM - Mode Selection Page */}
      {currentPage === 'mode-selection' && (
        <ModeSelection onModeSelect={handleModeSelect} />
      )}
      
      {/* REAL PAGE SYSTEM - Quick Game Setup Page */}
      {currentPage === 'quick-game-setup' && (
        isMobile ? (
          <MobileQuickGameSetup 
            onCasesFiltered={handleCasesFiltered}
            onRandomGameStart={handleRandomGameStart}
            onBack={handleBackToModeSelection}
          />
        ) : (
          <QuickGameFilter 
            onCasesFiltered={handleCasesFiltered}
            onRandomGameStart={handleRandomGameStart}
            onBack={handleBackToModeSelection}
          />
        )
      )}
      
      {/* REAL PAGE SYSTEM - Case Preview Page */}
      {currentPage === 'case-preview' && (
        isMobile ? (
          <MobileCasePreview 
            cases={filteredCases}
            gameSettings={quickGameSettings || undefined}
            onCaseSelect={handleCaseSelect}
            onBack={handleBackToFilter}
          />
        ) : (
          <CasePreview 
            cases={filteredCases}
            gameSettings={quickGameSettings || undefined}
            onCaseSelect={handleCaseSelect}
            onBack={handleBackToFilter}
          />
        )
      )}
      
      {/* REAL PAGE SYSTEM - Role Selection Page */}
      {currentPage === 'role-selection' && selectedCaseForQuickGame && quickGameSettings && (
        isMobile ? (
          <MobileRoleSelector
            selectedCase={selectedCaseForQuickGame}
            gameSettings={quickGameSettings}
            selectedRole={selectedRoleForQuickGame}
            onRoleSelect={handleRoleSelect}
            onBack={handleBackToCase}
          />
        ) : (
          <div className="min-h-screen relative p-4">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/courtroom-background.jpg')`
              }}
            />
            
            <div className="relative z-10 max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <Gavel className="text-verdict-gold mx-auto mb-4" size={48} />
                  <h1 className="text-4xl font-serif font-bold text-verdict-gold mb-2">
                    Choose Your Role
                  </h1>
                  <p className="text-parchment/80 text-lg">
                    Selected Case: <span className="text-verdict-gold font-medium">{selectedCaseForQuickGame.case_name}</span>
                  </p>
                  <p className="text-parchment/60 text-sm mt-2">
                    Game Mode: {quickGameSettings?.playerMode === 'solo' ? 'Solo Practice' : 'Multiplayer'} • 
                    Time Limit: {quickGameSettings?.timeLimit ? `${quickGameSettings.timeLimit} minutes` : 'Standard'}
                  </p>
                </motion.div>
              </div>
              
              {/* Role Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <EnhancedRoleSelector
                  selectedRole={selectedRoleForQuickGame}
                  onRoleSelect={handleRoleSelect}
                  userPreferences={{
                    preferred_role_1: user?.user_metadata?.preferred_role_1,
                    preferred_role_2: user?.user_metadata?.preferred_role_2,
                    preferred_role_3: user?.user_metadata?.preferred_role_3
                  }}
                  gameMode={quickGameSettings?.playerMode === 'solo' ? 'solo' : 'multiplayer'}
                />
              </motion.div>
              
              {/* Navigation */}
              <div className="flex justify-center mt-8">
                <GavelButton
                  variant="ghost"
                  onClick={handleBackToCase}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Case Selection
                </GavelButton>
              </div>
            </div>
          </div>
        )
      )}
      
      {/* REAL PAGE SYSTEM - Game Page */}
      {currentPage === 'game' && (
        <>
          {selectedGameMode === 'standard' && currentGame && (
            <StrategicCourtroom onGameEnd={handleGameEnd} />
          )}
          
          {selectedGameMode === 'junior' && (
            <JuniorJusticeGame onBackToMenu={handleBackToModeSelection} />
          )}
          
          {selectedGameMode === 'master' && (
            <LegalMasterMode onBackToMenu={handleBackToModeSelection} />
          )}
        </>
      )}
      
      {/* REAL PAGE SYSTEM - Training Page */}
      {currentPage === 'training' && (
        <TrainingAcademy 
          onClose={handleCloseTraining}
          onStartGame={handleStartGameFromTraining}
        />
      )}
      
      {/* REAL PAGE SYSTEM - Career Page */}
      {currentPage === 'career' && (
        <CareerProgression 
          onClose={handleCloseCareer}
          onStartCase={handleStartCase}
          onViewTraining={() => {
            setCurrentPage('training')
          }}
        />
      )}
        </>
      )}
      
      {/* Mobile Bottom Navigation - Show on non-game pages */}
      {!debugModeActive && currentPage !== 'auth' && currentPage !== 'game' && (
        <MobileBottomNav
          currentPage={currentPage}
          onNavigate={(page) => {
            console.log('Mobile nav navigation to:', page)
            setCurrentPage(page as 'auth' | 'mode-selection' | 'quick-game-setup' | 'case-preview' | 'role-selection' | 'game' | 'career' | 'training')
          }}
          inGame={currentPage.includes('game')}
        />
      )}
    </>
  )
}