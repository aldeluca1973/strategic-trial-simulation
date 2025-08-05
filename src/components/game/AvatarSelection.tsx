import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Crown, 
  Shield, 
  Star, 
  Zap, 
  Scale, 
  Gavel,
  Heart,
  Flame,
  Target,
  Award,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'starter' | 'earned' | 'premium' | 'legendary';
  unlockRequirement?: {
    type: 'achievement' | 'games_played' | 'score';
    value: string | number;
    description: string;
  };
  unlocked: boolean;
  stats?: {
    charisma: number;
    authority: number;
    intellect: number;
  };
  specialAbility?: string;
}

interface AvatarSelectionProps {
  userAvatars: Avatar[];
  selectedAvatarId: string;
  onAvatarSelect: (avatarId: string) => void;
  userAchievements?: string[];
  userStats?: {
    gamesPlayed: number;
    totalScore: number;
  };
  compact?: boolean;
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  userAvatars,
  selectedAvatarId,
  onAvatarSelect,
  userAchievements = [],
  userStats = { gamesPlayed: 0, totalScore: 0 },
  compact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // All available avatars
  const allAvatars: Avatar[] = [
    // Starter Avatars (Free)
    {
      id: 'rookie_lawyer',
      name: 'Rookie Lawyer',
      description: 'Fresh out of law school and ready to make a mark',
      icon: <User className="w-8 h-8" />,
      category: 'starter',
      unlocked: true,
      stats: { charisma: 6, authority: 4, intellect: 7 },
      specialAbility: 'First Impression: +10% points on opening statements'
    },
    {
      id: 'public_defender',
      name: 'Public Defender',
      description: 'Fighting for justice, one case at a time',
      icon: <Shield className="w-8 h-8" />,
      category: 'starter',
      unlocked: true,
      stats: { charisma: 7, authority: 6, intellect: 6 },
      specialAbility: 'People\'s Champion: +15% jury impact when defending'
    },
    {
      id: 'prosecutor',
      name: 'District Attorney',
      description: 'Seeking truth and upholding the law',
      icon: <Scale className="w-8 h-8" />,
      category: 'starter',
      unlocked: true,
      stats: { charisma: 6, authority: 8, intellect: 6 },
      specialAbility: 'Case Builder: +10% evidence presentation points'
    },

    // Earned Avatars
    {
      id: 'seasoned_attorney',
      name: 'Seasoned Attorney',
      description: 'Years of experience in the courtroom',
      icon: <Gavel className="w-8 h-8" />,
      category: 'earned',
      unlockRequirement: {
        type: 'games_played',
        value: 10,
        description: 'Complete 10 trials'
      },
      unlocked: false,
      stats: { charisma: 8, authority: 7, intellect: 8 },
      specialAbility: 'Veteran Instinct: +20% combo duration'
    },
    {
      id: 'legal_scholar',
      name: 'Legal Scholar',
      description: 'Master of legal precedent and procedure',
      icon: <Star className="w-8 h-8" />,
      category: 'earned',
      unlockRequirement: {
        type: 'achievement',
        value: 'evidence_master',
        description: 'Unlock "Evidence Master" achievement'
      },
      unlocked: false,
      stats: { charisma: 7, authority: 6, intellect: 10 },
      specialAbility: 'Legal Mind: Double points for complex legal arguments'
    },
    {
      id: 'media_lawyer',
      name: 'Media Sensation',
      description: 'The camera loves you, and so does the jury',
      icon: <Heart className="w-8 h-8" />,
      category: 'earned',
      unlockRequirement: {
        type: 'achievement',
        value: 'perry_mason',
        description: 'Create a "Perry Mason Moment"'
      },
      unlocked: false,
      stats: { charisma: 10, authority: 7, intellect: 7 },
      specialAbility: 'Spotlight: +25% dramatic moment points'
    },

    // Premium Avatars
    {
      id: 'corporate_counsel',
      name: 'Corporate Counsel',
      description: 'Sharp suits, sharper mind',
      icon: <Target className="w-8 h-8" />,
      category: 'premium',
      unlockRequirement: {
        type: 'score',
        value: 50000,
        description: 'Achieve 50,000 total score'
      },
      unlocked: false,
      stats: { charisma: 8, authority: 9, intellect: 9 },
      specialAbility: 'Power Play: Start each trial with a random powerup'
    },
    {
      id: 'supreme_advocate',
      name: 'Supreme Advocate',
      description: 'Argued before the highest courts in the land',
      icon: <Crown className="w-8 h-8" />,
      category: 'premium',
      unlockRequirement: {
        type: 'achievement',
        value: 'trial_veteran',
        description: 'Become a "Trial Veteran"'
      },
      unlocked: false,
      stats: { charisma: 9, authority: 9, intellect: 9 },
      specialAbility: 'Supreme Authority: Objections have +50% success rate'
    },

    // Legendary Avatars
    {
      id: 'legend_of_law',
      name: 'Legend of Law',
      description: 'Your name is whispered in law schools everywhere',
      icon: <Award className="w-8 h-8" />,
      category: 'legendary',
      unlockRequirement: {
        type: 'achievement',
        value: 'unstoppable',
        description: 'Achieve "Unstoppable Force" status'
      },
      unlocked: false,
      stats: { charisma: 10, authority: 10, intellect: 10 },
      specialAbility: 'Legendary Presence: All actions have +30% base points'
    },
    {
      id: 'phoenix_wright',
      name: 'Ace Attorney',
      description: 'Turnabout is always possible',
      icon: <Flame className="w-8 h-8" />,
      category: 'legendary',
      unlockRequirement: {
        type: 'achievement',
        value: 'perfect_score',
        description: 'Achieve a perfect trial score'
      },
      unlocked: false,
      stats: { charisma: 10, authority: 8, intellect: 10 },
      specialAbility: 'Turnabout: Failing an action triggers a comeback bonus'
    }
  ];

  // Check unlock status based on requirements
  const checkUnlockStatus = (avatar: Avatar): boolean => {
    if (!avatar.unlockRequirement) return avatar.unlocked;

    switch (avatar.unlockRequirement.type) {
      case 'games_played':
        return userStats.gamesPlayed >= (avatar.unlockRequirement.value as number);
      case 'score':
        return userStats.totalScore >= (avatar.unlockRequirement.value as number);
      case 'achievement':
        return userAchievements.includes(avatar.unlockRequirement.value as string);
      default:
        return false;
    }
  };

  // Merge with user data and update unlock status
  const mergedAvatars = allAvatars.map(defaultAvatar => {
    const userAvatar = userAvatars.find(ua => ua.id === defaultAvatar.id);
    const unlocked = checkUnlockStatus(defaultAvatar);
    return { ...defaultAvatar, ...userAvatar, unlocked };
  });

  const categories = [
    { id: 'all', name: 'All', count: mergedAvatars.length },
    { id: 'starter', name: 'Starter', count: mergedAvatars.filter(a => a.category === 'starter').length },
    { id: 'earned', name: 'Earned', count: mergedAvatars.filter(a => a.category === 'earned').length },
    { id: 'premium', name: 'Premium', count: mergedAvatars.filter(a => a.category === 'premium').length },
    { id: 'legendary', name: 'Legendary', count: mergedAvatars.filter(a => a.category === 'legendary').length }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'starter': return 'from-green-500 to-green-600 border-green-400';
      case 'earned': return 'from-blue-500 to-blue-600 border-blue-400';
      case 'premium': return 'from-purple-500 to-purple-600 border-purple-400';
      case 'legendary': return 'from-yellow-500 to-orange-500 border-yellow-400';
      default: return 'from-gray-500 to-gray-600 border-gray-400';
    }
  };

  const getCategoryGlow = (category: string) => {
    switch (category) {
      case 'earned': return 'shadow-blue-500/50';
      case 'premium': return 'shadow-purple-500/50';
      case 'legendary': return 'shadow-yellow-500/50';
      default: return '';
    }
  };

  const filteredAvatars = mergedAvatars.filter(avatar => 
    selectedCategory === 'all' || avatar.category === selectedCategory
  );

  const unlockedCount = mergedAvatars.filter(a => a.unlocked).length;
  const selectedAvatar = mergedAvatars.find(a => a.id === selectedAvatarId);

  if (compact) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
        <h3 className="text-blue-400 font-bold mb-3">Attorney Avatar</h3>
        
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            className={`w-16 h-16 rounded-full flex items-center justify-center border-2
                       ${selectedAvatar ? getCategoryColor(selectedAvatar.category) : 'bg-gray-800 border-gray-600'}
                       ${selectedAvatar ? getCategoryGlow(selectedAvatar.category) : ''}`}
            whileHover={{ scale: 1.05 }}
          >
            {selectedAvatar?.icon || <User className="w-8 h-8 text-gray-500" />}
          </motion.div>
          
          <div className="flex-1">
            <div className="font-bold text-white">
              {selectedAvatar?.name || 'No Avatar Selected'}
            </div>
            <div className="text-sm text-gray-400">
              {selectedAvatar?.specialAbility || 'Select an avatar to see abilities'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {mergedAvatars.slice(0, 8).map((avatar) => (
            <motion.button
              key={avatar.id}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm
                         ${avatar.unlocked ? getCategoryColor(avatar.category) : 'bg-gray-800 border-gray-600'}
                         ${avatar.id === selectedAvatarId ? 'ring-2 ring-white' : ''}
                         ${avatar.unlocked ? 'hover:scale-105' : 'cursor-not-allowed opacity-50'}`}
              onClick={() => avatar.unlocked && onAvatarSelect(avatar.id)}
              disabled={!avatar.unlocked}
              whileHover={avatar.unlocked ? { scale: 1.05 } : {}}
              whileTap={avatar.unlocked ? { scale: 0.95 } : {}}
            >
              {avatar.unlocked ? avatar.icon : <Lock className="w-4 h-4 text-gray-500" />}
            </motion.button>
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
          ⚖️ CHOOSE YOUR ATTORNEY ⚖️
        </motion.h1>
        <p className="text-gray-400 text-lg">
          Avatars Unlocked: <span className="text-blue-400 font-bold">{unlockedCount}</span> / {mergedAvatars.length}
        </p>
      </div>

      {/* Current Selection Preview */}
      {selectedAvatar && (
        <motion.div
          className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 mb-8 border border-blue-500/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center space-x-6">
            <motion.div
              className={`w-20 h-20 rounded-full flex items-center justify-center border-4
                         ${getCategoryColor(selectedAvatar.category)} ${getCategoryGlow(selectedAvatar.category)}`}
              animate={{ 
                rotate: selectedAvatar.category === 'legendary' ? 360 : 0 
              }}
              transition={{ 
                duration: 3, 
                repeat: selectedAvatar.category === 'legendary' ? Infinity : 0,
                ease: 'linear'
              }}
            >
              {selectedAvatar.icon}
            </motion.div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedAvatar.name}</h2>
              <p className="text-gray-300 mb-3">{selectedAvatar.description}</p>
              
              {selectedAvatar.stats && (
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Charisma</div>
                    <div className="text-lg font-bold text-pink-400">{selectedAvatar.stats.charisma}/10</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Authority</div>
                    <div className="text-lg font-bold text-red-400">{selectedAvatar.stats.authority}/10</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Intellect</div>
                    <div className="text-lg font-bold text-blue-400">{selectedAvatar.stats.intellect}/10</div>
                  </div>
                </div>
              )}
              
              {selectedAvatar.specialAbility && (
                <div className="bg-black/30 rounded-lg p-3">
                  <span className="text-amber-400 font-bold">Special Ability:</span>
                  <span className="text-white ml-2">{selectedAvatar.specialAbility}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 bg-black/50 rounded-lg p-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm
                         ${selectedCategory === category.id 
                           ? 'bg-blue-500 text-white font-bold' 
                           : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name} ({category.count})
            </motion.button>
          ))}
        </div>
      </div>

      {/* Avatars Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        layout
      >
        <AnimatePresence>
          {filteredAvatars.map((avatar) => (
            <motion.div
              key={avatar.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`relative rounded-xl p-6 border-2 cursor-pointer overflow-hidden
                         ${avatar.unlocked 
                           ? `bg-gradient-to-br ${getCategoryColor(avatar.category)} ${getCategoryGlow(avatar.category)}` 
                           : 'bg-gray-800 border-gray-600'}
                         ${avatar.id === selectedAvatarId ? 'ring-4 ring-white' : ''}
                         ${avatar.unlocked ? 'hover:scale-105' : 'cursor-not-allowed opacity-50'}
                         transform transition-all duration-200`}
              onClick={() => avatar.unlocked && onAvatarSelect(avatar.id)}
              whileHover={avatar.unlocked ? { y: -5 } : {}}
            >
              {/* Legendary Sparkles */}
              {avatar.unlocked && avatar.category === 'legendary' && (
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
                {/* Avatar Icon */}
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className={`text-6xl ${avatar.unlocked ? 'text-white' : 'text-gray-500'}`}
                    animate={{ 
                      rotate: avatar.unlocked && avatar.category === 'legendary' ? 360 : 0 
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: avatar.unlocked && avatar.category === 'legendary' ? Infinity : 0,
                      ease: 'linear'
                    }}
                  >
                    {avatar.unlocked ? avatar.icon : <Lock className="w-16 h-16" />}
                  </motion.div>
                  
                  {avatar.id === selectedAvatarId && avatar.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </motion.div>
                  )}
                </div>

                {/* Avatar Info */}
                <h3 className={`font-bold text-lg mb-2 ${avatar.unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {avatar.unlocked ? avatar.name : '???'}
                </h3>
                
                <p className={`text-sm mb-4 ${avatar.unlocked ? 'text-gray-200' : 'text-gray-600'}`}>
                  {avatar.unlocked ? avatar.description : 'Unlock to reveal'}
                </p>

                {/* Stats Preview */}
                {avatar.unlocked && avatar.stats && (
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="text-center">
                      <div className="text-gray-300">CHA</div>
                      <div className="text-pink-400 font-bold">{avatar.stats.charisma}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-300">AUT</div>
                      <div className="text-red-400 font-bold">{avatar.stats.authority}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-300">INT</div>
                      <div className="text-blue-400 font-bold">{avatar.stats.intellect}</div>
                    </div>
                  </div>
                )}

                {/* Unlock Requirement */}
                {!avatar.unlocked && avatar.unlockRequirement && (
                  <div className="bg-black/30 rounded-lg p-2 mb-4">
                    <div className="text-xs text-gray-400">
                      <span className="text-amber-400">Unlock:</span> {avatar.unlockRequirement.description}
                    </div>
                  </div>
                )}

                {/* Category Badge */}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold
                    ${avatar.category === 'legendary' ? 'bg-yellow-400 text-black' :
                      avatar.category === 'premium' ? 'bg-purple-400 text-white' :
                      avatar.category === 'earned' ? 'bg-blue-400 text-white' :
                      'bg-green-400 text-white'}`}>
                    {avatar.category.toUpperCase()}
                  </span>
                  
                  {avatar.unlocked && (
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Zap className="w-3 h-3" />
                      <span>Special</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AvatarSelection;