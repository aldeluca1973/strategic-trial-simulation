import { create } from 'zustand'
import { GameSession, GameParticipant, LegalCase, Profile } from '@/lib/supabase'

// Game Mode Types
export type GameMode = 'training' | 'career' | 'junior' | 'standard' | 'master'

// Bluetooth types
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice: (options: any) => Promise<BluetoothDevice>
      getDevices: () => Promise<BluetoothDevice[]>
    }
  }
}

interface BluetoothDevice {
  id: string
  name?: string
  gatt?: {
    connected: boolean
    connect: () => Promise<{
      getPrimaryService: (uuid: string) => Promise<{
        getCharacteristics: () => Promise<any[]>
        getCharacteristic: (uuid: string) => Promise<{
          writeValue: (data: any) => Promise<void>
        }>
      }>
    }>
    disconnect: () => Promise<void>
  }
  addEventListener: (event: string, callback: () => void) => void
}

interface GameState {
  // Current game session
  currentGame: GameSession | null
  participants: GameParticipant[]
  selectedCase: LegalCase | null
  currentUser: Profile | null
  userRole: 'judge' | 'prosecutor' | 'defense' | 'spectator' | null
  
  // App navigation state
  currentView: 'auth' | 'mode-selection' | 'lobby' | 'game' | 'profile'
  selectedGameMode: GameMode | null
  
  // Actions for app navigation
  setCurrentView: (view: GameState['currentView']) => void
  setSelectedGameMode: (mode: GameMode | null) => void
  clearGame: () => void
  
  // Game flow state
  currentPhase: GameSession['current_phase']
  timeRemaining: number
  isConnected: boolean
  
  // Real-time features
  peerConnections: Map<string, any>
  bluetoothDevice: BluetoothDevice | null
  
  // Game content
  playerArguments: Record<string, string[]>
  presentedEvidence: Array<{
    id: string
    presented_by: string
    evidence: any
    timestamp: string
  }>
  
  // UI state
  showChat: boolean
  showEvidence: boolean
  activeModal: string | null
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: string
  }>
  
  // Actions
  setCurrentGame: (game: GameSession | null) => void
  setParticipants: (participants: GameParticipant[]) => void
  setSelectedCase: (case_: LegalCase | null) => void
  setCurrentUser: (user: Profile | null) => void
  setUserRole: (role: GameState['userRole']) => void
  setCurrentPhase: (phase: GameState['currentPhase']) => void
  setTimeRemaining: (time: number) => void
  setIsConnected: (connected: boolean) => void
  addPeerConnection: (userId: string, connection: any) => void
  removePeerConnection: (userId: string) => void
  setBluetoothDevice: (device: BluetoothDevice | null) => void
  addPlayerArgument: (role: string, argument: string) => void
  addPresentedEvidence: (evidence: GameState['presentedEvidence'][0]) => void
  setShowChat: (show: boolean) => void
  setShowEvidence: (show: boolean) => void
  setActiveModal: (modal: string | null) => void
  addNotification: (notification: Omit<GameState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  reset: () => void
}

const initialState = {
  currentGame: null,
  participants: [],
  selectedCase: null,
  currentUser: null,
  userRole: null,
  currentView: 'auth' as const,
  selectedGameMode: null,
  currentPhase: 'lobby' as const,
  timeRemaining: 0,
  isConnected: false,
  peerConnections: new Map(),
  bluetoothDevice: null,
  playerArguments: {},
  presentedEvidence: [],
  showChat: false,
  showEvidence: true,
  activeModal: null,
  notifications: [],
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  
  setCurrentGame: (game) => set({ currentGame: game }),
  setParticipants: (participants) => set({ participants }),
  setSelectedCase: (selectedCase) => set({ selectedCase }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setUserRole: (userRole) => set({ userRole }),
  setCurrentView: (currentView) => set({ currentView }),
  setSelectedGameMode: (selectedGameMode) => set({ selectedGameMode }),
  setCurrentPhase: (currentPhase) => set({ currentPhase }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setIsConnected: (isConnected) => set({ isConnected }),
  
  clearGame: () => set({ 
    currentGame: null, 
    participants: [],
    selectedCase: null,
    userRole: null,
    currentPhase: 'lobby',
    timeRemaining: 0,
    playerArguments: {},
    presentedEvidence: [],
    showChat: false,
    showEvidence: true,
    activeModal: null
  }),
  
  addPeerConnection: (userId, connection) => {
    const peerConnections = new Map(get().peerConnections)
    peerConnections.set(userId, connection)
    set({ peerConnections })
  },
  
  removePeerConnection: (userId) => {
    const peerConnections = new Map(get().peerConnections)
    peerConnections.delete(userId)
    set({ peerConnections })
  },
  
  setBluetoothDevice: (bluetoothDevice) => set({ bluetoothDevice }),
  
  addPlayerArgument: (role, argument) => {
    const playerArguments = { ...get().playerArguments }
    if (!playerArguments[role]) {
      playerArguments[role] = []
    }
    playerArguments[role].push(argument)
    set({ playerArguments })
  },
  
  addPresentedEvidence: (evidence) => {
    set(state => ({
      presentedEvidence: [...state.presentedEvidence, evidence]
    }))
  },
  
  setShowChat: (showChat) => set({ showChat }),
  setShowEvidence: (showEvidence) => set({ showEvidence }),
  setActiveModal: (activeModal) => set({ activeModal }),
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const timestamp = new Date().toISOString()
    set(state => ({
      notifications: [...state.notifications, { ...notification, id, timestamp }]
    }))
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    }, 5000)
  },
  
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },
  
  reset: () => set(initialState),
}))