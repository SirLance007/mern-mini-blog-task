import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Heart, 
  Eye, 
  MessageCircle, 
  Clock, 
  User, 
  Share2, 
  ArrowLeft, 
  Calendar,
  Tag,
  BookOpen,
  ThumbsUp,
  Send,
  Trash2,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/posts/${id}`);
      const postData = response.data.data.post;
      setPost(postData);
      setIsLiked(postData.isLiked || false);
      setLikesCount(postData.likes?.length || 0);
      setComments(postData.comments || []);
    } catch (error) {
      setError('Failed to fetch post');
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/posts/${id}/like`);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      toast.success(isLiked ? 'Post unliked' : 'Post liked!');
      
      // Notify streak page to refetch data
      window.dispatchEvent(new Event('streak-data-update'));
    } catch (error) {
      toast.error('Failed to like post');
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await axios.post(`http://localhost:3000/api/posts/${id}/comments`, {
        content: newComment
      });
      
      const newCommentData = response.data.data.comment;
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add comment';
      toast.error(message);
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user || post.author._id !== user._id) {
      toast.error('You can only delete your own posts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeletingPost(true);
    try {
      await axios.delete(`http://localhost:3000/api/posts/${id}`);
      toast.success('Post deleted successfully!');
      
      // Notify streak page to refetch data
      window.dispatchEvent(new Event('post-deleted'));
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete post';
      toast.error(message);
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPost(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            {error || 'Post not found'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Post Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--primary)' }}>
              <img 
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=6366f1&color=fff`}
                alt={post.author?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {post.author?.name || 'Anonymous User'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {user && post.author?._id === user._id && (
              <>
                <motion.button
                  onClick={() => navigate(`/edit/${id}`)}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Edit post"
                >
                  <Edit3 size={16} />
                </motion.button>
                <motion.button
                  onClick={handleDeletePost}
                  disabled={deletingPost}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Delete post"
                >
                  {deletingPost ? (
                    <div className="loading-spinner w-4 h-4"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </motion.button>
              </>
            )}
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          {post.title}
        </h1>
        
        {post.excerpt && (
          <p className="text-xl mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {post.excerpt}
          </p>
        )}

        {/* Post Meta */}
        <div className="flex items-center space-x-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{calculateReadingTime(post.content)} min read</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{post.viewCount || 0} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </motion.div>

      {/* Featured Image */}
      {post.featuredImage?.url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt || post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </motion.div>
      )}

      {/* Post Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div 
          className="prose prose-lg max-w-none"
          style={{ color: 'var(--foreground)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Tag size={16} style={{ color: 'var(--muted-foreground)' }} />
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                style={{ 
                  background: 'var(--accent)', 
                  color: 'var(--accent-foreground)', 
                  borderRadius: 'var(--radius)', 
                  padding: '0.25rem 0.75rem', 
                  fontSize: '0.875rem' 
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between py-6 border-t border-b mb-8"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleLike}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
            style={isLiked 
              ? { background: 'var(--destructive)', color: 'var(--destructive-foreground)' }
              : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
            <span>{likesCount}</span>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={18} />
            <span>{comments.length}</span>
          </motion.button>
        </div>
        
        <motion.button
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Share2 size={18} />
          <span>Share</span>
        </motion.button>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
          Comments ({comments.length})
        </h3>

        {/* Add Comment */}
        {user && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <form onSubmit={handleComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg resize-none transition-all"
                style={{ 
                  background: 'var(--input)', 
                  color: 'var(--input-foreground)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)' 
                }}
              />
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {submittingComment ? (
                    <div className="loading-spinner w-4 h-4"></div>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Post Comment</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'User')}&background=6366f1&color=fff&size=32`}
                      alt={comment.author?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                        {comment.author?.name || 'Anonymous User'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostDetailPage; 