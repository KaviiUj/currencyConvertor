import React, { useState, useEffect } from 'react';
import { api } from '../../utils/apiHandler';
import './CreateStaffModal.css';

const CreateStaffModal = ({ show, onClose, onCreate, editMode = false, staffData = null }) => {
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    mobile: '',
    email: '',
    password: '',
    address: '',
    passportNumber: '',
    country: '',
    branchId: '',
    isActive: true
  });
  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (show) {
      fetchBranches();
      
      // If in edit mode, populate form with existing data
      if (editMode && staffData) {
        setFormData({
          fName: staffData.fName || '',
          lName: staffData.lName || '',
          mobile: staffData.mobile || '',
          email: staffData.email || '',
          password: '', // Password is not editable
          address: staffData.address || '',
          passportNumber: staffData.passportNumber || '',
          country: staffData.country || '',
          branchId: staffData.branchId || '',
          isActive: staffData.isActive !== undefined ? staffData.isActive : true
        });
      } else {
        // Reset form for create mode
        setFormData({
          fName: '',
          lName: '',
          mobile: '',
          email: '',
          password: '',
          address: '',
          passportNumber: '',
          country: '',
          branchId: '',
          isActive: true
        });
      }
    }
  }, [show, editMode, staffData]);

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const data = await api.get('/api/branches');
      // Filter only active branches
      const activeBranches = data.branches?.filter(b => b.isActive) || [];
      setBranches(activeBranches);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fName.trim()) {
      newErrors.fName = 'First name is required';
    }

    if (!formData.lName.trim()) {
      newErrors.lName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Only validate password in create mode
    if (!editMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }

    if (!formData.passportNumber.trim()) {
      newErrors.passportNumber = 'Passport number is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.branchId) {
      newErrors.branchId = 'Please select a branch';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Find selected branch to get branchName and branchCode
      const selectedBranch = branches.find(b => b.branchId === formData.branchId);
      
      const requestData = {
        fName: formData.fName.trim(),
        lName: formData.lName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        passportNumber: formData.passportNumber.trim(),
        country: formData.country.trim(),
        branchName: selectedBranch?.branchName || '',
        branchCode: selectedBranch?.branchCode || '',
        branchId: formData.branchId,
        isActive: formData.isActive
      };

      // Add password only in create mode
      if (!editMode) {
        requestData.password = formData.password;
      }

      // Add staffId in edit mode
      if (editMode && staffData) {
        requestData.staffId = staffData.staffId;
      }

      await onCreate(requestData, editMode);
      
      // Reset form and close modal on success
      setFormData({
        fName: '',
        lName: '',
        mobile: '',
        email: '',
        password: '',
        address: '',
        passportNumber: '',
        country: '',
        branchId: '',
        isActive: true
      });
      setErrors({});
      onClose();
    } catch (err) {
      // Error will be handled by parent component
      console.error('Error in form submission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        fName: '',
        lName: '',
        mobile: '',
        email: '',
        password: '',
        address: '',
        passportNumber: '',
        country: '',
        branchId: '',
        isActive: true
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="create-staff-modal-overlay" onClick={handleClose}>
      <div className="create-staff-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-staff-modal-header">
          <h2 className="create-staff-modal-title">{editMode ? 'Update Staff' : 'Create Staff'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="create-staff-modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fName" className="form-label">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fName"
                  name="fName"
                  className={`form-input ${errors.fName ? 'input-error' : ''}`}
                  placeholder="Enter first name"
                  value={formData.fName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.fName && <span className="error-text">{errors.fName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lName" className="form-label">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lName"
                  name="lName"
                  className={`form-input ${errors.lName ? 'input-error' : ''}`}
                  placeholder="Enter last name"
                  value={formData.lName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.lName && <span className="error-text">{errors.lName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="mobile" className="form-label">
                  Mobile Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  className={`form-input ${errors.mobile ? 'input-error' : ''}`}
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.mobile && <span className="error-text">{errors.mobile}</span>}
              </div>
            </div>

            <div className="form-row">
              {!editMode && (
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
              )}

              <div className="form-group" style={editMode ? { gridColumn: '1 / -1' } : {}}>
                <label htmlFor="passportNumber" className="form-label">
                  Passport Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="passportNumber"
                  name="passportNumber"
                  className={`form-input ${errors.passportNumber ? 'input-error' : ''}`}
                  placeholder="Enter passport number"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.passportNumber && <span className="error-text">{errors.passportNumber}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Address <span className="required">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className={`form-input ${errors.address ? 'input-error' : ''}`}
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Country <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className={`form-input ${errors.country ? 'input-error' : ''}`}
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.country && <span className="error-text">{errors.country}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="branchId" className="form-label">
                  Branch <span className="required">*</span>
                </label>
                <select
                  id="branchId"
                  name="branchId"
                  className={`form-input ${errors.branchId ? 'input-error' : ''}`}
                  value={formData.branchId}
                  onChange={handleChange}
                  disabled={isLoading || loadingBranches}
                >
                  <option value="">Select a branch</option>
                  {branches.map(branch => (
                    <option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
                {errors.branchId && <span className="error-text">{errors.branchId}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          <div className="create-staff-modal-footer">
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
              disabled={isLoading || loadingBranches}
            >
              {isLoading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStaffModal;

