import { useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'

interface BluetoothGameData {
  type: 'game_invite' | 'game_data' | 'player_action'
  payload: any
}

export function useBluetooth() {
  const { bluetoothDevice, setBluetoothDevice, addNotification } = useGameStore()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Check if Bluetooth is available
  const isBluetoothAvailable = useCallback(() => {
    return 'bluetooth' in navigator && 'requestDevice' in (navigator as any).bluetooth
  }, [])

  // Request Bluetooth device and connect
  const connectBluetooth = useCallback(async () => {
    if (!isBluetoothAvailable()) {
      addNotification({
        type: 'error',
        message: 'Bluetooth Web API is not supported in this browser'
      })
      return false
    }

    setIsConnecting(true)
    try {
      // Request device with Trial Sim service
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{
          services: ['12345678-1234-1234-1234-123456789abc'] // Custom service UUID for Trial Sim
        }],
        optionalServices: ['battery_service']
      })

      console.log('Bluetooth device found:', device.name)
      
      // Connect to GATT server
      const server = await device.gatt.connect()
      console.log('Connected to GATT server')

      // Get our custom service
      const service = await server.getPrimaryService('12345678-1234-1234-1234-123456789abc')
      
      // Get characteristics for reading and writing
      const characteristics = await service.getCharacteristics()
      console.log('Available characteristics:', characteristics)

      setBluetoothDevice(device)
      setIsConnected(true)
      
      addNotification({
        type: 'success',
        message: `Connected to ${device.name || 'Bluetooth device'}`
      })

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        console.log('Bluetooth device disconnected')
        setIsConnected(false)
        setBluetoothDevice(null)
        addNotification({
          type: 'info',
          message: 'Bluetooth device disconnected'
        })
      })

      return true
    } catch (error) {
      console.error('Bluetooth connection error:', error)
      addNotification({
        type: 'error',
        message: 'Failed to connect to Bluetooth device'
      })
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [isBluetoothAvailable, setBluetoothDevice, addNotification])

  // Disconnect Bluetooth device
  const disconnectBluetooth = useCallback(async () => {
    if (bluetoothDevice?.gatt?.connected) {
      try {
        await bluetoothDevice.gatt.disconnect()
        setIsConnected(false)
        setBluetoothDevice(null)
        addNotification({
          type: 'info',
          message: 'Bluetooth device disconnected'
        })
      } catch (error) {
        console.error('Error disconnecting Bluetooth:', error)
      }
    }
  }, [bluetoothDevice, setBluetoothDevice, addNotification])

  // Send game data over Bluetooth
  const sendBluetoothData = useCallback(async (data: BluetoothGameData) => {
    if (!bluetoothDevice?.gatt?.connected) {
      addNotification({
        type: 'error',
        message: 'No Bluetooth device connected'
      })
      return false
    }

    try {
      // Get the service and characteristic for writing
      const server = await bluetoothDevice.gatt!.connect()
      const service = await server.getPrimaryService('12345678-1234-1234-1234-123456789abc')
      const characteristic = await service.getCharacteristic('87654321-4321-4321-4321-cba987654321')

      // Convert data to bytes
      const dataString = JSON.stringify(data)
      const encoder = new TextEncoder()
      const dataBytes = encoder.encode(dataString)

      // Write data to characteristic
      await characteristic.writeValue(dataBytes)
      
      console.log('Sent Bluetooth data:', data)
      return true
    } catch (error) {
      console.error('Error sending Bluetooth data:', error)
      addNotification({
        type: 'error',
        message: 'Failed to send data over Bluetooth'
      })
      return false
    }
  }, [bluetoothDevice, addNotification])

  // Scan for nearby devices advertising Trial Sim game
  const scanForGameDevices = useCallback(async () => {
    if (!isBluetoothAvailable()) {
      addNotification({
        type: 'error',
        message: 'Bluetooth scanning not available'
      })
      return []
    }

    try {
      // Note: Web Bluetooth API doesn't support scanning without user interaction
      // This would typically be triggered by a user action
      const devices = await (navigator as any).bluetooth.getDevices()
      return devices.filter((device: any) => 
        device.name?.includes('TrialSim') || 
        device.name?.includes('Courtroom')
      )
    } catch (error) {
      console.error('Error scanning for devices:', error)
      return []
    }
  }, [isBluetoothAvailable, addNotification])

  // Share game invitation via Bluetooth
  const shareGameInvitation = useCallback(async (roomCode: string, caseName: string) => {
    const inviteData: BluetoothGameData = {
      type: 'game_invite',
      payload: {
        roomCode,
        caseName,
        timestamp: Date.now()
      }
    }

    return await sendBluetoothData(inviteData)
  }, [sendBluetoothData])

  return {
    isBluetoothAvailable: isBluetoothAvailable(),
    isConnecting,
    isConnected,
    bluetoothDevice,
    connectBluetooth,
    disconnectBluetooth,
    sendBluetoothData,
    scanForGameDevices,
    shareGameInvitation
  }
}