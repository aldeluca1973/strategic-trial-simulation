import { useEffect, useCallback, useRef } from 'react'
import SimplePeer from 'simple-peer'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useAuth } from './useAuth'

export function useWebRTC() {
  const { user } = useAuth()
  const {
    currentGame,
    participants,
    peerConnections,
    addPeerConnection,
    removePeerConnection,
    addNotification
  } = useGameStore()
  
  const localStreamRef = useRef<MediaStream | null>(null)
  const signalPollingRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebRTC connection to a peer
  const connectToPeer = useCallback(async (targetUserId: string, initiator = false) => {
    if (!currentGame || !user || !targetUserId) return

    try {
      // Create peer connection
      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream: localStreamRef.current || undefined
      })

      peer.on('signal', async (signalData) => {
        // Send signaling data through Supabase
        try {
          await supabase.functions.invoke('webrtc-signaling', {
            body: {
              action: 'send_signal',
              gameSessionId: currentGame.id,
              fromUserId: user.id,
              toUserId: targetUserId,
              signalData
            }
          })
        } catch (error) {
          console.error('Error sending signal:', error)
        }
      })

      peer.on('connect', () => {
        console.log('Connected to peer:', targetUserId)
        addNotification({
          type: 'success',
          message: `Connected to player via WebRTC`
        })
      })

      peer.on('data', (data) => {
        try {
          const message = JSON.parse(data.toString())
          console.log('Received WebRTC message:', message)
          // Handle peer-to-peer messages here
        } catch (error) {
          console.error('Error parsing WebRTC data:', error)
        }
      })

      peer.on('stream', (remoteStream) => {
        console.log('Received remote stream from:', targetUserId)
        // Handle remote audio/video stream
        const audioElement = document.getElementById(`audio-${targetUserId}`) as HTMLAudioElement
        if (audioElement) {
          audioElement.srcObject = remoteStream
        }
      })

      peer.on('error', (error) => {
        console.error('WebRTC peer error:', error)
        addNotification({
          type: 'error',
          message: 'Connection error with player'
        })
      })

      peer.on('close', () => {
        console.log('Peer connection closed:', targetUserId)
        removePeerConnection(targetUserId)
      })

      addPeerConnection(targetUserId, peer)
      return peer
    } catch (error) {
      console.error('Error creating peer connection:', error)
      addNotification({
        type: 'error',
        message: 'Failed to establish peer connection'
      })
    }
  }, [currentGame, user, addPeerConnection, removePeerConnection, addNotification])

  // Initialize local media stream
  const initializeLocalStream = useCallback(async (audio = true, video = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video })
      localStreamRef.current = stream
      
      // Connect local stream to audio element
      const localAudioElement = document.getElementById('local-audio') as HTMLAudioElement
      if (localAudioElement) {
        localAudioElement.srcObject = stream
        localAudioElement.muted = true // Prevent feedback
      }
      
      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      addNotification({
        type: 'error',
        message: 'Failed to access microphone. Audio chat will not be available.'
      })
    }
  }, [addNotification])

  // Poll for incoming signals
  const pollForSignals = useCallback(async () => {
    if (!currentGame || !user) return

    try {
      const response = await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'get_signals',
          gameSessionId: currentGame.id,
          fromUserId: user.id
        }
      })

      if (response.data?.data?.signals) {
        for (const signal of response.data.data.signals) {
          const peer = peerConnections.get(signal.from_user_id)
          if (peer && !peer.destroyed) {
            peer.signal(signal.signal_data)
          } else if (signal.signal_data.type === 'offer') {
            // Create new peer for incoming connection
            const newPeer = await connectToPeer(signal.from_user_id, false)
            if (newPeer) {
              newPeer.signal(signal.signal_data)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error polling for signals:', error)
    }
  }, [currentGame, user, peerConnections, connectToPeer])

  // Initialize WebRTC for all participants
  const initializeWebRTC = useCallback(async () => {
    if (!currentGame || !user || participants.length <= 1) return

    // Initialize local stream first
    await initializeLocalStream()

    // Connect to other participants (only if we have a higher user ID to avoid duplicate connections)
    for (const participant of participants) {
      if (participant.user_id && participant.user_id !== user.id) {
        const shouldInitiate = user.id > participant.user_id
        await connectToPeer(participant.user_id, shouldInitiate)
      }
    }

    // Start polling for signals
    if (signalPollingRef.current) {
      clearInterval(signalPollingRef.current)
    }
    signalPollingRef.current = setInterval(pollForSignals, 2000)
  }, [currentGame, user, participants, initializeLocalStream, connectToPeer, pollForSignals])

  // Send data to all connected peers
  const sendToPeers = useCallback((data: any) => {
    const message = JSON.stringify(data)
    peerConnections.forEach((peer) => {
      if (peer.connected) {
        peer.send(message)
      }
    })
  }, [peerConnections])

  // Cleanup
  useEffect(() => {
    return () => {
      if (signalPollingRef.current) {
        clearInterval(signalPollingRef.current)
      }
      
      // Close all peer connections
      peerConnections.forEach((peer) => {
        if (!peer.destroyed) {
          peer.destroy()
        }
      })
      
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    initializeWebRTC,
    connectToPeer,
    sendToPeers,
    localStream: localStreamRef.current
  }
}