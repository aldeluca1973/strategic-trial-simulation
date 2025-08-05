import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Home, RotateCcw } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'

interface QuitButtonProps {
  onQuitToMenu: () => void
  onRestartCase: () => void
  gamePhase?: string
}

export function QuitButton({ onQuitToMenu, onRestartCase, gamePhase }: QuitButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleQuitClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmQuit = () => {
    // Clear any game state
    localStorage.removeItem('strategic-trial-game-state')
    sessionStorage.clear()
    
    // Reset to main menu
    onQuitToMenu()
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <CourtroomCard>
            <CourtroomCardHeader>
              <CourtroomCardTitle className="text-center">
                Exit Current Trial?
              </CourtroomCardTitle>
            </CourtroomCardHeader>
            <CourtroomCardContent>
              <div className="text-center space-y-4">
                <p className="text-parchment/80">
                  Are you sure you want to exit this trial? 
                  {gamePhase !== 'lobby' && gamePhase !== 'completed' && (
                    <span className="block mt-2 text-sm text-yellow-400">
                      ⚠️ Your progress will be lost
                    </span>
                  )}
                </p>
                
                <div className="flex gap-3 justify-center">
                  <GavelButton
                    variant="ghost"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Continue Trial
                  </GavelButton>
                  
                  <GavelButton
                    variant="accent"
                    onClick={handleConfirmQuit}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <LogOut size={16} />
                    Exit to Menu
                  </GavelButton>
                </div>
                
                {gamePhase !== 'lobby' && (
                  <div className="pt-2 border-t border-gavel-blue/30">
                    <GavelButton
                      variant="secondary"
                      onClick={() => {
                        onRestartCase()
                        setShowConfirm(false)
                      }}
                      className="w-full"
                      size="sm"
                    >
                      <RotateCcw size={14} />
                      Restart This Case
                    </GavelButton>
                  </div>
                )}
              </div>
            </CourtroomCardContent>
          </CourtroomCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <GavelButton
        variant="ghost"
        size="sm"
        onClick={handleQuitClick}
        className="bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/40 backdrop-blur-sm"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Exit Trial</span>
      </GavelButton>
    </div>
  )
}