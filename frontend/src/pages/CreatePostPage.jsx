import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  Tag, 
  Type, 
  FileText,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Image upload config
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const CreatePostPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'other',
    tags: '',
    status: 'draft',
    featuredImage: {
      url: '',
      alt: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food' },
    { value: 'health', label: 'Health' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    if (formData.excerpt && formData.excerpt.length > 200) {
      newErrors.excerpt = 'Excerpt cannot be more than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const postData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await axios.post('http://localhost:3000/api/posts', postData);
      
      toast.success('Post created successfully!');
      // Notify streak page to refetch data
      window.dispatchEvent(new Event('post-created'));
      navigate(`/post/${response.data.data.post._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create post';
      toast.error(message);
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add image upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    setUploading(true);
    setUploadProgress(50); // Show some progress
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          url: base64Image,
          alt: file.name
        }
      }));
      
      setUploadProgress(100);
      toast.success('Image uploaded successfully!');
      setUploading(false);
      setUploadProgress(0);
    };
    
    reader.onerror = () => {
      toast.error('Failed to read image file');
      setUploading(false);
      setUploadProgress(0);
    };
    
    reader.readAsDataURL(file);
  };

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto px-2 md:px-0"
    >
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-[var(--primary)] to-[var(--chart-4)] rounded-lg shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--primary)] drop-shadow-lg">
            Create New Post
          </h1>
        </div>
        <p className="text-[var(--muted-foreground)]">
          Share your thoughts with the world. Write something amazing!
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 backdrop-blur-lg transition-all duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                  <Type className="inline w-4 h-4 mr-1" />
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors bg-[var(--card)] text-[var(--card-foreground)] placeholder-[var(--muted-foreground)] ${errors.title ? 'border-red-300 dark:border-red-600' : 'border-[var(--border)]'}`}
                  placeholder="Enter your post title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </motion.div>

              {/* Category */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--card)] text-[var(--card-foreground)]"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Excerpt */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                  Excerpt (Optional)
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors bg-[var(--card)] text-[var(--card-foreground)] placeholder-[var(--muted-foreground)] ${errors.excerpt ? 'border-red-300 dark:border-red-600' : 'border-[var(--border)]'}`}
                  placeholder="Brief description of your post..."
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.excerpt}</p>
                )}
              </motion.div>

              {/* Content */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors bg-[var(--card)] text-[var(--card-foreground)] placeholder-[var(--muted-foreground)] ${errors.content ? 'border-red-300 dark:border-red-600' : 'border-[var(--border)]'}`}
                  placeholder="Write your amazing content here..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                )}
              </motion.div>

              {/* Tags */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--card)] text-[var(--card-foreground)] placeholder-[var(--muted-foreground)]"
                  placeholder="technology, web development, react"
                />
              </motion.div>

              {/* Status */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--card)] text-[var(--card-foreground)]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </motion.div>

              {/* Featured Image Upload */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-[var(--primary)] mb-2 flex items-center gap-2">
                  <ImageIcon className="inline w-4 h-4 mr-1" />
                  Featured Image
                </label>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploading}
                      id="image-upload"
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 ${
                        uploading 
                          ? 'border-[var(--border)] bg-[var(--muted)] cursor-not-allowed' 
                          : 'border-[var(--primary)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 dark:hover:bg-[var(--primary)]/90'
                      }`}
                      style={{ 
                        background: uploading ? 'var(--muted)' : 'transparent',
                        borderColor: uploading ? 'var(--border)' : 'var(--primary)',
                        color: 'var(--foreground)'
                      }}
                    >
                      <Upload size={20} />
                      <span className="font-medium">
                        {uploading ? 'Uploading...' : 'Click to upload image'}
                      </span>
                    </label>
                    
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--primary)' }}>
                        <div className="loading-spinner w-4 h-4"></div>
                        {uploadProgress}%
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {formData.featuredImage.url && !uploading && (
                    <div className="relative group">
                      <img
                        src={formData.featuredImage.url}
                        alt={formData.featuredImage.alt || 'Preview'}
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-[var(--border)] shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, featuredImage: { url: '', alt: '' } }))}
                        className="absolute top-2 right-2 p-1 bg-[var(--red)] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[var(--red)]/90"
                        title="Remove image"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  <span>{isSubmitting ? 'Creating...' : 'Create Post'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-3 border border-[var(--border)] text-[var(--muted-foreground)] rounded-lg hover:bg-[var(--muted)] dark:hover:bg-[var(--muted)] transition-colors"
                >
                  {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 backdrop-blur-lg flex flex-col gap-4 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[var(--primary)] drop-shadow-lg">
              Preview
            </h3>
            
            {showPreview ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[var(--primary)] drop-shadow-lg">
                    {formData.title || 'Your title will appear here'}
                  </h4>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Category: {categories.find(c => c.value === formData.category)?.label}
                  </p>
                </div>
                
                {formData.excerpt && (
                  <p className="text-[var(--muted-foreground)] text-sm">
                    {formData.excerpt}
                  </p>
                )}
                
                <div className="text-sm text-[var(--muted-foreground)]">
                  <p>Content length: {formData.content.length} characters</p>
                  <p>Reading time: ~{Math.ceil(formData.content.length / 200)} min</p>
                </div>
                
                {formData.tags && (
                  <div>
                    <p className="text-sm font-medium text-[var(--primary)] drop-shadow-lg">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.split(',').map((tag, index) => (
                        tag.trim() && (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[var(--primary)]/10 dark:bg-[var(--primary)]/90 text-[var(--primary)] dark:text-[var(--primary)]/20 text-xs rounded-full"
                          >
                            {tag.trim()}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-[var(--muted-foreground)] py-8">
                <Eye size={48} className="mx-auto mb-4 opacity-50" />
                <p>Click the preview button to see your post</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreatePostPage; 