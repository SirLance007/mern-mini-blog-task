import React from 'react';
import { motion } from 'framer-motion';

const BadgesDisplay = ({ badges }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  if (!badges || badges.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-lg font-semibold text-var(--color-text-primary) mb-2">
          No badges yet
        </h3>
        <p className="text-var(--color-text-secondary)">
          Start contributing to earn your first badge!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {badges.map((badge, index) => (
        <motion.div
          key={badge.badgeId}
          variants={badgeVariants}
          className="bg-var(--color-bg-secondary) p-4 rounded-lg border border-var(--color-border) hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{badge.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-var(--color-text-primary) mb-1">
                {badge.name}
              </h4>
              <p className="text-sm text-var(--color-text-secondary) mb-2">
                {badge.description}
              </p>
              <div className="text-xs text-var(--color-text-secondary)">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BadgesDisplay; 