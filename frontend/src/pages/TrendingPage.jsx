import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { TrendingUp, Clock, Eye, Heart, Calendar, Filter, MessageCircle, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikeContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const TrendingPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('week');
  const [sortBy, setSortBy] = useState('trending');
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLikes();

  const timeFrames = [
    { value: 'day', label: 'Today', icon: Clock },
    { value: 'week', label: 'This Week', icon: Calendar },
    { value: 'month', label: 'This Month', icon: TrendingUp }
  ];

  const sortOptions = [
    { value: 'trending', label: 'Trending Score' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'recent', label: 'Recently Published' }
  ];

  useEffect(() => {
    fetchTrendingPosts();
  }, [timeFrame, sortBy]);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/posts/trending?timeFrame=${timeFrame}&limit=20`);
      setPosts(response.data.data.posts);
    } catch (error) {
      setError('Failed to fetch trending posts');
      console.error('Error fetching trending posts:', error);
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
      // Update the post in the local state
      setPosts(prev => prev.map(post => {
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

  const handleComment = (postId) => {
    // For now, just show an alert. In a real app, this would open a comment modal
    alert(`Comment functionality for post ${postId} - This would open a comment modal in a real app!`);
  };

  const handleShare = (postId) => {
    // For now, just show an alert. In a real app, this would open a share modal
    alert(`Share functionality for post ${postId} - This would open a share modal in a real app!`);
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

  const getTrendingScore = (post) => {
    // Calculate a simple trending score based on likes, views, and recency
    const likes = post.likes?.length || 0;
    const views = post.viewCount || 0;
    const daysSincePublished = Math.ceil((new Date() - new Date(post.publishedAt || post.createdAt)) / (1000 * 60 * 60 * 24));
    const recencyFactor = Math.max(0.1, 1 - (daysSincePublished / 30));
    
    return Math.round((likes * 10 + views * 0.1) * recencyFactor);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'likes':
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      case 'views':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'recent':
        return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
      case 'trending':
      default:
        return getTrendingScore(b) - getTrendingScore(a);
    }
  });

  const POSTS_PER_PAGE = 9;
  const [page, setPage] = useState(1);
  const paginatedPosts = sortedPosts.slice(0, page * POSTS_PER_PAGE);

  if (loading) {
    return <Loading />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // smaller stagger
        duration: 0.6,         // longer duration
        ease: [0.4, 0, 0.2, 1] // custom cubic-bezier for smoothness
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  // Memoized PostCard
  const TrendingPostCard = React.memo(function TrendingPostCard({ post, index, isLiked, handleLike, handleComment, handleShare, getTrendingScore, formatDate }) {
    return (
      <motion.article
        key={post._id}
        variants={itemVariants}
        layout
        className="card group overflow-hidden transition-all duration-300 hover:shadow-xl relative"
        style={{ 
          background: 'var(--card)', 
          color: 'var(--card-foreground)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}
        whileHover={{ y: -5 }}
      >
        {/* Trending Badge */}
        {index < 3 && (
          <div className="absolute top-4 left-4 z-10">
            <div className="px-3 py-1 rounded-full text-sm font-bold shadow-lg" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              #{index + 1} Trending
            </div>
          </div>
        )}

        {post.featuredImage?.url && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={post.featuredImage.url} 
              alt={post.featuredImage.alt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ borderRadius: 'calc(var(--radius) - 2px)' }}
              loading="lazy"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--primary)' }}>
              <img 
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=6366f1&color=fff`}
                alt={post.author?.name || 'User'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {post.author?.name || 'Anonymous User'}
              </span>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {formatDate(post.publishedAt || post.createdAt)}
              </p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer" style={{ color: 'var(--foreground)' }}>
            <a href={`/post/${post._id}`}>{post.title}</a>
          </h2>
          
          {post.excerpt && (
            <p className="mb-4 line-clamp-3" style={{ color: 'var(--muted-foreground)' }}>
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{post.readingTime || '5'} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye size={14} />
                <span>{post.viewCount || 0}</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => handleLike(post._id)}
              style={isLiked(post._id)
                ? { color: 'var(--destructive)', background: 'var(--muted)', borderRadius: 'var(--radius)' }
                : { color: 'var(--muted-foreground)', background: 'var(--muted)', borderRadius: 'var(--radius)' }}
              className="flex items-center space-x-1 px-3 py-1 text-sm transition-colors hover:bg-opacity-80"
            >
              <Heart size={16} className={isLiked(post._id) ? 'fill-current' : ''} />
              <span>{post.likes?.length || 0}</span>
            </motion.button>
          </div>

          {/* Trending Score */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Score: {getTrendingScore(post)}
              </span>
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    style={{ background: 'var(--accent)', color: 'var(--accent-foreground)', borderRadius: 'var(--radius)', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <motion.button 
              onClick={() => handleComment(post._id)}
              className="flex items-center space-x-1 hover:text-primary-600 transition-all duration-300"
              style={{ color: 'var(--muted-foreground)' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <MessageCircle size={16} />
              <span className="text-sm">Comment</span>
            </motion.button>
            
            <motion.button 
              onClick={() => handleShare(post._id)}
              className="flex items-center space-x-1 hover:text-primary-600 transition-all duration-300"
              style={{ color: 'var(--muted-foreground)' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Share2 size={16} />
              <span className="text-sm">Share</span>
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 rounded-lg shadow-lg" style={{ background: 'var(--primary)' }}>
            <TrendingUp className="w-8 h-8" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--foreground)' }}>
            Trending Posts
          </h1>
        </div>
        <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Discover the most popular and engaging content from our community
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="card p-6" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {timeFrames.map((frame) => (
                <motion.button
                  key={frame.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeFrame(frame.value)}
                  style={timeFrame === frame.value
                    ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius)' }
                    : { background: 'var(--muted)', color: 'var(--muted-foreground)', borderRadius: 'var(--radius)' }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 shadow hover:shadow-md"
                >
                  <frame.icon size={16} />
                  <span>{frame.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex items-center space-x-2 relative">
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ 
                    background: 'var(--input)', 
                    color: 'var(--input-foreground)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    paddingRight: '2.5rem',
                  }}
                  className="px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none pr-10"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[var(--input)] text-[var(--input-foreground)]">
                      {option.label}
                    </option>
                  ))}
                </select>
                {/* Custom arrow icon */}
                <svg className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 p-4"
          style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
        >
          {error}
        </motion.div>
      )}

      {/* Trending Posts Grid */}
      <AnimatePresence>
        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post, index) => (
            <TrendingPostCard
              key={post._id}
              post={post}
              index={index}
              isLiked={isLiked}
              handleLike={handleLike}
              handleComment={handleComment}
              handleShare={handleShare}
              getTrendingScore={getTrendingScore}
              formatDate={formatDate}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {paginatedPosts.length < sortedPosts.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Load More
          </button>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <motion.div 
          variants={itemVariants}
          className="text-center py-12"
        >
          <div style={{ color: 'var(--muted-foreground)' }} className="mb-4">
            <TrendingUp size={64} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            No trending posts found
          </h3>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Check back later for the latest trending content!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrendingPage; 