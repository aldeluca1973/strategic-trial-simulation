import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, Gavel, Users, Mail } from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { CourtroomCard, CourtroomCardContent, CourtroomCardHeader, CourtroomCardTitle } from '@/components/ui/courtroom-card'
import { useAuth } from '@/hooks/useAuth'

interface AuthPageProps {
  onAuthenticated: () => void
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        onAuthenticated()
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
        
        // Show success message for signup instead of redirecting
        setSuccessMessage(
          '🎉 Welcome to Strategic Trial Simulation! ' + 
          'Check your email for a beautifully designed confirmation message from our team. ' +
          'Once confirmed, you can start your legal career!'
        )
        
        // Reset form
        setEmail('')
        setPassword('')
        setFullName('')
        setIsLogin(true) // Switch to login view
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Courtroom Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/courtroom-background.jpg)',
        }}
      />
      
      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-gavel-blue/80 via-gavel-blue-700/85 to-mahogany/80" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 animate-pulse-gentle">
          <Scale size={64} className="text-verdict-gold" />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse-gentle">
          <Gavel size={48} className="text-verdict-gold" />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-pulse-gentle">
          <Users size={32} className="text-verdict-gold" />
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
            The Virtual Gavel
          </h1>
          <p className="text-parchment/80 text-lg">
            Multiplayer Trial Simulation Game
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Scale className="text-verdict-gold" size={20} />
            <span className="text-parchment/60 text-sm">Justice • Strategy • Education</span>
            <Gavel className="text-verdict-gold" size={20} />
          </div>
        </motion.div>

        {/* Auth Card */}
        <CourtroomCard>
          <CourtroomCardHeader>
            <CourtroomCardTitle className="text-center">
              {isLogin ? 'Enter the Courtroom' : 'Join the Bar'}
            </CourtroomCardTitle>
            <p className="text-center text-parchment/70 text-sm">
              {isLogin 
                ? 'Sign in to start your legal career'
                : 'Create your attorney profile'
              }
            </p>
          </CourtroomCardHeader>
          
          <CourtroomCardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-parchment mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment placeholder-parchment/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold focus:border-transparent"
                    placeholder="Your legal name"
                    required={!isLogin}
                  />
                </motion.div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-parchment mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment placeholder-parchment/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold focus:border-transparent"
                  placeholder="attorney@lawfirm.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-parchment mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-verdict-gold/30 rounded-lg bg-gavel-blue/50 text-parchment placeholder-parchment/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded"
                >
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-sm text-center bg-green-400/10 p-3 rounded border border-green-400/30"
                >
                  <div className="flex items-start gap-2">
                    <Mail className="text-green-400 mt-0.5 flex-shrink-0" size={16} />
                    <span>{successMessage}</span>
                  </div>
                </motion.div>
              )}

              <GavelButton
                type="submit"
                className="w-full"
                size="lg"
                variant="accent"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gavel-blue border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  isLogin ? 'Enter Courtroom' : 'Join the Bar'
                )}
              </GavelButton>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-verdict-gold hover:text-verdict-gold/80 text-sm underline-offset-4 hover:underline transition-colors"
              >
                {isLogin 
                  ? "New to the legal profession? Create an account"
                  : "Already admitted to the bar? Sign in"
                }
              </button>
            </div>

            {/* Features */}
            <div className="mt-8 border-t border-verdict-gold/20 pt-6">
              <h3 className="text-parchment font-semibold mb-3 text-center">Game Features</h3>
              <div className="space-y-2 text-sm text-parchment/70">
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-verdict-gold" />
                  <span>AI Jury with realistic legal reasoning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-verdict-gold" />
                  <span>1-3 player cross-device multiplayer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gavel size={16} className="text-verdict-gold" />
                  <span>50+ real historical legal cases</span>
                </div>
              </div>
            </div>
          </CourtroomCardContent>
        </CourtroomCard>
      </motion.div>
    </div>
  )
}