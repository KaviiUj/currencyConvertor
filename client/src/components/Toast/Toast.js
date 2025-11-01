import React, { useEffect, useRef } from 'react';
import './Toast.css';

const Toast = ({ message, show, onClose, duration = 3000 }) => {
  const onCloseRef = useRef(onClose);

  // Keep the ref updated
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onCloseRef.current();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!show) return null;

  return (
    <div className="toast toast-success">
      <div className="toast-content">
        <svg
          className="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
