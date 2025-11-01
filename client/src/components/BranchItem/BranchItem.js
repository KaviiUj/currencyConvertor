import React from 'react';
import './BranchItem.css';

const BranchItem = ({ branch, onToggle }) => {
  return (
    <div className="branch-item">
      <div className="branch-item-name">{branch.branchName}</div>
      <label className="branch-switch">
        <input
          type="checkbox"
          checked={branch.isActive}
          onChange={() => onToggle(branch.branchId)}
        />
        <span className="branch-slider"></span>
      </label>
    </div>
  );
};

export default BranchItem;

