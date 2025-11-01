import React, { useState, useEffect } from 'react';
import StaffItem from '../../components/StaffItem/StaffItem';
import CreateStaffModal from '../../components/CreateStaffModal/CreateStaffModal';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import Toast from '../../components/Toast/Toast';
import { api, formatErrorMessage } from '../../utils/apiHandler';
import './Staff.css';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.get('/api/staff');
      setStaff(data.staff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (staffId) => {
    try {
      // Find the current staff member to get their current status
      const currentStaff = staff.find(s => s.staffId === staffId);
      if (!currentStaff) return;

      // Toggle the status
      const newStatus = !currentStaff.isActive;

      // Optimistically update UI
      setStaff(prevStaff =>
        prevStaff.map(staffMember =>
          staffMember.staffId === staffId
            ? { ...staffMember, isActive: newStatus }
            : staffMember
        )
      );

      // Call API to update status
      const data = await api.patch(
        `/api/staff/activate-deactivate?staffId=${staffId}&status=${newStatus}`
      );

      console.log('Staff status updated:', data);

      // Update with actual response data
      setStaff(prevStaff =>
        prevStaff.map(staffMember =>
          staffMember.staffId === staffId ? data.staff : staffMember
        )
      );

      // Show success toast
      const statusText = data.staff.isActive ? 'activated' : 'deactivated';
      setToastMessage(`${data.staff.fName} ${data.staff.lName} is ${statusText}`);
      setShowToast(true);
    } catch (err) {
      console.error('Error toggling staff status:', err);
      
      // Revert optimistic update on error
      const currentStaff = staff.find(s => s.staffId === staffId);
      if (currentStaff) {
        setStaff(prevStaff =>
          prevStaff.map(staffMember =>
            staffMember.staffId === staffId
              ? { ...staffMember, isActive: currentStaff.isActive }
              : staffMember
          )
        );
      }

      // Show error message
      setError(formatErrorMessage(err));
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (staffId) => {
    const staffToEdit = staff.find(s => s.staffId === staffId);
    if (staffToEdit) {
      setEditingStaff(staffToEdit);
      setShowCreateModal(true);
    }
  };

  const handleDelete = (staffId) => {
    const staffToDelete = staff.find(s => s.staffId === staffId);
    if (staffToDelete) {
      setDeletingStaff(staffToDelete);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;

    try {
      const data = await api.get(`/api/staff/delete?staffId=${deletingStaff.staffId}`);
      
      console.log('Staff deleted successfully:', data);
      
      // Show success toast
      setToastMessage(`${deletingStaff.fName} ${deletingStaff.lName} deleted successfully`);
      setShowToast(true);
      
      // Close modal
      setShowDeleteModal(false);
      setDeletingStaff(null);
      
      // Refresh the staff list
      await fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      
      // Show error message
      setError(formatErrorMessage(err));
      
      // Close modal
      setShowDeleteModal(false);
      setDeletingStaff(null);
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingStaff(null);
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingStaff(null);
  };

  const handleCreateOrUpdateStaff = async (staffData, isEditMode) => {
    try {
      let data;
      
      if (isEditMode) {
        // Update staff
        data = await api.post('/api/staff/update', staffData);
        console.log('Staff updated successfully:', data);
        setToastMessage(`${data.staff.fName} ${data.staff.lName} updated successfully`);
      } else {
        // Create staff
        data = await api.post('/api/staff', staffData);
        console.log('Staff created successfully:', data);
        setToastMessage(`${data.staff.fName} ${data.staff.lName} created successfully`);
      }
      
      // Refresh the staff list
      await fetchStaff();
      
      // Show success toast
      setShowToast(true);
      
      return data;
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} staff:`, err);
      throw new Error(formatErrorMessage(err));
    }
  };

  return (
    <div className="staff-container">
      <div className="staff-content">
        <div className="staff-header">
          <h1 className="staff-title">Staff</h1>
          <button className="add-staff-btn" onClick={handleAddStaff}>
            Add Staff
          </button>
        </div>

        {loading && <p className="staff-message">Loading staff...</p>}
        
        {error && <p className="staff-error">Error: {error}</p>}
        
        {!loading && !error && staff.length === 0 && (
          <p className="staff-message">No staff found</p>
        )}

        {!loading && !error && staff.length > 0 && (
          <div className="staff-list">
            {staff.map((staffMember) => (
              <StaffItem
                key={staffMember.staffId}
                staff={staffMember}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <CreateStaffModal
          show={showCreateModal}
          onClose={handleCloseModal}
          onCreate={handleCreateOrUpdateStaff}
          editMode={!!editingStaff}
          staffData={editingStaff}
        />

        <ConfirmationModal
          show={showDeleteModal}
          title="Delete Staff"
          message={deletingStaff ? `Are you sure you want to delete ${deletingStaff.fName} ${deletingStaff.lName}? This action cannot be undone.` : ''}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
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

export default Staff;

