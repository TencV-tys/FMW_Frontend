// UserPages/UserNotifications.jsx - UPDATED with resolution request filters
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
  faUserShield,
  faWarning,
  faTimes,
  faPaperPlane,
  faHourglassHalf,
  faThumbsUp,
  faThumbsDown
} from '@fortawesome/free-solid-svg-icons';
import './styles/UserNotification.css';
import UserNav from '../UserComponents/UserDashboardNav';
import {useWifiUrl} from '../hooks/useWifiUrl';

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [pageLoading, setPageLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, notificationId: null, notificationTitle: null });
  const [deleteAllModal, setDeleteAllModal] = useState({ isOpen: false });
  const [markAllReadModal, setMarkAllReadModal] = useState({ isOpen: false });
  const wifi = useWifiUrl();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!pageLoading) {
      fetchNotifications();
    }
  }, [filter]);

  const fetchInitialData = async () => {
    try {
      setPageLoading(true);
      await Promise.all([
        fetchNotifications(),
        fetchUnreadCount()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setDataLoading(true);
      const response = await fetch(`${wifi}/api/notifications`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        let filteredNotifications = data.notifications || [];
        
        if (filter !== 'all') {
          if (filter === 'unread') {
            filteredNotifications = filteredNotifications.filter(
              notification => !notification.is_read
            );
          } else {
            filteredNotifications = filteredNotifications.filter(
              notification => notification.type === filter
            );
          }
        }
        
        setNotifications(filteredNotifications.slice(0, 50));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setDataLoading(false);
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
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        ));
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
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        setUnreadCount(0);
        setMarkAllReadModal({ isOpen: false });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${wifi}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const deletedNotif = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setDeleteModal({ isOpen: false, notificationId: null, notificationTitle: null });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const response = await fetch(`${wifi}/api/notifications/delete-all`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications([]);
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

  const handleStatCardClick = (filterType) => {
    setFilter(filterType);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      // Resolution Request Types
      case 'resolution_request_submitted':
        return faHourglassHalf;
      case 'resolution_request_approved':
        return faThumbsUp;
      case 'resolution_request_rejected':
        return faThumbsDown;
      case 'resolution_request_pending':
        return faHourglassHalf;
        
      // Deletion Request Types
      case 'deletion_request_submitted':
        return faPaperPlane;
      case 'deletion_request_approved':
        return faCheckCircle;
      case 'deletion_request_rejected':
        return faTimesCircle;
      case 'deletion_request':
        return faUserShield;
        
      // Post and General Types
      case 'user_warning':
        return faExclamationTriangle;
      case 'post_removed_warning':
        return faEyeSlash;
      case 'post_deleted_warning':
        return faTrash;
      case 'post_restored':
        return faEye;
      case 'report_submitted':
        return faExclamationTriangle;
      case 'report_status_update':
        return faCheckCircle;
      case 'feedback_submitted':
        return faComments;
      case 'feedback_updated':
        return faSyncAlt;
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
      // Resolution Request Colors
      case 'resolution_request_submitted':
        return '#f59e0b'; // Amber - pending/submitted
      case 'resolution_request_approved':
        return '#10b981'; // Green - approved
      case 'resolution_request_rejected':
        return '#ef4444'; // Red - rejected
      case 'resolution_request_pending':
        return '#f59e0b'; // Amber - pending
        
      // Deletion Request Colors
      case 'deletion_request_submitted':
        return '#3b82f6'; // Blue - submitted
      case 'deletion_request_approved':
        return '#10b981'; // Green - approved
      case 'deletion_request_rejected':
        return '#ef4444'; // Red - rejected
      case 'deletion_request':
        return '#8b5cf6'; // Purple - admin deletion request
        
      // Other Types
      case 'user_warning':
        return '#f59e0b';
      case 'post_resolved':
        return '#10b981';
      case 'post_removed_warning':
        return '#f59e0b';
      case 'post_deleted_warning':
        return '#ef4444';
      case 'post_restored':
        return '#3b82f6';
      case 'report_submitted':
        return '#8b5cf6';
      case 'report_status_update':
        return '#06b6d4';
      case 'feedback_submitted':
        return '#10b981';
      case 'feedback_updated':
        return '#3b82f6';
      case 'deletion_limit_reached':
        return '#ef4444';
      case 'deletion_warning':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getNotificationLabel = (type) => {
    switch (type) {
      // Resolution Request Labels
      case 'resolution_request_submitted':
        return 'Resolution Submitted';
      case 'resolution_request_approved':
        return 'Resolution Approved';
      case 'resolution_request_rejected':
        return 'Resolution Rejected';
      case 'resolution_request_pending':
        return 'Resolution Pending';
        
      // Deletion Request Labels
      case 'deletion_request_submitted':
        return 'Request Submitted';
      case 'deletion_request_approved':
        return 'Request Approved';
      case 'deletion_request_rejected':
        return 'Request Rejected';
      case 'deletion_request':
        return 'Admin Request';
        
      // Other Labels
      case 'user_warning':
        return 'User Warning';
      case 'post_removed_warning':
        return 'Post Removed';
      case 'post_deleted_warning':
        return 'Post Deleted';
      case 'post_restored':
        return 'Post Restored';
      case 'report_submitted':
        return 'Report Submitted';
      case 'report_status_update':
        return 'Report Update';
      case 'feedback_submitted':
        return 'Feedback Submitted';
      case 'feedback_updated':
        return 'Feedback Updated';
      case 'deletion_limit_reached':
        return 'Deletion Limit';
      case 'deletion_warning':
        return 'Deletion Warning';
      default:
        return 'Notification';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      if (diffInMinutes < 1) return 'Just now';
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  if (pageLoading) {
    return (
      <section className="user-notif-page">
        <UserNav />
        <div className="loading-container-fmw">
          <div className="loading-spinner-fmw"></div>
          <p>Loading your notifications...</p>
        </div>
      </section>
    );
  } 
 
  return ( 
    <section className="user-notif-page">
      <UserNav />
      
      {/* Header */}
      <header className="user-notif-header">
        <div className="user-notif-header-content">
          <h1>
            <FontAwesomeIcon icon={faBell} />
            Notifications
          </h1>
          <p>Stay updated with your account activities</p>
        </div>
        <div className="user-notif-header-actions">
          <button 
            className="user-notif-btn-mark-all"
            onClick={() => setMarkAllReadModal({ isOpen: true })}
            disabled={unreadCount === 0}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            Mark All as Read
          </button>
          <button 
            className="user-notif-btn-delete-all"
            onClick={() => setDeleteAllModal({ isOpen: true })}
            disabled={notifications.length === 0}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
            Delete All
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="user-notif-stats">
        <div 
          className={`user-notif-stat-card ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
          title="Show all notifications"
        >
          <div className="user-notif-stat-icon total">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="user-notif-stat-info">
            <h3>{notifications.length}</h3>
            <p>Total</p>
          </div>
        </div>
        <div 
          className={`user-notif-stat-card ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('unread')}
          style={{ cursor: 'pointer' }}
          title="Show unread notifications"
        >
          <div className="user-notif-stat-icon unread">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="user-notif-stat-info">
            <h3>{unreadCount}</h3>
            <p>Unread</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="user-notif-filters">
        <div className="user-notif-filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="user-notif-filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            
            {/* Resolution Request Categories */}
            <option value="resolution_request_submitted">Resolution Submitted</option>
            <option value="resolution_request_approved">Resolution Approved</option>
            <option value="resolution_request_rejected">Resolution Rejected</option>
            <option value="resolution_request_pending">Resolution Pending</option>
            
            {/* Deletion Request Categories */}
            <option value="deletion_request_submitted">Deletion Submitted</option>
            <option value="deletion_request_approved">Deletion Approved</option>
            <option value="deletion_request_rejected">Deletion Rejected</option>
            
            {/* Post Categories */}
        
            <option value="post_restored">Restored Posts</option>
            <option value="post_removed_warning">Post Removal Warnings</option>
            <option value="post_deleted_warning">Post Deletion Warnings</option>
            
            {/* Report Categories */}
            <option value="report_submitted">Reports</option>
            <option value="report_status_update">Report Updates</option>
            
            {/* Feedback Categories */}
            <option value="feedback_submitted">Feedback Submitted</option>
            <option value="feedback_updated">Feedback Updates</option>
            
            {/* Warning Categories */}
            <option value="user_warning">User Warnings</option>
            <option value="deletion_limit_reached">Deletion Limits</option>
            <option value="deletion_warning">Deletion Warnings</option>
          </select>
        </div>
      </section>

      {/* Active Filter Display */}
      {filter !== 'all' && (
        <div className="user-notif-active-filters">
          <span className="user-notif-filter-label">Active filter:</span>
          <div className="user-notif-filter-tags">
            <span className="user-notif-filter-tag">
              {filter === 'unread' && 'Unread Only'}
              
              {/* Resolution Request Filters */}
              {filter === 'resolution_request_submitted' && 'Resolution Submitted'}
              {filter === 'resolution_request_approved' && 'Resolution Approved'}
              {filter === 'resolution_request_rejected' && 'Resolution Rejected'}
              {filter === 'resolution_request_pending' && 'Resolution Pending'}
              
              {/* Deletion Request Filters */}
              {filter === 'deletion_request_submitted' && 'Deletion Submitted'}
              {filter === 'deletion_request_approved' && 'Deletion Approved'}
              {filter === 'deletion_request_rejected' && 'Deletion Rejected'}
              
              {/* Post Filters */}
            
              {filter === 'post_removed_warning' && 'Post Removal Warnings'}
              {filter === 'post_deleted_warning' && 'Post Deletion Warnings'}
              {filter === 'post_restored' && 'Restored Posts'}
              
              {/* Report Filters */}
              {filter === 'report_submitted' && 'Reports'}
              {filter === 'report_status_update' && 'Report Updates'}
              
              {/* Feedback Filters */}
              {filter === 'feedback_submitted' && 'Feedback Submitted'}
              {filter === 'feedback_updated' && 'Feedback Updates'}
              
              {/* Warning Filters */}
              {filter === 'user_warning' && 'User Warnings'}
              {filter === 'deletion_limit_reached' && 'Deletion Limits'}
              {filter === 'deletion_warning' && 'Deletion Warnings'}
            </span>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <section className="user-notif-list">
        {dataLoading ? (
          <div className="user-notif-loading user-notif-data-loading">
            <div className="user-notif-spinner"></div>
            <p>Loading notifications data...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="user-notif-list-container">
            <div className="user-notif-list-header">
              <span className="user-notif-count">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {filter !== 'all' && ` (Filtered)`}
              </span>
            </div>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`user-notif-item ${notification.is_read ? 'read' : 'unread'}`}
                data-type={notification.type}
              >
                <div className="user-notif-icon">
                  <FontAwesomeIcon 
                    icon={getNotificationIcon(notification.type)} 
                    style={{ color: getNotificationColor(notification.type) }}
                  />
                </div>
                <div className="user-notif-content">
                  <div className="user-notif-header-row">
                    <h4>{notification.title}</h4>
                    <span 
                      className="user-notif-type-badge"
                      style={{ backgroundColor: getNotificationColor(notification.type) }}
                    >
                      {getNotificationLabel(notification.type)}
                    </span>
                  </div>
                  <p>{notification.message}</p>
                  <div className="user-notif-meta">
                    <span className="time">{formatTime(notification.created_at)}</span>
                  </div>
                </div>
                <div className="user-notif-actions">
                  {!notification.is_read && (
                    <button 
                      className="user-notif-btn-read"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                  )}
                  <button 
                    className="user-notif-btn-delete"
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
          <div className="user-notif-empty">
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

      {/* Mark All as Read Confirmation Modal */}
      {markAllReadModal.isOpen && (
        <div className="user-notif-modal-overlay" onClick={() => setMarkAllReadModal({ isOpen: false })}>
          <div className="user-notif-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="user-notif-modal-header">
              <FontAwesomeIcon icon={faCheckDouble} className="user-notif-warning-icon" style={{ color: '#10b981' }} />
              <h3>Mark All as Read</h3>
              <button 
                className="user-notif-modal-close"
                onClick={() => setMarkAllReadModal({ isOpen: false })}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="user-notif-modal-body">
              <p>Are you sure you want to mark all <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''} as read?</p>
              <p className="user-notif-warning-text">This action will mark all notifications as read and cannot be undone.</p>
            </div>
            <div className="user-notif-modal-footer">
              <button 
                className="user-notif-modal-btn-secondary"
                onClick={() => setMarkAllReadModal({ isOpen: false })}
              >
                Cancel
              </button>
              <button 
                className="user-notif-modal-btn-primary mark-read-confirm"
                onClick={markAllAsRead}
              >
                <FontAwesomeIcon icon={faCheckDouble} />
                Mark All as Read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Notification Modal */}
      {deleteModal.isOpen && (
        <div className="user-notif-modal-overlay" onClick={() => setDeleteModal({ isOpen: false, notificationId: null, notificationTitle: null })}>
          <div className="user-notif-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="user-notif-modal-header">
              <FontAwesomeIcon icon={faWarning} className="user-notif-warning-icon" />
              <h3>Delete Notification</h3>
              <button 
                className="user-notif-modal-close"
                onClick={() => setDeleteModal({ isOpen: false, notificationId: null, notificationTitle: null })}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="user-notif-modal-body">
              <p>Are you sure you want to delete this notification?</p>
              <p><strong>"{deleteModal.notificationTitle}"</strong></p>
              <p className="user-notif-warning-text">This action cannot be undone.</p>
            </div>
            <div className="user-notif-modal-footer">
              <button 
                className="user-notif-modal-btn-secondary"
                onClick={() => setDeleteModal({ isOpen: false, notificationId: null, notificationTitle: null })}
              >
                Cancel
              </button>
              <button 
                className="user-notif-modal-btn-primary delete-confirm"
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
        <div className="user-notif-modal-overlay" onClick={() => setDeleteAllModal({ isOpen: false })}>
          <div className="user-notif-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="user-notif-modal-header">
              <FontAwesomeIcon icon={faWarning} className="user-notif-warning-icon" />
              <h3>Delete All Notifications</h3>
              <button 
                className="user-notif-modal-close"
                onClick={() => setDeleteAllModal({ isOpen: false })}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="user-notif-modal-body">
              <p>Are you sure you want to delete ALL notifications?</p>
              <p><strong>This will permanently delete {notifications.length} notification{notifications.length !== 1 ? 's' : ''}.</strong></p>
              <p className="user-notif-warning-text">This action cannot be undone and all notification history will be lost.</p>
            </div>
            <div className="user-notif-modal-footer">
              <button 
                className="user-notif-modal-btn-secondary"
                onClick={() => setDeleteAllModal({ isOpen: false })}
              >
                Cancel
              </button>
              <button 
                className="user-notif-modal-btn-primary delete-confirm"
                onClick={deleteAllNotifications}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
                Delete All Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}