import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faRefresh,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faCheck,
  faTimes,
  faFire,
  faList,
  faEye,
  faUser,
  faEnvelope,
  faBan,
  faTimesCircle,
  faExternalLinkAlt,
  faUsers,
  faWarning,
  faChartBar,
  faTrash,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import './styles/AdminDeletionRequests.css';

export default function AdminDeletionRequests() {
  const [users, setUsers] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enhanced filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  
  // Highlight state for navigation
  const [highlightedRequest, setHighlightedRequest] = useState(null);
  const [highlightedUser, setHighlightedUser] = useState(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState('requests');

  // Enhanced modal states
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    request: null
  });

  const [userViewModal, setUserViewModal] = useState({
    isOpen: false,
    user: null
  });

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: '', // 'approve' or 'reject'
    title: '',
    message: '',
    request: null,
    action: '',
    isProcessing: false
  });

  // Rejection Reason Modal
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    request: null,
    reason: '',
    isProcessing: false
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // 🆕 ADDED: Double-click prevention
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // Scroll refs for auto-scrolling
  const tableContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const highlightedRowRef = useRef(null);
  const highlightedCellRef = useRef(null);

  // Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Navigation function to User Statistics
  const navigateToUserStatistics = (userId, email) => {
    setActiveTab('users');
    setHighlightedUser(userId);
    setSearchTerm(email); // Auto-search for the user
    closeViewModal();
    
    setTimeout(() => {
      const userElement = document.querySelector(`tr[data-user-id="${userId}"]`);
      if (userElement && tableContainerRef.current) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  };

  // Auto-scroll function for User Statistics
  const scrollToHighlightedUser = (userId) => {
    const userElement = document.querySelector(`tr[data-user-id="${userId}"]`);
    if (userElement && tableContainerRef.current) {
      userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Auto-scroll function with HORIZONTAL scroll to buttons
  const scrollToHighlightedRequest = (requestId) => {
    const tableElement = document.querySelector(`tr[data-request-id="${requestId}"]`);
    const mobileElement = document.querySelector(`.adr-mobile-card[data-request-id="${requestId}"]`);
    
    const element = tableElement || mobileElement;
    
    if (element && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.clientHeight;
      
      const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });

      if (tableElement && tableWrapperRef.current) {
        const tableWrapper = tableWrapperRef.current;
        const actionsCell = tableElement.querySelector('td:last-child');
        
        if (actionsCell) {
          const cellLeft = actionsCell.offsetLeft;
          const cellWidth = actionsCell.offsetWidth;
          const wrapperWidth = tableWrapper.clientWidth;
          
          const scrollLeft = cellLeft - (wrapperWidth / 2) + (cellWidth / 2);
          
          tableWrapper.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
          });

          highlightedCellRef.current = actionsCell;
        }
      }
      
      highlightedRowRef.current = element;
    }
  };

  // Re-scroll when request data loads and highlighted request exists
  useEffect(() => {
    if (highlightedRequest && deletionRequests.length > 0 && !requestsLoading) {
      setTimeout(() => {
        scrollToHighlightedRequest(highlightedRequest);
      }, 500);
    }
  }, [deletionRequests, requestsLoading, highlightedRequest]);

  // Auto-scroll when highlighted user changes
  useEffect(() => {
    if (highlightedUser && activeTab === 'users') {
      setTimeout(() => {
        scrollToHighlightedUser(highlightedUser);
      }, 500);
    }
  }, [highlightedUser, activeTab]);

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightRequest = urlParams.get('highlightRequest');
    
    if (highlightRequest) {
      const requestId = parseInt(highlightRequest);
      setHighlightedRequest(requestId);
      
      if (deletionRequests.length > 0) {
        const requestItem = deletionRequests.find(r => r.id === requestId);
        
        if (!requestItem) {
          showToast('This deletion request has been processed or does not exist', 'error');
        }
      }
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [deletionRequests]);

  // Smart polling setup
  useEffect(() => {
    fetchDeletionRequests();
    fetchUsersDeletionStats();

    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (isTabActiveRef.current) {
        fetchDeletionRequests();
        fetchUsersDeletionStats();
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
  }, [statusFilter, priorityFilter]);

  // Smart polling functions
  const startPolling = () => {
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        fetchDeletionRequests();
        fetchUsersDeletionStats();
      }
    }, 60000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    showToast('Refreshing deletion requests...', 'success');
    await fetchDeletionRequests();
    await fetchUsersDeletionStats();
  };

  const fetchUsersDeletionStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/users-deletion-stats', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users deletion stats');
        showToast('Error fetching user statistics', 'error');
      }
    } catch (error) {
      console.error('Error fetching users deletion stats:', error);
      showToast('Error fetching user statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletionRequests = async () => {
    try {
      setRequestsLoading(true);
      let url = 'http://localhost:8000/api/admin/deletion-requests';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
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
        setDeletionRequests(data.requests || []);
      } else {
        console.error('Failed to fetch deletion requests');
        showToast('Error fetching deletion requests', 'error');
      }
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
      showToast('Error fetching deletion requests', 'error');
    } finally {
      setRequestsLoading(false);
    }
  };

  // Clear highlighted items
  const clearHighlightedItems = () => {
    setHighlightedRequest(null);
    setHighlightedUser(null);
  };

  // 🆕 UPDATED: Enhanced request processing with modal closing
  const processDeletionRequest = async (requestId, action, rejectionReason = '') => {
    // Prevent double-click
    if (processingRequestId === requestId) return;
    
    setProcessingRequestId(requestId);
    
    if (confirmationModal.isProcessing) {
      setProcessingRequestId(null);
      return;
    }
    
    setConfirmationModal(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const requestBody = { action: action };
      if (rejectionReason) {
        requestBody.admin_notes = rejectionReason;
      }

      const response = await fetch(`http://localhost:8000/api/admin/deletion-requests/${requestId}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        setDeletionRequests(prev => prev.filter(request => request.id !== requestId));
        fetchUsersDeletionStats();
        
        // 🆕 CLOSE ALL MODALS after successful action
        closeConfirmationModal();
        closeRejectionModal();
        closeViewModal(); // 🆕 ADDED: Close view modal
        
        showToast(data.message || `Request ${action}d successfully`, 'success');
        
        if (highlightedRequest === requestId) {
          setHighlightedRequest(null);
        }
      } else {
        throw new Error('Failed to process request');
      }
    } catch (error) {
      console.error('Error processing deletion request:', error);
      showToast('Error processing deletion request', 'error');
    } finally {
      setConfirmationModal(prev => ({ ...prev, isProcessing: false }));
      setProcessingRequestId(null);
    }
  };

  // Modal Functions
  const openViewModal = (request) => {
    setViewModal({ isOpen: true, request });
    if (highlightedRequest === request.id) {
      setHighlightedRequest(null);
    }
  };

  // 🆕 ADDED: Open user view modal
  const openUserViewModal = (user) => {
    setUserViewModal({ isOpen: true, user });
    if (highlightedUser === user.id) {
      setHighlightedUser(null);
    }
  };

  // 🆕 UPDATED: Open action confirmation with double-click prevention
  const openActionConfirmation = (request, action) => {
    // Prevent double-click
    if (processingRequestId === request.id) return;

    const actionLabels = {
      approve: 'Approve',
      reject: 'Reject'
    };

    if (action === 'reject') {
      openRejectionModal(request);
      return;
    }

    setConfirmationModal({
      isOpen: true,
      type: action,
      title: `${actionLabels[action]} Deletion Request`,
      message: `Are you sure you want to ${action} this deletion request?`,
      request: request,
      action: action,
      isProcessing: false
    });
  };

  // Open rejection reason modal
  const openRejectionModal = (request) => {
    // Prevent double-click
    if (processingRequestId === request.id) return;

    setRejectionModal({
      isOpen: true,
      request: request,
      reason: '',
      isProcessing: false
    });
  };

  // Close rejection reason modal
  const closeRejectionModal = () => {
    setRejectionModal({
      isOpen: false,
      request: null,
      reason: '',
      isProcessing: false
    });
  };

  // 🆕 UPDATED: Handle rejection reason submission with modal closing
  const handleRejectionSubmit = () => {
    if (rejectionModal.isProcessing || !rejectionModal.reason.trim()) return;
    if (processingRequestId === rejectionModal.request?.id) return;
    
    processDeletionRequest(rejectionModal.request.id, 'reject', rejectionModal.reason.trim());
  };

  const closeViewModal = () => {
    setViewModal({ isOpen: false, request: null });
  };

  // 🆕 ADDED: Close user view modal
  const closeUserViewModal = () => {
    setUserViewModal({ isOpen: false, user: null });
  };

  const closeConfirmationModal = () => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      request: null,
      action: '',
      isProcessing: false
    });
  };

  // 🆕 UPDATED: Handle confirm action with modal closing
  const handleConfirmAction = () => {
    if (confirmationModal.isProcessing) return;
    if (processingRequestId === confirmationModal.request?.id) return;
    
    if (confirmationModal.type === 'approve' || confirmationModal.type === 'reject') {
      processDeletionRequest(confirmationModal.request.id, confirmationModal.action);
    }
  };

  // Priority badge classes with new terms
  const getPriorityBadgeClass = (request) => {
    const deletions = request.current_deletions || 0;
    if (deletions >= 4) return 'adr-priority-critical';
    if (deletions === 3) return 'adr-priority-limit';
    return 'adr-priority-warning';
  };

  const getPriorityBadgeText = (request) => {
    const deletions = request.current_deletions || 0;
    if (deletions >= 4) return 'Too Many This Month';
    if (deletions === 3) return 'Limit Reached';
    return 'Approaching Limit';
  };

  // Status badge classes
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'adr-status-pending',
      approved: 'adr-status-approved',
      rejected: 'adr-status-rejected'
    };
    return statusMap[status] || 'adr-status-pending';
  };

  // Status icons
  const getStatusIcon = (status) => {
    const iconMap = {
      pending: faClock,
      approved: faCheckCircle,
      rejected: faBan
    };
    return iconMap[status] || faClock;
  };

  // Priority icons with new terms
  const getPriorityIcon = (request) => {
    const deletions = request.current_deletions || 0;
    if (deletions >= 4) return faFire;
    if (deletions === 3) return faWarning;
    return faExclamationTriangle;
  };

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
    return statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm !== '' || highlightedRequest !== null || highlightedUser !== null || userStatusFilter !== 'all';
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setUserStatusFilter('all');
    setSearchTerm('');
    setHighlightedRequest(null);
    setHighlightedUser(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter only pending requests for the main interface
  const pendingRequests = deletionRequests.filter(request => request.status === 'pending');

  // Filter logic with new priority terms
  const filteredRequests = pendingRequests.filter(request => {
    const matchesSearch = 
      request.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.post_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const deletions = request.current_deletions || 0;
    const matchesPriority = priorityFilter === 'all' || 
      (priorityFilter === 'critical' && deletions >= 4) ||
      (priorityFilter === 'limit' && deletions === 3) ||
      (priorityFilter === 'warning' && deletions >= 1 && deletions <= 2);

    return matchesSearch && matchesPriority;
  });

  // Stats for PENDING REQUESTS tab with new terms
  const requestStats = {
    total: pendingRequests.length,
    critical: pendingRequests.filter(req => (req.current_deletions || 0) >= 4).length,
    limit: pendingRequests.filter(req => (req.current_deletions || 0) === 3).length,
    warning: pendingRequests.filter(req => (req.current_deletions || 0) >= 1 && (req.current_deletions || 0) <= 2).length
  };

  // Stats for USER STATISTICS tab
  const userStats = {
    totalUsers: users.length,
    limitReached: users.filter(u => u.limit_reached).length,
    approachingLimit: users.filter(u => u.deletion_count >= 2 && !u.limit_reached).length,
    totalDeletions: users.reduce((sum, user) => sum + (user.deletion_count || 0), 0),
    withinLimit: users.filter(u => u.deletion_count <= 1).length
  };

  // Handle stat card click for PENDING REQUESTS tab
  const handleRequestStatCardClick = (filterType) => {
    setActiveTab('requests');
    setPriorityFilter(filterType);
    setHighlightedRequest(null);
  };

  // Handle stat card click for USER STATISTICS tab
  const handleUserStatCardClick = (filterType) => {
    setActiveTab('users');
    setUserStatusFilter(filterType);
    setHighlightedUser(null);
  };

  // Filter users for user statistics tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // User status filtering
    const matchesStatus = userStatusFilter === 'all' || 
      (userStatusFilter === 'limit_reached' && user.limit_reached) ||
      (userStatusFilter === 'approaching' && user.deletion_count >= 2 && !u.limit_reached) ||
      (userStatusFilter === 'within' && user.deletion_count <= 1);

    return matchesSearch && matchesStatus;
  });

  // Get user status class and text
  const getUserStatusClass = (user) => {
    if (user.limit_reached) return 'adr-user-status-banned';
    if (user.deletion_count >= 2) return 'adr-user-status-suspended';
    return 'adr-user-status-active';
  };

  const getUserStatusText = (user) => {
    if (user.limit_reached) return 'Limit Reached';
    if (user.deletion_count >= 2) return 'Approaching Limit';
    return 'Within Limit';
  };

  // Check if user filter is active
  const isUserFilterActive = () => {
    return userStatusFilter !== 'all' || searchTerm !== '' || highlightedUser !== null;
  };

  // 🆕 UPDATED: Mobile Request Card Component with double-click prevention
  const MobileRequestCard = ({ request }) => {
    const isHighlighted = highlightedRequest === request.id;
    const isProcessing = processingRequestId === request.id;
    
    return (
      <div 
        className={`adr-mobile-card ${isHighlighted ? 'adr-request-highlighted' : ''}`}
        data-request-id={request.id}
      >
        <div className="adr-mobile-header">
          <div className="adr-mobile-title">
            <h3>
              {request.first_name} {request.last_name}
              <FontAwesomeIcon 
                icon={faExternalLinkAlt} 
                className="adr-external-link-icon"
                title="Click to view user details"
              />
            </h3>
            <div className="adr-mobile-id">ID: #{request.id}</div>
          </div>
          <div className="adr-mobile-badges">
            <span className={`adr-mobile-priority ${getPriorityBadgeClass(request)}`}>
              <FontAwesomeIcon icon={getPriorityIcon(request)} />
              {getPriorityBadgeText(request)}
            </span>
          </div>
        </div>
        
        <div className="adr-mobile-details">
          <div className="adr-mobile-detail">
            <FontAwesomeIcon icon={faUser} />
            <span className="adr-clickable">
              {request.first_name} {request.last_name}
            </span>
          </div>
          <div className="adr-mobile-detail">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>{request.email}</span>
          </div>
          <div className="adr-mobile-detail">
            <FontAwesomeIcon icon={faClock} />
            <span>{formatTime(request.created_at)}</span>
          </div>
          <div className="adr-mobile-detail">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>Deletions: {request.current_deletions || 0}/3</span>
          </div>
          
          <div className="adr-mobile-description">
            <strong>Reason:</strong>
            <p>{request.reason?.length > 150 
              ? `${request.reason.substring(0, 150)}...`
              : request.reason
            }</p>
          </div>

          {request.post_title && (
            <div className="adr-mobile-description">
              <strong>Related Post:</strong>
              <p>{request.post_title}</p>
            </div>
          )}
        </div>

        <div className="adr-mobile-status-section">
          <span className={`adr-mobile-status ${getStatusBadgeClass(request.status)}`}>
            <FontAwesomeIcon icon={getStatusIcon(request.status)} />
            {request.status}
          </span>
        </div>
        
        <div className="adr-mobile-actions">
          <button
            className="adr-action-btn view"
            onClick={() => openViewModal(request)}
            title="View details"
            disabled={confirmationModal.isProcessing || isProcessing}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          
          <button
            className="adr-action-btn approve"
            onClick={() => openActionConfirmation(request, 'approve')}
            title="Approve Request"
            disabled={confirmationModal.isProcessing || isProcessing}
          >
            <FontAwesomeIcon icon={faCheck} />
          </button>
          
          <button
            className="adr-action-btn reject"
            onClick={() => openActionConfirmation(request, 'reject')}
            title="Reject Request"
            disabled={confirmationModal.isProcessing || isProcessing}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`adr-toast adr-toast-${toast.type}`}>
          <div className="adr-toast-content">
            <FontAwesomeIcon 
              icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="adr-toast-icon" 
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="adr-management-header">
        <div className="adr-header-content">
          <p>Manage and review user deletion requests</p>
        </div>
        <div className="adr-header-actions">
          <button 
            className="adr-refresh-btn"
            onClick={handleManualRefresh}
            disabled={requestsLoading}
          >
            <FontAwesomeIcon icon={faRefresh} spin={requestsLoading} />
            Refresh
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="adr-tabs">
        <button 
          className={`adr-tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FontAwesomeIcon icon={faClock} />
          Pending Requests ({requestStats.total})
        </button>
        <button 
          className={`adr-tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FontAwesomeIcon icon={faUsers} />
          User Statistics ({userStats.totalUsers})
        </button>
      </div>

      {/* Stats Cards - DIFFERENT FOR EACH TAB */}
      {activeTab === 'requests' && (
        <section className="adr-management-stats">
          <div 
            className={`adr-stat-card ${priorityFilter === 'all' && !highlightedRequest ? 'adr-stat-active' : ''}`}
            onClick={() => handleRequestStatCardClick('all')}
            style={{ cursor: 'pointer' }}
            title="Show all requests"
          >
            <div className="adr-stat-info">
              <span className="adr-stat-number">{requestStats.total}</span>
              <span className="adr-stat-label">Total Requests</span>
            </div>
          </div>
          <div 
            className={`adr-stat-card ${priorityFilter === 'critical' ? 'adr-stat-active' : ''}`}
            onClick={() => handleRequestStatCardClick('critical')}
            style={{ cursor: 'pointer' }}
            title="Show too many requests (4+ deletions)"
          >
            <div className="adr-stat-info">
              <span className="adr-stat-number">{requestStats.critical}</span>
              <span className="adr-stat-label">Too Many This Month</span>
            </div>
          </div>
          <div 
            className={`adr-stat-card ${priorityFilter === 'limit' ? 'adr-stat-active' : ''}`}
            onClick={() => handleRequestStatCardClick('limit')}
            style={{ cursor: 'pointer' }}
            title="Show limit reached requests (3 deletions)"
          >
            <div className="adr-stat-info">
              <span className="adr-stat-number">{requestStats.limit}</span>
              <span className="adr-stat-label">Limit Reached</span>
            </div>
          </div>
          <div 
            className={`adr-stat-card ${priorityFilter === 'warning' ? 'adr-stat-active' : ''}`}
            onClick={() => handleRequestStatCardClick('warning')}
            style={{ cursor: 'pointer' }}
            title="Show approaching limit requests (1-2 deletions)"
          >
            <div className="adr-stat-info">
              <span className="adr-stat-number">{requestStats.warning}</span>
              <span className="adr-stat-label">Approaching Limit</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="adr-management-stats">
          <div 
            className={`adr-stat-card ${userStatusFilter === 'all' && !highlightedUser ? 'adr-stat-active' : ''}`}
            onClick={() => handleUserStatCardClick('all')}
            style={{ cursor: 'pointer' }}
            title="All users"
          >
            <div className="adr-stat-info">
              <span className="adr-stat-number">{userStats.totalUsers}</span>
              <span className="adr-stat-label">Total Users</span>
            </div>
          </div>
          <div 
            className={`adr-stat-card ${userStatusFilter === 'limit_reached' ? 'adr-stat-active' : ''}`}
            onClick={() => handleUserStatCardClick('limit_reached')}
            style={{ cursor: 'pointer' }}
            title="Users who reached deletion limit"
          >
            <div className="adr-stat-info">
              <span className="adr-stat-number">{userStats.limitReached}</span>
              <span className="adr-stat-label">Limit Reached</span>
            </div>
          </div>
          <div 
            className={`adr-stat-card ${userStatusFilter === 'approaching' ? 'adr-stat-active' : ''}`}
            onClick={() => handleUserStatCardClick('approaching')}
            style={{ cursor: 'pointer' }}
            title="Users approaching deletion limit"
          >
            <div className="adr-stat-info">
              <span className="adr-stat-number">{userStats.approachingLimit}</span>
              <span className="adr-stat-label">Approaching Limit</span>
            </div>
          </div>
          <div 
            className={`adr-stat-card ${userStatusFilter === 'within' ? 'adr-stat-active' : ''}`}
            onClick={() => handleUserStatCardClick('within')}
            style={{ cursor: 'pointer' }}
            title="Users within normal limits"
          >
            <div className="adr-stat-info">
              <span className="adr-stat-number">{userStats.withinLimit}</span>
              <span className="adr-stat-label">Within Limit</span>
            </div>
          </div>
        </section>
      )}

      {/* Pending Requests Tab Content */}
      {activeTab === 'requests' && (
        <>
          {/* Filters */}
          <section className="adr-management-filters">
            <div className="adr-search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search requests by name, email, reason, or post..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="adr-filter-group">
              <FontAwesomeIcon icon={faFilter} />
              <select 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="adr-filter-select"
                disabled={confirmationModal.isProcessing}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Too Many This Month (4+)</option>
                <option value="limit">Limit Reached (3)</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="adr-filter-group">
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
                className="adr-clear-filters-btn"
                onClick={clearAllFilters}
                title="Clear all filters"
                disabled={confirmationModal.isProcessing}
              >
                Clear Filters
              </button>
            )}
          </section>

          {/* Requests Table */}
          <section className="adr-management-table-container" ref={tableContainerRef}>
            <div className="adr-management-table-content">
              <div className="adr-management-table-title">
                <h2>Deletion Requests</h2>
                <div className="adr-management-header-info">
                  <span className="adr-management-count">
                    Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                    {isFilterActive() && ` (Filtered)`}
                    {highlightedRequest && ` - Highlighted: #${highlightedRequest}`}
                  </span>
                </div>
              </div>

              {requestsLoading ? (
                <div className="adr-loading-state">
                  <div className="adr-loading-spinner"></div>
                  <p>Loading deletion requests...</p>
                </div>
              ) : filteredRequests.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div 
                    className="adr-table-wrapper" 
                    style={{ display: viewMode === 'table' ? 'block' : 'none' }}
                    ref={tableWrapperRef}
                  >
                    <table className="adr-management-table">
                      <thead>
                        <tr>
                          <th>User & Email</th>
                          <th>Request Details</th>
                          <th>Priority Level</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map(request => {
                          const isHighlighted = highlightedRequest === request.id;
                          const isProcessing = processingRequestId === request.id;
                          
                          return (
                            <tr 
                              key={request.id} 
                              className={`${isHighlighted ? 'adr-request-highlighted-row' : ''} adr-clickable-row`}
                              data-request-id={request.id}
                              onClick={() => openViewModal(request)}
                            >
                              <td>
                                <div className="adr-user-info">
                                  <FontAwesomeIcon icon={faUser} />
                                  <div>
                                    <div>
                                      <span className="adr-clickable">
                                        {request.first_name} {request.last_name}
                                        <FontAwesomeIcon 
                                          icon={faExternalLinkAlt} 
                                          className="adr-external-link-icon"
                                        />
                                      </span>
                                    </div>
                                    <div className="adr-user-email">
                                      <FontAwesomeIcon icon={faEnvelope} />
                                      {request.email}
                                    </div>
                                    <div className="adr-deletion-count">
                                      <FontAwesomeIcon icon={faExclamationTriangle} />
                                      Deletions: {request.current_deletions || 0}/3
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="adr-request-details">
                                  <strong>Reason:</strong>
                                  <div className="adr-request-reason">
                                    {request.reason?.length > 100 
                                      ? `${request.reason.substring(0, 100)}...`
                                      : request.reason
                                    }
                                  </div>
                                  {request.post_title && (
                                    <div className="adr-post-info">
                                      <strong>Post:</strong> {request.post_title}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={`adr-priority-badge ${getPriorityBadgeClass(request)}`}>
                                  <FontAwesomeIcon icon={getPriorityIcon(request)} />
                                  {getPriorityBadgeText(request)}
                                </span>
                              </td>
                              <td>
                                <span className={`adr-status-badge ${getStatusBadgeClass(request.status)}`}>
                                  <FontAwesomeIcon icon={getStatusIcon(request.status)} />
                                  {request.status}
                                </span>
                              </td>
                              <td>
                                <div className="adr-date">
                                  {formatTime(request.created_at)}
                                </div>
                              </td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <div className="adr-management-actions">
                                  <button
                                    className="adr-action-btn view"
                                    onClick={() => openViewModal(request)}
                                    title="View details"
                                    disabled={confirmationModal.isProcessing || isProcessing}
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </button>
                                  
                                  <button
                                    className="adr-action-btn approve"
                                    onClick={() => openActionConfirmation(request, 'approve')}
                                    title="Approve Request"
                                    disabled={confirmationModal.isProcessing || isProcessing}
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </button>
                                  
                                  <button
                                    className="adr-action-btn reject"
                                    onClick={() => openActionConfirmation(request, 'reject')}
                                    title="Reject Request"
                                    disabled={confirmationModal.isProcessing || isProcessing}
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="adr-mobile-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
                    {filteredRequests.map(request => (
                      <MobileRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="adr-empty-state">
                  <FontAwesomeIcon icon={faClock} size="3x" />
                  <h3>No deletion requests found</h3>
                  <p>
                    {pendingRequests.length === 0
                      ? "There are no pending deletion requests." 
                      : "No requests match your filter criteria."
                    }
                  </p>
                  {isFilterActive() && (
                    <button 
                      className="adr-retry-btn" 
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
        </>
      )}

      {/* User Statistics Tab Content */}
      {activeTab === 'users' && (
        <>
          {/* Filters */}
          <section className="adr-management-filters">
            <div className="adr-search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="adr-filter-group">
              <FontAwesomeIcon icon={faFilter} />
              <select 
                value={userStatusFilter} 
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="adr-filter-select"
              >
                <option value="all">All Users</option>
                <option value="limit_reached">Limit Reached</option>
                <option value="approaching">Approaching Limit</option>
                <option value="within">Within Limit</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {isUserFilterActive() && (
              <button 
                className="adr-clear-filters-btn"
                onClick={clearAllFilters}
                title="Clear all filters"
              >
                Clear Filters
              </button>
            )}
          </section>

          {/* Users Table */}
          <section className="adr-management-table-container">
            <div className="adr-management-table-content">
              <div className="adr-management-table-title">
                <h2>Users Deletion Status</h2>
                <div className="adr-management-header-info">
                  <span className="adr-management-count">
                    {filteredUsers.length} of {userStats.totalUsers} user{filteredUsers.length !== 1 ? 's' : ''}
                    {isUserFilterActive() && ' (Filtered)'}
                    {highlightedUser && ` - Highlighted User`}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="adr-loading-state">
                  <div className="adr-loading-spinner"></div>
                  <p>Loading users deletion data...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="adr-empty-state">
                  <FontAwesomeIcon icon={faUsers} size="3x" />
                  <h3>No users found</h3>
                  <p>
                    {users.length === 0
                      ? "There are no users to display." 
                      : "No users match your filter criteria."
                    }
                  </p>
                  {isUserFilterActive() && (
                    <button 
                      className="adr-retry-btn" 
                      onClick={clearAllFilters}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="adr-table-wrapper">
                  <table className="adr-management-table">
                    <thead>
                      <tr>
                        <th>User Information</th>
                        <th>Deletion Status</th>
                        <th>Deletion Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => {
                        const isHighlighted = highlightedUser === user.id;
                        
                        return (
                          <tr 
                            key={user.id} 
                            className={`${isHighlighted ? 'adr-request-highlighted-row adr-user-highlighted-row' : ''} adr-clickable-row`}
                            data-user-id={user.id}
                            onClick={() => openUserViewModal(user)}
                          >
                            <td>
                              <div className="adr-user-info">
                                <FontAwesomeIcon icon={faUser} />
                                <div>
                                  <div>
                                    <span className="adr-clickable">
                                      {user.first_name} {user.last_name}
                                      <FontAwesomeIcon 
                                        icon={faExternalLinkAlt} 
                                        className="adr-external-link-icon"
                                      />
                                    </span>
                                  </div>
                                  <div className="adr-user-email">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                    {user.email}
                                  </div>
                                  <div className="adr-user-status">
                                    Status: <span className={`adr-user-status-badge ${getUserStatusClass(user)}`}>
                                      {getUserStatusText(user)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`adr-status-badge ${getUserStatusClass(user)}`}>
                                {getUserStatusText(user)}
                              </span>
                            </td>
                            <td>
                              <div className="adr-progress-container">
                                <span className="adr-progress-text">
                                  {user.deletion_count || 0} / 3
                                </span>
                                <div className="adr-progress-bar">
                                  <div 
                                    className={`adr-progress-fill ${
                                      user.limit_reached 
                                        ? 'limit-reached' 
                                        : user.deletion_count >= 2 
                                        ? 'approaching' 
                                        : 'normal'
                                    }`}
                                    style={{ width: `${Math.min(((user.deletion_count || 0) / 3) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* View Request Modal */}
      {viewModal.isOpen && viewModal.request && (
        <div className="adr-modal-overlay" onClick={closeViewModal}>
          <div className="adr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="adr-modal-header">
              <h2>Request Details</h2>
              <button 
                className="adr-modal-close"
                onClick={closeViewModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="adr-modal-body">
              <div className="adr-details-modal">
                <div className="adr-detail-section">
                  <h3>User Information</h3>
                  <div className="adr-detail-row">
                    <label>Name:</label>
                    <span>{viewModal.request.first_name} {viewModal.request.last_name}</span>
                  </div>
                  <div className="adr-detail-row">
                    <label>Email:</label>
                    <span>{viewModal.request.email}</span>
                  </div>
                  <div className="adr-detail-row">
                    <label>Current Deletions:</label>
                    <span>{viewModal.request.current_deletions || 0}/3</span>
                  </div>
                  {/* Navigation button to User Statistics */}
                  <div className="adr-detail-row full-width">
                    <button
                      className="adr-btn adr-btn-primary"
                      onClick={() => navigateToUserStatistics(
                        viewModal.request.user_id, 
                        viewModal.request.email
                      )}
                      style={{ marginTop: '1rem' }}
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      View User Statistics
                    </button>
                  </div>
                </div>

                <div className="adr-detail-section">
                  <h3>Request Details</h3>
                  <div className="adr-detail-row">
                    <label>Priority:</label>
                    <span className={`adr-priority-badge ${getPriorityBadgeClass(viewModal.request)}`}>
                      {getPriorityBadgeText(viewModal.request)}
                    </span>
                  </div>
                  <div className="adr-detail-row">
                    <label>Status:</label>
                    <span className={`adr-status-badge ${getStatusBadgeClass(viewModal.request.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(viewModal.request.status)} />
                      {viewModal.request.status}
                    </span>
                  </div>
                  <div className="adr-detail-row full-width">
                    <label>Reason:</label>
                    <div className="adr-reason-full">
                      {viewModal.request.reason}
                    </div>
                  </div>
                  {viewModal.request.post_title && (
                    <div className="adr-detail-row">
                      <label>Related Post:</label>
                      <span>{viewModal.request.post_title}</span>
                    </div>
                  )}
                </div>

                <div className="adr-detail-section">
                  <h3>Timestamps</h3>
                  <div className="adr-detail-row">
                    <label>Requested:</label>
                    <span>{new Date(viewModal.request.created_at).toLocaleString()}</span>
                  </div>
                  {viewModal.request.updated_at !== viewModal.request.created_at && (
                    <div className="adr-detail-row">
                      <label>Last Updated:</label>
                      <span>{new Date(viewModal.request.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {viewModal.request.admin_notes && (
                  <div className="adr-detail-section">
                    <h3>Admin Notes</h3>
                    <div className="adr-detail-row full-width">
                      <div className="adr-admin-notes">
                        {viewModal.request.admin_notes}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="adr-modal-footer">
              <button 
                className="adr-btn adr-btn-secondary"
                onClick={closeViewModal}
              >
                Close
              </button>
              <div className="adr-modal-actions">
                <button
                  className="adr-btn adr-btn-success"
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionConfirmation(viewModal.request, 'approve');
                  }}
                  disabled={confirmationModal.isProcessing || processingRequestId === viewModal.request.id}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Approve
                </button>
                <button
                  className="adr-btn adr-btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionConfirmation(viewModal.request, 'reject');
                  }}
                  disabled={confirmationModal.isProcessing || processingRequestId === viewModal.request.id}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 ADDED: User View Modal */}
      {userViewModal.isOpen && userViewModal.user && (
        <div className="adr-modal-overlay" onClick={closeUserViewModal}>
          <div className="adr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="adr-modal-header">
              <h2>User Details</h2>
              <button 
                className="adr-modal-close"
                onClick={closeUserViewModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="adr-modal-body">
              <div className="adr-details-modal">
                <div className="adr-detail-section">
                  <h3>User Information</h3>
                  <div className="adr-detail-row">
                    <label>Name:</label>
                    <span>{userViewModal.user.first_name} {userViewModal.user.last_name}</span>
                  </div>
                  <div className="adr-detail-row">
                    <label>Email:</label>
                    <span>{userViewModal.user.email}</span>
                  </div>
                  <div className="adr-detail-row">
                    <label>User ID:</label>
                    <span>#{userViewModal.user.id}</span>
                  </div>
                </div>

                <div className="adr-detail-section">
                  <h3>Deletion Statistics</h3>
                  <div className="adr-detail-row">
                    <label>Current Deletions:</label>
                    <span>{userViewModal.user.deletion_count || 0} / 3</span>
                  </div>
                  <div className="adr-detail-row">
                    <label>Status:</label>
                    <span className={`adr-user-status-badge ${getUserStatusClass(userViewModal.user)}`}>
                      {getUserStatusText(userViewModal.user)}
                    </span>
                  </div>
                  <div className="adr-detail-row full-width">
                    <label>Progress:</label>
                    <div className="adr-progress-container" style={{ marginTop: '1rem' }}>
                      <div className="adr-progress-bar">
                        <div 
                          className={`adr-progress-fill ${
                            userViewModal.user.limit_reached 
                              ? 'limit-reached' 
                              : userViewModal.user.deletion_count >= 2 
                              ? 'approaching' 
                              : 'normal'
                          }`}
                          style={{ width: `${Math.min(((userViewModal.user.deletion_count || 0) / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="adr-progress-text">
                        {userViewModal.user.deletion_count || 0} out of 3 deletions this month
                      </span>
                    </div>
                  </div>
                </div>

                {userViewModal.user.limit_reached && (
                  <div className="adr-detail-section">
                    <h3>Limit Status</h3>
                    <div className="adr-detail-row full-width">
                      <div className="adr-rejection-warning">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        This user has reached the monthly deletion limit (3 requests)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="adr-modal-footer">
              <button 
                className="adr-btn adr-btn-secondary"
                onClick={closeUserViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="adr-modal-overlay" onClick={closeConfirmationModal}>
          <div className="adr-modal-content adr-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adr-modal-header">
              <h3>{confirmationModal.title}</h3>
              <button 
                className="adr-modal-close"
                onClick={closeConfirmationModal}
                disabled={confirmationModal.isProcessing}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="adr-modal-body">
              <div className="adr-confirm-content">
                <div className="adr-confirm-icon">
                  <FontAwesomeIcon 
                    icon={confirmationModal.type === 'reject' ? faTimesCircle : faCheckCircle} 
                    size="3x"
                  />
                </div>
                <p>{confirmationModal.message}</p>
                
                {confirmationModal.request && (
                  <div className="adr-confirm-details">
                    <strong>Request Details:</strong>
                    <span><strong>User:</strong> {confirmationModal.request.first_name} {confirmationModal.request.last_name}</span>
                    <span><strong>Email:</strong> {confirmationModal.request.email}</span>
                    <span><strong>Deletions:</strong> {confirmationModal.request.current_deletions || 0}/3 • {getPriorityBadgeText(confirmationModal.request)}</span>
                    <span><strong>Reason:</strong> {confirmationModal.request.reason?.substring(0, 100)}...</span>
                    <small>ID: #{confirmationModal.request.id}</small>
                  </div>
                )}

                {confirmationModal.type === 'reject' && (
                  <div className="adr-rejection-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    User will be notified about this rejection
                  </div>
                )}
              </div>
            </div>
            <div className="adr-modal-footer">
              <button 
                className="adr-btn adr-btn-secondary"
                onClick={closeConfirmationModal}
                disabled={confirmationModal.isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`adr-btn ${
                  confirmationModal.type === 'reject' 
                    ? 'adr-btn-danger' 
                    : 'adr-btn-success'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmAction();
                }}
                disabled={confirmationModal.isProcessing || processingRequestId === confirmationModal.request?.id}
              >
                {confirmationModal.isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faRefresh} spin />
                    Processing...
                  </>
                ) : (
                  confirmationModal.type === 'reject' ? 'Reject Request' : 'Approve Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModal.isOpen && (
        <div className="adr-modal-overlay" onClick={closeRejectionModal}>
          <div className="adr-modal-content adr-rejection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adr-modal-header">
              <h3>Reject Deletion Request</h3>
              <button 
                className="adr-modal-close"
                onClick={closeRejectionModal}
                disabled={rejectionModal.isProcessing}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="adr-modal-body">
              <div className="adr-rejection-content">
                <div className="adr-rejection-icon">
                  <FontAwesomeIcon icon={faBan} size="3x" />
                </div>
                <p>Please provide a reason for rejecting this deletion request:</p>
                
                {rejectionModal.request && (
                  <div className="adr-confirm-details">
                    <strong>Request Details:</strong>
                    <span><strong>User:</strong> {rejectionModal.request.first_name} {rejectionModal.request.last_name}</span>
                    <span><strong>Email:</strong> {rejectionModal.request.email}</span>
                    <span><strong>Deletions:</strong> {rejectionModal.request.current_deletions || 0}/3 • {getPriorityBadgeText(rejectionModal.request)}</span>
                    <span><strong>Reason:</strong> {rejectionModal.request.reason?.substring(0, 100)}...</span>
                    <small>ID: #{rejectionModal.request.id}</small>
                  </div>
                )}

                <div className="adr-rejection-reason-input">
                  <label htmlFor="rejectionReason">Rejection Reason:</label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionModal.reason}
                    onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explain why this deletion request is being rejected..."
                    rows="4"
                    disabled={rejectionModal.isProcessing}
                  />
                  {!rejectionModal.reason.trim() && (
                    <small className="adr-rejection-warning">Please provide a rejection reason</small>
                  )}
                </div>

                <div className="adr-rejection-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  This action will reject the deletion request and notify the user.
                </div>
              </div>
            </div>
            <div className="adr-modal-footer">
              <button 
                className="adr-btn adr-btn-secondary"
                onClick={closeRejectionModal}
                disabled={rejectionModal.isProcessing}
              >
                Cancel
              </button>
              <button 
                className="adr-btn adr-btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectionSubmit();
                }}
                disabled={rejectionModal.isProcessing || !rejectionModal.reason.trim() || processingRequestId === rejectionModal.request?.id}
              >
                {rejectionModal.isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faRefresh} spin />
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBan} />
                    Reject Request
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