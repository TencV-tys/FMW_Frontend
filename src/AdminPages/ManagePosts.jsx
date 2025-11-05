import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faEye, 
  faTrash, 
  faBan, 
  faRefresh, 
  faFilter, 
  faCheckCircle,
  faList,
  faTimes,
  faMapMarkerAlt,
  faUndo,
  faImage,
  faExclamationTriangle,
  faFlag,
  faHistory,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import './styles/ManagePosts.css';

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [viewMode, setViewMode] = useState('table');
  const [viewModal, setViewModal] = useState({ isOpen: false, post: null });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    post: null,
    action: '',
    title: '',
    message: '',
    isProcessing: false
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // 🎯 POST REPORT THRESHOLDS (Same pattern as ManageUsers)
  const REPORT_THRESHOLDS = {
    CAN_REMOVE: 3,    // Allow removal at 3+ reports
    CAN_DELETE: 5     // Allow permanent deletion at 5+ reports
  };

  // 🆕 ADDED: Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  // Fetch posts data
  useEffect(() => {
    fetchPosts();

    // 🆕 ADDED: Smart polling setup
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (isTabActiveRef.current) {
        // Tab became active, fetch immediately
        fetchPosts();
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
  }, []);

  // 🆕 ADDED: Smart polling functions (60 seconds)
  const startPolling = () => {
    stopPolling(); // Clear any existing interval
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        fetchPosts();
      }
    }, 60000); // 60 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // 🆕 ADDED: Manual refresh
  const handleManualRefresh = async () => {
    showToast('Refreshing posts...', 'success');
    await fetchPosts();
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/posts', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts');
        showToast('Failed to fetch posts', 'error');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast('Error fetching posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open View Modal
  const openViewModal = (post) => {
    setViewModal({ isOpen: true, post });
  };

  // Close Modals
  const closeModal = () => {
    setViewModal({ isOpen: false, post: null });
    setConfirmationModal({ isOpen: false, post: null, action: '', title: '', message: '', isProcessing: false });
  };

  // Show confirmation modal for ALL actions
  const showConfirmationModal = (post, action) => {
    let title = '';
    let message = '';
    
    switch (action) {
      case 'remove':
        title = 'Remove Post';
        message = `Are you sure you want to remove the post "${post.title}" from public view?`;
        break;
      case 'delete':
        title = 'Delete Post';
        message = `Are you sure you want to permanently delete the post "${post.title}"? This action cannot be undone.`;
        break;
      case 'restore':
        title = 'Restore Post';
        message = `Are you sure you want to restore the post "${post.title}" to active status?`;
        break;
      case 'resolve':
        title = 'Resolve Post';
        message = `Are you sure you want to mark the post "${post.title}" as resolved?`;
        break;
      default:
        return;
    }

    setConfirmationModal({
      isOpen: true,
      post,
      action,
      title,
      message,
      isProcessing: false
    });
  };

  // 🎯 UPDATED: Check if post can be removed based on threshold
  const canRemovePost = (post) => {
    const reportCount = post.total_report_count || 0;
    return reportCount >= REPORT_THRESHOLDS.CAN_REMOVE;
  };

  // 🎯 UPDATED: Check if post can be deleted based on threshold
  const canDeletePost = (post) => {
    const reportCount = post.total_report_count || 0;
    return reportCount >= REPORT_THRESHOLDS.CAN_DELETE;
  };

  // 🎯 UPDATED: Handle post actions with threshold validation
  const handlePostAction = (postId, action) => {
    const post = posts.find(p => p.id === postId);
    
    // Validate thresholds before showing confirmation
    if (action === 'remove' && !canRemovePost(post)) {
      showToast(`Post needs at least ${REPORT_THRESHOLDS.CAN_REMOVE} reports to be removed (currently has ${post.total_report_count || 0})`, 'error');
      return;
    }
    
    if (action === 'delete' && !canDeletePost(post)) {
      showToast(`Post needs at least ${REPORT_THRESHOLDS.CAN_DELETE} reports to be permanently deleted (currently has ${post.total_report_count || 0})`, 'error');
      return;
    }

    // Show confirmation modal for ALL actions
    showConfirmationModal(post, action);
  };

  // Execute post action after confirmation
  const executePostAction = async (postId, action) => {
    try {
      let url, method, body;
      
      switch (action) {
        case 'remove':
          url = `http://localhost:8000/api/admin/posts/${postId}/remove`;
          method = 'PUT';
          body = { 
            reason: 'Violation of community guidelines'
          };
          break;
        case 'delete':
          url = `http://localhost:8000/api/admin/posts/${postId}`;
          method = 'DELETE';
          body = { 
            reason: 'Severe violation'
          };
          break;
        case 'restore':
          url = `http://localhost:8000/api/admin/posts/${postId}/restore`;
          method = 'PUT';
          body = {};
          break;
        case 'resolve':
          url = `http://localhost:8000/api/admin/posts/${postId}/resolve`;
          method = 'PUT';
          body = { reason: 'Issue resolved' };
          break;
        default:
          return;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        updatePostsAfterAction(postId, action);
        let successMessage = '';
        switch (action) {
          case 'remove':
            successMessage = 'Post removed from public view!';
            break;
          case 'delete':
            successMessage = 'Post deleted permanently!';
            break;
          case 'restore':
            successMessage = 'Post restored successfully!';
            break;
          case 'resolve':
            successMessage = 'Post marked as resolved!';
            break;
        }
        showToast(successMessage, 'success');
        closeModal();
      } else {
        showToast(data.error || 'Failed to perform action', 'error');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      showToast('Error performing action', 'error');
    }
  };

  // Handle confirmed action from confirmation modal
  const handleConfirmedAction = async () => {
    if (confirmationModal.post && confirmationModal.action && !confirmationModal.isProcessing) {
      setConfirmationModal(prev => ({ ...prev, isProcessing: true }));
      await executePostAction(confirmationModal.post.id, confirmationModal.action);
      setConfirmationModal({ isOpen: false, post: null, action: '', title: '', message: '', isProcessing: false });
    }
  };

  // Update posts after successful action
  const updatePostsAfterAction = (postId, action) => {
    setPosts(currentPosts => {
      if (action === 'delete') {
        return currentPosts.filter(post => post.id !== postId);
      }
      
      return currentPosts.map(post => {
        if (post.id === postId) {
          switch (action) {
            case 'remove':
              return { ...post, status: 'Removed' };
            case 'restore':
              return { ...post, status: 'Active' };
            case 'resolve':
              return { ...post, status: 'Resolved' };
            default:
              return post;
          }
        }
        return post;
      });
    });
    
    setSelectedPosts(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(postId);
      return newSelected;
    });
  };

  // Filter posts based on search, status, and type
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.barangay_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.purok_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesType = typeFilter === 'all' || post.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Check if any filter is active
  const isFilterActive = () => {
    return statusFilter !== 'all' || typeFilter !== 'all' || searchTerm !== '';
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
  };

  // Get unique types for filter dropdown
  const getUniqueTypes = () => {
    const types = [...new Set(posts.map(post => post.type).filter(Boolean))];
    return types.sort();
  };

  // 🎯 UPDATED: Bulk actions with threshold validation
  const handleBulkAction = async (action) => {
    if (selectedPosts.size === 0) return;

    // Check thresholds for bulk actions
    const selectedPostsData = posts.filter(post => selectedPosts.has(post.id));
    
    if (action === 'remove') {
      const cannotRemove = selectedPostsData.filter(post => !canRemovePost(post));
      if (cannotRemove.length > 0) {
        showToast(`Some posts don't meet the ${REPORT_THRESHOLDS.CAN_REMOVE} report threshold for removal`, 'error');
        return;
      }
    }
    
    if (action === 'delete') {
      const cannotDelete = selectedPostsData.filter(post => !canDeletePost(post));
      if (cannotDelete.length > 0) {
        showToast(`Some posts don't meet the ${REPORT_THRESHOLDS.CAN_DELETE} report threshold for deletion`, 'error');
        return;
      }
    }

    let confirmationMessage = '';
    let actionText = '';
    
    switch (action) {
      case 'remove':
        confirmationMessage = `Are you sure you want to remove ${selectedPosts.size} post(s) from public view?`;
        actionText = 'remove';
        break;
      case 'delete':
        confirmationMessage = `Are you sure you want to permanently delete ${selectedPosts.size} post(s)? This action cannot be undone.`;
        actionText = 'delete';
        break;
      case 'restore':
        confirmationMessage = `Are you sure you want to restore ${selectedPosts.size} post(s)?`;
        actionText = 'restore';
        break;
      default:
        return;
    }

    if (!window.confirm(confirmationMessage)) return;

    try {
      const promises = Array.from(selectedPosts).map(postId => 
        executePostAction(postId, action)
      );
      await Promise.all(promises);
      setSelectedPosts(new Set());
      showToast(`${selectedPosts.size} post(s) ${actionText} successfully!`, 'success');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showToast('Error performing bulk action', 'error');
    }
  };

  // Toggle post selection
  const togglePostSelection = (postId) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  // Select all filtered posts
  const toggleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length && filteredPosts.length > 0) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(post => post.id)));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      'Active': 'pm-status-active',
      'Removed': 'pm-status-removed',
      'Resolved': 'pm-status-resolved'
    };
    return statusMap[status] || 'pm-status-active';
  };

  // Get type badge class
  const getTypeClass = (type) => {
    const typeMap = {
      'found': 'pm-type-found',
      'lost': 'pm-type-lost',
      'for sale': 'pm-type-sale',
      'looking to buy': 'pm-type-buy',
      'service offered': 'pm-type-service',
      'help wanted': 'pm-type-help'
    };
    return typeMap[type?.toLowerCase()] || 'pm-type-default';
  };

  // Get stat card class for types
  const getStatCardClass = (type) => {
    const typeMap = {
      'Found': 'pm-stat-found',
      'Lost': 'pm-stat-lost',
      'For Sale': 'pm-stat-sale',
      'Looking to Buy': 'pm-stat-buy',
      'Service Offered': 'pm-stat-service',
      'Help Wanted': 'pm-stat-help'
    };
    return typeMap[type] || 'pm-type-stat';
  };

  // Render location information with purok
  const renderLocationInfo = (post) => {
    let locationText = post.barangay_name;
    if (post.purok_name) {
      locationText += `, ${post.purok_name}`;
    }
    return locationText;
  };

  // Get photo URL
  const getPhotoUrl = (post) => {
    if (post.photo) {
      return `http://localhost:8000/uploads/${post.photo}`;
    }
    return null;
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(statusFilter === value ? 'all' : value);
    } else if (filterType === 'type') {
      setTypeFilter(typeFilter === value ? 'all' : value);
    } else if (filterType === 'all') {
      setStatusFilter('all');
      setTypeFilter('all');
    }
  };

  // 🎯 UPDATED: Get report severity for posts (same pattern as users)
  const getReportSeverity = (post) => {
    const reportCount = post.total_report_count || 0;
    
    if (reportCount >= REPORT_THRESHOLDS.CAN_DELETE) return 'high';
    if (reportCount >= REPORT_THRESHOLDS.CAN_REMOVE) return 'medium';
    return 'none';
  };

  // 🎯 NEW: Report severity badge component (same pattern as users)
  const ReportSeverityBadge = ({ post }) => {
    const severity = getReportSeverity(post);
    if (severity === 'none') return null;

    const severityConfig = {
      high: { 
        class: 'report-high', 
        text: 'High Risk - Can Delete', 
        icon: faExclamationTriangle 
      },
      medium: { 
        class: 'report-medium', 
        text: 'Medium Risk - Can Remove', 
        icon: faFlag 
      }
    };

    const config = severityConfig[severity];

    return (
      <span className={`report-severity-badge ${config.class}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  // 🎯 UPDATED: Get action buttons with threshold validation (same pattern as users)
  const getActionButtons = (post) => {
    if (post.status === 'Removed') {
      return (
        <>
          <button
            className="pm-action-btn pm-action-restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore Post"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className={`pm-action-btn pm-action-delete ${!canDeletePost(post) ? 'disabled' : ''}`}
            onClick={() => canDeletePost(post) && handlePostAction(post.id, 'delete')}
            title={!canDeletePost(post) ? 
              `Need ${REPORT_THRESHOLDS.CAN_DELETE}+ reports to delete` 
              : "Delete Permanently"}
            disabled={!canDeletePost(post)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    } else if (post.status === 'Resolved') {
      return (
        <>
          <button
            className={`pm-action-btn pm-action-remove ${!canRemovePost(post) ? 'disabled' : ''}`}
            onClick={() => canRemovePost(post) && handlePostAction(post.id, 'remove')}
            title={!canRemovePost(post) ? 
              `Need ${REPORT_THRESHOLDS.CAN_REMOVE}+ reports to remove` 
              : "Remove Post"}
            disabled={!canRemovePost(post)}
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          <button
            className="pm-action-btn pm-action-restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore to Active"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className={`pm-action-btn pm-action-delete ${!canDeletePost(post) ? 'disabled' : ''}`}
            onClick={() => canDeletePost(post) && handlePostAction(post.id, 'delete')}
            title={!canDeletePost(post) ? 
              `Need ${REPORT_THRESHOLDS.CAN_DELETE}+ reports to delete` 
              : "Delete Permanently"}
            disabled={!canDeletePost(post)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            className="pm-action-btn pm-action-resolve"
            onClick={() => handlePostAction(post.id, 'resolve')}
            title="Mark as Resolved"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>
          <button
            className={`pm-action-btn pm-action-remove ${!canRemovePost(post) ? 'disabled' : ''}`}
            onClick={() => canRemovePost(post) && handlePostAction(post.id, 'remove')}
            title={!canRemovePost(post) ? 
              `Need ${REPORT_THRESHOLDS.CAN_REMOVE}+ reports to remove` 
              : "Remove Post"}
            disabled={!canRemovePost(post)}
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          <button
            className={`pm-action-btn pm-action-delete ${!canDeletePost(post) ? 'disabled' : ''}`}
            onClick={() => canDeletePost(post) && handlePostAction(post.id, 'delete')}
            title={!canDeletePost(post) ? 
              `Need ${REPORT_THRESHOLDS.CAN_DELETE}+ reports to delete` 
              : "Delete Permanently"}
            disabled={!canDeletePost(post)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    }
  };

  // Handle action from view modal
  const handleModalAction = (action) => {
    if (viewModal.post) {
      handlePostAction(viewModal.post.id, action);
    }
  };

  // Calculate type statistics
  const typeStats = {
    'Found': posts.filter(p => p.type?.toLowerCase() === 'found').length,
    'Lost': posts.filter(p => p.type?.toLowerCase() === 'lost').length,
    'For Sale': posts.filter(p => p.type?.toLowerCase() === 'for sale').length,
    'Looking to Buy': posts.filter(p => p.type?.toLowerCase() === 'looking to buy').length,
    'Service Offered': posts.filter(p => p.type?.toLowerCase() === 'service offered').length,
    'Help Wanted': posts.filter(p => p.type?.toLowerCase() === 'help wanted').length
  };

  // 🎯 UPDATED: Render modal actions with threshold validation
  const renderModalActions = (post) => {
    if (post.status === 'Removed') {
      return (
        <>
          <button
            className="pm-modal-btn pm-modal-restore"
            onClick={() => handleModalAction('restore')}
          >
            <FontAwesomeIcon icon={faUndo} />
            Restore Post
          </button>
          <button
            className={`pm-modal-btn pm-modal-delete ${!canDeletePost(post) ? 'disabled' : ''}`}
            onClick={() => canDeletePost(post) && handleModalAction('delete')}
            disabled={!canDeletePost(post)}
            title={!canDeletePost(post) ? `Need ${REPORT_THRESHOLDS.CAN_DELETE}+ reports to delete` : ''}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete Permanently
          </button>
        </>
      );
    } else if (post.status === 'Resolved') {
      return (
        <>
          <button
            className={`pm-modal-btn pm-modal-remove ${!canRemovePost(post) ? 'disabled' : ''}`}
            onClick={() => canRemovePost(post) && handleModalAction('remove')}
            disabled={!canRemovePost(post)}
            title={!canRemovePost(post) ? `Need ${REPORT_THRESHOLDS.CAN_REMOVE}+ reports to remove` : ''}
          >
            <FontAwesomeIcon icon={faBan} />
            Remove Post
          </button>
          <button
            className="pm-modal-btn pm-modal-restore"
            onClick={() => handleModalAction('restore')}
          >
            <FontAwesomeIcon icon={faUndo} />
            Restore to Active
          </button>
          <button
            className={`pm-modal-btn pm-modal-delete ${!canDeletePost(post) ? 'disabled' : ''}`}
            onClick={() => canDeletePost(post) && handleModalAction('delete')}
            disabled={!canDeletePost(post)}
            title={!canDeletePost(post) ? `Need ${REPORT_THRESHOLDS.CAN_DELETE}+ reports to delete` : ''}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete Permanently
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            className="pm-modal-btn pm-modal-resolve"
            onClick={() => handleModalAction('resolve')}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            Mark as Resolved
          </button>
          <button
            className={`pm-modal-btn pm-modal-remove ${!canRemovePost(post) ? 'disabled' : ''}`}
            onClick={() => canRemovePost(post) && handleModalAction('remove')}
            disabled={!canRemovePost(post)}
            title={!canRemovePost(post) ? `Need ${REPORT_THRESHOLDS.CAN_REMOVE}+ reports to remove` : ''}
          >
            <FontAwesomeIcon icon={faBan} />
            Remove Post
          </button>
          <button
            className={`pm-modal-btn pm-modal-delete ${!canDeletePost(post) ? 'disabled' : ''}`}
            onClick={() => canDeletePost(post) && handleModalAction('delete')}
            disabled={!canDeletePost(post)}
            title={!canDeletePost(post) ? `Need ${REPORT_THRESHOLDS.CAN_DELETE}+ reports to delete` : ''}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete Permanently
          </button>
        </>
      );
    }
  };

  // Mobile card view with type
  const MobilePostCard = ({ post }) => (
    <div className="pm-mobile-card">
      <div className="pm-mobile-header">
        <div className="pm-mobile-title">
          <h3>{post.title}</h3>
          <div className="pm-mobile-author">
            by {post.first_name} {post.last_name}
          </div>
        </div>
        <div className="pm-mobile-badges">
          <span className={`pm-mobile-status ${getStatusClass(post.status)}`}>
            {post.status}
          </span>
          <span className={`pm-mobile-type ${getTypeClass(post.type)}`}>
            {post.type}
          </span>
        </div>
      </div>
      
      <div className="pm-mobile-details">
        <div className="pm-mobile-detail">
          <span className="pm-detail-label">ID</span>
          <span className="pm-detail-value">#{post.id}</span>
        </div>
        <div className="pm-mobile-detail">
          <span className="pm-detail-label">Category</span>
          <span className="pm-detail-value">{post.category_name}</span>
        </div>
        <div className="pm-mobile-detail">
          <span className="pm-detail-label">Location</span>
          <span className="pm-detail-value">{renderLocationInfo(post)}</span>
        </div>
        <div className="pm-mobile-detail">
          <span className="pm-detail-label">Date</span>
          <span className="pm-detail-value">{formatDate(post.created_at)}</span>
        </div>
        <div className="pm-mobile-detail">
          <span className="pm-detail-label">Total Reports</span>
          <span className="pm-detail-value">{post.total_report_count || 0}</span>
        </div>
      </div>

      {/* 🎯 ADDED: Report severity badge for mobile */}
      <div className="pm-mobile-report-severity">
        <ReportSeverityBadge post={post} />
      </div>
      
      <div className="pm-mobile-actions">
        <button 
          className="pm-mobile-btn pm-mobile-view"
          onClick={() => openViewModal(post)}
        >
          <FontAwesomeIcon icon={faEye} />
          View
        </button>
        {getActionButtons(post)}
      </div>
    </div>
  );

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`pm-toast pm-toast-${toast.type}`}>
          <div className="pm-toast-content">
            <FontAwesomeIcon 
              icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="pm-toast-icon" 
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="pm-header">
        <div className="pm-header-content">
          <p>Review and moderate community posts</p>
        </div>
        <button 
          className="pm-refresh-btn"
          onClick={handleManualRefresh}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="pm-stats">
        <div 
          className={`pm-stat-card ${statusFilter === 'all' && typeFilter === 'all' ? 'pm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('all', 'all')}
          style={{ cursor: 'pointer' }}
        >
          <span className="pm-stat-number">{posts.length}</span>
          <span className="pm-stat-label">Total Posts</span>
        </div>
        <div 
          className={`pm-stat-card ${statusFilter === 'Active' ? 'pm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'Active')}
          style={{ cursor: 'pointer' }}
        >
          <span className="pm-stat-number">{posts.filter(p => p.status === 'Active').length}</span>
          <span className="pm-stat-label">Active</span>
        </div>
        <div 
          className={`pm-stat-card ${statusFilter === 'Resolved' ? 'pm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'Resolved')}
          style={{ cursor: 'pointer' }}
        >
          <span className="pm-stat-number">{posts.filter(p => p.status === 'Resolved').length}</span>
          <span className="pm-stat-label">Resolved</span>
        </div>
        <div 
          className={`pm-stat-card ${statusFilter === 'Removed' ? 'pm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'Removed')}
          style={{ cursor: 'pointer' }}
        >
          <span className="pm-stat-number">{posts.filter(p => p.status === 'Removed').length}</span>
          <span className="pm-stat-label">Removed</span>
        </div>
        
        {Object.entries(typeStats).map(([type, count]) => (
          count > 0 && (
            <div 
              key={type}
              className={`pm-stat-card ${getStatCardClass(type)} ${typeFilter === type ? 'pm-stat-active' : ''}`}
              onClick={() => handleStatCardClick('type', type)}
              style={{ cursor: 'pointer' }}
            >
              <span className="pm-stat-number">{count}</span>
              <span className="pm-stat-label">{type}</span>
            </div>
          )
        ))}
      </div>

      {/* Filters and Search */}
      <div className="pm-filters">
        <div className="pm-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search posts, authors, types, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="pm-filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
            <option value="Removed">Removed</option>
          </select>
        </div>

        <div className="pm-filter-group">
          <FontAwesomeIcon icon={faTag} />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {getUniqueTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="pm-filter-group">
          <FontAwesomeIcon icon={faList} />
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="table">Table View</option>
            <option value="card">Card View</option>
          </select>
        </div>

        {isFilterActive() && (
          <button  
            className="pm-clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}

        {selectedPosts.size > 0 && (
          <div className="pm-bulk-actions">
            <span>{selectedPosts.size} selected</span>
            <button 
              className="pm-bulk-btn pm-bulk-remove"
              onClick={() => handleBulkAction('remove')}
            >
              <FontAwesomeIcon icon={faBan} />
              Remove
            </button>
            <button 
              className="pm-bulk-btn pm-bulk-restore"
              onClick={() => handleBulkAction('restore')}
            >
              <FontAwesomeIcon icon={faUndo} />
              Restore
            </button>
            <button 
              className="pm-bulk-btn pm-bulk-delete"
              onClick={() => handleBulkAction('delete')}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* 🎯 MOVED: Report Thresholds Info - NOW AFTER FILTERS (Same as ManageUsers) */}
      <div className="thresholds-info">
        <h3>Post Report Thresholds:</h3>
        <div className="thresholds-grid">
          <div className="threshold-item">
            <span className="threshold-badge threshold-remove">⏸️</span>
            <span className="threshold-text">
              <strong>{REPORT_THRESHOLDS.CAN_REMOVE}+ Total Reports:</strong> Can remove post from public view
            </span>
          </div>
          <div className="threshold-item">
            <span className="threshold-badge threshold-delete">🚫</span>
            <span className="threshold-text">
              <strong>{REPORT_THRESHOLDS.CAN_DELETE}+ Total Reports:</strong> Can permanently delete post
            </span>
          </div>
        </div>
      </div>

      {/* 🆕 UPDATED: Active Filters Display (Same as AdminFeedback) */}
      {isFilterActive() && (
        <div className="pm-active-filters-section">
          <span className="pm-active-filters-label">Active filter:</span>
          <div className="pm-filter-tags">
            {statusFilter !== 'all' && (
              <span className="pm-filter-tag">
                Status: {statusFilter}
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="pm-filter-tag">
                Type: {typeFilter}
              </span>
            )}
            {searchTerm && (
              <span className="pm-filter-tag">
                Search: "{searchTerm}"
              </span>
            )}
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className='pm-table-container'>
        <div className='pm-table-content'>
          <div className='pm-table-title'>
            <h2>Posts Management</h2>
            <div className="pm-header-info">
              <span className="pm-count">
                {filteredPosts.length} of {posts.length} post{filteredPosts.length !== 1 ? 's' : ''}
                {isFilterActive() && ' (Filtered)'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="pm-loading-state">
              <div className="pm-loading-spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="pm-empty-state">
              <p>
                {posts.length === 0 
                  ? "No posts have been created yet." 
                  : "No posts match your search criteria."
                }
              </p>
              {isFilterActive() && (
                <button 
                  className="pm-retry-btn" 
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="pm-table-wrapper" style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                <table className='pm-table'>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>ID</th>
                      <th>Title & Author</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Location</th> 
                      <th>Date Posted</th>
                      <th>Status</th>
                      <th>Total Reports</th>
                      <th>Risk Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map(post => (
                      <tr key={post.id} className={selectedPosts.has(post.id) ? 'pm-row-selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedPosts.has(post.id)}
                            onChange={() => togglePostSelection(post.id)}
                          />
                        </td>
                        <td className="pm-id">#{post.id}</td>
                        <td>
                          <div className="pm-title-author">
                            <strong className="pm-title">{post.title}</strong>
                            <span className="pm-author">
                              by {post.first_name} {post.last_name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`pm-type-badge ${getTypeClass(post.type)}`}>
                            {post.type}
                          </span>
                        </td>
                        <td>{post.category_name}</td>
                        <td>
                          <div className="pm-location-info">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="pm-location-icon" />
                            <span>{renderLocationInfo(post)}</span>
                          </div>
                        </td>
                        <td>{formatDate(post.created_at)}</td>
                        <td>
                          <span className={`pm-status-badge ${getStatusClass(post.status)}`}>
                            {post.status}
                          </span>
                        </td>
                        <td>
                          <span className="pm-report-count">
                            {post.total_report_count || 0}
                          </span>
                        </td>
                        <td>
                          <ReportSeverityBadge post={post} />
                        </td>
                        <td>
                          <div className='pm-actions'>
                            <button
                              className="pm-action-btn pm-action-view"
                              onClick={() => openViewModal(post)}
                              title="View Post"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            {getActionButtons(post)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="pm-mobile-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
                {filteredPosts.map(post => (
                  <MobilePostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Post Modal */}
      {viewModal.isOpen && viewModal.post && (
        <div className="pm-modal-overlay" onClick={closeModal}>
          <div className="pm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h2>View Post</h2>
              <button className="pm-modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="pm-modal-body">
              {/* 🎯 ADDED: Report Statistics in Modal */}
              <div className="pm-report-stats">
                <h4>Post Report Statistics:</h4>
                <div className="pm-report-stats-grid">
                  <div className="pm-report-stat">
                    <span className="pm-stat-label">Total Reports:</span>
                    <span className="pm-stat-value">{viewModal.post.total_report_count || 0}</span>
                  </div>
                  <div className="pm-report-stat">
                    <span className="pm-stat-label">Risk Level:</span>
                    <span className="pm-stat-value">
                      <ReportSeverityBadge post={viewModal.post} />
                    </span>
                  </div>
                </div>
              </div>

              {getPhotoUrl(viewModal.post) && (
                <div className="pm-photo-container">
                  <label>Post Photo:</label>
                  <div className="pm-photo">
                    <img
                      src={getPhotoUrl(viewModal.post)}
                      alt={viewModal.post.title}
                      className="pm-photo-display"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="pm-photo-fallback" style={{ display: 'none' }}>
                      <FontAwesomeIcon icon={faImage} />
                      <span>Photo not available</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pm-details">
                <div className="pm-detail-row">
                  <label>Title:</label>
                  <span>{viewModal.post.title}</span>
                </div>
                <div className="pm-detail-row">
                  <label>Author:</label>
                  <span>{viewModal.post.first_name} {viewModal.post.last_name}</span>
                </div>
                <div className="pm-detail-row">
                  <label>Type:</label>
                  <span className={`pm-type-badge ${getTypeClass(viewModal.post.type)}`}>
                    {viewModal.post.type}
                  </span>
                </div>
                <div className="pm-detail-row">
                  <label>Category:</label>
                  <span>{viewModal.post.category_name}</span>
                </div>
                <div className="pm-detail-row">
                  <label>Location:</label>
                  <span>{renderLocationInfo(viewModal.post)}</span>
                </div>
                <div className="pm-detail-row">
                  <label>Status:</label>
                  <span className={`pm-status-badge ${getStatusClass(viewModal.post.status)}`}>
                    {viewModal.post.status}
                  </span>
                </div>
                <div className="pm-detail-row">
                  <label>Date Posted:</label>
                  <span>{formatDate(viewModal.post.created_at)}</span>
                </div>
                <div className="pm-detail-row pm-full-width">
                  <label>Description:</label>
                  <div className="pm-description">
                    {viewModal.post.description}
                  </div>
                </div>
                {viewModal.post.color && (
                  <div className="pm-detail-row">
                    <label>Color:</label>
                    <span>{viewModal.post.color}</span>
                  </div>
                )}
                <div className="pm-detail-row pm-full-width">
                  <label>Contact Info:</label>
                  <div className="pm-contact-info">
                    {viewModal.post.contact_info}
                  </div>
                </div>
              </div>
            </div>
            <div className="pm-modal-footer">
              <div className="pm-modal-actions">
                {renderModalActions(viewModal.post)}
                <button className="pm-modal-btn pm-modal-close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for ALL Actions */}
      {confirmationModal.isOpen && (
        <div className="pm-modal-overlay" onClick={closeModal}>
          <div className="pm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h2>{confirmationModal.title}</h2>
              <button className="pm-modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="pm-modal-body">
              <div className="pm-confirmation-content">
                <div className="pm-warning-icon-large">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <p>{confirmationModal.message}</p>
                
                {/* 🎯 ADDED: Report stats in confirmation modal */}
                {confirmationModal.post && (
                  <div className="pm-confirmation-stats">
                    <p><strong>Current Reports:</strong> {confirmationModal.post.total_report_count || 0}</p>
                    <p><strong>Required for this action:</strong> {
                      confirmationModal.action === 'remove' ? REPORT_THRESHOLDS.CAN_REMOVE :
                      confirmationModal.action === 'delete' ? REPORT_THRESHOLDS.CAN_DELETE : 0
                    }+ reports</p>
                  </div>
                )}

                {confirmationModal.action === 'delete' && (
                  <div className="pm-deletion-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>This action cannot be undone!</span>
                  </div>
                )}
              </div>
            </div>
            <div className="pm-modal-footer">
              <button 
                className="pm-modal-btn pm-modal-cancel" 
                onClick={closeModal}
                disabled={confirmationModal.isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`pm-modal-btn ${
                  confirmationModal.action === 'delete' ? 'pm-modal-delete' :
                  confirmationModal.action === 'remove' ? 'pm-modal-remove' :
                  confirmationModal.action === 'restore' ? 'pm-modal-restore' :
                  'pm-modal-resolve'
                }`} 
                onClick={handleConfirmedAction}
                disabled={confirmationModal.isProcessing}
              >
                {confirmationModal.isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faRefresh} spin />
                    Processing...
                  </>
                ) : (
                  <>
                    {confirmationModal.action === 'remove' && 'Remove Post'}
                    {confirmationModal.action === 'delete' && 'Delete Permanently'}
                    {confirmationModal.action === 'restore' && 'Restore Post'}
                    {confirmationModal.action === 'resolve' && 'Mark as Resolved'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )} 
    </>
  );
}