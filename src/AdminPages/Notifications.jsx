import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 🆕 ADD THIS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckCircle,
  faTrash,
  faFilter,
  faCheckDouble,
  faExclamationTriangle,
  faExternalLinkAlt,
  faUserSlash,
  faBan,
  faUserCheck,
  faUserTimes,
  faCommentDots,
  faUserLock,
  faUndo,
  faPlusCircle,
  faTimes,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import './styles/Notifications.css'; 

export default function AdminNotifications() {
  const navigate = useNavigate(); // 🆕 ADD THIS HOOK
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    reports: 0,
    user_suspended: 0,
    user_banned: 0,
    feedback_submitted: 0,
    deletion_request: 0
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: '', // 'markAllRead' or 'clearAll'
    title: '',
    message: '',
    isProcessing: false // Prevent double clicks
  });

  // Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationStats();

    // Set up smart polling
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (isTabActiveRef.current) {
        // Tab became active, fetch immediately
        fetchNotifications();
        fetchNotificationStats();
        startPolling();
      } else {
        // Tab hidden, stop polling
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [filter]);

  // Smart polling functions
  const startPolling = () => {
    stopPolling(); // Clear any existing interval
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        fetchNotifications();
        fetchNotificationStats();
      }
    }, 60000); // 60 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'all' 
        ? 'http://localhost:8000/api/admin/notifications'
        : `http://localhost:8000/api/admin/notifications/type/${filter}`;
      
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
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
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
 
      if (response.ok) {
        const data = await response.json();
        setStats({ 
          total: data.stats?.total || 0,
          unread: data.stats?.unread || 0,
          reports: data.stats?.reports || 0,
          user_suspended: data.stats?.user_suspended || 0,
          user_banned: data.stats?.user_banned || 0,
          feedback_submitted: data.stats?.feedback_submitted || 0,
          deletion_request: data.stats?.deletion_request || 0
        });
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  }; 

  // Manual refresh
  const handleManualRefresh = async () => {
    showToast('Refreshing notifications...', 'success');
    await fetchNotifications();
    await fetchNotificationStats();
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (filterType) => {
    setFilter(filterType);
  };

  // 🆕 ENHANCED: Parse metadata from notification
  const parseNotificationMetadata = (notification) => {
    try {
      return notification.metadata ? JSON.parse(notification.metadata) : {};
    } catch (error) {
      console.error('Error parsing notification metadata:', error);
      return {};
    }
  };

  // 🆕 ENHANCED: Get navigation link with specific data parameters
  const getNotificationLink = (notification) => {
    const metadata = parseNotificationMetadata(notification);

    switch (notification.type) {
      case 'report_submitted':
        // Navigate to reports page with specific report ID
        return metadata.report_id ? `/admin/reports?highlightReport=${metadata.report_id}` : '/admin/reports';
      
      case 'post_resolved':
      case 'post_restored':
      case 'post_removed':
      case 'post_deleted':
      case 'post_resolved_by_user':
        // Navigate to manage posts with post ID filter
        return metadata.post_id ? `/admin/manage-posts?highlightPost=${metadata.post_id}` : '/admin/manage-posts';
      
      case 'user_suspended':
      case 'user_banned':
      case 'user_activated':
      case 'user_deleted':
        // Navigate to manage users with user ID filter
        return metadata.target_user_id ? `/admin/manage-users?highlightUser=${metadata.target_user_id}` : '/admin/manage-users';
      
      case 'feedback_submitted':
      case 'feedback_updated':
      case 'feedback_deleted':
        // Navigate to feedback with specific feedback ID
        return metadata.feedback_id ? `/admin/feedback?highlightFeedback=${metadata.feedback_id}` : '/admin/feedback';
      
      case 'deletion_request':
      case 'deletion_request_approved':
      case 'deletion_request_rejected':
        // Navigate to deletion requests with specific request ID
        return metadata.request_id ? `/admin/deletion-requests?highlightRequest=${metadata.request_id}` : '/admin/deletion-requests';
      
      default:
        return null;
    }   
  }; 

  // 🆕 ENHANCED: Handle notification click with navigation
  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Get the navigation link
    const link = getNotificationLink(notification);
    
    // Navigate to the specific page
    if (link) {
      navigate(link);
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
        showToast('Notification marked as read', 'success');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      showToast('Error marking notification as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const response = await fetch('http://localhost:8000/api/admin/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        fetchNotificationStats();
        closeConfirmationModal();
        showToast('All notifications marked as read', 'success');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      showToast('Error marking all notifications as read', 'error');
    } finally {
      setConfirmationModal(prev => ({ ...prev, isProcessing: false }));
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
        showToast('Notification deleted', 'success');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('Error deleting notification', 'error');
    }
  };

  const clearAllNotifications = async () => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const response = await fetch('http://localhost:8000/api/admin/notifications', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications([]);
        fetchNotificationStats();
        closeConfirmationModal();
        showToast('All notifications cleared', 'success');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      showToast('Error clearing notifications', 'error');
    } finally {
      setConfirmationModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Confirmation Modal Functions
  const openMarkAllReadConfirmation = () => {
    if (stats.unread === 0) return;
    
    setConfirmationModal({
      isOpen: true,
      type: 'markAllRead',
      title: 'Mark All as Read',
      message: `Are you sure you want to mark all ${stats.unread} unread notifications as read? This action cannot be undone.`,
      isProcessing: false
    });
  };

  const openClearAllConfirmation = () => {
    if (notifications.length === 0) return;
    
    setConfirmationModal({
      isOpen: true,
      type: 'clearAll',
      title: 'Clear All Notifications',
      message: `Are you sure you want to clear all ${notifications.length} notifications? This action cannot be undone and all notifications will be permanently deleted.`,
      isProcessing: false
    });
  };

  const closeConfirmationModal = () => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      isProcessing: false
    });
  };

  const handleConfirmAction = () => {
    if (confirmationModal.isProcessing) return;
    
    if (confirmationModal.type === 'markAllRead') {
      markAllAsRead();
    } else if (confirmationModal.type === 'clearAll') {
      clearAllNotifications();
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
      case 'feedback_submitted':
      case 'feedback_updated':
      case 'feedback_deleted':
        return faCommentDots;
      case 'deletion_request':
      case 'deletion_request_approved':
      case 'deletion_request_rejected':
        return faUserLock;
      case 'post_resolved_by_user':
        return faCheckCircle;
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
      case 'feedback_submitted':
        return '#3b82f6';
      case 'feedback_updated':
        return '#8b5cf6';
      case 'feedback_deleted':
        return '#ef4444';
      case 'deletion_request':
      case 'deletion_request_approved':
      case 'deletion_request_rejected':
        return '#FF8904';
      case 'post_resolved_by_user':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  // 🆕 ENHANCED: Get description text based on metadata
  const getNotificationDescription = (notification) => {
    const metadata = parseNotificationMetadata(notification);
    
    switch (notification.type) {
      case 'report_submitted':
        return `Report #${metadata.report_id} for Post #${metadata.post_id}`;
      
      case 'post_resolved':
      case 'post_restored':
        return `Post #${metadata.post_id} - ${metadata.post_title || ''}`;
      
      case 'user_suspended':
      case 'user_banned':
        return `User #${metadata.target_user_id} - ${metadata.target_user_name || ''}`;
      
      default:
        return '';
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

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`admin-notif-toast admin-notif-toast-${toast.type}`}>
          <div className="admin-notif-toast-content">
            <FontAwesomeIcon 
              icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="admin-notif-toast-icon" 
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="admin-notif-header">
        <div className="admin-notif-header-content">
          <p>Manage and view system notifications</p>
        </div>
        <div className="admin-notif-header-actions">
          <button 
            className="admin-notif-refresh-btn"
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faRefresh} spin={loading} />
            Refresh
          </button>
          <button 
            className="admin-notif-btn-mark-all-read"
            onClick={openMarkAllReadConfirmation}
            disabled={stats.unread === 0 || confirmationModal.isProcessing}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            Mark All as Read
          </button>
          <button 
            className="admin-notif-btn-clear-all"
            onClick={openClearAllConfirmation}
            disabled={notifications.length === 0 || confirmationModal.isProcessing}
          >
            <FontAwesomeIcon icon={faTrash} />
            Clear All
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="admin-notif-stats">
        <div 
          className={`admin-notif-stat-card ${filter === 'all' ? 'admin-notif-active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
          title="Show all notifications"
        >
          <div className="admin-notif-stat-info">
            <h3>{stats.total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div 
          className={`admin-notif-stat-card ${filter === 'unread' ? 'admin-notif-active' : ''}`}
          onClick={() => handleStatCardClick('unread')}
          style={{ cursor: 'pointer' }}
          title="Show unread notifications"
        >
          <div className="admin-notif-stat-info">
            <h3>{stats.unread}</h3>
            <p>Unread</p>
          </div>
        </div>
        <div 
          className={`admin-notif-stat-card ${filter === 'report_submitted' ? 'admin-notif-active' : ''}`}
          onClick={() => handleStatCardClick('report_submitted')}
          style={{ cursor: 'pointer' }}
          title="Show report notifications"
        >
          <div className="admin-notif-stat-info">
            <h3>{stats.reports}</h3>
            <p>Reports</p>
          </div>
        </div>
        
        {/* Deletion Request Stats */}
        <div 
          className={`admin-notif-stat-card ${filter === 'deletion_request' ? 'admin-notif-active' : ''}`}
          onClick={() => handleStatCardClick('deletion_request')}
          style={{ cursor: 'pointer' }}
          title="Show deletion request notifications"
        >
          <div className="admin-notif-stat-info">
            <h3>{stats.deletion_request}</h3>
            <p>Deletion Requests</p>
          </div>
        </div>
        
        {/* User Action Stats */}
        <div 
          className={`admin-notif-stat-card ${filter === 'user_suspended' ? 'admin-notif-active' : ''}`}
          onClick={() => handleStatCardClick('user_suspended')}
          style={{ cursor: 'pointer' }}
          title="Show user suspension notifications"
        >
          <div className="admin-notif-stat-info">
            <h3>{stats.user_suspended}</h3>
            <p>User Suspensions</p>
          </div>
        </div>
        <div 
          className={`admin-notif-stat-card ${filter === 'user_banned' ? 'admin-notif-active' : ''}`}
          onClick={() => handleStatCardClick('user_banned')}
          style={{ cursor: 'pointer' }}
          title="Show user ban notifications"
        >
          <div className="admin-notif-stat-info">
            <h3>{stats.user_banned}</h3>
            <p>User Bans</p>
          </div>
        </div>
        
        {/* Feedback Stats */}
        <div 
          className={`admin-notif-stat-card ${filter === 'feedback_submitted' ? 'admin-notif-active' : ''}`}
          onClick={() => handleStatCardClick('feedback_submitted')}
          style={{ cursor: 'pointer' }}
          title="Show feedback submitted notifications"
        >
          <div className="admin-notif-stat-info">
            <h3>{stats.feedback_submitted}</h3>
            <p>Feedback</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="admin-notif-filters">
        <div className="admin-notif-filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="admin-notif-filter-select"
            disabled={confirmationModal.isProcessing}
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
            <option value="deletion_request">Deletion Requests</option>
            <option value="deletion_request_approved">Request Approved</option>
            <option value="deletion_request_rejected">Request Rejected</option>
            <option value="post_resolved_by_user">User Resolved Posts</option>
            <option value="feedback_submitted">Feedback Submitted</option>
            <option value="feedback_updated">Feedback Updated</option>
            <option value="feedback_deleted">Feedback Deleted</option>
          </select>
        </div>
        
        {/* Clear Filters Button */}
        {isFilterActive() && (
          <button 
            className="admin-notif-clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
            disabled={confirmationModal.isProcessing}
          >
            Clear Filters
          </button>
        )}
      </section>

      {/* Active Filters Display */}
      {isFilterActive() && (
        <div className="admin-notif-active-filters-section">
          <span className="admin-notif-active-filters-label">Active filter:</span>
          <div className="admin-notif-filter-tags">
            <span className="admin-notif-filter-tag">
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
              {filter === 'deletion_request' && 'Deletion Requests'}
              {filter === 'deletion_request_approved' && 'Request Approved'}
              {filter === 'deletion_request_rejected' && 'Request Rejected'}
              {filter === 'post_resolved_by_user' && 'User Resolved Posts'}
              {filter === 'feedback_submitted' && 'Feedback Submitted'}
              {filter === 'feedback_updated' && 'Feedback Updated'}
              {filter === 'feedback_deleted' && 'Feedback Deleted'}
            </span>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <section className="admin-notif-list">
        {loading ? (
          <div className="admin-notif-loading-state">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="admin-notif-container">
            <div className="admin-notif-header-info">
              <span className="admin-notif-count">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {isFilterActive() && ` (Filtered)`}
              </span>
            </div>
            {notifications.map(notification => {
              const isClickable = getNotificationLink(notification) !== null;
              const description = getNotificationDescription(notification);
              
              return (
                <div 
                  key={notification.id} 
                  className={`admin-notif-item ${notification.is_read ? 'admin-notif-read' : 'admin-notif-unread'} ${
                    isClickable ? 'admin-notif-clickable' : ''
                  }`}
                  onClick={() => isClickable && handleNotificationClick(notification)}
                >
                  <div className="admin-notif-icon">
                    <FontAwesomeIcon 
                      icon={getNotificationIcon(notification.type)} 
                      style={{ color: getNotificationColor(notification.type) }}
                    />
                  </div>
                  <div className="admin-notif-content">
                    <h4>
                      {notification.title}
                      {isClickable && (
                        <FontAwesomeIcon 
                          icon={faExternalLinkAlt} 
                          className="admin-notif-external-link-icon"
                          title="Click to view related content"
                        />
                      )}
                    </h4>
                    <p>{notification.message}</p>
                    {description && (
                      <div className="admin-notif-description">
                        <small>{description}</small>
                      </div>
                    )}
                    <div className="admin-notif-meta">
                      <span className="admin-notif-user">
                        {notification.first_name} {notification.last_name}
                        {notification.role === 'admin' && ' (Admin)'}
                      </span>
                      <span className="admin-notif-time">{formatTime(notification.created_at)}</span>
                      <span className="admin-notif-type">{notification.type.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="admin-notif-actions">
                    {!notification.is_read && (
                      <button 
                        className="admin-notif-btn-mark-read"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Mark as read"
                        disabled={confirmationModal.isProcessing}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </button>
                    )}
                    <button 
                      className="admin-notif-btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete notification"
                      disabled={confirmationModal.isProcessing}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="admin-notif-empty-state">
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
                className="admin-notif-retry-btn" 
                onClick={clearAllFilters}
                disabled={confirmationModal.isProcessing}
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="admin-notif-modal-overlay" onClick={closeConfirmationModal}>
          <div className="admin-notif-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-notif-modal-header">
              <h3>{confirmationModal.title}</h3>
              <button 
                className="admin-notif-modal-close"
                onClick={closeConfirmationModal}
                disabled={confirmationModal.isProcessing}
              >
                ×
              </button>
            </div>
            <div className="admin-notif-modal-body">
              <div className="admin-notif-confirm-icon">
                <FontAwesomeIcon 
                  icon={confirmationModal.type === 'markAllRead' ? faCheckDouble : faTrash} 
                  size="3x"
                />
              </div>
              <p>{confirmationModal.message}</p>
            </div>
            <div className="admin-notif-modal-footer">
              <button 
                className="admin-notif-btn-secondary"
                onClick={closeConfirmationModal}
                disabled={confirmationModal.isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`admin-notif-btn-primary ${
                  confirmationModal.type === 'clearAll' ? 'admin-notif-warning' : ''
                }`}
                onClick={handleConfirmAction}
                disabled={confirmationModal.isProcessing}
              >
                {confirmationModal.isProcessing ? 'Processing...' : 
                  confirmationModal.type === 'markAllRead' ? 'Mark All as Read' : 'Clear All'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}