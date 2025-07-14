import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

const LikeContext = createContext();

export const LikeProvider = ({ children }) => {
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const { user, isAuthenticated } = useAuth();

  // Fetch user's liked and saved posts on login
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserLikes();
      fetchUserSaves();
    } else {
      setLikedPosts(new Set());
      setSavedPosts(new Set());
    }
  }, [isAuthenticated, user]);

  const fetchUserLikes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/liked`);
      const likedPostIds = new Set(response.data.data.posts.map(post => post._id));
      setLikedPosts(likedPostIds);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const fetchUserSaves = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/saved`);
      const savedPostIds = new Set(response.data.data.posts.map(post => post._id));
      setSavedPosts(savedPostIds);
    } catch (error) {
      console.error('Error fetching user saves:', error);
    }
  };

  const toggleLike = async (postId) => {
    if (!isAuthenticated) return false;

    try {
      await axios.put(`${API_BASE_URL}/posts/${postId}/like`);
      
      const newLikedPosts = new Set(likedPosts);
      if (newLikedPosts.has(postId)) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      setLikedPosts(newLikedPosts);
      
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  };

  const toggleSave = async (postId) => {
    if (!isAuthenticated) return false;

    try {
      const newSavedPosts = new Set(savedPosts);
      if (newSavedPosts.has(postId)) {
        // Unsave
        await axios.delete(`${API_BASE_URL}/posts/${postId}/save`);
        newSavedPosts.delete(postId);
      } else {
        // Save
        await axios.post(`${API_BASE_URL}/posts/${postId}/save`);
        newSavedPosts.add(postId);
      }
      setSavedPosts(newSavedPosts);
      
      return true;
    } catch (error) {
      console.error('Error toggling save:', error);
      return false;
    }
  };

  const isLiked = (postId) => {
    return likedPosts.has(postId);
  };

  const isSaved = (postId) => {
    return savedPosts.has(postId);
  };

  const value = {
    likedPosts,
    savedPosts,
    toggleLike,
    toggleSave,
    isLiked,
    isSaved,
    fetchUserLikes,
    fetchUserSaves
  };

  return (
    <LikeContext.Provider value={value}>
      {children}
    </LikeContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikeProvider');
  }
  return context;
}; 