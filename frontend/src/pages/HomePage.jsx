import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Heart, Eye, MessageCircle, Clock, User, TrendingUp, Search, Plus, Share2, Trash2, Bookmark, Sparkles, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikeContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../utils/config';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deletingPosts, setDeletingPosts] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const { user } = useAuth();
  const { isLiked, isSaved, toggleLike, toggleSave } = useLikes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await axios.get(`${API_BASE_URL}/posts?${params}`);
      
      if (page === 1) {
        setPosts(response.data.data.posts);
      } else {
        setPosts(prev => [...prev, ...response.data.data.posts]);
      }
      
      setHasMore(response.data.data.pagination.page < response.data.data.pagination.pages);
    } catch (error) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', error);
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
      
      // Trigger streak data update
      window.dispatchEvent(new CustomEvent('streak-data-update'));
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

  const handleDelete = async (postId) => {
    if (!user) return;
    
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    setDeletingPosts(prev => new Set([...prev, postToDelete]));
    
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postToDelete}`);
      
      // Remove the post from local state
      setPosts(prev => prev.filter(post => post._id !== postToDelete));
      
      // Trigger streak data update
      window.dispatchEvent(new CustomEvent('streak-data-update'));
      
      toast.success('Post deleted successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete post';
      toast.error(message);
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postToDelete);
        return newSet;
      });
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const handleSave = async (postId) => {
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }

    const success = await toggleSave(postId);
    if (success) {
      const message = isSaved(postId) ? 'Post saved successfully!' : 'Post removed from saved';
      toast.success(message);
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

  if (loading && page === 1) {
    return <Loading />;
  }

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'technology', label: 'Technology' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food' },
    { value: 'health', label: 'Health' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Floating icons for hero
  const floatingIcons = [
    { icon: BookOpen, delay: 0, x: -30, y: -20 },
    { icon: Heart, delay: 0.5, x: 30, y: -30 },
    { icon: TrendingUp, delay: 1, x: -40, y: 30 },
    { icon: Sparkles, delay: 1.5, x: 40, y: 40 },
    { icon: Users, delay: 2, x: 0, y: 50 }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto relative overflow-hidden"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Multiple gradient orbs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--secondary)] to-[var(--primary)] rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full blur-3xl"
        />
        
        {/* Floating icons spread across the page */}
        {floatingIcons.map((item, idx) => (
          <motion.div
            key={idx}
            className="absolute opacity-10"
            style={{ 
              left: `${20 + (idx * 15)}%`, 
              top: `${10 + (idx * 20)}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.25, 0.1], 
              scale: [1, 1.3, 1], 
              rotate: [0, 360],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 8 + idx * 2, 
              delay: item.delay, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            <item.icon size={48 + idx * 8} style={{ color: 'var(--primary)' }} />
          </motion.div>
        ))}
        
        {/* Additional floating elements */}
        {[...Array(8)].map((_, idx) => (
          <motion.div
            key={`extra-${idx}`}
            className="absolute opacity-5"
            style={{ 
              left: `${10 + (idx * 12)}%`, 
              top: `${5 + (idx * 15)}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.05, 0.15, 0.05], 
              scale: [0.8, 1.2, 0.8], 
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 12 + idx * 1.5, 
              delay: idx * 0.3, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ background: 'var(--primary)' }}
            />
          </motion.div>
        ))}
      </div>
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="text-center mb-12 py-16 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Welcome to <span style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', color: 'transparent' }}>BlogVista</span>
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Discover amazing stories, share your thoughts, and connect with writers from around the world
        </p>
        {user && (
          <motion.button
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create')}
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius)' }}
            className="inline-flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-4 text-lg"
          >
            <Sparkles size={24} />
            <span>Create Post</span>
          </motion.button>
        )}
      </motion.div>

      {/* Category Filters */}
      <motion.div variants={itemVariants} className="mb-8 px-4 sm:px-6">
        <div className="card p-4 sm:p-6" style={{ 
          background: 'var(--card)', 
          color: 'var(--card-foreground)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Filter by Category
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Choose a category to explore specific topics
            </p>
          </div>
          
          {/* Mobile: Scrollable horizontal list */}
          <div className="md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <motion.button
                  key={category.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setPage(1);
                  }}
                  style={selectedCategory === category.value
                    ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius)' }
                    : { background: 'var(--muted)', color: 'var(--muted-foreground)', borderRadius: 'var(--radius)' }}
                  className="flex-shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 shadow hover:shadow-md whitespace-nowrap"
                >
                  {category.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory(category.value);
                  setPage(1);
                }}
                style={selectedCategory === category.value
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius)' }
                  : { background: 'var(--muted)', color: 'var(--muted-foreground)', borderRadius: 'var(--radius)' }}
                className="px-3 py-2 text-sm font-medium transition-all duration-200 shadow hover:shadow-md"
              >
                {category.label}
              </motion.button>
            ))}
          </div>

          {/* Active filter indicator */}
          {selectedCategory !== 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ 
                background: 'var(--primary)', 
                color: 'var(--primary-foreground)' 
              }}>
                <span>Active:</span>
                <span>{categories.find(c => c.value === selectedCategory)?.label}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedCategory('all');
                    setPage(1);
                  }}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                >
                  ×
                </motion.button>
              </span>
            </motion.div>
          )}
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

      {/* Posts Grid */}
      <AnimatePresence>
        <motion.div variants={containerVariants} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {posts.map((post, index) => (
            <motion.article
              key={post._id}
              variants={itemVariants}
              layout
              className="card group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.025]"
              style={{ 
                background: 'var(--card)', 
                color: 'var(--card-foreground)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.10)'
              }}
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              <div className="aspect-video overflow-hidden bg-[var(--muted)] flex items-center justify-center">
                {post.featuredImage?.url ? (
                  <img 
                    src={post.featuredImage.url} 
                    alt={post.featuredImage.alt || post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ borderRadius: 'calc(var(--radius) - 2px)' }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-[var(--muted-foreground)] opacity-60">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="8" fill="var(--muted)"/><path d="M7 17l4-4 4 4M7 7h10v10H7V7z" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-xs mt-2">No image</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--primary)' }}>
                      <img 
                        src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=6366f1&color=fff`}
                        alt={post.author?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {post.author?.name || 'Anonymous User'}
                      </span>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Save Button - Only show for posts not created by current user */}
                    {user && post.author?._id !== user.id && (
                      <motion.button
                        onClick={() => handleSave(post._id)}
                        className="p-2 rounded-full transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        style={{ color: isSaved(post._id) ? 'var(--primary)' : 'var(--muted-foreground)' }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={isSaved(post._id) ? 'Remove from saved' : 'Save post'}
                      >
                        <Bookmark size={16} className={isSaved(post._id) ? 'fill-current' : ''} />
                      </motion.button>
                    )}
                    
                    {/* Delete Button - Only show for posts created by current user */}
                    {user && post.author?._id === user.id && (
                      <motion.button
                        onClick={() => handleDelete(post._id)}
                        disabled={deletingPosts.has(post._id)}
                        className="p-2 rounded-full transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                        style={{ color: 'var(--destructive)' }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete post"
                      >
                        {deletingPosts.has(post._id) ? (
                          <div className="loading-spinner w-4 h-4"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer" style={{ color: 'var(--foreground)' }}>
                  <span onClick={() => navigate(`/post/${post._id}`)}>{post.title}</span>
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
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
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
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        style={{ background: 'var(--accent)', color: 'var(--accent-foreground)', borderRadius: 'var(--radius)', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <motion.button 
                    onClick={() => handleComment(post._id)}
                    className="flex items-center space-x-1 hover:text-primary-600 transition-all duration-300"
                    style={{ color: 'var(--muted-foreground)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle size={16} />
                    <span className="text-sm">Comment</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => handleShare(post._id)}
                    className="flex items-center space-x-1 hover:text-primary-600 transition-all duration-300"
                    style={{ color: 'var(--muted-foreground)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 size={16} />
                    <span className="text-sm">Share</span>
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && (
        <motion.div 
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius)' }}
            className="px-8 py-3 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Loading...' : 'Load More Posts'}
          </motion.button>
        </motion.div>
      )}

      {!hasMore && posts.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="mt-12 text-center"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <p className="text-lg">🎉 You've reached the end!</p>
          <p className="text-sm mt-2">No more posts to load</p>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPostToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        loading={deletingPosts.has(postToDelete)}
      />
    </motion.div>
  );
};

export default HomePage; 