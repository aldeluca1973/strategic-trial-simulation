import { useState, useEffect, useCallback } from 'react'
import { supabase, GameSession, GameParticipant, LegalCase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useAuth } from './useAuth'

export function useGameSession() {
  const { user } = useAuth()
  const {
    currentGame,
    setCurrentGame,
    participants,
    setParticipants,
    setSelectedCase,
    addNotification
  } = useGameStore()
  
  const [loading, setLoading] = useState(false)

  // Create a new game session
  const createGame = useCallback(async (settings: {
    maxPlayers?: number
    allowSpectators?: boolean
    timeLimit?: number
    preferredRole?: string | null
    selectedCaseId?: string
  } = {}) => {
    if (!user) {
      addNotification({ type: 'error', message: 'You must be logged in to create a game' })
      return null
    }

    setLoading(true)
    try {
      const response = await supabase.functions.invoke('game-session-manager', {
        body: {
          action: 'create_game',
          userId: user.id,
          data: {
            maxPlayers: settings.maxPlayers || 3,
            allowSpectators: settings.allowSpectators || false,
            timeLimit: settings.timeLimit || 300,
            preferredRole: settings.preferredRole,
            selectedCaseId: settings.selectedCaseId
          }
        }
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      const { gameSession, selectedCase } = response.data.data
      setCurrentGame(gameSession)
      setSelectedCase(selectedCase)
      
      addNotification({ 
        type: 'success', 
        message: `Game created! Room code: ${gameSession.room_code}` 
      })
      
      return gameSession
    } catch (error) {
      console.error('Error creating game:', error)
      addNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to create game' 
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [user, setCurrentGame, setSelectedCase, addNotification])

  // Join an existing game session
  const joinGame = useCallback(async (roomCode: string, preferredRole?: string | null) => {
    if (!user) {
      addNotification({ type: 'error', message: 'You must be logged in to join a game' })
      return null
    }

    setLoading(true)
    try {
      const response = await supabase.functions.invoke('game-session-manager', {
        body: {
          action: 'join_game',
          userId: user.id,
          data: { roomCode, preferredRole }
        }
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      const { gameSession, assignedRole, participants: gameParticipants } = response.data.data
      setCurrentGame(gameSession)
      setParticipants(gameParticipants)
      
      if (gameSession.game_settings?.selectedCase) {
        setSelectedCase(gameSession.game_settings.selectedCase)
      }
      
      addNotification({ 
        type: 'success', 
        message: `Joined game as ${assignedRole}!` 
      })
      
      return { gameSession, assignedRole }
    } catch (error) {
      console.error('Error joining game:', error)
      addNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to join game' 
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [user, setCurrentGame, setParticipants, setSelectedCase, addNotification])

  // Advance to next phase (Judge only)
  const advancePhase = useCallback(async () => {
    if (!currentGame || !user) return

    try {
      const response = await supabase.functions.invoke('game-session-manager', {
        body: {
          action: 'advance_phase',
          gameSessionId: currentGame.id,
          userId: user.id,
          data: { currentPhase: currentGame.current_phase }
        }
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      addNotification({ 
        type: 'success', 
        message: `Advanced to ${response.data.data.newPhase} phase` 
      })
    } catch (error) {
      console.error('Error advancing phase:', error)
      addNotification({ 
        type: 'error', 
        message: 'Failed to advance phase' 
      })
    }
  }, [currentGame, user, addNotification])

  // Real-time subscriptions
  useEffect(() => {
    if (!currentGame) return

    // Subscribe to game session updates
    const gameSubscription = supabase
      .channel(`game_session_${currentGame.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${currentGame.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCurrentGame(payload.new as GameSession)
          }
        }
      )
      .subscribe()

    // Subscribe to participants updates
    const participantsSubscription = supabase
      .channel(`game_participants_${currentGame.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `game_session_id=eq.${currentGame.id}`
        },
        async () => {
          // Refetch participants when changes occur
          const { data } = await supabase
            .from('game_participants')
            .select('*')
            .eq('game_session_id', currentGame.id)
            .eq('is_connected', true)
            .order('join_order')

          if (data) {
            setParticipants(data)
          }
        }
      )
      .subscribe()

    return () => {
      gameSubscription.unsubscribe()
      participantsSubscription.unsubscribe()
    }
  }, [currentGame, setCurrentGame, setParticipants])

  return {
    currentGame,
    participants,
    loading,
    createGame,
    joinGame,
    advancePhase
  }
}