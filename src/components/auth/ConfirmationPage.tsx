import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Mail, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'

export function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No confirmation token provided')
      return
    }

    confirmEmail(token)
  }, [token])

  const confirmEmail = async (confirmationToken: string) => {
    try {
      // Call our custom email confirmation function
      const { data, error } = await supabase.rpc('confirm_email_with_token', {
        token: confirmationToken
      })

      if (error) throw error

      const result = typeof data === 'string' ? JSON.parse(data) : data

      if (result.success) {
        setStatus('success')
        setMessage('Your account has been confirmed successfully! Welcome to Strategic Trial Simulation.')
        
        // Automatically redirect after 3 seconds
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to confirm email')
      }
    } catch (error) {
      console.error('Confirmation error:', error)
      setStatus('error')
      setMessage('An error occurred while confirming your email')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-400" size={64} />
      case 'error':
      case 'expired':
        return <XCircle className="text-red-400" size={64} />
      case 'loading':
      default:
        return <Clock className="text-verdict-gold animate-pulse" size={64} />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'error':
      case 'expired':
        return 'text-red-400'
      case 'loading':
      default:
        return 'text-verdict-gold'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 animate-pulse-gentle">
          <Mail size={64} className="text-verdict-gold" />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse-gentle">
          <CheckCircle size={48} className="text-verdict-gold" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Game Title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-verdict-gold mb-2">
            Strategic Trial Simulation
          </h1>
          <p className="text-parchment/80 text-lg">
            Email Confirmation
          </p>
        </motion.div>

        {/* Confirmation Card */}
        <CourtroomCard>
          <CourtroomCardHeader>
            <CourtroomCardTitle className="text-center">
              Account Confirmation
            </CourtroomCardTitle>
          </CourtroomCardHeader>
          
          <CourtroomCardContent>
            <div className="text-center space-y-6">
              {/* Status Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                {getStatusIcon()}
              </motion.div>

              {/* Status Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
                  {status === 'loading' && 'Confirming Your Email...'}
                  {status === 'success' && '🎉 Welcome to the Bar!'}
                  {status === 'error' && 'Confirmation Failed'}
                  {status === 'expired' && 'Link Expired'}
                </h2>
                
                <p className="text-parchment/80 text-sm leading-relaxed">
                  {message}
                </p>

                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 text-green-400"
                  >
                    <p className="text-sm">
                      🏛️ Your legal career starts now! You'll be redirected to the courtroom shortly.
                    </p>
                  </motion.div>
                )}

                {(status === 'error' || status === 'expired') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-4"
                  >
                    <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 text-red-400">
                      <p className="text-sm">
                        Don't worry! You can request a new confirmation email or contact our support team.
                      </p>
                    </div>
                    
                    <GavelButton
                      onClick={() => navigate('/')}
                      className="w-full"
                      variant="accent"
                    >
                      Return to Home
                    </GavelButton>
                  </motion.div>
                )}

                {status === 'loading' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-center"
                  >
                    <div className="w-6 h-6 border-2 border-verdict-gold border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </CourtroomCardContent>
        </CourtroomCard>
      </motion.div>
    </div>
  )
}
