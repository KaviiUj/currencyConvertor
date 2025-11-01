import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ show, title, message, onConfirm, onCancel, confirmText = 'Yes', cancelText = 'No' }) => {
  if (!show) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onCancel}>
      <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <h2 className="confirmation-modal-title">{title}</h2>
        </div>
        <div className="confirmation-modal-body">
          <p className="confirmation-modal-message">{message}</p>
        </div>
        <div className="confirmation-modal-footer">
          <button
            className="confirmation-modal-button confirmation-modal-button-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="confirmation-modal-button confirmation-modal-button-confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

