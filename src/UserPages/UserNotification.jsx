// UserPages/UserNotifications.jsx
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckCircle,
  faTimesCircle,
  faTrash,
  faSearch,
  faFilter,
  faCheckDouble,
  faExclamationTriangle,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import './styles/UserNotification.css';
import UserNav from '../UserComponents/UserDashboardNav';
import User from '../pages/User';

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/notifications', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        let filteredNotifications = data.notifications || [];
        
        // Apply filter
        if (filter !== 'all') {
          filteredNotifications = filteredNotifications.filter(
            notification => notification.type === filter
          );
        }
        
        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/unread-count', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        ));
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        // Update all notifications to read
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        // Reset unread count
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post_resolved':
        return faCheckCircle;
      case 'post_removed':
        return faEyeSlash;
      case 'post_deleted':
        return faTrash;
      case 'post_restored':
        return faEye;
      case 'report_submitted':
        return faExclamationTriangle;
      case 'report_status_update':
        return faCheckCircle;
      case 'account_suspended':
        return faTimesCircle;
      default:
        return faBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'post_resolved':
        return '#10b981';
      case 'post_removed':
        return '#f59e0b';
      case 'post_deleted':
        return '#ef4444';
      case 'post_restored':
        return '#3b82f6';
      case 'report_submitted':
        return '#8b5cf6';
      case 'report_status_update':
        return '#06b6d4';
      case 'account_suspended':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <section className='user-notification-page'>
    <div className="user-notifications-page">
      <UserNav/>
      {/* Header */}
      <header className="notifications-header">
        <div className="header-content">
          <h1>
            <FontAwesomeIcon icon={faBell} />
            Notifications
          </h1>
          <p>Stay updated with your account activities</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-mark-all-read"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            Mark All as Read
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="notification-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="stat-info">
            <h3>{notifications.length}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon unread">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="stat-info">
            <h3>{unreadCount}</h3>
            <p>Unread</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="notification-filters">
        <div className="filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="post_resolved">Resolved Posts</option>
            <option value="post_removed">Removed Posts</option>
            <option value="post_deleted">Deleted Posts</option>
            <option value="post_restored">Restored Posts</option>
            <option value="report_submitted">Reports</option>
            <option value="report_status_update">Report Updates</option>
            <option value="account_suspended">Account Status</option>
          </select>
        </div>
      </section>

      {/* Notifications List */}
      <section className="notifications-list">
        {loading ? (
          <div className="loading-state">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                <FontAwesomeIcon 
                  icon={getNotificationIcon(notification.type)} 
                  style={{ color: getNotificationColor(notification.type) }}
                />
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <div className="notification-meta">
                  <span className="time">{formatTime(notification.created_at)}</span>
                </div>
              </div>
              <div className="notification-actions">
                {!notification.is_read && (
                  <button 
                    className="btn-mark-read"
                    onClick={() => markAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FontAwesomeIcon icon={faBell} size="3x" />
            <h3>No notifications</h3>
            <p>You're all caught up! New notifications will appear here.</p>
          </div>
        )}
      </section>
    </div>
    </section>
  );
}