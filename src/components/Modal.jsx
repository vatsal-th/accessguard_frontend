import React, { useEffect } from 'react';

const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
    </div>
  );
};

export default Modal; 