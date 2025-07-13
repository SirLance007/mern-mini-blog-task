import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ContributionCalendar from '../components/ContributionCalendar';
import StreakStats from '../components/StreakStats';
import BadgesDisplay from '../components/BadgesDisplay';
import { toast } from 'react-hot-toast';

const StreakPage = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    // Only fetch data when user and user._id are available
    if (user && user._id) {
      fetchStreakData();
      fetchBadges();
    } else {
      // If no user, set loading to false and show appropriate message
      setLoading(false);
    }
    
    // Listen for streak-data-update event
    const handler = () => {
      if (user && user._id) {
        fetchStreakData();
        fetchBadges();
      }
    };
    window.addEventListener('streak-data-update', handler);
    
    // Listen for post creation/deletion events
    const postHandler = () => {
      if (user && user._id) {
        setTimeout(() => {
          fetchStreakData();
          fetchBadges();
        }, 1000); // Small delay to ensure backend has processed the change
      }
    };
    window.addEventListener('post-created', postHandler);
    window.addEventListener('post-deleted', postHandler);
    
    return () => {
      window.removeEventListener('streak-data-update', handler);
      window.removeEventListener('post-created', postHandler);
      window.removeEventListener('post-deleted', postHandler);
    };
  }, [user]);

  const fetchStreakData = async () => {
    // Validate user and userId before making the request
    if (!user || !user._id) {
      console.warn('[StreakPage] Cannot fetch streak data: user or user._id is not available');
      return;
    }

    try {
      console.log('[StreakPage] Fetching streak data for userId:', user._id);
      const token = localStorage.getItem('token');
      console.log('[StreakPage] Token available:', !!token);
      
      const response = await fetch(`/api/streak/calendar/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[StreakPage] Response status:', response.status);
      console.log('[StreakPage] Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('[StreakPage] Received data:', data);
        console.log('[StreakPage] Calendar data length:', data.data?.calendarData?.length);
        console.log('[StreakPage] Days with posts:', data.data?.calendarData?.filter(d => d.posts > 0).length);
        console.log('[StreakPage] Total posts:', data.data?.totalPosts);
        console.log('[StreakPage] Total likes received:', data.data?.totalLikesReceived);
        setStreakData(data.data);
      } else {
        const text = await response.text();
        console.error('[StreakPage] Failed to fetch streak data:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          responseText: text
        });
        toast.error('Failed to fetch streak data');
      }
    } catch (error) {
      console.error('[StreakPage] Error fetching streak data:', error);
      toast.error('Failed to load streak data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    // Validate user and userId before making the request
    if (!user || !user._id) {
      console.warn('[StreakPage] Cannot fetch badges: user or user._id is not available');
      return;
    }

    try {
      console.log('[StreakPage] Fetching badges for userId:', user._id);
      const response = await fetch(`/api/streak/badges/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('[StreakPage] Badges response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[StreakPage] Received badges data:', data);
        setBadges(data.data.badges);
      } else {
        const text = await response.text();
        console.error('[StreakPage] Failed to fetch badges:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          responseText: text
        });
        toast.error('Failed to fetch badges');
      }
    } catch (error) {
      console.error('[StreakPage] Error fetching badges:', error);
    }
  };

  const handleDayClick = (day) => {
    console.log('Selected day:', day);
  };

  const tabs = [
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'stats', name: 'Stats', icon: '📊' },
    { id: 'badges', name: 'Badges', icon: '🏆' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-var(--color-bg-primary) flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-var(--color-primary) mx-auto mb-4"></div>
          <p className="text-var(--color-text-secondary)">Loading streak data...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user || !user._id) {
    return (
      <div className="min-h-screen bg-var(--color-bg-primary) flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-var(--color-text-primary) mb-4">
            Authentication Required
          </h2>
          <p className="text-var(--color-text-secondary) max-w-md mx-auto">
            Please log in to view your streak dashboard and track your contributions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-var(--color-bg-primary) py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-var(--color-text-primary)">
              Your Streak Dashboard
            </h1>
            <button
              onClick={() => {
                setLoading(true);
                fetchStreakData();
                fetchBadges();
              }}
              className="px-4 py-2 bg-var(--color-primary) text-white rounded-lg hover:bg-var(--color-primary-dark) transition-colors duration-200 flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>
          <p className="text-var(--color-text-secondary) max-w-2xl mx-auto">
            Track your daily contributions, maintain your streak, and earn badges for your dedication to blogging.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-var(--color-bg-secondary) rounded-lg p-1 border border-var(--color-border)">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-var(--color-primary) text-white shadow-lg'
                    : 'text-var(--color-text-secondary) hover:text-var(--color-text-primary) hover:bg-var(--color-bg-primary)'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'calendar' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border)"
              >
                <StreakStats stats={streakData} />
              </motion.div>

              {/* Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ContributionCalendar 
                  data={streakData} 
                  onDayClick={handleDayClick}
                />
              </motion.div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-8">
              {/* Detailed Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border)"
              >
                <h3 className="text-2xl font-semibold text-var(--color-text-primary) mb-6">
                  Detailed Statistics
                </h3>
                <StreakStats stats={streakData} />
              </motion.div>

              {/* Activity Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border)"
              >
                <h3 className="text-2xl font-semibold text-var(--color-text-primary) mb-6">
                  Activity Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📝</div>
                    <div className="text-2xl font-bold text-var(--color-text-primary)">
                      {streakData?.totalPosts || 0}
                    </div>
                    <div className="text-var(--color-text-secondary)">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">❤️</div>
                    <div className="text-2xl font-bold text-var(--color-text-primary)">
                      {streakData?.totalLikesReceived || 0}
                    </div>
                    <div className="text-var(--color-text-secondary)">Likes Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">👍</div>
                    <div className="text-2xl font-bold text-var(--color-text-primary)">
                      {streakData?.calendarData?.reduce((sum, day) => sum + day.likes, 0) || 0}
                    </div>
                    <div className="text-var(--color-text-secondary)">Likes Given</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <div className="text-2xl font-bold text-var(--color-text-primary)">
                      {streakData?.calendarData?.reduce((sum, day) => sum + day.comments, 0) || 0}
                    </div>
                    <div className="text-var(--color-text-secondary)">Comments</div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border)"
              >
                <h3 className="text-2xl font-semibold text-var(--color-text-primary) mb-6">
                  Your Badges
                </h3>
                <BadgesDisplay badges={badges} />
              </motion.div>

              {/* Badge Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-var(--color-bg-secondary) p-6 rounded-xl border border-var(--color-border)"
              >
                <h3 className="text-2xl font-semibold text-var(--color-text-primary) mb-6">
                  Badge Progress
                </h3>
                <div className="space-y-4">
                  {[
                    { id: 'first-post', name: 'First Post', requirement: 1, current: streakData?.totalPosts || 0, icon: '📝' },
                    { id: 'week-streak', name: 'Week Warrior', requirement: 7, current: streakData?.currentStreak || 0, icon: '🔥' },
                    { id: 'month-streak', name: 'Monthly Master', requirement: 30, current: streakData?.currentStreak || 0, icon: '⭐' },
                    { id: 'century-streak', name: 'Century Club', requirement: 100, current: streakData?.longestStreak || 0, icon: '🏆' }
                  ].map((badge) => {
                    const progress = Math.min((badge.current / badge.requirement) * 100, 100);
                    const earned = badge.current >= badge.requirement;
                    
                    return (
                      <div key={badge.id} className="flex items-center space-x-4">
                        <div className="text-2xl">{badge.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-var(--color-text-primary)">
                              {badge.name}
                            </span>
                            <span className="text-sm text-var(--color-text-secondary)">
                              {badge.current}/{badge.requirement}
                            </span>
                          </div>
                          <div className="w-full bg-var(--color-bg-primary) rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                earned ? 'bg-var(--color-accent)' : 'bg-var(--color-primary)'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        {earned && (
                          <div className="text-var(--color-accent) text-xl">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StreakPage; 