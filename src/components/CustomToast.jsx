import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useState, useCallback } from 'react';

// Custom Toast Hook
export const useCustomToast = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    
    return id;
  }, [removeToast]);

  const toast = useCallback({
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    warning: (message, duration) => showToast(message, 'warning', duration)
  }, [showToast]);

  return { toasts, removeToast, toast };
};

// Custom Toast Component
export const CustomToastContainer = ({ toasts, removeToast }) => {
  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return faCheckCircle;
      case 'error': return faTimes;
      case 'warning': return faExclamationTriangle;
      default: return faInfoCircle;
    }
  };

  const getToastColor = (type) => {
    switch (type) {
      case 'success': return '#16a34a';
      case 'error': return '#dc2626';
      case 'warning': return '#d97706';
      default: return '#FF8904';
    }
  };

  return (
    <div className="custom-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`custom-toast custom-toast-${toast.type}`}
          style={{ borderLeftColor: getToastColor(toast.type) }}
          onClick={() => removeToast(toast.id)}
        >
          <div className="custom-toast-icon">
            <FontAwesomeIcon icon={getToastIcon(toast.type)} />
          </div>
          <div className="custom-toast-content">
            <p className="custom-toast-message">{toast.message}</p>
          </div>
          <button
            className="custom-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            aria-label="Close notification"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div 
            className="custom-toast-progress" 
            style={{ 
              animationDuration: `${toast.duration}ms`,
              backgroundColor: getToastColor(toast.type)
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Default export for backward compatibility
export default { useCustomToast, CustomToastContainer };