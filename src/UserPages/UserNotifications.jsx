// UserPages/UserNotifications.jsx - FIXED ICON ERROR
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckCircle,
  faTimesCircle,
  faTrash,
  faFilter,
  faCheckDouble,
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faTrashAlt,
  faComments,
  faSyncAlt,
  faUndo,
  faPlusCircle,
  faCalendarAlt, // CHANGED FROM faCalendarExclamation
  faUserShield,
  faWarning,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './styles/UserNotification.css';
import UserNav from '../UserComponents/UserDashboardNav';

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, notificationId: null, notificationTitle: null });
  const [deleteAllModal, setDeleteAllModal] = useState({ isOpen: false });
   const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

      const wifi = isLocalhost 
  ? 'http://localhost:8000' 
  : 'http://192.168.1.27:8000';
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${wifi}/api/notifications`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        let filteredNotifications = data.notifications || [];
        
        // Apply filter - FIXED LOGIC
        if (filter !== 'all') {
          if (filter === 'unread') {
            // Filter by read status
            filteredNotifications = filteredNotifications.filter(
              notification => !notification.is_read
            );
          } else {
            // Filter by type
            filteredNotifications = filteredNotifications.filter(
              notification => notification.type === filter
            );
          }
        }
        
        // Limit to 50 notifications like admin
        setNotifications(filteredNotifications.slice(0, 50));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${wifi}/api/notifications/unread-count`, {
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
      const response = await fetch(`${wifi}/api/notifications/${notificationId}/read`, {
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
      const response = await fetch(`${wifi}/api/notifications/read-all`, {
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

  // Delete single notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${wifi}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        // Update count if it was unread
        const deletedNotif = notifications.find(n => n.id === notificationId);
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setDeleteModal({ isOpen: false, notificationId: null, notificationTitle: null });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // DELETE ALL NOTIFICATIONS
  const deleteAllNotifications = async () => {
    try {
      const response = await fetch(`${wifi}/api/notifications/delete-all`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Clear all notifications from state
        setNotifications([]);
        // Reset unread count
        setUnreadCount(0);
        setDeleteAllModal({ isOpen: false });
      } else {
        alert('Failed to delete all notifications');
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      alert('Error deleting all notifications');
    }
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (filterType) => {
    setFilter(filterType);
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
      case 'user_suspended':
        return faTimesCircle;
      case 'feedback_submitted':
        return faComments;
      case 'feedback_updated':
        return faSyncAlt;
      // 🆕 DELETION REQUEST ICONS
      case 'deletion_request_approved':
        return faCheckCircle;
      case 'deletion_request_rejected':
        return faTimesCircle;
      case 'deletion_limit_reset':
        return faUndo;
      case 'additional_deletions_granted':
        return faPlusCircle;
      // 🆕 NEW: MONTHLY REPORTING & WARNING ICONS
      case 'post_removed_warning':
        return faExclamationTriangle;
      case 'post_deleted_warning':
        return faExclamationTriangle;
      case 'user_report_warning':
        return faUserShield;
      case 'report_threshold_reached':
        return faCalendarAlt; // CHANGED TO faCalendarAlt
      case 'deletion_limit_reached':
        return faExclamationTriangle;
      case 'deletion_warning':
        return faExclamationTriangle;
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
      case 'user_suspended':
        return '#ef4444';
      case 'feedback_submitted':
        return '#10b981';
      case 'feedback_updated':
        return '#3b82f6';
      // 🆕 DELETION REQUEST COLORS
      case 'deletion_request_approved':
        return '#10b981';
      case 'deletion_request_rejected':
        return '#ef4444';
      case 'deletion_limit_reset':
        return '#3b82f6';
      case 'additional_deletions_granted':
        return '#10b981';
      // 🆕 NEW: MONTHLY REPORTING & WARNING COLORS
      case 'post_removed_warning':
        return '#f59e0b';
      case 'post_deleted_warning':
        return '#ef4444';
      case 'user_report_warning':
        return '#f59e0b';
      case 'report_threshold_reached':
        return '#8b5cf6';
      case 'deletion_limit_reached':
        return '#ef4444';
      case 'deletion_warning':
        return '#f59e0b';
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
            <button 
              className="btn-delete-all"
              onClick={() => setDeleteAllModal({ isOpen: true })}
              disabled={notifications.length === 0}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
              Delete All
            </button>
          </div>
        </header>

        {/* Stats - Now Filterable */}
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
              <h3>{notifications.length}</h3>
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
              <option value="unread">Unread Only</option>
              <option value="post_resolved">Resolved Posts</option>
              <option value="post_removed">Removed Posts</option>
              <option value="post_deleted">Deleted Posts</option>
              <option value="post_restored">Restored Posts</option>
              <option value="report_submitted">Reports</option>
              <option value="report_status_update">Report Updates</option>
              <option value="user_suspended">Account Status</option>
              <option value="feedback_submitted">Feedback Submitted</option>
              <option value="feedback_updated">Feedback Updates</option>
              {/* 🆕 DELETION REQUEST FILTERS */}
              <option value="deletion_request_approved">Approved Deletions</option>
              <option value="deletion_request_rejected">Rejected Deletions</option>
              <option value="deletion_limit_reset">Deletion Limit Reset</option>
              <option value="additional_deletions_granted">Additional Deletions</option>
              {/* 🆕 NEW: MONTHLY REPORTING FILTERS */}
              <option value="post_removed_warning">Post Removal Warnings</option>
              <option value="post_deleted_warning">Post Deletion Warnings</option>
              <option value="user_report_warning">Report Warnings</option>
              <option value="deletion_limit_reached">Deletion Limits</option>
              <option value="deletion_warning">Deletion Warnings</option>
            </select>
          </div>
        </section>

        {/* Active Filter Display */}
        {filter !== 'all' && (
          <div className="active-filter-section">
            <span className="active-filter-label">Active filter:</span>
            <div className="filter-tags">
              <span className="filter-tag">
                {filter === 'unread' && 'Unread Only'}
                {filter === 'post_resolved' && 'Resolved Posts'}
                {filter === 'post_removed' && 'Removed Posts'}
                {filter === 'post_deleted' && 'Deleted Posts'}
                {filter === 'post_restored' && 'Restored Posts'}
                {filter === 'report_submitted' && 'Reports'}
                {filter === 'report_status_update' && 'Report Updates'}
                {filter === 'user_suspended' && 'Account Status'}
                {filter === 'feedback_submitted' && 'Feedback Submitted'}
                {filter === 'feedback_updated' && 'Feedback Updates'}
            
                {filter === 'deletion_request_approved' && 'Approved Deletions'}
                {filter === 'deletion_request_rejected' && 'Rejected Deletions'}
                {filter === 'deletion_limit_reset' && 'Deletion Limit Reset'}
                {filter === 'additional_deletions_granted' && 'Additional Deletions'}
            
                {filter === 'post_removed_warning' && 'Post Removal Warnings'}
                {filter === 'post_deleted_warning' && 'Post Deletion Warnings'}
                {filter === 'user_report_warning' && 'Report Warnings'}
                {filter === 'deletion_limit_reached' && 'Deletion Limits'}
                {filter === 'deletion_warning' && 'Deletion Warnings'}
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
                  {filter !== 'all' && ` (Filtered)`}
                </span>
              </div>
              {notifications.map(notification => (
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
                    <button 
                      className="btn-delete"
                      onClick={() => setDeleteModal({ 
                        isOpen: true, 
                        notificationId: notification.id, 
                        notificationTitle: notification.title 
                      })}
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
                  ? "You're all caught up! New notifications will appear here." 
                  : "No notifications match your filter criteria."
                }
              </p>
            </div>
          )}
        </section>

        {/* Delete Single Notification Modal */}
        {deleteModal.isOpen && (
          <div className="modal-overlay-fmw" onClick={() => setDeleteModal({ isOpen: false, notificationId: null, notificationTitle: null })}>
            <div className="modal-content-fmw" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-fmw">
                <FontAwesomeIcon icon={faWarning} className="warning-icon-fmw" />
                <h3>Delete Notification</h3>
                <button 
                  className="modal-close-fmw"
                  onClick={() => setDeleteModal({ isOpen: false, notificationId: null, notificationTitle: null })}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body-fmw">
                <p>Are you sure you want to delete this notification?</p>
                <p><strong>"{deleteModal.notificationTitle}"</strong></p>
                <p className="warning-text-fmw">This action cannot be undone.</p>
              </div>
              <div className="modal-footer-fmw">
                <button 
                  className="btn-secondary-fmw"
                  onClick={() => setDeleteModal({ isOpen: false, notificationId: null, notificationTitle: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary-fmw delete-confirm-fmw"
                  onClick={() => deleteNotification(deleteModal.notificationId)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete Notification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Notifications Modal */}
        {deleteAllModal.isOpen && (
          <div className="modal-overlay-fmw" onClick={() => setDeleteAllModal({ isOpen: false })}>
            <div className="modal-content-fmw" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-fmw">
                <FontAwesomeIcon icon={faWarning} className="warning-icon-fmw" />
                <h3>Delete All Notifications</h3>
                <button 
                  className="modal-close-fmw"
                  onClick={() => setDeleteAllModal({ isOpen: false })}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body-fmw">
                <p>Are you sure you want to delete ALL notifications?</p>
                <p><strong>This will permanently delete {notifications.length} notification{notifications.length !== 1 ? 's' : ''}.</strong></p>
                <p className="warning-text-fmw">This action cannot be undone and all notification history will be lost.</p>
              </div>
              <div className="modal-footer-fmw">
                <button 
                  className="btn-secondary-fmw"
                  onClick={() => setDeleteAllModal({ isOpen: false })}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary-fmw delete-confirm-fmw"
                  onClick={deleteAllNotifications}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                  Delete All Notifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}