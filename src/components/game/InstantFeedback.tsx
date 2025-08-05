import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gavel, 
  Zap, 
  Shield, 
  Target, 
  Star, 
  Crown, 
  Flame,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface FeedbackEvent {
  id: string;
  type: 'success' | 'failure' | 'critical' | 'combo' | 'achievement' | 'powerup';
  subtype: string;
  message: string;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  duration?: number;
}

interface InstantFeedbackProps {
  events: FeedbackEvent[];
  onEventComplete: (eventId: string) => void;
}

const InstantFeedback: React.FC<InstantFeedbackProps> = ({ events, onEventComplete }) => {
  const [activeEvents, setActiveEvents] = useState<FeedbackEvent[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      const newEvent = events[events.length - 1];
      setActiveEvents(prev => [...prev, newEvent]);

      // Auto-remove after duration
      const duration = newEvent.duration || getDurationByIntensity(newEvent.intensity);
      setTimeout(() => {
        setActiveEvents(prev => prev.filter(e => e.id !== newEvent.id));
        onEventComplete(newEvent.id);
      }, duration);
    }
  }, [events, onEventComplete]);

  const getDurationByIntensity = (intensity: string): number => {
    switch (intensity) {
      case 'low': return 1500;
      case 'medium': return 2500;
      case 'high': return 3500;
      case 'extreme': return 5000;
      default: return 2000;
    }
  };

  const getEventConfig = (event: FeedbackEvent) => {
    const configs = {
      // Success Events
      successful_objection: {
        icon: <Gavel className="w-8 h-8" />,
        color: 'from-green-400 to-emerald-500',
        borderColor: 'border-green-400',
        textColor: 'text-white',
        bgEffect: 'bg-green-500/20',
        screenEffect: 'green-flash'
      },
      sustained_objection: {
        icon: <CheckCircle2 className="w-8 h-8" />,
        color: 'from-blue-400 to-cyan-500',
        borderColor: 'border-blue-400',
        textColor: 'text-white',
        bgEffect: 'bg-blue-500/20',
        screenEffect: 'blue-flash'
      },
      evidence_presented: {
        icon: <Target className="w-8 h-8" />,
        color: 'from-purple-400 to-violet-500',
        borderColor: 'border-purple-400',
        textColor: 'text-white',
        bgEffect: 'bg-purple-500/20',
        screenEffect: 'purple-flash'
      },
      strong_argument: {
        icon: <Star className="w-8 h-8" />,
        color: 'from-yellow-400 to-orange-500',
        borderColor: 'border-yellow-400',
        textColor: 'text-black',
        bgEffect: 'bg-yellow-500/20',
        screenEffect: 'gold-flash'
      },
      
      // Combo Events
      combo_master: {
        icon: <Flame className="w-8 h-8" />,
        color: 'from-red-500 to-orange-600',
        borderColor: 'border-red-400',
        textColor: 'text-white',
        bgEffect: 'bg-red-500/30',
        screenEffect: 'fire-effect'
      },
      
      // Achievement Events
      achievement_unlocked: {
        icon: <Award className="w-8 h-8" />,
        color: 'from-gold-400 to-yellow-500',
        borderColor: 'border-gold-400',
        textColor: 'text-black',
        bgEffect: 'bg-gold-500/30',
        screenEffect: 'achievement-sparkle'
      },
      
      // Power-up Events
      powerup_activated: {
        icon: <Zap className="w-8 h-8" />,
        color: 'from-purple-500 to-pink-500',
        borderColor: 'border-purple-400',
        textColor: 'text-white',
        bgEffect: 'bg-purple-500/30',
        screenEffect: 'lightning-effect'
      },
      
      // Failure Events
      objection_overruled: {
        icon: <XCircle className="w-8 h-8" />,
        color: 'from-red-400 to-red-600',
        borderColor: 'border-red-400',
        textColor: 'text-white',
        bgEffect: 'bg-red-500/20',
        screenEffect: 'red-flash'
      },
      
      // Default
      default: {
        icon: <Star className="w-8 h-8" />,
        color: 'from-gray-400 to-gray-600',
        borderColor: 'border-gray-400',
        textColor: 'text-white',
        bgEffect: 'bg-gray-500/20',
        screenEffect: 'none'
      }
    };

    return configs[event.subtype as keyof typeof configs] || configs.default;
  };

  const getIntensityScale = (intensity: string) => {
    switch (intensity) {
      case 'low': return 0.8;
      case 'medium': return 1.0;
      case 'high': return 1.2;
      case 'extreme': return 1.5;
      default: return 1.0;
    }
  };

  const getShakeIntensity = (intensity: string) => {
    switch (intensity) {
      case 'low': return 2;
      case 'medium': return 5;
      case 'high': return 10;
      case 'extreme': return 15;
      default: return 5;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {activeEvents.map((event) => {
          const config = getEventConfig(event);
          const scale = getIntensityScale(event.intensity);
          const shakeAmount = getShakeIntensity(event.intensity);

          return (
            <React.Fragment key={event.id}>
              {/* Screen Flash Effect */}
              {event.intensity === 'extreme' && (
                <motion.div
                  className={`absolute inset-0 ${config.bgEffect}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Main Feedback Display */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ 
                  scale: 0, 
                  rotate: -180, 
                  opacity: 0,
                  y: 100 
                }}
                animate={{ 
                  scale: scale,
                  rotate: 0,
                  opacity: 1,
                  y: 0,
                  x: event.intensity === 'extreme' ? [0, -shakeAmount, shakeAmount, -shakeAmount, 0] : 0
                }}
                exit={{ 
                  scale: 0,
                  rotate: 180,
                  opacity: 0,
                  y: -100
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 300,
                  duration: 0.6
                }}
              >
                <div className={`bg-gradient-to-r ${config.color} ${config.textColor} font-bold 
                              px-8 py-6 rounded-2xl shadow-2xl border-4 ${config.borderColor}
                              backdrop-blur-sm relative overflow-hidden`}
                     style={{ 
                       transform: `scale(${scale})`,
                       boxShadow: event.intensity === 'extreme' 
                         ? `0 0 50px rgba(255, 255, 255, 0.8), 0 0 100px rgba(255, 255, 255, 0.4)`
                         : '0 20px 40px rgba(0, 0, 0, 0.3)'
                     }}>
                  
                  {/* Sparkle Effect for Achievements */}
                  {event.type === 'achievement' && (
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  <div className="flex items-center space-x-4 relative z-10">
                    <motion.div
                      animate={{ 
                        rotate: event.type === 'combo' ? 360 : 0,
                        scale: event.intensity === 'extreme' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        duration: event.type === 'combo' ? 1 : 0.5,
                        repeat: event.type === 'combo' ? Infinity : 0,
                        ease: 'linear'
                      }}
                    >
                      {config.icon}
                    </motion.div>
                    
                    <div className="text-center">
                      <motion.div 
                        className="text-2xl font-black uppercase tracking-wider"
                        animate={{ 
                          scale: event.intensity === 'extreme' ? [1, 1.1, 1] : 1 
                        }}
                        transition={{ 
                          duration: 0.5, 
                          repeat: event.intensity === 'extreme' ? Infinity : 0 
                        }}
                      >
                        {event.message}
                      </motion.div>
                      
                      {event.subtype === 'combo_master' && (
                        <motion.div 
                          className="text-lg font-bold mt-1"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          🔥 COMBO STREAK! 🔥
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Particle Effects for Extreme Events */}
              {event.intensity === 'extreme' && (
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [1, 1, 0],
                        y: [0, -200],
                        x: [0, (Math.random() - 0.5) * 200]
                      }}
                      transition={{
                        duration: 2,
                        delay: Math.random() * 0.5,
                        ease: 'easeOut'
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Sound Effect Trigger (Visual Indicator) */}
              {event.intensity === 'high' || event.intensity === 'extreme' && (
                <motion.div
                  className="absolute bottom-10 right-10 text-white/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ duration: 1 }}
                >
                  🔊
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default InstantFeedback;