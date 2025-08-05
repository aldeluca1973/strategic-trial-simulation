import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Award, Target, Flame, Shield, Star, Crown } from 'lucide-react';
import { PowerUp } from './PowerUpManager';

interface GameHUDProps {
  currentScore: number;
  comboMultiplier: number;
  powerUpCharge: number;
  activePowerUps: PowerUp[];
  recentEvents: Array<{
    type: string;
    points: number;
    timestamp: number;
  }>;
  onActivatePowerUp: (powerUpType: string) => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  currentScore,
  comboMultiplier,
  powerUpCharge,
  activePowerUps,
  recentEvents,
  onActivatePowerUp
}) => {
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [latestEvent, setLatestEvent] = useState<any>(null);

  // Show score popup for recent events
  useEffect(() => {
    if (recentEvents.length > 0) {
      const latest = recentEvents[recentEvents.length - 1];
      if (Date.now() - latest.timestamp < 3000) { // Show for 3 seconds
        setLatestEvent(latest);
        setShowScorePopup(true);
        setTimeout(() => setShowScorePopup(false), 2500);
      }
    }
  }, [recentEvents]);

  const getComboColor = () => {
    if (comboMultiplier >= 2.5) return 'text-purple-400';
    if (comboMultiplier >= 2.0) return 'text-red-400';
    if (comboMultiplier >= 1.5) return 'text-orange-400';
    if (comboMultiplier >= 1.2) return 'text-yellow-400';
    return 'text-gray-400';
  };



  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none">
      <div className="flex justify-between items-start">
        
        {/* Left HUD - Score & Combo */}
        <motion.div 
          className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-amber-500/30 pointer-events-auto"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            {/* Score Display */}
            <div className="text-center">
              <div className="text-amber-400 text-sm font-medium">SCORE</div>
              <motion.div 
                className="text-2xl font-bold text-white"
                key={currentScore}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {formatScore(currentScore)}
              </motion.div>
            </div>

            {/* Combo Multiplier */}
            <div className="text-center">
              <div className="text-gray-400 text-sm font-medium">COMBO</div>
              <motion.div 
                className={`text-xl font-bold ${getComboColor()}`}
                animate={{ 
                  scale: comboMultiplier > 1 ? [1, 1.1, 1] : 1,
                  textShadow: comboMultiplier >= 2 ? '0 0 10px currentColor' : 'none'
                }}
                transition={{ duration: 0.5 }}
              >
                {comboMultiplier >= 2 && <Flame className="w-4 h-4 inline mr-1" />}
                {comboMultiplier.toFixed(1)}x
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right HUD - Power-ups */}
        <motion.div 
          className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30 pointer-events-auto"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-3">
            <div className="text-blue-400 text-sm font-medium">POWER-UP</div>
            <div className="w-32 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${powerUpCharge}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">{Math.round(powerUpCharge)}%</div>
          </div>

          {/* Power-up Activation Button */}
          {powerUpCharge >= 100 && (
            <motion.button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 
                         text-white font-bold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-200
                         hover:scale-105 active:scale-95"
              onClick={() => onActivatePowerUp('random')}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' }}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              ACTIVATE!
            </motion.button>
          )}

          {/* Active Power-ups */}
          {activePowerUps.length > 0 && (
            <div className="mt-3 space-y-1">
              {activePowerUps.map((powerUp, index) => (
                <motion.div
                  key={`${powerUp.id}-${index}`}
                  className="flex items-center space-x-2 bg-purple-600/20 rounded px-2 py-1"
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {powerUp.icon}
                  <span className="text-xs text-purple-300 capitalize">
                    {powerUp.name}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Score Popup Animation */}
      <AnimatePresence>
        {showScorePopup && latestEvent && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold 
                          px-6 py-3 rounded-full shadow-2xl border-2 border-white">
              <div className="text-center">
                <div className="text-2xl">+{latestEvent.points}</div>
                <div className="text-sm capitalize">{latestEvent.type.replace('_', ' ')}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Flash Effect */}
      <AnimatePresence>
        {comboMultiplier >= 2 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameHUD;