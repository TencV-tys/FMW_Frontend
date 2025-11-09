 import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faSearch, 
  faFilter, 
  faEye, 
  faCheckCircle, 
  faClock,
  faTimesCircle,
  faExclamationTriangle,
  faUser,
  faBug,
  faLightbulb, 
  faStar,
  faCommentDots,
  faRefresh,
  faUserShield, 
  faTrash,
  faBan,
  faTimes,
  faEnvelope,
  faFlag,
  faCode,
  faList,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import './styles/AdminFeedback.css';

export default function AdminFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0
  });

  // Modal states
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    feedback: null
  });

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: '', // 'delete' or 'statusChange'
    title: '',
    message: '',
    feedback: null,
    newStatus: '',
    isProcessing: false
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Debug state
  const [showDebug, setShowDebug] = useState(false);

  // Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  // Highlight state for navigation
  const [highlightedFeedback, setHighlightedFeedback] = useState(null);

  useEffect(() => {
    fetchFeedback();
    fetchFeedbackStats();

    // Smart polling setup
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (isTabActiveRef.current) {
        fetchFeedback();
        fetchFeedbackStats();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [statusFilter, typeFilter, priorityFilter]);

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightFeedback = urlParams.get('highlightFeedback');
    
    if (highlightFeedback) {
      const feedbackId = parseInt(highlightFeedback);
      setHighlightedFeedback(feedbackId);
      
      // Wait for feedback to load, then check status
      if (feedback.length > 0) {
        const feedbackItem = feedback.find(f => f.id === feedbackId);
        
        if (!feedbackItem) {
          // Feedback doesn't exist in the fetched data
          showToast('This feedback has been deleted or does not exist', 'error');
        }
      }
    }
  }, [feedback]);

  // Smart polling functions (60 seconds)
  const startPolling = () => {
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        fetchFeedback();
        fetchFeedbackStats();
      }
    }, 60000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:8000/api/admin/feedback';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const feedbackData = data.feedback || [];
        setFeedback(feedbackData);
      } else {
        console.error('Failed to fetch feedback:', response.status);
        showToast('Error fetching feedback', 'error');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      showToast('Error fetching feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/feedback/stats', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const statsData = data.stats || {};
        setStats({ 
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          reviewed: statsData.reviewed || 0,
          in_progress: statsData.in_progress || 0,
          completed: statsData.completed || 0,
          rejected: statsData.rejected || 0
        });
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    }
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    showToast('Refreshing feedback...', 'success');
    await fetchFeedback();
    await fetchFeedbackStats();
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (filterType) => {
    setStatusFilter(filterType);
  };

  // Handle feedback click to navigate to related content
  const handleFeedbackClick = (feedbackItem) => {
    if (feedbackItem.user_id) {
      navigate(`/admin/manage-posts?userId=${feedbackItem.user_id}&userName=${encodeURIComponent(feedbackItem.submitter_first_name + ' ' + feedbackItem.submitter_last_name)}`);
    }
  };

  // View feedback details
  const handleViewFeedback = (feedbackItem) => {
    setViewModal({
      isOpen: true,
      feedback: feedbackItem
    });
  };

  // Close view modal
  const closeViewModal = () => {
    setViewModal({
      isOpen: false,
      feedback: null
    });
  };

  // Update feedback status
  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setFeedback(prev => prev.map(item => 
          item.id === feedbackId ? { ...item, status: newStatus } : item
        ));
        fetchFeedbackStats();
        closeConfirmationModal();
        showToast(`Feedback marked as ${newStatus.replace('_', ' ')}`, 'success');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      showToast('Error updating feedback status', 'error');
    } finally {
      setConfirmationModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Delete feedback
  const deleteFeedback = async (feedbackId) => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/feedback/${feedbackId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setFeedback(prev => prev.filter(item => item.id !== feedbackId));
        fetchFeedbackStats();
        closeConfirmationModal();
        showToast('Feedback deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      showToast('Error deleting feedback', 'error');
    } finally {
      setConfirmationModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Open confirmation modal for status change
  const openStatusChangeConfirmation = (feedbackItem, newStatus) => {
    const statusLabels = {
      pending: 'Pending',
      reviewed: 'Reviewed',
      in_progress: 'In Progress',
      completed: 'Completed',
      rejected: 'Rejected'
    };

    setConfirmationModal({
      isOpen: true,
      type: 'statusChange',
      title: `Mark as ${statusLabels[newStatus]}`,
      message: `Are you sure you want to mark this feedback as ${statusLabels[newStatus].toLowerCase()}?`,
      feedback: feedbackItem,
      newStatus: newStatus,
      isProcessing: false
    });
  };

  // Open confirmation modal for deletion
  const openDeleteConfirmation = (feedbackItem) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Feedback',
      message: 'Are you sure you want to delete this feedback? This action cannot be undone.',
      feedback: feedbackItem,
      newStatus: '',
      isProcessing: false
    });
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      feedback: null,
      newStatus: '',
      isProcessing: false
    });
  };

  // Handle confirm action
  const handleConfirmAction = () => {
    if (confirmationModal.isProcessing) return;
    
    if (confirmationModal.type === 'statusChange') {
      updateFeedbackStatus(confirmationModal.feedback.id, confirmationModal.newStatus);
    } else if (confirmationModal.type === 'delete') {
      deleteFeedback(confirmationModal.feedback.id);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'feedback-status-pending',
      reviewed: 'feedback-status-reviewed',
      in_progress: 'feedback-status-in-progress',
      completed: 'feedback-status-completed',
      rejected: 'feedback-status-rejected'
    };
    return statusMap[status] || 'feedback-status-pending';
  };

  // Get type badge class
  const getTypeBadgeClass = (type) => {
    const typeMap = {
      bug: 'feedback-type-bug',
      feature: 'feedback-type-feature',
      suggestion: 'feedback-type-suggestion',
      general: 'feedback-type-general'
    };
    return typeMap[type] || 'feedback-type-general';
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
      critical: 'feedback-priority-critical',
      high: 'feedback-priority-high',
      medium: 'feedback-priority-medium',
      low: 'feedback-priority-low'
    };
    return priorityMap[priority] || 'feedback-priority-medium';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const iconMap = {
      pending: faClock,
      reviewed: faEye,
      in_progress: faExclamationTriangle,
      completed: faCheckCircle,
      rejected: faBan
    };
    return iconMap[status] || faClock;
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const iconMap = {
      bug: faBug,
      feature: faStar,
      suggestion: faLightbulb,
      general: faComments
    };
    return iconMap[type] || faComments;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown date';
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
    return statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || searchTerm !== '';
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get available actions based on current status
  const getAvailableActions = (feedbackItem) => {
    const actions = ['view']; // Always show view button
    
    switch (feedbackItem.status) {
      case 'pending':
        actions.push('reviewed', 'in_progress', 'rejected');
        break;
      case 'reviewed':
        actions.push('in_progress', 'completed', 'rejected');
        break;
      case 'in_progress':
        actions.push('completed', 'rejected');
        break;
      case 'completed':
        actions.push('pending'); // Only show reopen, NOT rejected
        break;
      case 'rejected':
        actions.push('pending'); // Only show reopen, NOT completed
        break;
    }
    
    // Only show delete button for completed or rejected
    if (feedbackItem.status === 'completed' || feedbackItem.status === 'rejected') {
      actions.push('delete');
    }
    
    return actions;
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${item.submitter_first_name} ${item.submitter_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submitter_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Mobile Feedback Card Component
  const MobileFeedbackCard = ({ feedbackItem }) => {
    const availableActions = getAvailableActions(feedbackItem);
    
    return (
      <div 
        className={`feedback-mobile-card ${highlightedFeedback === feedbackItem.id ? 'feedback-highlighted' : ''}`}
        data-feedback-id={feedbackItem.id}
      >
        <div className="feedback-mobile-header">
          <div className="feedback-mobile-title">
            <h3>
              {feedbackItem.title}
              <FontAwesomeIcon 
                icon={faExternalLinkAlt} 
                className="feedback-external-link-icon"
                title="Click to view user posts"
              />
            </h3>
            <div className="feedback-mobile-id">ID: #{feedbackItem.id}</div>
          </div>
          <div className="feedback-mobile-badges">
            <span className={`feedback-mobile-type ${getTypeBadgeClass(feedbackItem.type)}`}>
              <FontAwesomeIcon icon={getTypeIcon(feedbackItem.type)} />
              {feedbackItem.type}
            </span>
            <span className={`feedback-mobile-priority ${getPriorityBadgeClass(feedbackItem.priority)}`}>
              {feedbackItem.priority}
            </span>
          </div>
        </div>
        
        <div className="feedback-mobile-details">
          <div className="feedback-mobile-detail">
            <FontAwesomeIcon icon={faUser} />
            <span>{feedbackItem.submitter_first_name} {feedbackItem.submitter_last_name}</span>
          </div>
          <div className="feedback-mobile-detail">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>{feedbackItem.submitter_email}</span>
          </div>
          <div className="feedback-mobile-detail">
            <FontAwesomeIcon icon={faClock} />
            <span>{formatTime(feedbackItem.created_at)}</span>
          </div>
          
          <div className="feedback-mobile-description">
            <strong>Description:</strong>
            <p>{feedbackItem.description?.length > 150 
              ? `${feedbackItem.description.substring(0, 150)}...`
              : feedbackItem.description
            }</p>
          </div>
        </div>

        <div className="feedback-mobile-status-section">
          <span className={`feedback-mobile-status ${getStatusBadgeClass(feedbackItem.status)}`}>
            <FontAwesomeIcon icon={getStatusIcon(feedbackItem.status)} />
            {feedbackItem.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="feedback-mobile-actions">
          {availableActions.includes('view') && (
            <button
              className="feedback-action-btn view"
              onClick={() => handleViewFeedback(feedbackItem)}
              title="View details"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          )}
          
          {availableActions.includes('reviewed') && (
            <button
              className="feedback-action-btn review"
              onClick={() => openStatusChangeConfirmation(feedbackItem, 'reviewed')}
              title="Mark as Reviewed"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          )}
          
          {availableActions.includes('in_progress') && (
            <button
              className="feedback-action-btn progress"
              onClick={() => openStatusChangeConfirmation(feedbackItem, 'in_progress')}
              title="Mark as In Progress"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </button>
          )}
          
          {availableActions.includes('completed') && (
            <button
              className="feedback-action-btn complete"
              onClick={() => openStatusChangeConfirmation(feedbackItem, 'completed')}
              title="Mark as Completed"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
            </button>
          )}
          
          {availableActions.includes('rejected') && (
            <button
              className="feedback-action-btn reject"
              onClick={() => openStatusChangeConfirmation(feedbackItem, 'rejected')}
              title="Reject Feedback"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faBan} />
            </button>
          )}
          
          {availableActions.includes('pending') && (
            <button
              className="feedback-action-btn pending"
              onClick={() => openStatusChangeConfirmation(feedbackItem, 'pending')}
              title="Reopen Feedback"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faRefresh} />
            </button>
          )}
          
          {availableActions.includes('delete') && (
            <button
              className="feedback-action-btn delete"
              onClick={() => openDeleteConfirmation(feedbackItem)}
              title="Delete Feedback"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`feedback-toast feedback-toast-${toast.type}`}>
          <div className="feedback-toast-content">
            <FontAwesomeIcon 
              icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="feedback-toast-icon" 
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="feedback-management-header">
        <div className="feedback-header-content">
          <p>Manage and review user feedback and suggestions</p>
        </div>
        <div className="feedback-header-actions">
          <button 
            className="feedback-refresh-btn"
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faRefresh} spin={loading} />
            Refresh
          </button>
          <button 
            className="feedback-refresh-btn"
            onClick={() => setShowDebug(!showDebug)}
          >
            <FontAwesomeIcon icon={faCode} />
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      </header>

      {/* Debug Information */}
      {showDebug && (
        <div className="feedback-debug-panel">
          <h3>🔍 Debug Information</h3>
          <div className="debug-section">
            <h4>API Data Structure:</h4>
            <p><strong>Total Items:</strong> {feedback.length}</p>
            <p><strong>Field Names:</strong> id, user_id, type, title, description, status, priority, submitter_first_name, submitter_last_name, submitter_email</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <section className="feedback-management-stats">
        <div 
          className={`feedback-stat-card ${statusFilter === 'all' ? 'feedback-stat-active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
          title="Show all feedback"
        >
          <div className="feedback-stat-info">
            <span className="feedback-stat-number">{stats.total}</span>
            <span className="feedback-stat-label">Total</span>
          </div>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'pending' ? 'feedback-stat-active' : ''}`}
          onClick={() => handleStatCardClick('pending')}
          style={{ cursor: 'pointer' }}
          title="Show pending feedback"
        >
          <div className="feedback-stat-info">
            <span className="feedback-stat-number">{stats.pending}</span>
            <span className="feedback-stat-label">Pending</span>
          </div>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'reviewed' ? 'feedback-stat-active' : ''}`}
          onClick={() => handleStatCardClick('reviewed')}
          style={{ cursor: 'pointer' }}
          title="Show reviewed feedback"
        >
          <div className="feedback-stat-info">
            <span className="feedback-stat-number">{stats.reviewed}</span>
            <span className="feedback-stat-label">Reviewed</span>
          </div>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'in_progress' ? 'feedback-stat-active' : ''}`}
          onClick={() => handleStatCardClick('in_progress')}
          style={{ cursor: 'pointer' }}
          title="Show in progress feedback"
        >
          <div className="feedback-stat-info">
            <span className="feedback-stat-number">{stats.in_progress}</span>
            <span className="feedback-stat-label">In Progress</span>
          </div>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'completed' ? 'feedback-stat-active' : ''}`}
          onClick={() => handleStatCardClick('completed')}
          style={{ cursor: 'pointer' }}
          title="Show completed feedback"
        >
          <div className="feedback-stat-info">
            <span className="feedback-stat-number">{stats.completed}</span>
            <span className="feedback-stat-label">Completed</span>
          </div>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'rejected' ? 'feedback-stat-active' : ''}`}
          onClick={() => handleStatCardClick('rejected')}
          style={{ cursor: 'pointer' }}
          title="Show rejected feedback"
        >
          <div className="feedback-stat-info">
            <span className="feedback-stat-number">{stats.rejected}</span>
            <span className="feedback-stat-label">Rejected</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="feedback-management-filters">
        <div className="feedback-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search feedback by title, description, or submitter..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="feedback-filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="feedback-filter-select"
            disabled={confirmationModal.isProcessing}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="feedback-filter-group">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="feedback-filter-select"
            disabled={confirmationModal.isProcessing}
          >
            <option value="all">All Types</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="suggestion">Suggestion</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="feedback-filter-group">
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="feedback-filter-select"
            disabled={confirmationModal.isProcessing}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="feedback-filter-group">
          <FontAwesomeIcon icon={faList} />
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="table">Table View</option>
            <option value="card">Card View</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {isFilterActive() && (
          <button 
            className="feedback-clear-filters-btn"
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
        <div className="feedback-active-filters-section">
          <span className="feedback-active-filters-label">Active filters:</span>
          <div className="feedback-filter-tags">
            {statusFilter !== 'all' && (
              <span className="feedback-filter-tag">
                Status: {statusFilter.replace('_', ' ')}
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="feedback-filter-tag">
                Type: {typeFilter}
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="feedback-filter-tag">
                Priority: {priorityFilter}
              </span>
            )}
            {searchTerm && (
              <span className="feedback-filter-tag">
                Search: "{searchTerm}"
              </span>
            )}
          </div>
        </div>
      )}

      {/* Feedback List */}
      <section className="feedback-management-table-container">
        <div className="feedback-management-table-content">
          <div className="feedback-management-table-title">
            <h2>User Feedback</h2>
            <div className="feedback-management-header-info">
              <span className="feedback-management-count">
                Showing {filteredFeedback.length} feedback item{filteredFeedback.length !== 1 ? 's' : ''}
                {isFilterActive() && ` (Filtered)`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="feedback-loading-state">
              <div className="feedback-loading-spinner"></div>
              <p>Loading feedback...</p>
            </div>
          ) : filteredFeedback.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="feedback-table-wrapper" style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                <table className="feedback-management-table">
                  <thead>
                    <tr>
                      <th>User & Email</th>
                      <th>Type & Priority</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedback.map(feedbackItem => {
                      const availableActions = getAvailableActions(feedbackItem);
                      
                      return (
                        <tr 
                          key={feedbackItem.id} 
                          className={`${highlightedFeedback === feedbackItem.id ? 'feedback-highlighted-row' : ''} feedback-clickable-row`}
                          data-feedback-id={feedbackItem.id}
                          onClick={() => handleFeedbackClick(feedbackItem)}
                        >
                          <td>
                            <div className="feedback-user-info">
                              <FontAwesomeIcon icon={faUser} />
                              <div>
                                <div>
                                  {feedbackItem.submitter_first_name} {feedbackItem.submitter_last_name}
                                  {feedbackItem.user_id && ` (User #${feedbackItem.user_id})`}
                                  <FontAwesomeIcon 
                                    icon={faExternalLinkAlt} 
                                    className="feedback-external-link-icon"
                                    title="Click to view user posts"
                                  />
                                </div>
                                <div className="feedback-user-email">
                                  <FontAwesomeIcon icon={faEnvelope} />
                                  {feedbackItem.submitter_email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="feedback-type-priority">
                              <span className={`feedback-type-badge ${getTypeBadgeClass(feedbackItem.type)}`}>
                                <FontAwesomeIcon icon={getTypeIcon(feedbackItem.type)} />
                                {feedbackItem.type}
                              </span>
                              <span className={`feedback-priority-badge ${getPriorityBadgeClass(feedbackItem.priority)}`}>
                                {feedbackItem.priority}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="feedback-description">
                              <strong>{feedbackItem.title}</strong>
                              <br />
                              {feedbackItem.description?.length > 100 
                                ? `${feedbackItem.description.substring(0, 100)}...`
                                : feedbackItem.description
                              }
                            </div>
                          </td>
                          <td>
                            <span className={`feedback-status-badge ${getStatusBadgeClass(feedbackItem.status)}`}>
                              <FontAwesomeIcon icon={getStatusIcon(feedbackItem.status)} />
                              {feedbackItem.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="feedback-date">
                              {formatTime(feedbackItem.created_at)}
                            </div>
                          </td>
                          <td>
                            <div className="feedback-management-actions" onClick={(e) => e.stopPropagation()}>
                              {availableActions.includes('view') && (
                                <button
                                  className="feedback-action-btn view"
                                  onClick={() => handleViewFeedback(feedbackItem)}
                                  title="View details"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                              )}
                              
                              {availableActions.includes('reviewed') && (
                                <button
                                  className="feedback-action-btn review"
                                  onClick={() => openStatusChangeConfirmation(feedbackItem, 'reviewed')}
                                  title="Mark as Reviewed"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                              )}
                              
                              {availableActions.includes('in_progress') && (
                                <button
                                  className="feedback-action-btn progress"
                                  onClick={() => openStatusChangeConfirmation(feedbackItem, 'in_progress')}
                                  title="Mark as In Progress"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faExclamationTriangle} />
                                </button>
                              )}
                              
                              {availableActions.includes('completed') && (
                                <button
                                  className="feedback-action-btn complete"
                                  onClick={() => openStatusChangeConfirmation(feedbackItem, 'completed')}
                                  title="Mark as Completed"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                              )}
                              
                              {availableActions.includes('rejected') && (
                                <button
                                  className="feedback-action-btn reject"
                                  onClick={() => openStatusChangeConfirmation(feedbackItem, 'rejected')}
                                  title="Reject Feedback"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faBan} />
                                </button>
                              )}
                              
                              {availableActions.includes('pending') && (
                                <button
                                  className="feedback-action-btn pending"
                                  onClick={() => openStatusChangeConfirmation(feedbackItem, 'pending')}
                                  title="Reopen Feedback"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faRefresh} />
                                </button>
                              )}
                              
                              {availableActions.includes('delete') && (
                                <button
                                  className="feedback-action-btn delete"
                                  onClick={() => openDeleteConfirmation(feedbackItem)}
                                  title="Delete Feedback"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="feedback-mobile-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
                {filteredFeedback.map(feedbackItem => (
                  <MobileFeedbackCard key={feedbackItem.id} feedbackItem={feedbackItem} />
                ))}
              </div>
            </>
          ) : (
            <div className="feedback-empty-state">
              <FontAwesomeIcon icon={faComments} size="3x" />
              <h3>No feedback found</h3>
              <p>
                {feedback.length === 0
                  ? "There is no feedback to display." 
                  : "No feedback matches your filter criteria."
                }
              </p>
              {isFilterActive() && (
                <button 
                  className="feedback-retry-btn" 
                  onClick={clearAllFilters}
                  disabled={confirmationModal.isProcessing}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* View Feedback Modal */}
      {viewModal.isOpen && viewModal.feedback && (
        <div className="feedback-modal-overlay" onClick={closeViewModal}>
          <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h2>Feedback Details</h2>
              <button 
                className="feedback-modal-close"
                onClick={closeViewModal}
              >
                ×
              </button>
            </div>
            <div className="feedback-modal-body">
              <div className="feedback-details-modal">
                <div className="feedback-detail-section">
                  <h3>User Information</h3>
                  <div className="feedback-detail-row">
                    <label>Name:</label>
                    <span>{viewModal.feedback.submitter_first_name} {viewModal.feedback.submitter_last_name}</span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Email:</label>
                    <span>{viewModal.feedback.submitter_email}</span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>User ID:</label>
                    <span>#{viewModal.feedback.user_id}</span>
                  </div>
                </div>

                <div className="feedback-detail-section">
                  <h3>Feedback Details</h3>
                  <div className="feedback-detail-row">
                    <label>Type:</label>
                    <span className={`feedback-type-badge ${getTypeBadgeClass(viewModal.feedback.type)}`}>
                      {viewModal.feedback.type}
                    </span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Priority:</label>
                    <span className={`feedback-priority-badge ${getPriorityBadgeClass(viewModal.feedback.priority)}`}>
                      {viewModal.feedback.priority}
                    </span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Status:</label>
                    <span className={`feedback-status-badge ${getStatusBadgeClass(viewModal.feedback.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(viewModal.feedback.status)} />
                      {viewModal.feedback.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Title:</label>
                    <span>{viewModal.feedback.title}</span>
                  </div>
                  <div className="feedback-detail-row full-width">
                    <label>Description:</label>
                    <div className="feedback-description-full">
                      {viewModal.feedback.description}
                    </div>
                  </div>
                </div>

                <div className="feedback-detail-section">
                  <h3>Timestamps</h3>
                  <div className="feedback-detail-row">
                    <label>Submitted:</label>
                    <span>{new Date(viewModal.feedback.created_at).toLocaleString()}</span>
                  </div>
                  {viewModal.feedback.updated_at !== viewModal.feedback.created_at && (
                    <div className="feedback-detail-row">
                      <label>Last Updated:</label>
                      <span>{new Date(viewModal.feedback.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {viewModal.feedback.admin_notes && (
                  <div className="feedback-detail-section">
                    <h3>Admin Notes</h3>
                    <div className="feedback-detail-row full-width">
                      <div className="feedback-admin-notes">
                        {viewModal.feedback.admin_notes}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="feedback-modal-footer">
              <button 
                className="feedback-btn feedback-btn-primary"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="feedback-modal-overlay" onClick={closeConfirmationModal}>
          <div className="feedback-modal-content feedback-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h3>{confirmationModal.title}</h3>
              <button 
                className="feedback-modal-close"
                onClick={closeConfirmationModal}
                disabled={confirmationModal.isProcessing}
              >
                ×
              </button>
            </div>
            <div className="feedback-modal-body">
              <div className="feedback-confirm-content">
                <div className="feedback-confirm-icon">
                  <FontAwesomeIcon 
                    icon={confirmationModal.type === 'delete' ? faTrash : faExclamationTriangle} 
                    size="3x"
                  />
                </div>
                <p>{confirmationModal.message}</p>
                
                {confirmationModal.feedback && (
                  <div className="feedback-confirm-details">
                    <strong>Feedback Details:</strong>
                    <span><strong>User:</strong> {confirmationModal.feedback.submitter_first_name} {confirmationModal.feedback.submitter_last_name}</span>
                    <span><strong>Type:</strong> {confirmationModal.feedback.type} • {confirmationModal.feedback.priority} priority</span>
                    <span><strong>Title:</strong> {confirmationModal.feedback.title}</span>
                    <small>ID: #{confirmationModal.feedback.id}</small>
                  </div>
                )}

                {confirmationModal.type === 'delete' && (
                  <div className="feedback-deletion-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    This action cannot be undone!
                  </div>
                )}
              </div>
            </div>
            <div className="feedback-modal-footer">
              <button 
                className="feedback-btn feedback-btn-secondary"
                onClick={closeConfirmationModal}
                disabled={confirmationModal.isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`feedback-btn ${
                  confirmationModal.type === 'delete' 
                    ? 'feedback-btn-danger' 
                    : 'feedback-btn-primary'
                }`}
                onClick={handleConfirmAction}
                disabled={confirmationModal.isProcessing}
              >
                {confirmationModal.isProcessing ? 'Processing...' : 
                  confirmationModal.type === 'delete' ? 'Delete Feedback' : 'Confirm'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}