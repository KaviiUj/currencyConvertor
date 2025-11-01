import React, { useState } from 'react';
import './CreateBranchModal.css';

const CreateBranchModal = ({ show, onClose, onCreate }) => {
  const [branchName, setBranchName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!branchName.trim()) {
      setError('Branch name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onCreate(branchName.trim());
      // Reset form and close modal on success
      setBranchName('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create branch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setBranchName('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="create-branch-modal-overlay" onClick={handleClose}>
      <div className="create-branch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-branch-modal-header">
          <h2 className="create-branch-modal-title">Create Branch</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="create-branch-modal-body">
            <div className="form-group">
              <label htmlFor="branchName" className="form-label">
                Branch Name
              </label>
              <input
                type="text"
                id="branchName"
                className={`form-input ${error ? 'input-error' : ''}`}
                placeholder="Enter branch name"
                value={branchName}
                onChange={(e) => {
                  setBranchName(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
                autoFocus
              />
              {error && <span className="error-text">{error}</span>}
            </div>
          </div>
          
          <div className="create-branch-modal-footer">
            <button
              type="button"
              className="modal-button modal-button-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-button modal-button-create"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBranchModal;

