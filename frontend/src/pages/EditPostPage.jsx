import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Sparkles, Tag, Type, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../utils/config';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const EditPostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'other',
    tags: '',
    status: 'draft',
    featuredImage: { url: '', alt: '' }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
        const post = response.data.data.post;
        setFormData({
          title: post.title || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          category: post.category || 'other',
          tags: post.tags ? post.tags.join(', ') : '',
          status: post.status || 'draft',
          featuredImage: post.featuredImage || { url: '', alt: '' }
        });
      } catch (error) {
        toast.error('Failed to fetch post for editing');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
      await axios.put(`${API_BASE_URL}/posts/${id}`, postData);
      toast.success('Post updated successfully!');
      window.dispatchEvent(new Event('streak-data-update'));
      navigate(`/post/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update post';
      toast.error(message);
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    setUploading(true);
    setUploadProgress(50);
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

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Loading...</div>;
  }

  return (
    <motion.div className="max-w-4xl mx-auto px-2 md:px-0">
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
            Edit Post
          </h1>
        </div>
        <p className="text-[var(--muted-foreground)]">
          Update your post below and save your changes.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2">
          <div className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 backdrop-blur-lg transition-all duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
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
              </div>
              {/* Category */}
              <div>
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
              </div>
              {/* Excerpt */}
              <div>
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
              </div>
              {/* Content */}
              <div>
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
              </div>
              {/* Tags */}
              <div>
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
              </div>
              {/* Status */}
              <div>
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
              </div>
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                  <ImageIcon className="inline w-4 h-4 mr-1" />
                  Featured Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--muted)] file:text-[var(--muted-foreground)] hover:file:bg-[var(--primary)] hover:file:text-white"
                />
                {formData.featuredImage?.url && (
                  <img
                    src={formData.featuredImage.url}
                    alt={formData.featuredImage.alt || 'Featured'}
                    className="mt-4 w-full h-48 object-cover rounded-lg border border-[var(--border)]"
                  />
                )}
              </div>
              {/* Save Button */}
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <div className="loading-spinner w-5 h-5"></div>
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
        {/* Preview Section (optional) */}
        {/* ... you can add a preview here if desired ... */}
      </div>
    </motion.div>
  );
};

export default EditPostPage; 