import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Smartphone, Bluetooth, Copy, Settings, LogOut, User, Trophy } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { RoleSelector } from './RoleSelector'
import { CaseStatistics } from './CaseStatistics'
import { PlayerDashboard } from '@/components/profile/PlayerDashboard'
import { useGameSession } from '@/hooks/useGameSession'
import { useAuth } from '@/hooks/useAuth'
import { useBluetooth } from '@/hooks/useBluetooth'
import { useGameStore } from '@/stores/gameStore'

interface GameLobbyProps {
  onStartGame: () => void
  onBackToModeSelection?: () => void
}

export function GameLobby({ onStartGame, onBackToModeSelection }: GameLobbyProps) {
  const [showCreateGame, setShowCreateGame] = useState(false)
  const [showJoinGame, setShowJoinGame] = useState(false)
  const [showPlayerDashboard, setShowPlayerDashboard] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(3)
  const [timeLimit, setTimeLimit] = useState(300)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [preferredRoleForJoin, setPreferredRoleForJoin] = useState<string | null>(null)
  
  const { user, signOut } = useAuth()
  const { currentGame, participants, loading, createGame, joinGame } = useGameSession()
  const { 
    isBluetoothAvailable, 
    isConnected: bluetoothConnected, 
    connectBluetooth, 
    shareGameInvitation 
  } = useBluetooth()
  const { addNotification } = useGameStore()

  // Auto-start game when all conditions are met
  useEffect(() => {
    if (currentGame) {
      // Trigger game start immediately when a game is created or joined
      onStartGame()
    }
  }, [currentGame, onStartGame])

  const handleCreateGame = async () => {
    const game = await createGame({ 
      maxPlayers, 
      timeLimit, 
      preferredRole: selectedRole 
    })
    if (game) {
      setShowCreateGame(false)
      setSelectedRole(null)
    }
  }

  const handleJoinGame = async () => {
    if (!roomCode.trim()) {
      addNotification({ type: 'error', message: 'Please enter a room code' })
      return
    }
    
    const result = await joinGame(roomCode.toUpperCase(), preferredRoleForJoin)
    if (result) {
      setShowJoinGame(false)
      setRoomCode('')
      setPreferredRoleForJoin(null)
    }
  }

  const copyRoomCode = async () => {
    if (currentGame?.room_code) {
      try {
        await navigator.clipboard.writeText(currentGame.room_code)
        addNotification({ type: 'success', message: 'Room code copied to clipboard!' })
      } catch {
        addNotification({ type: 'error', message: 'Failed to copy room code' })
      }
    }
  }

  const shareViaBluetooth = async () => {
    if (currentGame && currentGame.game_settings?.selectedCase) {
      const success = await shareGameInvitation(
        currentGame.room_code,
        currentGame.game_settings.selectedCase.case_name
      )
      if (success) {
        addNotification({ type: 'success', message: 'Game invitation sent via Bluetooth!' })
      }
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // If in a game, show the game lobby
  if (currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-verdict-gold mb-2">
              Game Lobby
            </h1>
            <p className="text-parchment/80">Room Code: 
              <span className="font-mono text-verdict-gold mx-2 text-xl">
                {currentGame.room_code}
              </span>
              <GavelButton variant="ghost" size="sm" onClick={copyRoomCode}>
                <Copy size={16} />
              </GavelButton>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Case Information and Statistics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <CourtroomCard>
                <CourtroomCardHeader>
                  <CourtroomCardTitle>Selected Case</CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  {currentGame.game_settings?.selectedCase ? (
                    <div className="space-y-3">
                      <h3 className="font-serif text-lg text-verdict-gold">
                        {currentGame.game_settings.selectedCase.case_name}
                      </h3>
                      <div className="text-sm text-parchment/70">
                        <span className="font-medium">Year:</span> {currentGame.game_settings.selectedCase.year} • 
                        <span className="font-medium">Location:</span> {currentGame.game_settings.selectedCase.location}
                      </div>
                      <p className="text-sm text-parchment/80 leading-relaxed">
                        {currentGame.game_settings.selectedCase.case_background}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-verdict-gold/20 text-verdict-gold rounded">
                          Difficulty: {currentGame.game_settings.selectedCase.difficulty_level}/5
                        </span>
                        <span className="px-2 py-1 bg-gavel-blue/50 text-parchment rounded">
                          {currentGame.game_settings.selectedCase.case_category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-parchment/60">Loading case information...</p>
                  )}
                </CourtroomCardContent>
              </CourtroomCard>
              
              {/* Case Statistics */}
              {currentGame.game_settings?.selectedCase && (
                <CaseStatistics selectedCase={currentGame.game_settings.selectedCase} />
              )}
            </motion.div>

            {/* Players */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CourtroomCard>
                <CourtroomCardHeader>
                  <CourtroomCardTitle>Players ({participants.length}/{currentGame.max_players})</CourtroomCardTitle>
                </CourtroomCardHeader>
                <CourtroomCardContent>
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gavel-blue/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            participant.is_connected ? 'bg-green-400' : 'bg-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-parchment">
                              Player {participant.join_order}
                              {participant.user_id === currentGame.host_user_id && ' (Host)'}
                              {participant.user_id === user?.id && ' (You)'}
                            </p>
                            <p className="text-xs text-parchment/60 capitalize">
                              {participant.role}
                            </p>
                          </div>
                        </div>
                        {participant.is_connected && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                      </motion.div>
                    ))}
                    
                    {/* Empty slots */}
                    {Array.from({ length: currentGame.max_players - participants.length }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="flex items-center gap-3 p-3 bg-gavel-blue/10 rounded-lg border-2 border-dashed border-verdict-gold/30"
                      >
                        <div className="w-3 h-3 rounded-full bg-gray-600" />
                        <p className="text-parchment/40">Waiting for player...</p>
                      </div>
                    ))}
                  </div>
                </CourtroomCardContent>
              </CourtroomCard>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* Bluetooth Share */}
            {isBluetoothAvailable && (
              <GavelButton
                variant="secondary"
                onClick={bluetoothConnected ? shareViaBluetooth : connectBluetooth}
                disabled={loading}
              >
                <Bluetooth size={16} />
                {bluetoothConnected ? 'Share via Bluetooth' : 'Connect Bluetooth'}
              </GavelButton>
            )}

            {/* Start Game (Host only) */}
            {currentGame.host_user_id === user?.id && (
              <GavelButton
                variant="accent"
                size="lg"
                onClick={() => onStartGame()}
                disabled={participants.length < 1}
              >
                Start Trial
              </GavelButton>
            )}
            
            {/* Leave Game */}
            <GavelButton
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              Leave Game
            </GavelButton>
          </motion.div>
        </div>
      </div>
    )
  }

  // Main lobby menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-verdict-gold mb-2">
            The Virtual Gavel
          </h1>
          <p className="text-parchment/80 text-lg">
            Welcome back, {user?.user_metadata?.full_name || user?.email}!
          </p>
          <div className="flex gap-2 justify-center mt-2">
            <GavelButton
              variant="ghost"
              size="sm"
              onClick={() => setShowPlayerDashboard(true)}
            >
              <User size={16} />
              Profile
            </GavelButton>
            <GavelButton
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              Sign Out
            </GavelButton>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* Create Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CourtroomCard className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowCreateGame(true)}>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-3">
                  <Plus className="text-verdict-gold" size={24} />
                  Create New Game
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <p className="text-parchment/70">
                  Start a new trial simulation and invite friends to join as attorneys or judge.
                </p>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>

          {/* Join Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CourtroomCard className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowJoinGame(true)}>
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-3">
                  <Users className="text-verdict-gold" size={24} />
                  Join Existing Game
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <p className="text-parchment/70">
                  Enter a room code to join an ongoing trial simulation.
                </p>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>

          {/* Practice Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CourtroomCard className="cursor-pointer hover:scale-105 transition-transform opacity-75">
              <CourtroomCardHeader>
                <CourtroomCardTitle className="flex items-center gap-3">
                  <Smartphone className="text-verdict-gold" size={24} />
                  Practice Mode
                  <span className="text-xs bg-verdict-gold/20 text-verdict-gold px-2 py-1 rounded">Coming Soon</span>
                </CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <p className="text-parchment/70">
                  Practice your legal arguments against AI opponents.
                </p>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>
        </div>
      </div>

      {/* Create Game Modal */}
      {showCreateGame && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>Create New Game</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-6">
                  {/* Role Selection */}
                  <div>
                    <RoleSelector
                      selectedRole={selectedRole}
                      onRoleSelect={setSelectedRole}
                      userPreferences={{
                        preferred_role_1: user?.user_metadata?.preferred_role_1,
                        preferred_role_2: user?.user_metadata?.preferred_role_2,
                        preferred_role_3: user?.user_metadata?.preferred_role_3
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-parchment mb-1">
                        Max Players
                      </label>
                      <select
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment focus:outline-none focus:ring-2 focus:ring-verdict-gold"
                      >
                        <option value={1}>1 Player (Solo)</option>
                        <option value={2}>2 Players</option>
                        <option value={3}>3 Players</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-parchment mb-1">
                        Time Limit (minutes)
                      </label>
                      <select
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment focus:outline-none focus:ring-2 focus:ring-verdict-gold"
                      >
                        <option value={180}>3 minutes</option>
                        <option value={300}>5 minutes</option>
                        <option value={600}>10 minutes</option>
                        <option value={900}>15 minutes</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <GavelButton
                    variant="accent"
                    onClick={handleCreateGame}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Game'}
                  </GavelButton>
                  <GavelButton
                    variant="ghost"
                    onClick={() => setShowCreateGame(false)}
                    className="flex-1"
                  >
                    Cancel
                  </GavelButton>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>
        </div>
      )}

      {/* Join Game Modal */}
      {showJoinGame && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <CourtroomCard>
              <CourtroomCardHeader>
                <CourtroomCardTitle>Join Game</CourtroomCardTitle>
              </CourtroomCardHeader>
              <CourtroomCardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-parchment mb-1">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment placeholder-parchment/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold font-mono text-center text-lg tracking-wider"
                      placeholder="ABCD12"
                      maxLength={6}
                    />
                  </div>
                  
                  {/* Role Preference for Joining */}
                  <div>
                    <label className="block text-sm font-medium text-parchment mb-2">
                      Preferred Role (Optional)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['judge', 'prosecutor', 'defense'] as const).map((role) => (
                        <GavelButton
                          key={role}
                          variant={preferredRoleForJoin === role ? 'accent' : 'ghost'}
                          size="sm"
                          onClick={() => setPreferredRoleForJoin(
                            preferredRoleForJoin === role ? null : role
                          )}
                          className="capitalize text-xs"
                        >
                          {role}
                        </GavelButton>
                      ))}
                    </div>
                    <p className="text-xs text-parchment/60 mt-1">
                      We'll try to assign your preferred role if available
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <GavelButton
                    variant="accent"
                    onClick={handleJoinGame}
                    disabled={loading || !roomCode.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Joining...' : 'Join Game'}
                  </GavelButton>
                  <GavelButton
                    variant="ghost"
                    onClick={() => {
                      setShowJoinGame(false)
                      setRoomCode('')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </GavelButton>
                </div>
              </CourtroomCardContent>
            </CourtroomCard>
          </motion.div>
        </div>
      )}
      
      {/* Player Dashboard Modal */}
      {showPlayerDashboard && (
        <PlayerDashboard onClose={() => setShowPlayerDashboard(false)} />
      )}
    </div>
  )
}