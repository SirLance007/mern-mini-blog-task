import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Heart, Eye, MessageCircle, Clock, User, Share2, Bookmark, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikeContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import toast from 'react-hot-toast';

const SavedPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingPosts, setDeletingPosts] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const { user } = useAuth();
  const { isLiked, isSaved, toggleLike, toggleSave } = useLikes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/posts/saved');
      setPosts(response.data.data.posts);
    } catch (error) {
      setError('Failed to fetch saved posts');
      console.error('Error fetching saved posts:', error);
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

  const handleUnsave = async (postId) => {
    if (!user) {
      toast.error('Please login to manage saved posts');
      return;
    }
    
    const success = await toggleSave(postId);
    if (success) {
      // Remove the post from local state
      setPosts(prev => prev.filter(post => post._id !== postId));
      toast.success('Post removed from saved');
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

  if (loading) {
    return <Loading />;
  }

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="text-center mb-12 py-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          <span style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', color: 'transparent' }}>Saved Posts</span>
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Your collection of favorite posts and articles
        </p>
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

      {posts.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-12"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <Bookmark size={64} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">No saved posts yet</h2>
          <p className="mb-6">Start saving posts you like to see them here!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius)' }}
            className="inline-flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
          >
            <span>Explore Posts</span>
          </motion.button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.article
                key={post._id}
                variants={itemVariants}
                layout
                className="card group overflow-hidden transition-all duration-300 hover:shadow-xl"
                style={{ 
                  background: 'var(--card)', 
                  color: 'var(--card-foreground)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)'
                }}
                whileHover={{ y: -5 }}
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
                      {/* Unsave Button */}
                      <motion.button
                        onClick={() => handleUnsave(post._id)}
                        className="p-2 rounded-full transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                        style={{ color: 'var(--destructive)' }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Remove from saved"
                      >
                        <Trash2 size={16} />
                      </motion.button>
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
                      onClick={() => navigate(`/post/${post._id}`)}
                      className="flex items-center space-x-1 hover:text-primary-600 transition-all duration-300"
                      style={{ color: 'var(--muted-foreground)' }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MessageCircle size={16} />
                      <span className="text-sm">View Post</span>
                    </motion.button>
                    
                    <motion.button 
                      onClick={() => handleUnsave(post._id)}
                      className="flex items-center space-x-1 hover:text-red-600 transition-all duration-300"
                      style={{ color: 'var(--destructive)' }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                      <span className="text-sm">Remove</span>
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPostToDelete(null);
        }}
        onConfirm={() => {
          if (postToDelete) {
            handleUnsave(postToDelete);
            setShowDeleteModal(false);
            setPostToDelete(null);
          }
        }}
        title="Remove from Saved"
        message="Are you sure you want to remove this post from your saved posts?"
        loading={false}
      />
    </motion.div>
  );
};

export default SavedPostsPage; 