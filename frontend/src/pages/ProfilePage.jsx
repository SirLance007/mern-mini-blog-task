import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikeContext';
import { Mail, User, Globe, Twitter, Github, Instagram, Save, Edit2, Camera, Upload, Heart, BookOpen, FileText, Eye, MessageCircle, Clock, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/config';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    socialLinks: user?.socialLinks || { twitter: '', github: '', instagram: '', website: '' },
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [deletingPosts, setDeletingPosts] = useState(new Set());
  const fileInputRef = useRef();
  const { isLiked, toggleLike } = useLikes();
  const navigate = useNavigate();
  const [userPostsLoaded, setUserPostsLoaded] = useState(false);
  const [likedPostsLoaded, setLikedPostsLoaded] = useState(false);
  const POSTS_PER_PAGE = 10;
  const [postPage, setPostPage] = useState(1);
  const [likedPage, setLikedPage] = useState(1);
  
  const paginatedUserPosts = userPosts.slice(0, postPage * POSTS_PER_PAGE);
  const paginatedLikedPosts = likedPosts.slice(0, likedPage * POSTS_PER_PAGE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      setProfile(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [name.split('.')[1]]: value
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      
      // Update local state immediately
      setAvatarPreview(base64Image);
      setProfile(prev => ({ ...prev, avatar: base64Image }));
      
      // Save to backend
      axios.put(`${API_BASE_URL}/auth/profile`, {
        name: profile.name,
        bio: profile.bio,
        avatar: base64Image,
        socialLinks: profile.socialLinks
      })
      .then(response => {
        if (response.data.success) {
          updateUser(response.data.data.user);
          toast.success('Avatar updated successfully!');
        }
      })
      .catch(error => {
        console.error('Avatar upload error:', error);
        const message = error.response?.data?.message || 'Failed to upload avatar';
        toast.error(message);
        
        // Revert to original avatar on error
        setAvatarPreview(user?.avatar || '');
        setProfile(prev => ({ ...prev, avatar: user?.avatar || '' }));
      })
      .finally(() => {
        setIsUploading(false);
      });
    };
    
    reader.onerror = () => {
      toast.error('Failed to read image file');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleEdit = () => setEditMode(true);
  
  const handleCancel = () => {
    setEditMode(false);
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      socialLinks: user?.socialLinks || { twitter: '', github: '', instagram: '', website: '' },
    });
    setAvatarPreview(user?.avatar || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, {
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        socialLinks: profile.socialLinks
      });
      
      if (response.data.success) {
        updateUser(response.data.data.user);
        setEditMode(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;
    
    setLoadingPosts(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/my`);
      setUserPosts(response.data.data.posts);
      setUserPostsLoaded(true);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast.error('Failed to fetch your posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchLikedPosts = async () => {
    if (!user) return;
    
    setLoadingPosts(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/liked`);
      setLikedPosts(response.data.data.posts);
      setLikedPostsLoaded(true);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      toast.error('Failed to fetch liked posts');
    } finally {
      setLoadingPosts(false);
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
      setLikedPosts(prev => prev.map(post => {
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

  const handleDeletePost = async (postId) => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    setDeletingPosts(prev => new Set([...prev, postId]));
    
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`);
      
      // Remove from local state
      setUserPosts(prev => prev.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
      
      // Notify streak page to refetch data
      window.dispatchEvent(new Event('post-deleted'));
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete post';
      toast.error(message);
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
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
    if (activeTab === 'posts' && !userPostsLoaded) {
      fetchUserPosts();
    } else if (activeTab === 'liked' && !likedPostsLoaded) {
      fetchLikedPosts();
    }
    // Only fetch when needed!
  }, [activeTab, user, userPostsLoaded, likedPostsLoaded]);

  // Memoized PostCard for user posts
  const UserPostCard = React.memo(function UserPostCard({ post, user, navigate, handleDeletePost, deletingPosts, formatDate }) {
    return (
      <motion.div 
        key={post._id} 
        className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl"
        style={{ 
          borderColor: 'var(--border)',
          background: 'var(--card)',
          color: 'var(--card-foreground)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
      >
        {post.featuredImage && (
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            {/* Optionally, you can show a blurred background image here */}
          </div>
        )}
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=40`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover border-2"
                  style={{ borderColor: 'var(--primary)' }}
                  loading="lazy"
                />
                <div>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {user?.name || 'Anonymous'}
                  </span>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
              {/* Category Badge */}
              {post.category && (
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ 
                  background: 'var(--primary)', 
                  color: 'var(--primary-foreground)' 
                }}>
                  {post.category}
                </div>
              )}
              {/* Title */}
              <h3 
                className="text-xl font-bold mb-3 cursor-pointer hover:underline transition-all duration-200"
                style={{ color: 'var(--foreground)' }}
                onClick={() => navigate(`/post/${post._id}`)}
              >
                {post.title}
              </h3>
              {/* Excerpt */}
              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {post.excerpt}
              </p>
              {/* Featured Image */}
              {post.featuredImage?.url ? (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={post.featuredImage.url} 
                    alt={post.featuredImage.alt || post.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : post.featuredImage ? (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : null}
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {post.viewCount || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {post.likes?.length || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageCircle size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {post.comments?.length || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 ml-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/post/${post._id}`)}
                className="p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                title="View Post"
              >
                <Eye size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDeletePost(post._id)}
                disabled={deletingPosts.has(post._id)}
                className="p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
                title="Delete Post"
              >
                {deletingPosts.has(post._id) ? (
                  <div className="loading-spinner w-4 h-4"></div>
                ) : (
                  <Trash2 size={18} />
                )}
              </motion.button>
            </div>
          </div>
          </div>
        </motion.div>
    );
  });

  // Memoized PostCard for liked posts
  const LikedPostCard = React.memo(function LikedPostCard({ post, isLiked, navigate, handleLike, user, formatDate }) {
    return (
      <motion.div 
        key={post._id} 
        className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl"
        style={{ 
          borderColor: 'var(--border)',
          background: 'var(--card)',
          color: 'var(--card-foreground)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
      >
        {post.featuredImage && (
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            {/* Optionally, you can show a blurred background image here */}
          </div>
        )}
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=6366f1&color=fff&size=40`}
                  alt={post.author?.name}
                  className="w-10 h-10 rounded-full object-cover border-2"
                  style={{ borderColor: 'var(--primary)' }}
                  loading="lazy"
                />
                <div>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {post.author?.name || 'Anonymous'}
                  </span>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
              {/* Category Badge */}
              {post.category && (
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ 
                  background: 'var(--primary)', 
                  color: 'var(--primary-foreground)' 
                }}>
                  {post.category}
                </div>
              )}
              {/* Title */}
              <h3 
                className="text-xl font-bold mb-3 cursor-pointer hover:underline transition-all duration-200"
                style={{ color: 'var(--foreground)' }}
                onClick={() => navigate(`/post/${post._id}`)}
              >
                {post.title}
              </h3>
              {/* Excerpt */}
              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {post.excerpt}
              </p>
              {/* Featured Image */}
              {post.featuredImage?.url ? (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={post.featuredImage.url} 
                    alt={post.featuredImage.alt || post.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : post.featuredImage ? (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : null}
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {post.viewCount || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart size={14} style={{ color: 'var(--destructive)' }} />
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {post.likes?.length || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageCircle size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {post.comments?.length || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 ml-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/post/${post._id}`)}
                className="p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                title="View Post"
              >
                <Eye size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleLike(post._id)}
                className="p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                style={isLiked(post._id)
                  ? { background: 'var(--destructive)', color: 'var(--destructive-foreground)' }
                  : { background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                title={isLiked(post._id) ? 'Unlike' : 'Like'}
              >
                <Heart size={18} className={isLiked(post._id) ? 'fill-current' : ''} />
              </motion.button>
            </div>
          </div>
          </div>
        </motion.div>
    );
  });

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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-1 p-1 rounded-lg" style={{ background: 'var(--muted)' }}>
          {[
            { id: 'profile', label: 'Profile', icon: <User size={16} /> },
            { id: 'posts', label: 'My Posts', icon: <FileText size={16} /> },
            { id: 'liked', label: 'Liked Posts', icon: <Heart size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'shadow-sm'
                  : 'hover:bg-opacity-80'
              }`}
              style={
                activeTab === tab.id
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { color: 'var(--muted-foreground)' }
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div 
          className="card flex flex-col items-center gap-6 p-8"
          style={{ 
            background: 'var(--card)', 
            color: 'var(--card-foreground)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        {/* Avatar Section */}
        <div className="relative group">
          <div className="relative">
            <img
              src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=6366f1&color=fff&size=128`}
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover shadow-lg border-4"
              style={{ borderColor: 'var(--primary)' }}
            />
            {editMode && (
              <motion.button
                className="absolute bottom-2 right-2 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                onClick={() => {
                  console.log('Camera button clicked');
                  fileInputRef.current.click();
                }}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isUploading ? (
                  <div className="loading-spinner w-5 h-5"></div>
                ) : (
                  <Camera size={20} />
                )}
              </motion.button>
            )}
            {editMode && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Upload size={24} className="text-white" />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
        </div>

        {/* Profile Form */}
        <form className="w-full space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <User size={16} /> Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editMode}
                style={{ 
                  background: 'var(--input)', 
                  color: 'var(--input-foreground)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)' 
                }}
                className="px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 transition-all"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled
                style={{ 
                  background: 'var(--input)', 
                  color: 'var(--input-foreground)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)' 
                }}
                className="px-4 py-2 opacity-60 cursor-not-allowed"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              disabled={!editMode}
              rows={4}
              style={{ 
                background: 'var(--input)', 
                color: 'var(--input-foreground)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius)' 
              }}
              className="px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 transition-all resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Social Links</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Twitter size={14} style={{ color: '#1DA1F2' }} />
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Twitter</span>
                </div>
                <input
                  type="text"
                  name="socialLinks.twitter"
                  value={profile.socialLinks.twitter}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="@username"
                  style={{ 
                    background: 'var(--input)', 
                    color: 'var(--input-foreground)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)' 
                  }}
                  className="px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Github size={14} style={{ color: 'var(--foreground)' }} />
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>GitHub</span>
                </div>
                <input
                  type="text"
                  name="socialLinks.github"
                  value={profile.socialLinks.github}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="username"
                  style={{ 
                    background: 'var(--input)', 
                    color: 'var(--input-foreground)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)' 
                  }}
                  className="px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Instagram size={14} style={{ color: '#E4405F' }} />
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Instagram</span>
                </div>
                <input
                  type="text"
                  name="socialLinks.instagram"
                  value={profile.socialLinks.instagram}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="username"
                  style={{ 
                    background: 'var(--input)', 
                    color: 'var(--input-foreground)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)' 
                  }}
                  className="px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Globe size={14} style={{ color: '#10B981' }} />
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Website</span>
                </div>
                <input
                  type="text"
                  name="socialLinks.website"
                  value={profile.socialLinks.website}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="https://..."
                  style={{ 
                    background: 'var(--input)', 
                    color: 'var(--input-foreground)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)' 
                  }}
                  className="px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 transition-all"
                />
              </div>
            </div>
          </div>

          {editMode && (
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <motion.button 
                type="submit" 
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="loading-spinner w-5 h-5"></div>
                ) : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                )}
              </motion.button>
              <motion.button 
                type="button" 
                onClick={handleCancel} 
                className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          )}
        </form>

        {/* Edit Button - Outside the form */}
        {!editMode && (
          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <motion.button 
              type="button" 
              onClick={handleEdit} 
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit2 size={18} /> Edit Profile
            </motion.button>
          </div>
        )}
      </motion.div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with Stats */}
          <div className="card p-6 mb-6" style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            color: 'var(--primary-foreground)', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)' 
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">My Posts</h2>
                  <p className="text-sm opacity-90">{userPosts.length} posts published</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{userPosts.length}</div>
                <div className="text-sm opacity-90">Total Posts</div>
              </div>
            </div>
          </div>
          
          {loadingPosts ? (
            <div className="card p-8 text-center" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
              <p style={{ color: 'var(--muted-foreground)' }}>Loading your posts...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="card p-12 text-center" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <FileText size={48} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>No posts yet</h3>
                <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>Start writing your first post to see it here!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/create')}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Create Your First Post
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {paginatedUserPosts.map((post, index) => (
                <UserPostCard
                  key={post._id}
                  post={post}
                  user={user}
                  navigate={navigate}
                  handleDeletePost={handleDeletePost}
                  deletingPosts={deletingPosts}
                  formatDate={formatDate}
                />
              ))}
              {paginatedUserPosts.length < userPosts.length && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setPostPage(p => p + 1)}
                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Liked Posts Tab */}
      {activeTab === 'liked' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with Stats */}
          <div className="card p-6 mb-6" style={{ 
            background: 'linear-gradient(135deg, var(--destructive), #ff6b6b)', 
            color: 'var(--destructive-foreground)', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)' 
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Heart size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Liked Posts</h2>
                  <p className="text-sm opacity-90">{likedPosts.length} posts liked</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{likedPosts.length}</div>
                <div className="text-sm opacity-90">Total Likes</div>
              </div>
            </div>
          </div>
          
          {loadingPosts ? (
            <div className="card p-8 text-center" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
              <p style={{ color: 'var(--muted-foreground)' }}>Loading liked posts...</p>
            </div>
          ) : likedPosts.length === 0 ? (
            <div className="card p-12 text-center" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Heart size={48} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>No liked posts yet</h3>
                <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>Like some posts to see them here!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Explore Posts
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {paginatedLikedPosts.map((post, index) => (
                <LikedPostCard
                  key={post._id}
                  post={post}
                  isLiked={isLiked}
                  navigate={navigate}
                  handleLike={handleLike}
                  user={user}
                  formatDate={formatDate}
                />
              ))}
              {paginatedLikedPosts.length < likedPosts.length && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setLikedPage(p => p + 1)}
                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage; 