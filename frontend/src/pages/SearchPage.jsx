import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Clock, Eye, Heart, MessageCircle, User, Calendar, TrendingUp, Hash } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../utils/config';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'relevance',
    timeFrame: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLikes();
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Categories', icon: Hash },
    { value: 'technology', label: 'Technology', icon: TrendingUp },
    { value: 'lifestyle', label: 'Lifestyle', icon: User },
    { value: 'travel', label: 'Travel', icon: Calendar },
    { value: 'food', label: 'Food', icon: Hash },
    { value: 'health', label: 'Health', icon: Hash },
    { value: 'business', label: 'Business', icon: Hash },
    { value: 'entertainment', label: 'Entertainment', icon: Hash },
    { value: 'other', label: 'Other', icon: Hash }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'views', label: 'Most Viewed' }
  ];

  const timeFrames = [
    { value: 'all', label: 'All Time' },
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        category: filters.category,
        sortBy: filters.sortBy,
        timeFrame: filters.timeFrame
      });
      
      const response = await axios.get(`${API_BASE_URL}/posts/search?${params}`);
      setResults(response.data.data.posts);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    
    const success = await toggleLike(postId);
    if (success) {
      setResults(prev => prev.map(post => {
        if (post._id === postId) {
          const newIsLiked = !isLiked(postId);
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newIsLiked 
              ? [...(post.likes || []), { user: user._id }]
              : (post.likes || []).filter(like => like.user !== user._id)
          };
        }
        return post;
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  return (
    <div className="max-w-6xl mx-auto" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span style={{ 
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))', 
            WebkitBackgroundClip: 'text', 
            color: 'transparent' 
          }}>
            Search Posts
          </span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Discover amazing content from our community
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for posts, authors, or topics..."
              className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-primary/20"
              style={{ 
                background: 'var(--input)', 
                color: 'var(--input-foreground)', 
                borderColor: 'var(--border)' 
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              <Filter size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card p-6" style={{ 
              background: 'var(--card)', 
              color: 'var(--card-foreground)', 
              borderRadius: 'var(--radius)', 
              border: '1px solid var(--border)' 
            }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border transition-all duration-200"
                    style={{ 
                      background: 'var(--input)', 
                      color: 'var(--input-foreground)', 
                      borderColor: 'var(--border)' 
                    }}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border transition-all duration-200"
                    style={{ 
                      background: 'var(--input)', 
                      color: 'var(--input-foreground)', 
                      borderColor: 'var(--border)' 
                    }}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Frame Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Time Frame
                  </label>
                  <select
                    value={filters.timeFrame}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeFrame: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border transition-all duration-200"
                    style={{ 
                      background: 'var(--input)', 
                      color: 'var(--input-foreground)', 
                      borderColor: 'var(--border)' 
                    }}
                  >
                    {timeFrames.map(timeFrame => (
                      <option key={timeFrame.value} value={timeFrame.value}>
                        {timeFrame.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p style={{ color: 'var(--muted-foreground)' }}>Searching...</p>
          </div>
        ) : query.trim() ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                Search Results ({results.length})
              </h2>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
                <Search size={64} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p>Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {results.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card p-6 hover:shadow-lg transition-all duration-200"
                    style={{ 
                      background: 'var(--card)', 
                      color: 'var(--card-foreground)', 
                      borderRadius: 'var(--radius)', 
                      border: '1px solid var(--border)' 
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Author Avatar */}
                      <img
                        src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=6366f1&color=fff&size=64`}
                        alt={post.author?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        {/* Post Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                            {post.author?.name || 'Anonymous'}
                          </span>
                          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            • {formatDate(post.createdAt)}
                          </span>
                          {post.category && (
                            <span className="px-2 py-1 text-xs rounded-full" style={{ 
                              background: 'var(--primary)', 
                              color: 'var(--primary-foreground)' 
                            }}>
                              {post.category}
                            </span>
                          )}
                        </div>

                        {/* Post Title */}
                        <h3 
                          className="text-xl font-semibold mb-2 cursor-pointer hover:underline"
                          style={{ color: 'var(--foreground)' }}
                          onClick={() => navigate(`/post/${post._id}`)}
                        >
                          {post.title}
                        </h3>

                        {/* Post Excerpt */}
                        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                          {post.excerpt}
                        </p>

                        {/* Featured Image */}
                        {post.featuredImage && (
                          <div className="mb-4">
                            <img 
                              src={post.featuredImage} 
                              alt={post.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Post Stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            <div className="flex items-center gap-1">
                              <Eye size={14} />
                              <span>{post.viewCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart size={14} />
                              <span>{post.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle size={14} />
                              <span>{post.comments?.length || 0}</span>
                            </div>
                          </div>

                          {/* Like Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLike(post._id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                            style={isLiked(post._id)
                              ? { background: 'var(--destructive)', color: 'var(--destructive-foreground)' }
                              : { background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                          >
                            <Heart size={16} className={isLiked(post._id) ? 'fill-current' : ''} />
                            <span>{isLiked(post._id) ? 'Liked' : 'Like'}</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
            <Search size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p>Enter a search term to find posts, authors, or topics</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SearchPage; 