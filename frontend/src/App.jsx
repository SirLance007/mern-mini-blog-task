import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LikeProvider } from './context/LikeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import ProfilePage from './pages/ProfilePage';
import TrendingPage from './pages/TrendingPage';
import SearchPage from './pages/SearchPage';
import SavedPostsPage from './pages/SavedPostsPage';
import StreakPage from './pages/StreakPage';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LikeProvider>
          <Router>
          <div style={{ background: 'var(--background)', color: 'var(--foreground)', minHeight: '100vh', position: 'relative' }}>
            <AnimatedBackground />
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/trending" element={<TrendingPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute>
                      <CreatePostPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/saved" 
                  element={
                    <ProtectedRoute>
                      <SavedPostsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/streak" 
                  element={
                    <ProtectedRoute>
                      <StreakPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#27272a',
                  color: '#fff',
                  borderRadius: '0.75rem',
                  border: '1px solid #3f3f46',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#2563eb',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
        </LikeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 