import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import LogoutButton from '../components/LogoutButton';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminStyles/AdminHeader.css';

export default function AdminHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/notifications/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.stats?.unread || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Dashboard';
      case '/admin/manage-users':
        return 'Manage Users';
      case '/admin/manage-posts':
        return 'Manage Posts';
      case '/admin/reports':
        return 'Reports';
         case '/admin/feedback':
        return 'Feedback';
      case '/admin/notifications':
        return 'Notifications';
      default:
        return 'Admin Dashboard';
    }
  };

  const handleNotificationClick = () => {
    navigate('/admin/notifications');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <h1 className="admin-title">{getPageTitle()}</h1>
        
        <div className="admin-header-actions">
          {/* Notifications */}
          <button 
            className="header-icon-btn" 
            onClick={handleNotificationClick}
            title="View Notifications"
          >
            <FontAwesomeIcon icon={faBell} />
            {notificationCount > 0 && (
              <span className="notification-badge">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {/* User Dropdown with Logout */}
          <div className="user-dropdown">
            <button 
              className="user-menu-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>Admin</span>
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item user-info">
                  <strong>Administrator</strong>
                  <small>admin@system.com</small>
                </div>
                <div className="dropdown-divider"></div>
                {/* LogoutButton with proper props */}
                <div className="dropdown-item">
                  <LogoutButton isDropdown={true} isOpen={true} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}