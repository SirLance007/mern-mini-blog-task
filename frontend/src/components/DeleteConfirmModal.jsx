import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading = false }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="card max-w-md w-full p-6"
          style={{ 
            background: 'var(--card)', 
            color: 'var(--card-foreground)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full" style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              {title || 'Confirm Delete'}
            </h3>
            <button
              onClick={onClose}
              className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <X size={16} />
            </button>
          </div>

          <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>

          <div className="flex gap-3">
            <motion.button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal; 