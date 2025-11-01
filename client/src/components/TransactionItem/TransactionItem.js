import React, { useState } from 'react';
import './TransactionItem.css';

const TransactionItem = ({ transaction }) => {
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

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className={`transaction-item ${isExpanded ? 'expanded' : ''}`}>
      <div className="transaction-item-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="transaction-summary">
          <div className="transaction-main-info">
            <span className="transaction-customer-name">{transaction.fullName}</span>
            <span className="transaction-date">{formatDate(transaction.date)}</span>
          </div>
          <div className="transaction-amount-info">
            <span className="transaction-amount">
              {formatCurrency(transaction.sendingAmount, transaction.sendingCurrency)} → {formatCurrency(transaction.receiveAmount, transaction.receiveCurrency)}
            </span>
            <span className="transaction-rate">Rate: {transaction.todaysRate.toFixed(4)}</span>
          </div>
        </div>
        <button className="transaction-expand-btn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="transaction-item-details">
          <div className="details-section">
            <h4 className="details-section-title">Customer Information</h4>
            <div className="details-grid">
              <div className="detail-field">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{transaction.fullName}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Surname:</span>
                <span className="detail-value">{transaction.surname}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{transaction.email}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Mobile:</span>
                <span className="detail-value">{transaction.mobile}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Passport Number:</span>
                <span className="detail-value">{transaction.passportNumber}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Country:</span>
                <span className="detail-value">{transaction.country}</span>
              </div>
              <div className="detail-field detail-field-full">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{transaction.address}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h4 className="details-section-title">Transaction Details</h4>
            <div className="details-grid">
              <div className="detail-field">
                <span className="detail-label">Sending Amount:</span>
                <span className="detail-value">{formatCurrency(transaction.sendingAmount, transaction.sendingCurrency)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Receiving Amount:</span>
                <span className="detail-value">{formatCurrency(transaction.receiveAmount, transaction.receiveCurrency)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Exchange Rate:</span>
                <span className="detail-value">{transaction.todaysRate.toFixed(4)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Our Fee:</span>
                <span className="detail-value">{transaction.ourFee}%</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Special Rate:</span>
                <span className="detail-value">{transaction.specialRate}%</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Transaction Date:</span>
                <span className="detail-value">{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h4 className="details-section-title">Branch & Staff Information</h4>
            <div className="details-grid">
              <div className="detail-field">
                <span className="detail-label">Branch Name:</span>
                <span className="detail-value">{transaction.branchName}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Branch Location:</span>
                <span className="detail-value">{transaction.branchLocation}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Staff Name:</span>
                <span className="detail-value">{transaction.staffName}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Staff Email:</span>
                <span className="detail-value">{transaction.staffEmail}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h4 className="details-section-title">System Information</h4>
            <div className="details-grid">
              <div className="detail-field">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value detail-value-small">{transaction.transactionId}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Created At:</span>
                <span className="detail-value">{formatDate(transaction.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionItem;

