import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import LogoutButton from '../components/LogoutButton';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminStyles/AdminHeader.css';

export default function AdminHeader() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const pollingIntervalRef = useRef(null);

    // Smart polling with 30-second intervals
    useEffect(() => {
        fetchNotificationCount();
        
        pollingIntervalRef.current = setInterval(fetchNotificationCount, 30000);
        
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
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
        const titleMap = {
            '/admin': 'Dashboard',
            '/admin/manage-users': 'Manage Users',
            '/admin/manage-posts': 'Manage Posts',
            '/admin/reports': 'Reports',
            '/admin/feedback': 'Feedback',
            '/admin/deletion-requests': 'Deletion Requests',
            '/admin/notifications': 'Notifications'
        };
        
        return titleMap[location.pathname] || 'Admin Dashboard';
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
                    {/* Notifications with Smart Polling */}
                    <button 
                        className="header-icon-btn" 
                        onClick={handleNotificationClick}
                        title={`View Notifications (${notificationCount} unread)`}
                        aria-label={`View notifications, ${notificationCount} unread`}
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
                            aria-expanded={showDropdown}
                            aria-label="Admin menu"
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