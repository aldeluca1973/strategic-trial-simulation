import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  Target, 
  Trophy, 
  Star, 
  Flame,
  Shield,
  Crown,
  Play,
  RotateCcw,
  Award,
  TrendingUp,
  Timer,
  Users
} from 'lucide-react';

interface QuickBattleMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  specialRules: string[];
  pointsMultiplier: number;
  unlockRequirement?: {
    type: 'games_played' | 'achievement' | 'score';
    value: string | number;
  };
  unlocked: boolean;
}

interface QuickBattleModeProps {
  availableModes: QuickBattleMode[];
  userStats: {
    gamesPlayed: number;
    totalScore: number;
    achievements: string[];
  };
  onModeSelect: (modeId: string) => void;
  onStartBattle: (modeId: string, options: any) => void;
}

const QuickBattleMode: React.FC<QuickBattleModeProps> = ({
  availableModes,
  userStats,
  onModeSelect,
  onStartBattle
}) => {
  const [selectedMode, setSelectedMode] = useState<QuickBattleMode | null>(null);
  const [battleOptions, setBattleOptions] = useState({
    caseType: 'random',
    aiDifficulty: 'medium',
    powerUpsEnabled: true
  });

  // Define all quick battle modes
  const allModes: QuickBattleMode[] = [
    {
      id: 'speed_trial',
      name: 'Speed Trial',
      description: 'Fast-paced 3-minute trials with time pressure bonus',
      icon: <Zap className="w-8 h-8" />,
      duration: 3,
      difficulty: 'easy',
      specialRules: [
        'All phases are 45 seconds',
        'Time pressure gives +50% points',
        'Quick decisions reward bonus multipliers'
      ],
      pointsMultiplier: 1.5,
      unlocked: true
    },
    {
      id: 'evidence_rush',
      name: 'Evidence Rush',
      description: 'Present evidence quickly before time runs out',
      icon: <Target className="w-8 h-8" />,
      duration: 4,
      difficulty: 'medium',
      specialRules: [
        'Evidence presentation phase only',
        'Multiple evidence pieces to present',
        'Each successful presentation extends time'
      ],
      pointsMultiplier: 1.8,
      unlockRequirement: {
        type: 'games_played',
        value: 5
      },
      unlocked: false
    },
    {
      id: 'objection_master',
      name: 'Objection Master',
      description: 'Intense witness examination with frequent objections',
      icon: <Shield className="w-8 h-8" />,
      duration: 5,
      difficulty: 'medium',
      specialRules: [
        'Witness examination focus',
        'AI makes frequent objectionable statements',
        'Perfect objection timing gives huge bonuses'
      ],
      pointsMultiplier: 2.0,
      unlockRequirement: {
        type: 'achievement',
        value: 'objection_master'
      },
      unlocked: false
    },
    {
      id: 'combo_blitz',
      name: 'Combo Blitz',
      description: 'Chain actions together for massive combo multipliers',
      icon: <Flame className="w-8 h-8" />,
      duration: 6,
      difficulty: 'hard',
      specialRules: [
        'Combo system enhanced',
        'No combo decay between actions',
        'Maximum combo gives 5x multiplier'
      ],
      pointsMultiplier: 2.5,
      unlockRequirement: {
        type: 'achievement',
        value: 'combo_master'
      },
      unlocked: false
    },
    {
      id: 'powerup_mayhem',
      name: 'Power-up Mayhem',
      description: 'Start with random power-ups and earn more quickly',
      icon: <Star className="w-8 h-8" />,
      duration: 5,
      difficulty: 'medium',
      specialRules: [
        'Start with 2 random power-ups',
        'Power-up charge rate +100%',
        'All power-ups are enhanced'
      ],
      pointsMultiplier: 1.7,
      unlockRequirement: {
        type: 'games_played',
        value: 15
      },
      unlocked: false
    },
    {
      id: 'perfect_score',
      name: 'Perfect Score Challenge',
      description: 'Achieve a perfect trial with no mistakes',
      icon: <Crown className="w-8 h-8" />,
      duration: 7,
      difficulty: 'expert',
      specialRules: [
        'Any failed action ends the trial',
        'Perfect performance gives 10x multiplier',
        'Ultimate test of skill'
      ],
      pointsMultiplier: 10.0,
      unlockRequirement: {
        type: 'score',
        value: 25000
      },
      unlocked: false
    },
    {
      id: 'survival_mode',
      name: 'Survival Mode',
      description: 'Endless trials that get progressively harder',
      icon: <Trophy className="w-8 h-8" />,
      duration: 0, // Endless
      difficulty: 'expert',
      specialRules: [
        'Continuous trials without breaks',
        'Difficulty increases each round',
        'Score multiplier grows with each victory'
      ],
      pointsMultiplier: 3.0,
      unlockRequirement: {
        type: 'achievement',
        value: 'trial_veteran'
      },
      unlocked: false
    }
  ];

  // Check unlock status
  const checkUnlockStatus = (mode: QuickBattleMode): boolean => {
    if (!mode.unlockRequirement) return mode.unlocked;

    switch (mode.unlockRequirement.type) {
      case 'games_played':
        return userStats.gamesPlayed >= (mode.unlockRequirement.value as number);
      case 'score':
        return userStats.totalScore >= (mode.unlockRequirement.value as number);
      case 'achievement':
        return userStats.achievements.includes(mode.unlockRequirement.value as string);
      default:
        return false;
    }
  };

  // Merge with user data
  const mergedModes = allModes.map(mode => ({
    ...mode,
    unlocked: checkUnlockStatus(mode)
  }));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-green-600 border-green-400 text-green-100';
      case 'medium': return 'from-yellow-500 to-orange-500 border-yellow-400 text-yellow-100';
      case 'hard': return 'from-red-500 to-red-600 border-red-400 text-red-100';
      case 'expert': return 'from-purple-500 to-purple-600 border-purple-400 text-purple-100';
      default: return 'from-gray-500 to-gray-600 border-gray-400 text-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      case 'expert': return '👑';
      default: return '⭐';
    }
  };

  const unlockedModes = mergedModes.filter(m => m.unlocked);

  const handleStartBattle = () => {
    if (selectedMode) {
      onStartBattle(selectedMode.id, battleOptions);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚡ QUICK BATTLE ⚡
        </motion.h1>
        <p className="text-gray-400 text-xl mb-4">
          Fast-paced legal challenges for instant action!
        </p>
        <div className="flex justify-center items-center space-x-6 text-lg">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-white">Modes Unlocked: <span className="text-yellow-400">{unlockedModes.length}</span>/{mergedModes.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-white">Games Played: <span className="text-blue-400">{userStats.gamesPlayed}</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span className="text-white">Total Score: <span className="text-purple-400">{userStats.totalScore.toLocaleString()}</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Mode Selection */}
        <div className="xl:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-400" />
            Battle Modes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mergedModes.map((mode) => (
              <motion.div
                key={mode.id}
                className={`relative rounded-xl p-6 border-2 cursor-pointer overflow-hidden
                           ${mode.unlocked 
                             ? `bg-gradient-to-br ${getDifficultyColor(mode.difficulty)} hover:scale-105` 
                             : 'bg-gray-800 border-gray-600 cursor-not-allowed opacity-50'}
                           ${selectedMode?.id === mode.id ? 'ring-4 ring-white' : ''}
                           transform transition-all duration-200`}
                onClick={() => mode.unlocked && setSelectedMode(mode)}
                whileHover={mode.unlocked ? { y: -5 } : {}}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: mergedModes.indexOf(mode) * 0.1 }}
              >
                {/* Difficulty Badge */}
                <div className="absolute top-4 right-4 text-2xl">
                  {getDifficultyIcon(mode.difficulty)}
                </div>

                <div className="mb-4">
                  <motion.div 
                    className="text-5xl mb-3"
                    animate={{ 
                      rotate: selectedMode?.id === mode.id ? [0, 5, -5, 0] : 0 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: selectedMode?.id === mode.id ? Infinity : 0 
                    }}
                  >
                    {mode.icon}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-2">{mode.name}</h3>
                  <p className="text-sm opacity-90 mb-3">{mode.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{mode.duration === 0 ? 'Endless' : `${mode.duration} min`}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{mode.pointsMultiplier}x points</span>
                    </div>
                  </div>
                </div>

                {/* Special Rules */}
                {mode.unlocked && (
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs font-bold mb-2">SPECIAL RULES:</div>
                    <ul className="text-xs space-y-1">
                      {mode.specialRules.map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-300 mr-1">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Unlock Requirement */}
                {!mode.unlocked && mode.unlockRequirement && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    <div className="text-xs font-bold text-red-400 mb-1">LOCKED</div>
                    <div className="text-xs text-red-300">
                      {mode.unlockRequirement.type === 'games_played' && `Play ${mode.unlockRequirement.value} games`}
                      {mode.unlockRequirement.type === 'score' && `Reach ${mode.unlockRequirement.value} total score`}
                      {mode.unlockRequirement.type === 'achievement' && `Unlock "${mode.unlockRequirement.value}" achievement`}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Battle Setup Panel */}
        <div className="xl:col-span-1">
          <AnimatePresence>
            {selectedMode && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30 sticky top-6"
              >
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Play className="w-6 h-6 mr-2 text-green-400" />
                  Battle Setup
                </h3>

                {/* Selected Mode Info */}
                <div className="bg-black/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    {selectedMode.icon}
                    <div>
                      <div className="font-bold text-white">{selectedMode.name}</div>
                      <div className="text-sm text-gray-400">{selectedMode.difficulty.toUpperCase()}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Duration</div>
                      <div className="text-white font-bold">
                        {selectedMode.duration === 0 ? 'Endless' : `${selectedMode.duration} min`}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Points</div>
                      <div className="text-yellow-400 font-bold">{selectedMode.pointsMultiplier}x</div>
                    </div>
                  </div>
                </div>

                {/* Battle Options */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Case Type
                    </label>
                    <select 
                      className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      value={battleOptions.caseType}
                      onChange={(e) => setBattleOptions(prev => ({ ...prev, caseType: e.target.value }))}
                    >
                      <option value="random">Random Case</option>
                      <option value="criminal">Criminal Law</option>
                      <option value="civil">Civil Law</option>
                      <option value="contract">Contract Dispute</option>
                      <option value="tort">Tort Law</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AI Difficulty
                    </label>
                    <select 
                      className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      value={battleOptions.aiDifficulty}
                      onChange={(e) => setBattleOptions(prev => ({ ...prev, aiDifficulty: e.target.value }))}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="powerups"
                      className="w-4 h-4 text-blue-600 rounded"
                      checked={battleOptions.powerUpsEnabled}
                      onChange={(e) => setBattleOptions(prev => ({ ...prev, powerUpsEnabled: e.target.checked }))}
                    />
                    <label htmlFor="powerups" className="text-sm text-gray-300">
                      Enable Power-ups
                    </label>
                  </div>
                </div>

                {/* Start Battle Button */}
                <motion.button
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500
                             text-white font-bold py-4 px-6 rounded-lg shadow-lg
                             transform transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={handleStartBattle}
                  whileHover={{ 
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)',
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span className="text-lg">START BATTLE!</span>
                  </div>
                </motion.button>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <h4 className="text-lg font-bold text-white mb-3">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-black/30 rounded p-2 text-center">
                      <div className="text-gray-400">Best Score</div>
                      <div className="text-yellow-400 font-bold">2,847</div>
                    </div>
                    <div className="bg-black/30 rounded p-2 text-center">
                      <div className="text-gray-400">Win Rate</div>
                      <div className="text-green-400 font-bold">78%</div>
                    </div>
                    <div className="bg-black/30 rounded p-2 text-center">
                      <div className="text-gray-400">Avg Time</div>
                      <div className="text-blue-400 font-bold">4:32</div>
                    </div>
                    <div className="bg-black/30 rounded p-2 text-center">
                      <div className="text-gray-400">Streak</div>
                      <div className="text-purple-400 font-bold">7</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedMode && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600 text-center">
              <Timer className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Select a Battle Mode</h3>
              <p className="text-gray-500">Choose a quick battle mode to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickBattleMode;