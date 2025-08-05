import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Star, 
  Crown, 
  Shield, 
  Target, 
  Flame,
  Zap,
  Gavel,
  Scale,
  Heart,
  Trophy,
  Medal,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'trial' | 'performance' | 'special' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward?: {
    type: 'powerup' | 'avatar' | 'title';
    value: string;
  };
}

interface AchievementSystemProps {
  userAchievements: Achievement[];
  recentUnlocks: string[];
  onAchievementClick: (achievementId: string) => void;
  compact?: boolean;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({
  userAchievements,
  recentUnlocks,
  onAchievementClick,
  compact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);

  // All possible achievements
  const allAchievements: Achievement[] = [
    // Trial Achievements
    {
      id: 'first_objection',
      name: 'Objection Overruled!',
      description: 'Make your first successful objection',
      icon: <Gavel className="w-6 h-6" />,
      category: 'trial',
      rarity: 'common',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: { type: 'powerup', value: 'objection_shield' }
    },
    {
      id: 'evidence_master',
      name: 'Evidence Master',
      description: 'Present 10 pieces of evidence successfully',
      icon: <Target className="w-6 h-6" />,
      category: 'trial',
      rarity: 'common',
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      reward: { type: 'powerup', value: 'evidence_boost' }
    },
    {
      id: 'combo_master',
      name: 'Combo Master',
      description: 'Achieve a 5x combo multiplier',
      icon: <Flame className="w-6 h-6" />,
      category: 'performance',
      rarity: 'rare',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: { type: 'title', value: 'Combo Master' }
    },
    {
      id: 'perry_mason',
      name: 'Perry Mason Moment',
      description: 'Create a legendary dramatic moment',
      icon: <Star className="w-6 h-6" />,
      category: 'special',
      rarity: 'epic',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: { type: 'avatar', value: 'perry_mason' }
    },
    {
      id: 'trial_veteran',
      name: 'Trial Veteran',
      description: 'Complete 25 trials',
      icon: <Scale className="w-6 h-6" />,
      category: 'mastery',
      rarity: 'rare',
      progress: 0,
      maxProgress: 25,
      unlocked: false,
      reward: { type: 'title', value: 'Trial Veteran' }
    },
    {
      id: 'perfect_score',
      name: 'Perfect Performance',
      description: 'Score over 2000 points in a single trial',
      icon: <Trophy className="w-6 h-6" />,
      category: 'performance',
      rarity: 'epic',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: { type: 'powerup', value: 'perfect_boost' }
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Win a trial in under 3 minutes',
      icon: <Zap className="w-6 h-6" />,
      category: 'special',
      rarity: 'epic',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: { type: 'title', value: 'Speed Demon' }
    },
    {
      id: 'unstoppable',
      name: 'Unstoppable Force',
      description: 'Win 10 trials in a row',
      icon: <Crown className="w-6 h-6" />,
      category: 'mastery',
      rarity: 'legendary',
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      reward: { type: 'avatar', value: 'legendary_crown' }
    }
  ];

  // Merge user achievements with defaults
  const mergedAchievements = allAchievements.map(defaultAch => {
    const userAch = userAchievements.find(ua => ua.id === defaultAch.id);
    return userAch || defaultAch;
  });

  const categories = [
    { id: 'all', name: 'All', icon: <Award className="w-4 h-4" /> },
    { id: 'trial', name: 'Trial', icon: <Gavel className="w-4 h-4" /> },
    { id: 'performance', name: 'Performance', icon: <Target className="w-4 h-4" /> },
    { id: 'special', name: 'Special', icon: <Star className="w-4 h-4" /> },
    { id: 'mastery', name: 'Mastery', icon: <Crown className="w-4 h-4" /> }
  ];

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

  const filteredAchievements = mergedAchievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedCount = mergedAchievements.filter(a => a.unlocked).length;
  const totalCount = mergedAchievements.length;

  // Handle recent unlock animations
  useEffect(() => {
    if (recentUnlocks.length > 0) {
      const latest = recentUnlocks[recentUnlocks.length - 1];
      setShowUnlockAnimation(latest);
      setTimeout(() => setShowUnlockAnimation(null), 3000);
    }
  }, [recentUnlocks]);

  if (compact) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-amber-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-amber-400 font-bold">Achievements</h3>
          <span className="text-sm text-gray-400">{unlockedCount}/{totalCount}</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {mergedAchievements.slice(0, 8).map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center
                         ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'bg-gray-800 border-gray-600'}
                         ${achievement.unlocked ? getRarityGlow(achievement.rarity) : ''}
                         cursor-pointer relative overflow-hidden`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAchievementClick(achievement.id)}
            >
              {achievement.unlocked ? (
                <>
                  {achievement.rarity === 'legendary' && (
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 20%, rgba(255,215,0,0.4) 0%, transparent 50%)',
                          'radial-gradient(circle at 80% 80%, rgba(255,215,0,0.4) 0%, transparent 50%)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <div className="text-white relative z-10">{achievement.icon}</div>
                </>
              ) : (
                <Lock className="w-4 h-4 text-gray-500" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🏆 ACHIEVEMENTS 🏆
        </motion.h1>
        <p className="text-gray-400 text-lg">
          Progress: <span className="text-amber-400 font-bold">{unlockedCount}</span> / {totalCount} unlocked
        </p>
        <div className="w-full bg-gray-700 rounded-full h-3 mt-3 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 bg-black/50 rounded-lg p-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                         ${selectedCategory === category.id 
                           ? 'bg-amber-500 text-black font-bold' 
                           : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.icon}
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        layout
      >
        <AnimatePresence>
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`bg-gradient-to-br ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'from-gray-800 to-gray-900 border-gray-600'}
                         border-2 rounded-xl p-6 cursor-pointer relative overflow-hidden
                         ${achievement.unlocked ? getRarityGlow(achievement.rarity) : ''}
                         transform transition-all duration-200 hover:scale-105`}
              onClick={() => onAchievementClick(achievement.id)}
              whileHover={{ y: -5 }}
            >
              {/* Rarity Sparkles for Legendary */}
              {achievement.unlocked && achievement.rarity === 'legendary' && (
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 20%, rgba(255,215,0,0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 80%, rgba(255,215,0,0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.4) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}

              <div className="relative z-10">
                {/* Icon and Lock Status */}
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className={`text-5xl ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}
                    animate={{ 
                      rotate: achievement.unlocked && achievement.rarity === 'legendary' ? 360 : 0 
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: achievement.unlocked && achievement.rarity === 'legendary' ? Infinity : 0,
                      ease: 'linear'
                    }}
                  >
                    {achievement.unlocked ? achievement.icon : <Lock className="w-12 h-12" />}
                  </motion.div>
                  
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </motion.div>
                  )}
                </div>

                {/* Achievement Info */}
                <h3 className={`font-bold text-lg mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {achievement.unlocked ? achievement.name : '???'}
                </h3>
                
                <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-gray-200' : 'text-gray-600'}`}>
                  {achievement.unlocked ? achievement.description : 'Complete the requirement to unlock'}
                </p>

                {/* Progress Bar */}
                {achievement.maxProgress > 1 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={achievement.unlocked ? 'text-gray-300' : 'text-gray-600'}>
                        Progress
                      </span>
                      <span className={achievement.unlocked ? 'text-white' : 'text-gray-500'}>
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className={`h-2 rounded-full ${achievement.unlocked ? 'bg-green-500' : 'bg-amber-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                )}

                {/* Rarity Badge */}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold
                    ${achievement.rarity === 'legendary' ? 'bg-yellow-400 text-black' :
                      achievement.rarity === 'epic' ? 'bg-purple-400 text-white' :
                      achievement.rarity === 'rare' ? 'bg-blue-400 text-white' :
                      'bg-gray-400 text-white'}`}>
                    {achievement.rarity.toUpperCase()}
                  </span>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="text-xs text-gray-400">
                      {achievement.unlockedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Reward */}
                {achievement.unlocked && achievement.reward && (
                  <div className="mt-3 p-2 bg-black/30 rounded-lg">
                    <div className="text-xs text-gray-300">
                      <span className="text-amber-400">Reward:</span> {achievement.reward.value}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Unlock Animation Overlay */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏆
              </motion.div>
              
              <h2 className="text-4xl font-bold text-yellow-400 mb-4">
                ACHIEVEMENT UNLOCKED!
              </h2>
              
              <motion.div
                className="text-2xl text-white font-bold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {mergedAchievements.find(a => a.id === showUnlockAnimation)?.name}
              </motion.div>
            </motion.div>

            {/* Celebration Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                    y: [0, -300],
                    x: [0, (Math.random() - 0.5) * 400]
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 1,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;