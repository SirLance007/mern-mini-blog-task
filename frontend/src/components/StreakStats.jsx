import React from 'react';
import { motion } from 'framer-motion';

const StreakStats = ({ stats }) => {
  const { currentStreak, longestStreak, totalPosts, totalLikesReceived, totalContributions } = stats || {};

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 100) return '🏆';
    if (streak >= 50) return '🔥';
    if (streak >= 30) return '⭐';
    if (streak >= 7) return '💪';
    if (streak >= 1) return '✨';
    return '🌱';
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return 'Start your streak today!';
    if (streak === 1) return 'Great start! Keep it going!';
    if (streak < 7) return 'Building momentum!';
    if (streak < 30) return 'You\'re on fire!';
    if (streak < 50) return 'Incredible dedication!';
    if (streak < 100) return 'Legendary streak!';
    return 'Unstoppable!';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* Current Streak */}
      <motion.div
        variants={itemVariants}
        className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border) hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl">{getStreakEmoji(currentStreak)}</div>
          <div className="text-xs text-var(--color-text-secondary) bg-var(--color-bg-primary) px-2 py-1 rounded-full">
            Current
          </div>
        </div>
        <div className="text-3xl font-bold text-var(--color-text-primary) mb-2">
          {currentStreak}
        </div>
        <div className="text-sm text-var(--color-text-secondary)">
          {getStreakMessage(currentStreak)}
        </div>
      </motion.div>

      {/* Longest Streak */}
      <motion.div
        variants={itemVariants}
        className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border) hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl">🏆</div>
          <div className="text-xs text-var(--color-text-secondary) bg-var(--color-bg-primary) px-2 py-1 rounded-full">
            Best
          </div>
        </div>
        <div className="text-3xl font-bold text-var(--color-text-primary) mb-2">
          {longestStreak}
        </div>
        <div className="text-sm text-var(--color-text-secondary)">
          Longest streak achieved
        </div>
      </motion.div>

      {/* Total Posts */}
      <motion.div
        variants={itemVariants}
        className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border) hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl">📝</div>
          <div className="text-xs text-var(--color-text-secondary) bg-var(--color-bg-primary) px-2 py-1 rounded-full">
            Posts
          </div>
        </div>
        <div className="text-3xl font-bold text-var(--color-text-primary) mb-2">
          {totalPosts || 0}
        </div>
        <div className="text-sm text-var(--color-text-secondary)">
          Total posts created
        </div>
      </motion.div>

      {/* Total Likes Received */}
      <motion.div
        variants={itemVariants}
        className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border) hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl">❤️</div>
          <div className="text-xs text-var(--color-text-secondary) bg-var(--color-bg-primary) px-2 py-1 rounded-full">
            Received
          </div>
        </div>
        <div className="text-3xl font-bold text-var(--color-text-primary) mb-2">
          {totalLikesReceived || 0}
        </div>
        <div className="text-sm text-var(--color-text-secondary)">
          Likes on your posts
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StreakStats; 