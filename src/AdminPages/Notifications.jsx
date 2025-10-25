import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckCircle,
  faTrash,
  faSearch,
  faFilter,
  faCheckDouble,
  faExclamationTriangle,
  faExternalLinkAlt,
  faUserSlash,
  faBan,
  faUserCheck,
  faUserTimes
} from '@fortawesome/free-solid-svg-icons';
import './styles/Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    reports: 0,
    user_suspended: 0,
    user_banned: 0,
    user_activated: 0,
    user_deleted: 0
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationStats();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'all' 
        ? 'http://localhost:8000/api/admin/notifications'
        : `http://localhost:8000/api/admin/notifications/type/${filter}`;
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        console.error('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/notifications/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {
          total: 0,
          unread: 0,
          reports: 0,
          user_suspended: 0,
          user_banned: 0,
          user_activated: 0,
          user_deleted: 0
        });
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (filterType) => {
    if (filterType === 'all') {
      setFilter('all');
    } else if (filterType === 'unread') {
      setFilter('unread');
    } else if (filterType === 'reports') {
      setFilter('report_submitted');
    } else if (filterType === 'user_suspended') {
      setFilter('user_suspended');
    } else if (filterType === 'user_banned') {
      setFilter('user_banned');
    } else if (filterType === 'user_activated') {
      setFilter('user_activated');
    } else if (filterType === 'user_deleted') {
      setFilter('user_deleted');
    }
  };

  // Handle notification click - Navigate to relevant page
  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    
    // Mark as read when clicked
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    const metadata = notification.metadata ? JSON.parse(notification.metadata) : {};
    
    switch (notification.type) {
      case 'report_submitted':
        // Navigate to reports page
        window.location.href = '/admin/reports';
        break;
      
      case 'post_removed':
      case 'post_deleted':
      case 'post_restored':
      case 'post_resolved':
        // Navigate to manage posts
        window.location.href = '/admin/manage-posts';
        break;
      
      case 'user_suspended':
      case 'user_banned':
      case 'user_activated':
      case 'user_deleted':
        // Navigate to manage users
        window.location.href = '/admin/manage-users';
        break;
      
      default:
        // For general notifications, just mark as read
        console.log('General notification clicked');
        break;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        ));
        fetchNotificationStats();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        fetchNotificationStats();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        fetchNotificationStats();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        const response = await fetch('http://localhost:8000/api/admin/notifications', {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          setNotifications([]);
          fetchNotificationStats();
        }
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post_resolved':
        return faCheckCircle;
      case 'post_removed':
        return faBell;
      case 'post_deleted':
        return faTrash;
      case 'post_restored':
        return faBell;
      case 'report_submitted':
        return faExclamationTriangle;
      case 'user_suspended':
        return faUserSlash;
      case 'user_banned':
        return faBan;
      case 'user_activated':
        return faUserCheck;
      case 'user_deleted':
        return faUserTimes;
      case 'general':
        return faBell;
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
      case 'user_suspended':
        return '#f59e0b';
      case 'user_banned':
        return '#ef4444';
      case 'user_activated':
        return '#10b981';
      case 'user_deleted':
        return '#dc2626';
      case 'general':
        return '#6b7280';
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

  // Check if any filter is active
  const isFilterActive = () => {
    return filter !== 'all';
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilter('all');
  };

  // Check if notification is clickable (has navigation)
  const isClickable = (notification) => {
    const clickableTypes = [
      'report_submitted',
      'post_removed',
      'post_deleted',
      'post_restored',
      'post_resolved',
      'user_suspended',
      'user_banned',
      'user_activated',
      'user_deleted'
    ];
    return clickableTypes.includes(notification.type);
  };

  return (
    <div className="notifications-page">
      {/* Header */}
      <header className="notifications-header">
        <div className="header-content">
          <h1>
            <FontAwesomeIcon icon={faBell} />
            Notifications
          </h1>
          <p>Manage and view system notifications</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-mark-all-read"
            onClick={markAllAsRead}
            disabled={stats.unread === 0}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            Mark All as Read
          </button>
          <button 
            className="btn-clear-all"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            <FontAwesomeIcon icon={faTrash} />
            Clear All
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="notification-stats">
        <div 
          className={`stat-card ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
          title="Show all notifications"
        >
          <div className="stat-icon total">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div 
          className={`stat-card ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('unread')}
          style={{ cursor: 'pointer' }}
          title="Show unread notifications"
        >
          <div className="stat-icon unread">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="stat-info">
            <h3>{stats.unread}</h3>
            <p>Unread</p>
          </div>
        </div>
        <div 
          className={`stat-card ${filter === 'report_submitted' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('reports')}
          style={{ cursor: 'pointer' }}
          title="Show report notifications"
        >
          <div className="stat-icon reports">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className="stat-info">
            <h3>{stats.reports}</h3>
            <p>Reports</p>
          </div>
        </div>
        
        {/* User Action Stats Cards */}
        <div 
          className={`stat-card ${filter === 'user_suspended' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('user_suspended')}
          style={{ cursor: 'pointer' }}
          title="Show user suspension notifications"
        >
          <div className="stat-icon user-suspended">
            <FontAwesomeIcon icon={faUserSlash} />
          </div>
          <div className="stat-info">
            <h3>{stats.user_suspended}</h3>
            <p>User Suspensions</p>
          </div>
        </div>
        <div 
          className={`stat-card ${filter === 'user_banned' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('user_banned')}
          style={{ cursor: 'pointer' }}
          title="Show user ban notifications"
        >
          <div className="stat-icon user-banned">
            <FontAwesomeIcon icon={faBan} />
          </div>
          <div className="stat-info">
            <h3>{stats.user_banned}</h3>
            <p>User Bans</p>
          </div>
        </div>
        <div 
          className={`stat-card ${filter === 'user_activated' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('user_activated')}
          style={{ cursor: 'pointer' }}
          title="Show user activation notifications"
        >
          <div className="stat-icon user-activated">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div className="stat-info">
            <h3>{stats.user_activated}</h3>
            <p>User Activations</p>
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
            <option value="unread">Unread Only</option>
            <option value="post_resolved">Resolved Posts</option>
            <option value="post_removed">Removed Posts</option>
            <option value="post_deleted">Deleted Posts</option>
            <option value="post_restored">Restored Posts</option>
            <option value="report_submitted">Reports</option>
            <option value="user_suspended">User Suspensions</option>
            <option value="user_banned">User Bans</option>
            <option value="user_activated">User Activations</option>
            <option value="user_deleted">User Deletions</option>
            <option value="general">General</option>
          </select>
        </div>
        
        {/* Clear Filters Button */}
        {isFilterActive() && (
          <button 
            className="clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </section>

      {/* Active Filters Display */}
      {isFilterActive() && (
        <div className="active-filters-section">
          <span className="active-filters-label">Active filter:</span>
          <div className="filter-tags">
            <span className="filter-tag">
              {filter === 'unread' && 'Unread Only'}
              {filter === 'report_submitted' && 'Reports'}
              {filter === 'post_resolved' && 'Resolved Posts'}
              {filter === 'post_removed' && 'Removed Posts'}
              {filter === 'post_deleted' && 'Deleted Posts'}
              {filter === 'post_restored' && 'Restored Posts'}
              {filter === 'user_suspended' && 'User Suspensions'}
              {filter === 'user_banned' && 'User Bans'}
              {filter === 'user_activated' && 'User Activations'}
              {filter === 'user_deleted' && 'User Deletions'}
              {filter === 'general' && 'General'}
            </span>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <section className="notifications-list">
        {loading ? (
          <div className="loading-state">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="notifications-container">
            <div className="notifications-header-info">
              <span className="notifications-count">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {isFilterActive() && ` (Filtered)`}
              </span>
            </div>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${
                  isClickable(notification) ? 'clickable' : ''
                }`}
                onClick={() => isClickable(notification) && handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  <FontAwesomeIcon 
                    icon={getNotificationIcon(notification.type)} 
                    style={{ color: getNotificationColor(notification.type) }}
                  />
                </div>
                <div className="notification-content">
                  <h4>
                    {notification.title}
                    {isClickable(notification) && (
                      <FontAwesomeIcon 
                        icon={faExternalLinkAlt} 
                        className="external-link-icon"
                        title="Click to view related content"
                      />
                    )}
                  </h4>
                  <p>{notification.message}</p>
                  <div className="notification-meta">
                    <span className="user">
                      {notification.first_name} {notification.last_name}
                      {notification.role === 'admin' && ' (Admin)'}
                    </span>
                    <span className="time">{formatTime(notification.created_at)}</span>
                    <span className="type">{notification.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.is_read && (
                    <button 
                      className="btn-mark-read"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      title="Mark as read"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                  )}
                  <button 
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    title="Delete notification"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FontAwesomeIcon icon={faBell} size="3x" />
            <h3>No notifications</h3>
            <p>
              {filter === 'all' 
                ? "There are no notifications to display." 
                : "No notifications match your filter criteria."
              }
            </p>
            {isFilterActive() && (
              <button 
                className="retry-btn" 
                onClick={clearAllFilters}
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}