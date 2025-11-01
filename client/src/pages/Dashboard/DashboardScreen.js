import React from 'react';
import Navigation from '../../components/Navigation/Navigation';
import './DashboardScreen.css';

const DashboardScreen = ({ children }) => {
  return (
    <div className="dashboard-screen">
      <div className="dashboard-navigation">
        <Navigation />
      </div>
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardScreen;

