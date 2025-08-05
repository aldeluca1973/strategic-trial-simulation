import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Gavel, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/use-mobile'

interface MobileAuthPageProps {
  onAuthenticated: () => void
}

export function MobileAuthPage({ onAuthenticated }: MobileAuthPageProps) {
  const isMobile = useIsMobile()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
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
        
        // Haptic feedback for successful login
        if (navigator.vibrate) {
          navigator.vibrate([50, 30, 50, 30, 50])
        }
        
        onAuthenticated()
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
        
        setSuccessMessage(
          '🎉 Welcome to Virtual Gavel! Check your email for confirmation.'
        )
        
        // Reset form and switch to login
        setEmail('')
        setPassword('')
        setFullName('')
        setIsLogin(true)
        
        // Haptic feedback for successful signup
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
      }
    } catch (err: any) {
      setError(err.message)
      // Error haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isMobile) {
    return null // Use desktop version
  }

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-gavel-blue via-gavel-blue-700 to-mahogany relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 -left-20 text-verdict-gold/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Scale size={120} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 -right-20 text-verdict-gold/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <Gavel size={100} />
        </motion.div>
        <div className="absolute top-1/3 right-1/4 text-verdict-gold/5">
          <Scale size={60} />
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen min-h-dvh safe-area-full">
        {/* Header */}
        <motion.div
          className="text-center pt-12 pb-8 px-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Gavel className="text-verdict-gold" size={40} />
            <h1 className="text-3xl font-bold text-parchment">
              Virtual Gavel
            </h1>
            <Scale className="text-verdict-gold" size={40} />
          </motion.div>
          
          <motion.p
            className="text-parchment/80 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Legal Game Experience
          </motion.p>
          
          <motion.div
            className="flex items-center justify-center gap-2 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-1 text-verdict-gold text-sm">
              <Scale size={16} />
              <span>Justice</span>
            </div>
            <div className="w-1 h-1 bg-verdict-gold/50 rounded-full" />
            <div className="flex items-center gap-1 text-verdict-gold text-sm">
              <Gavel size={16} />
              <span>Strategy</span>
            </div>
            <div className="w-1 h-1 bg-verdict-gold/50 rounded-full" />
            <div className="flex items-center gap-1 text-verdict-gold text-sm">
              <User size={16} />
              <span>Education</span>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Auth form */}
        <div className="flex-1 px-4 pb-8">
          <motion.div
            className="card-mobile-interactive max-w-sm mx-auto p-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Toggle buttons */}
            <div className="flex bg-gavel-blue/10 rounded-xl p-1 mb-6">
              <motion.button
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  isLogin
                    ? 'bg-gavel-blue text-parchment shadow-sm'
                    : 'text-gavel-blue hover:bg-gavel-blue/10'
                }`}
                onClick={() => {
                  setIsLogin(true)
                  setError('')
                  setSuccessMessage('')
                }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn className="w-4 h-4 mx-auto mb-1" />
                Sign In
              </motion.button>
              <motion.button
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  !isLogin
                    ? 'bg-gavel-blue text-parchment shadow-sm'
                    : 'text-gavel-blue hover:bg-gavel-blue/10'
                }`}
                onClick={() => {
                  setIsLogin(false)
                  setError('')
                  setSuccessMessage('')
                }}
                whileTap={{ scale: 0.98 }}
              >
                <UserPlus className="w-4 h-4 mx-auto mb-1" />
                Sign Up
              </motion.button>
            </div>
            
            {/* Success message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4"
                >
                  <p className="text-green-600 text-sm leading-relaxed text-center">
                    {successMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4"
                >
                  <p className="text-red-600 text-sm text-center">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name field for signup */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gavel-blue mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mahogany/40" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-parchment/50 border border-gavel-blue/20 rounded-xl text-gavel-blue placeholder-mahogany/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gavel-blue mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mahogany/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-parchment/50 border border-gavel-blue/20 rounded-xl text-gavel-blue placeholder-mahogany/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gavel-blue mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mahogany/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-parchment/50 border border-gavel-blue/20 rounded-xl text-gavel-blue placeholder-mahogany/50 focus:outline-none focus:ring-2 focus:ring-verdict-gold focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <motion.button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mahogany/40 touch-target"
                    onClick={() => setShowPassword(!showPassword)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-mahogany/60 mt-1">
                    Minimum 6 characters required
                  </p>
                )}
              </div>
              
              {/* Submit button */}
              <motion.button
                type="submit"
                className="w-full btn-mobile haptic-medium mt-6"
                disabled={loading || !email || !password || (!isLogin && !fullName)}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <LogIn className="w-5 h-5" />
                        Enter Courtroom
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Join the Bar
                      </>
                    )}
                  </>
                )}
              </motion.button>
            </form>
            
            {/* Switch mode */}
            <motion.div 
              className="text-center mt-6 pt-4 border-t border-gavel-blue/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-mahogany/70 text-sm">
                {isLogin ? "New to the legal profession?" : "Already have an account?"}
              </p>
              <motion.button
                type="button"
                className="text-verdict-gold font-medium text-sm mt-2 touch-target"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setSuccessMessage('')
                  // Light haptic feedback
                  if (navigator.vibrate) {
                    navigator.vibrate(10)
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Features preview */}
        <motion.div
          className="px-4 pb-safe-bottom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { icon: Scale, label: 'Fair Trials', color: 'text-verdict-gold' },
              { icon: Gavel, label: 'Strategic Play', color: 'text-verdict-gold' },
              { icon: User, label: 'Learn Law', color: 'text-verdict-gold' }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <div className={`${feature.color} mb-2 flex justify-center`}>
                    <Icon size={24} />
                  </div>
                  <p className="text-parchment/70 text-xs font-medium">
                    {feature.label}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}