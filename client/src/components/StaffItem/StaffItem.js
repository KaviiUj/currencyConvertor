import React, { useState } from 'react';
import './StaffItem.css';

const StaffItem = ({ staff, onToggle, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`staff-item ${isExpanded ? 'expanded' : ''}`}>
      <div className="staff-item-content">
        <div className="staff-item-info">
          <h3 className="staff-item-name">
            {staff.fName} {staff.lName}
          </h3>
          <div className="staff-item-details">
            <span className="staff-detail-item">{staff.email}</span>
            <span className="staff-detail-separator">|</span>
            <span className="staff-detail-item">{staff.mobile}</span>
            <span className="staff-detail-separator">|</span>
            <span className="staff-detail-item">{staff.passportNumber}</span>
          </div>
        </div>

        <div className="staff-item-actions">
          {/* View Button */}
          <button
            className={`staff-action-btn staff-view-btn ${isExpanded ? 'active' : ''}`}
            onClick={handleViewToggle}
            title={isExpanded ? "Hide Details" : "View Details"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>

          {/* Edit Button */}
          <button
            className="staff-action-btn staff-edit-btn"
            onClick={() => onEdit(staff.staffId)}
            title="Edit Staff"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>

          {/* Delete Button */}
          <button
            className="staff-action-btn staff-delete-btn"
            onClick={() => onDelete(staff.staffId)}
            title="Delete Staff"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>

          {/* Toggle Switch */}
          <label className="staff-switch">
            <input
              type="checkbox"
              checked={staff.isActive}
              onChange={() => onToggle(staff.staffId)}
            />
            <span className="staff-slider"></span>
          </label>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="staff-item-expanded">
          <div className="expanded-content">
            <div className="expanded-section">
              <h4 className="expanded-section-title">Personal Information</h4>
              <div className="expanded-grid">
                <div className="expanded-field">
                  <span className="expanded-label">Full Name:</span>
                  <span className="expanded-value">{staff.fName} {staff.lName}</span>
                </div>
                <div className="expanded-field">
                  <span className="expanded-label">Country:</span>
                  <span className="expanded-value">{staff.country}</span>
                </div>
                <div className="expanded-field">
                  <span className="expanded-label">Passport Number:</span>
                  <span className="expanded-value">{staff.passportNumber}</span>
                </div>
                <div className="expanded-field">
                  <span className="expanded-label">Address:</span>
                  <span className="expanded-value">{staff.address}</span>
                </div>
              </div>
            </div>

            <div className="expanded-section">
              <h4 className="expanded-section-title">Contact Information</h4>
              <div className="expanded-grid">
                <div className="expanded-field">
                  <span className="expanded-label">Email:</span>
                  <span className="expanded-value">{staff.email}</span>
                </div>
                <div className="expanded-field">
                  <span className="expanded-label">Mobile:</span>
                  <span className="expanded-value">{staff.mobile}</span>
                </div>
              </div>
            </div>

            <div className="expanded-section">
              <h4 className="expanded-section-title">Branch Information</h4>
              <div className="expanded-grid">
                <div className="expanded-field">
                  <span className="expanded-label">Branch Name:</span>
                  <span className="expanded-value">{staff.branchName}</span>
                </div>
                <div className="expanded-field">
                  <span className="expanded-label">Branch Code:</span>
                  <span className="expanded-value">{staff.branchCode}</span>
                </div>
              </div>
            </div>

            <div className="expanded-section">
              <h4 className="expanded-section-title">System Information</h4>
              <div className="expanded-grid">
                <div className="expanded-field">
                  <span className="expanded-label">Role:</span>
                  <span className="expanded-value">{staff.role}</span>
                </div>
                <div className="expanded-field">
                  <span className="expanded-label">Status:</span>
                  <span className={`expanded-value ${staff.isActive ? 'status-active' : 'status-inactive'}`}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="expanded-field">
                  <span className="expanded-label">Created At:</span>
                  <span className="expanded-value">{formatDate(staff.createdAt)}</span>
                </div>
                <div className="expanded-field">
                  <span className="expanded-label">Updated At:</span>
                  <span className="expanded-value">{formatDate(staff.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffItem;

