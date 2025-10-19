// AdminPages/Notifications.jsx - SIMPLIFIED (ONLY 3 CARDS)
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckCircle,
  faTrash,
  faSearch,
  faFilter,
  faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import './styles/Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    reports: 0
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
          reports: 0
        });
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
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
        return faBell;
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

      {/* Stats Cards - ONLY 3 CARDS */}
      <section className="notification-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon unread">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="stat-info">
            <h3>{stats.unread}</h3>
            <p>Unread</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon reports">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="stat-info">
            <h3>{stats.reports}</h3>
            <p>Reports</p>
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
            <option value="general">General</option>
          </select>
        </div>
        <div className="search-group">
          <FontAwesomeIcon icon={faSearch} />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            className="search-input"
          />
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
                  <span className="user">
                    {notification.first_name} {notification.last_name}
                    {notification.role === 'admin' && ' (Admin)'}
                  </span>
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
                <button 
                  className="btn-delete"
                  onClick={() => deleteNotification(notification.id)}
                  title="Delete notification"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FontAwesomeIcon icon={faBell} size="3x" />
            <h3>No notifications</h3>
            <p>There are no notifications to display.</p>
          </div>
        )}
      </section>
    </div>
  );
}