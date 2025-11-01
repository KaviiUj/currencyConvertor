import React, { useState, useEffect } from 'react';
import BranchItem from '../../components/BranchItem/BranchItem';
import CreateBranchModal from '../../components/CreateBranchModal/CreateBranchModal';
import Toast from '../../components/Toast/Toast';
import { api, formatErrorMessage } from '../../utils/apiHandler';
import './Branches.css';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.get('/api/branches');
      setBranches(data.branches || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (branchId) => {
    try {
      // Find the current branch to get its current status
      const currentBranch = branches.find(b => b.branchId === branchId);
      if (!currentBranch) return;

      // Toggle the status
      const newStatus = !currentBranch.isActive;

      // Optimistically update UI
      setBranches(prevBranches =>
        prevBranches.map(branch =>
          branch.branchId === branchId
            ? { ...branch, isActive: newStatus }
            : branch
        )
      );

      // Call API to update status
      const data = await api.patch(
        `/api/branches/activate-deactivate?branchId=${branchId}&status=${newStatus}`
      );

      console.log('Branch status updated:', data);

      // Update with actual response data
      setBranches(prevBranches =>
        prevBranches.map(branch =>
          branch.branchId === branchId ? data.branch : branch
        )
      );

      // Show success toast
      const statusText = data.branch.isActive ? 'activated' : 'deactivated';
      setToastMessage(`${data.branch.branchName} is ${statusText}`);
      setShowToast(true);
    } catch (err) {
      console.error('Error toggling branch status:', err);
      
      // Revert optimistic update on error
      const currentBranch = branches.find(b => b.branchId === branchId);
      if (currentBranch) {
        setBranches(prevBranches =>
          prevBranches.map(branch =>
            branch.branchId === branchId
              ? { ...branch, isActive: currentBranch.isActive }
              : branch
          )
        );
      }

      // Show error message
      setError(formatErrorMessage(err));
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddBranch = () => {
    setShowCreateModal(true);
  };

  const handleCreateBranch = async (branchName) => {
    try {
      const data = await api.post('/api/branches', { branchName });
      
      console.log('Branch created successfully:', data);
      
      // Refresh the branches list
      await fetchBranches();
      
      return data;
    } catch (err) {
      console.error('Error creating branch:', err);
      throw new Error(formatErrorMessage(err));
    }
  };

  return (
    <div className="branches-container">
      <div className="branches-content">
        <div className="branches-header">
          <h1 className="branches-title">Branches</h1>
          <button className="add-branch-btn" onClick={handleAddBranch}>
            Add Branch
          </button>
        </div>

        {loading && <p className="branches-message">Loading branches...</p>}
        
        {error && <p className="branches-error">Error: {error}</p>}
        
        {!loading && !error && branches.length === 0 && (
          <p className="branches-message">No branches found</p>
        )}

        {!loading && !error && branches.length > 0 && (
          <div className="branches-list">
            {branches.map((branch) => (
              <BranchItem
                key={branch.branchId}
                branch={branch}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        <CreateBranchModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBranch}
        />

        <Toast
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
};

export default Branches;

