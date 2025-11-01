import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get user role from localStorage
  const userRole = useMemo(() => {
    const roleStr = localStorage.getItem('role');
    return roleStr ? parseInt(roleStr, 10) : null;
  }, []);

  const handleLogout = async () => {
    setShowLogoutModal(false); // Close modal immediately
    
    try {
      const token = localStorage.getItem('accessToken');
      
      // Call logout API
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API fails
    }
    
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cache (if possible)
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Force a full page reload to login page
    window.location.href = '/';
  };

  // Define all navigation items with role requirements
  // Role 85 = Admin (can see all)
  // Role 96 = Staff (can only see Home and History)
  const allNavItems = [
    { path: '/home', label: 'Home', roles: [85, 96] }, // Available to both Admin and Staff
    { path: '/branches', label: 'Branches', roles: [85] }, // Admin only
    { path: '/staff', label: 'Staff', roles: [85] }, // Admin only
    { path: '/history', label: 'History', roles: [85, 96] }, // Available to both Admin and Staff
    { path: '/settings', label: 'Settings', roles: [85] }, // Admin only
  ];

  // Filter navigation items based on user role
  const navItems = useMemo(() => {
    if (!userRole) return allNavItems; // Show all if role not found (fallback)
    return allNavItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  return (
    <>
      <nav className="navigation">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
        <button
          className="nav-link nav-link-logout"
          onClick={() => setShowLogoutModal(true)}
        >
          Logout
        </button>
      </nav>

      <ConfirmationModal
        show={showLogoutModal}
        title="Logout"
        message="Do you want to logout"
        confirmText="Yes, Logout"
        cancelText="No, Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Navigation;

