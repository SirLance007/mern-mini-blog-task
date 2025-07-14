import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  Plus,
  Search,
  TrendingUp,
  Home,
  Settings,
  BookOpen,
  Sparkles,
  Heart,
  Bell,
  Star,
  Zap
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="w-5 h-5 md:w-6 md:h-6" /> },
    { to: '/trending', label: 'Trending', icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6" /> },
    { to: '/search', label: 'Search', icon: <Search className="w-5 h-5 md:w-6 md:h-6" /> },
    { to: '/streak', label: 'Streak', icon: <Zap className="w-5 h-5 md:w-6 md:h-6" /> },
  ];

  return (
    <nav
      style={{
        background: 'rgba(var(--card-rgb), 0.9)',
        color: 'var(--card-foreground)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50
      }}
      className="sticky top-0 w-full transition-all"
    >
      {/* Animated background for navbar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2 }}
          className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-[200px] h-[200px] bg-gradient-to-tr from-[var(--secondary)] to-[var(--primary)] rounded-full blur-2xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 relative z-10">
        <div className="flex flex-wrap justify-between items-center h-16 md:h-18 lg:h-20 gap-y-2">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
            <motion.div 
              style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                borderRadius: 'var(--radius)' 
              }} 
              className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center shadow-2xl relative overflow-hidden"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--primary-foreground)' }} />
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex flex-col"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span 
                className="text-lg md:text-2xl font-bold" 
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                  WebkitBackgroundClip: 'text', 
                  color: 'transparent' 
                }}
                whileHover={{ 
                  background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                  WebkitBackgroundClip: 'text'
                }}
                transition={{ duration: 0.3 }}
              >
                BlogVista
              </motion.span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2 lg:space-x-3 ml-2 sm:ml-4 md:ml-8 lg:ml-12 overflow-x-auto scrollbar-hide max-w-full">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.to}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={link.to}
                  className={`flex items-center space-x-2 px-5 py-2 md:px-6 lg:px-8 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
                    location.pathname === link.to
                      ? 'shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  style={location.pathname === link.to
                    ? { 
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                        color: 'var(--primary-foreground)',
                        boxShadow: '0 4px 20px 0 rgba(var(--primary-rgb), 0.3)'
                      }
                    : { 
                        color: 'var(--muted-foreground)',
                        background: 'transparent'
                      }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.icon}
                  </motion.div>
                  <motion.span
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.span>
                </Link>
              </motion.div>
            ))}

          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 min-w-0">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              style={{ 
                background: 'var(--muted)', 
                color: 'var(--muted-foreground)', 
                borderRadius: 'var(--radius)' 
              }}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-[var(--accent)] transition-all duration-200 relative overflow-hidden"
              aria-label="Toggle theme"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDark ? <Sun className="w-6 h-6 md:w-7 md:h-7" /> : <Moon className="w-6 h-6 md:w-7 md:h-7" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  className="flex items-center space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-full border shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group min-w-0"
                  style={{ 
                    borderColor: 'var(--border)',
                    background: 'var(--card)',
                    maxWidth: '200px'
                  }}
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-label="User menu"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                    whileHover={{ opacity: 0.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="relative flex-shrink-0">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
                      alt="Avatar"
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover border-2 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ borderColor: 'var(--primary)', objectFit: 'cover', objectPosition: 'center' }}
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 bg-green-500 border-white shadow-sm"
                    />
                  </div>
                  <div className="hidden sm:block text-left min-w-0 flex-1">
                    <span className="block font-medium text-xs sm:text-sm truncate" style={{ color: 'var(--foreground)' }}>{user?.name}</span>
                    <span className="block text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>@{user?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</span>
                  </div>
                </motion.button>
                
                {/* Enhanced Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 min-w-[250px] sm:min-w-[280px] max-w-[90vw] py-3 z-50"
                      style={{ 
                        boxShadow: '0 12px 40px 0 rgba(0,0,0,0.25)',
                        background: 'var(--card)',
                        color: 'var(--card-foreground)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      <div className="px-4 sm:px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
                              alt="Avatar"
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 shadow-lg"
                              style={{ borderColor: 'var(--primary)' }}
                            />
                            <div 
                              className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 bg-green-500 border-white shadow-sm"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--foreground)' }}>{user?.name}</span>
                            <span className="block text-xs sm:text-sm truncate" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div 
                                className="w-2 h-2 rounded-full bg-green-500"
                              />
                              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        {[
                          { to: '/profile', icon: <User size={18} />, label: 'Profile' },
                          { to: '/saved', icon: <BookOpen size={18} />, label: 'Saved Posts' },
                          { to: '/settings', icon: <Settings size={18} />, label: 'Settings' }
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center space-x-3 px-4 sm:px-6 py-3 hover:bg-[var(--muted)] rounded-lg transition-all duration-200 mx-2 group"
                            onClick={() => setDropdownOpen(false)}
                            style={{ color: 'var(--foreground)' }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.icon}
                            </motion.div>
                            <span className="font-medium text-sm sm:text-base">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t py-2" style={{ borderColor: 'var(--border)' }}>
                        <motion.button
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 sm:px-6 py-3 w-full hover:bg-[var(--destructive)] hover:bg-opacity-10 rounded-lg transition-all duration-200 mx-2 group"
                          style={{ color: 'var(--destructive)' }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <LogOut size={18} />
                          </motion.div>
                          <span className="font-medium text-sm sm:text-base">Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Sign In
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-xl hover:shadow-2xl relative overflow-hidden group"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                      color: 'var(--primary-foreground)' 
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">Sign Up</span>
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMenu}
              className="md:hidden w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-lg transition-all duration-200 relative overflow-hidden"
              style={{ 
                background: 'var(--muted)', 
                color: 'var(--muted-foreground)' 
              }}
              aria-label="Toggle menu"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-6 px-2 sm:px-4 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="space-y-2 sm:space-y-4">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-3 px-8 py-5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
                      location.pathname === link.to
                        ? 'shadow-lg'
                        : 'hover:bg-[var(--muted)]'
                    }`}
                    style={location.pathname === link.to
                      ? { 
                          background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                          color: 'var(--primary-foreground)' 
                        }
                      : { color: 'var(--muted-foreground)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                      whileHover={{ opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/create"
                    className="flex items-center space-x-3 px-8 py-5 rounded-xl font-medium transition-all duration-300 shadow-xl relative overflow-hidden group"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                      color: 'var(--primary-foreground)' 
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                    <Zap className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Create Post</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar; 