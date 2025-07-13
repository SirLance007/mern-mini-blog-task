import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, BookOpen, Heart, TrendingUp } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const floatingIcons = [
    { icon: BookOpen, delay: 0, x: -20, y: -30 },
    { icon: Heart, delay: 0.5, x: 20, y: -40 },
    { icon: TrendingUp, delay: 1, x: -30, y: 20 },
    { icon: Sparkles, delay: 1.5, x: 30, y: 30 }
  ];

  return (
    <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="absolute opacity-10"
            style={{ left: `${50 + item.x}%`, top: `${50 + item.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 8,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <item.icon size={48} style={{ color: 'var(--primary)' }} />
          </motion.div>
        ))}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-6 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <motion.div 
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 'var(--radius)' }} 
              className="p-3 shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-8 h-8" style={{ color: 'var(--primary-foreground)' }} />
            </motion.div>
            <h1 className="text-3xl font-bold" style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
              WebkitBackgroundClip: 'text', 
              color: 'transparent' 
            }}>
              BlogVista
            </h1>
          </div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--foreground)' }}>
            Welcome back!
          </h2>
          <p className="text-base mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Sign in to continue your journey
          </p>
        </motion.div>

        <motion.form 
          variants={itemVariants} 
          className="card space-y-5 p-6 shadow-2xl" 
          onSubmit={handleSubmit}
          style={{ 
            background: 'var(--card)', 
            color: 'var(--card-foreground)', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)', borderRadius: 'var(--radius)' }}
              className="p-3 mb-4 flex items-center gap-2 text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-current"></div>
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 transition-colors duration-200" style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={{ 
                    background: 'var(--input)', 
                    color: 'var(--input-foreground)', 
                    border: '2px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    paddingLeft: '2.5rem',
                    paddingRight: '1rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem'
                  }}
                  className="w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-neutral-400"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm flex items-center gap-1" 
                  style={{ color: 'var(--destructive)' }}
                >
                  <div className="w-1 h-1 rounded-full bg-current"></div>
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 transition-colors duration-200" style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  style={{ 
                    background: 'var(--input)', 
                    color: 'var(--input-foreground)', 
                    border: '2px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem'
                  }}
                  className="w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-neutral-400"
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  ) : (
                    <Eye className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                  )}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm flex items-center gap-1" 
                  style={{ color: 'var(--destructive)' }}
                >
                  <div className="w-1 h-1 rounded-full bg-current"></div>
                  {errors.password}
                </motion.p>
              )}
            </div>
          </div>

          <motion.div variants={itemVariants} className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                color: 'var(--primary-foreground)', 
                borderRadius: 'var(--radius)' 
              }}
              className="w-full py-3 px-4 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default LoginPage; 