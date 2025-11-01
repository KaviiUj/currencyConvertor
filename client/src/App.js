import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import DashboardScreen from './pages/Dashboard/DashboardScreen';
import Home from './pages/Home/Home';
import Branches from './pages/Branches/Branches';
import Staff from './pages/Staff/Staff';
import History from './pages/History/History';
import Settings from './pages/Settings/Settings';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Admin Route Wrapper - Only allows role 85 (Admin)
const AdminRoute = ({ children }) => {
  const roleStr = localStorage.getItem('role');
  const userRole = roleStr ? parseInt(roleStr, 10) : null;
  
  console.log('AdminRoute check - User role:', userRole); // Debug log
  
  // If not admin (role 85), redirect to home
  if (userRole !== 85) {
    console.log('Redirecting to /home - User is not admin'); // Debug log
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

function App() {
  const ProtectedLayout = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return <Navigate to="/" replace />;
    }
    return <DashboardScreen>{children}</DashboardScreen>;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<ProtectedLayout><Home /></ProtectedLayout>} />
          <Route path="/branches" element={<ProtectedLayout><AdminRoute><Branches /></AdminRoute></ProtectedLayout>} />
          <Route path="/staff" element={<ProtectedLayout><AdminRoute><Staff /></AdminRoute></ProtectedLayout>} />
          <Route path="/history" element={<ProtectedLayout><History /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><AdminRoute><Settings /></AdminRoute></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
