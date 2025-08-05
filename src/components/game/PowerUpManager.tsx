import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Zap, 
  Clock, 
  Eye, 
  Star,
  Flame,
  Crown,
  Lightbulb,
  Heart
} from 'lucide-react';

export interface PowerUp {
  id: string;
  type: 'objection_shield' | 'evidence_boost' | 'time_extension' | 'insight_vision' | 'drama_multiplier' | 'jury_charm' | 'quick_thinking' | 'second_chance';
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in seconds, 0 for instant effects
  cooldown: number; // in seconds
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effects: {
    [key: string]: any;
  };
}

interface PowerUpManagerProps {
  activePowerUps: PowerUp[];
  availablePowerUps: PowerUp[];
  onActivatePowerUp: (powerUpId: string) => void;
  onPowerUpExpired: (powerUpId: string) => void;
  gamePhase: string;
  canUsePowerUps: boolean;
}

const PowerUpManager: React.FC<PowerUpManagerProps> = ({
  activePowerUps,
  availablePowerUps,
  onActivatePowerUp,
  onPowerUpExpired,
  gamePhase,
  canUsePowerUps
}) => {
  const [powerUpTimers, setPowerUpTimers] = useState<{[key: string]: number}>({});
  const [showPowerUpSelection, setShowPowerUpSelection] = useState(false);

  // Define all available power-ups
  const allPowerUps: PowerUp[] = [
    {
      id: 'objection_shield',
      type: 'objection_shield',
      name: 'Objection Shield',
      description: 'Protects against failed objections for 30 seconds',
      icon: <Shield className="w-5 h-5" />,
      duration: 30,
      cooldown: 60,
      rarity: 'common',
      effects: { protectFromFailedObjections: true }
    },
    {
      id: 'evidence_boost',
      type: 'evidence_boost',
      name: 'Evidence Boost',
      description: 'Double points for evidence presentation (20 seconds)',
      icon: <Target className="w-5 h-5" />,
      duration: 20,
      cooldown: 45,
      rarity: 'common',
      effects: { evidencePointsMultiplier: 2 }
    },
    {
      id: 'time_extension',
      type: 'time_extension',
      name: 'Time Warp',
      description: 'Adds 60 seconds to the current phase',
      icon: <Clock className="w-5 h-5" />,
      duration: 0,
      cooldown: 120,
      rarity: 'rare',
      effects: { addTime: 60 }
    },
    {
      id: 'insight_vision',
      type: 'insight_vision',
      name: 'Insight Vision',
      description: 'Reveals witness credibility and bias indicators',
      icon: <Eye className="w-5 h-5" />,
      duration: 45,
      cooldown: 90,
      rarity: 'rare',
      effects: { revealWitnessStats: true }
    },
    {
      id: 'drama_multiplier',
      type: 'drama_multiplier',
      name: 'Drama Multiplier',
      description: 'Triple combo points for dramatic moments',
      icon: <Star className="w-5 h-5" />,
      duration: 25,
      cooldown: 75,
      rarity: 'epic',
      effects: { dramaPointsMultiplier: 3 }
    },
    {
      id: 'jury_charm',
      type: 'jury_charm',
      name: 'Jury Charm',
      description: 'Increases jury impact for all actions by 50%',
      icon: <Crown className="w-5 h-5" />,
      duration: 30,
      cooldown: 100,
      rarity: 'epic',
      effects: { juryImpactMultiplier: 1.5 }
    },
    {
      id: 'quick_thinking',
      type: 'quick_thinking',
      name: 'Quick Thinking',
      description: 'Instant +500 points and combo reset protection',
      icon: <Lightbulb className="w-5 h-5" />,
      duration: 0,
      cooldown: 150,
      rarity: 'legendary',
      effects: { instantPoints: 500, comboProtection: true }
    },
    {
      id: 'second_chance',
      type: 'second_chance',
      name: 'Second Chance',
      description: 'Allows retry of last failed action with bonus points',
      icon: <Heart className="w-5 h-5" />,
      duration: 0,
      cooldown: 180,
      rarity: 'legendary',
      effects: { retryLastAction: true, retryBonus: 1.5 }
    }
  ];

  // Timer management for active power-ups
  useEffect(() => {
    const timers: {[key: string]: NodeJS.Timeout} = {};

    activePowerUps.forEach(powerUp => {
      if (powerUp.duration > 0) {
        timers[powerUp.id] = setTimeout(() => {
          onPowerUpExpired(powerUp.id);
        }, powerUp.duration * 1000);
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [activePowerUps, onPowerUpExpired]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600 border-gray-400';
      case 'rare': return 'from-blue-500 to-blue-600 border-blue-400';
      case 'epic': return 'from-purple-500 to-purple-600 border-purple-400';
      case 'legendary': return 'from-yellow-500 to-orange-500 border-yellow-400';
      default: return 'from-gray-500 to-gray-600 border-gray-400';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'rare': return 'shadow-blue-500/50';
      case 'epic': return 'shadow-purple-500/50';
      case 'legendary': return 'shadow-yellow-500/50';
      default: return '';
    }
  };

  const isPhaseCompatible = (powerUp: PowerUp, phase: string): boolean => {
    const phaseCompatibility = {
      'objection_shield': ['evidence_presentation', 'witness_examination'],
      'evidence_boost': ['evidence_presentation'],
      'time_extension': ['opening_statements', 'evidence_presentation', 'witness_examination', 'closing_arguments'],
      'insight_vision': ['witness_examination'],
      'drama_multiplier': ['witness_examination', 'closing_arguments'],
      'jury_charm': ['opening_statements', 'closing_arguments'],
      'quick_thinking': ['evidence_presentation', 'witness_examination'],
      'second_chance': ['evidence_presentation', 'witness_examination']
    };

    return phaseCompatibility[powerUp.type]?.includes(phase) || false;
  };

  const getUsablePowerUps = () => {
    return availablePowerUps.filter(powerUp => 
      isPhaseCompatible(powerUp, gamePhase) && 
      !activePowerUps.find(active => active.id === powerUp.id)
    );
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      
      {/* Active Power-ups Display */}
      <AnimatePresence>
        {activePowerUps.length > 0 && (
          <motion.div
            className="mb-4 flex space-x-2"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            {activePowerUps.map((powerUp) => (
              <motion.div
                key={powerUp.id}
                className={`bg-gradient-to-r ${getRarityColor(powerUp.rarity)} 
                           text-white px-4 py-2 rounded-lg shadow-lg border-2
                           ${getRarityGlow(powerUp.rarity)} backdrop-blur-sm`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ 
                      rotate: powerUp.rarity === 'legendary' ? 360 : 0 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: powerUp.rarity === 'legendary' ? Infinity : 0,
                      ease: 'linear'
                    }}
                  >
                    {powerUp.icon}
                  </motion.div>
                  <div>
                    <div className="text-sm font-bold">{powerUp.name}</div>
                    {powerUp.duration > 0 && (
                      <div className="text-xs opacity-80">
                        {powerUpTimers[powerUp.id] || powerUp.duration}s
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power-up Activation Button */}
      {canUsePowerUps && getUsablePowerUps().length > 0 && (
        <motion.button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500
                     text-white font-bold py-3 px-6 rounded-full shadow-lg border-2 border-white/20
                     transform transition-all duration-200 hover:scale-105 active:scale-95
                     backdrop-blur-sm"
          onClick={() => setShowPowerUpSelection(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ 
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)',
            y: -2
          }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>POWER-UP</span>
            <div className="bg-white/20 rounded-full px-2 py-1 text-xs">
              {getUsablePowerUps().length}
            </div>
          </div>
        </motion.button>
      )}

      {/* Power-up Selection Modal */}
      <AnimatePresence>
        {showPowerUpSelection && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPowerUpSelection(false)}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto
                         border-2 border-purple-500/30 shadow-2xl"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  ⚡ CHOOSE YOUR POWER-UP ⚡
                </h2>
                <p className="text-gray-400">
                  Select a power-up to activate during this phase: <span className="text-purple-400 capitalize">{gamePhase.replace('_', ' ')}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getUsablePowerUps().map((powerUp) => (
                  <motion.button
                    key={powerUp.id}
                    className={`bg-gradient-to-br ${getRarityColor(powerUp.rarity)}
                               text-white p-4 rounded-xl border-2 shadow-lg
                               ${getRarityGlow(powerUp.rarity)} transform transition-all duration-200
                               hover:scale-105 active:scale-95 relative overflow-hidden`}
                    onClick={() => {
                      onActivatePowerUp(powerUp.id);
                      setShowPowerUpSelection(false);
                    }}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Rarity Sparkles */}
                    {powerUp.rarity === 'legendary' && (
                      <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{
                          background: [
                            'radial-gradient(circle at 20% 20%, rgba(255,215,0,0.4) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 80%, rgba(255,215,0,0.4) 0%, transparent 50%)',
                            'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.4) 0%, transparent 50%)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    <div className="relative z-10 text-center">
                      <motion.div 
                        className="text-4xl mb-3"
                        animate={{ 
                          rotate: powerUp.rarity === 'legendary' ? 360 : 0 
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: powerUp.rarity === 'legendary' ? Infinity : 0,
                          ease: 'linear'
                        }}
                      >
                        {powerUp.icon}
                      </motion.div>
                      <h3 className="font-bold text-lg mb-2">{powerUp.name}</h3>
                      <p className="text-sm opacity-90 mb-3">{powerUp.description}</p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="opacity-75">
                          {powerUp.duration > 0 ? `${powerUp.duration}s` : 'Instant'}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-bold
                          ${powerUp.rarity === 'legendary' ? 'bg-yellow-400 text-black' :
                            powerUp.rarity === 'epic' ? 'bg-purple-400 text-white' :
                            powerUp.rarity === 'rare' ? 'bg-blue-400 text-white' :
                            'bg-gray-400 text-white'}`}>
                          {powerUp.rarity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="text-center mt-6">
                <button
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={() => setShowPowerUpSelection(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PowerUpManager;