import React, { useState, useEffect, useMemo } from 'react';
import TransactionItem from '../../components/TransactionItem/TransactionItem';
import { api, formatErrorMessage } from '../../utils/apiHandler';
import './History.css';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user role
  const roleStr = localStorage.getItem('role');
  const userRole = roleStr ? parseInt(roleStr, 10) : null;
  const isAdmin = userRole === 85;

  useEffect(() => {
    fetchTransactions();
    if (isAdmin) {
      fetchBranches();
    }
  }, [isAdmin]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.get('/api/transactions/history');
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await api.get('/api/branches');
      setBranches(data.branches || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  // Filter transactions by branch
  const filteredTransactions = useMemo(() => {
    if (!isAdmin || selectedBranch === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.branchName === selectedBranch);
  }, [transactions, selectedBranch, isAdmin]);

  return (
    <div className="history-container">
      <div className="history-content">
        <div className="history-header">
          <h1 className="history-title">Transaction History</h1>
          
          {isAdmin && branches.length > 0 && (
            <div className="history-filter">
              <label htmlFor="branchFilter" className="filter-label">
                Filter by Branch:
              </label>
              <select
                id="branchFilter"
                className="filter-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.branchId} value={branch.branchName}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading && <p className="history-message">Loading transactions...</p>}
        
        {error && <p className="history-error">Error: {error}</p>}
        
        {!loading && !error && filteredTransactions.length === 0 && (
          <p className="history-message">No transactions found</p>
        )}

        {!loading && !error && filteredTransactions.length > 0 && (
          <div className="history-stats">
            <p className="stats-text">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
        )}

        {!loading && !error && filteredTransactions.length > 0 && (
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.transactionId}
                transaction={transaction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

