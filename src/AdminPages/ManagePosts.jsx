import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  faTag,
  faUser,
  faExternalLinkAlt,
  faUserShield,
  faUserSlash,
  faPauseCircle,
  faClock,
  faBell,
  faEnvelope,
  faVenusMars,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import './styles/ManagePosts.css';

export default function ManagePosts() {
  const navigate = useNavigate();
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

  // 🆕 ENHANCED: User filter and highlight states with scroll refs
  const [userFilter, setUserFilter] = useState(null);
  const [userName, setUserName] = useState('');
  const [highlightedPost, setHighlightedPost] = useState(null);

  // 🆕 ADDED: Scroll refs for auto-scrolling (like ManageUsers)
  const tableContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const highlightedRowRef = useRef(null);
  const highlightedCellRef = useRef(null);

  // 🎯 POST REPORT THRESHOLDS
  const REPORT_THRESHOLDS = {
    CAN_REMOVE: 3,
    CAN_DELETE: 5
  };

  // 🆕 ENHANCED: Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  // 🆕 ENHANCED: Highlight scrolling with auto-scroll (like ManageUsers)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const userNameParam = urlParams.get('userName');
    const highlightPost = urlParams.get('highlightPost');
    
    if (userId) {
      setUserFilter(parseInt(userId));
      setUserName(userNameParam || '');
      // Clear the URL parameters after reading them
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    if (highlightPost) {
      const postId = parseInt(highlightPost);
      setHighlightedPost(postId);
      
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        scrollToHighlightedPost(postId);
      }, 800);
      
      // Clear the URL parameter after reading it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // 🆕 ADDED: Auto-scroll function with HORIZONTAL scroll to buttons (like ManageUsers)
  const scrollToHighlightedPost = (postId) => {
    // Try table view first
    const tableElement = document.querySelector(`tr[data-post-id="${postId}"]`);
    // Try mobile card view
    const mobileElement = document.querySelector(`.manage-posts-mobile-card[data-post-id="${postId}"]`);
    
    const element = tableElement || mobileElement;
    
    if (element && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.clientHeight;
      
      // Calculate VERTICAL scroll position to center the element
      const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });

      // 🆕 ADDED: HORIZONTAL scrolling to show ACTION BUTTONS (like ManageUsers)
      if (tableElement && tableWrapperRef.current) {
        const tableWrapper = tableWrapperRef.current;
        const actionsCell = tableElement.querySelector('td:last-child');
        
        if (actionsCell) {
          const cellLeft = actionsCell.offsetLeft;
          const cellWidth = actionsCell.offsetWidth;
          const wrapperWidth = tableWrapper.clientWidth;
          
          // Calculate HORIZONTAL scroll position to show actions column
          const scrollLeft = cellLeft - (wrapperWidth / 2) + (cellWidth / 2);
          
          tableWrapper.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
          });

          // Store ref for the highlighted cell
          highlightedCellRef.current = actionsCell;
        }
      }
      
      // Store ref for potential re-scrolling
      highlightedRowRef.current = element;
    }
  };

  // 🆕 ADDED: Re-scroll when posts data loads and highlighted post exists
  useEffect(() => {
    if (highlightedPost && posts.length > 0 && !loading) {
      setTimeout(() => {
        scrollToHighlightedPost(highlightedPost);
      }, 500);
    }
  }, [posts, loading, highlightedPost]);

  // 🆕 ADDED: Auto-scroll when highlighted post changes
  useEffect(() => {
    if (highlightedPost) {
      setTimeout(() => {
        scrollToHighlightedPost(highlightedPost);
      }, 300);
    }
  }, [highlightedPost]);

  // 🆕 FIXED: Check for deleted posts when navigating from notifications
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightPost = urlParams.get('highlightPost');
    
    if (highlightPost) {
      const postId = parseInt(highlightPost);
      setHighlightedPost(postId);
      
      if (posts.length > 0) {
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
          showToast('This post has been deleted or does not exist', 'error');
        } else if (post.status === 'Deleted' || post.status === 'Removed') {
          showToast('This post has been deleted or removed', 'warning');
        }
      }
    }
  }, [posts]);

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

  // 🆕 ADDED: Clear user filter
  const clearUserFilter = () => {
    setUserFilter(null);
    setUserName('');
  };

  // 🆕 ADDED: Navigate to user in ManageUsers
  const navigateToUser = (userId, userName) => {
    navigate(`/admin/manage-users?highlightUser=${userId}`);
  };

  // 🆕 ADDED: Clear highlighted post
  const clearHighlightedPost = () => {
    setHighlightedPost(null);
  };

  // Open View Modal
  const openViewModal = (post) => {
    setViewModal({ isOpen: true, post });
    // Clear highlight when viewing post details
    if (highlightedPost === post.id) {
      setHighlightedPost(null);
    }
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

    // Clear highlight if the highlighted post was affected
    if (highlightedPost === postId) {
      setHighlightedPost(null);
    }
  };

  // 🆕 UPDATED: Filter posts based on search, status, type, AND user filter
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.barangay_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.purok_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesType = typeFilter === 'all' || post.type === typeFilter;
    const matchesUser = userFilter ? post.user_id === userFilter : true;
    
    return matchesSearch && matchesStatus && matchesType && matchesUser;
  });

  // 🆕 UPDATED: Check if any filter is active (including user filter and highlight)
  const isFilterActive = () => {
    return statusFilter !== 'all' || typeFilter !== 'all' || searchTerm !== '' || userFilter !== null || highlightedPost !== null;
  };

  // 🆕 UPDATED: Clear all filters (including user filter and highlight)
  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
    setUserFilter(null);
    setUserName('');
    setHighlightedPost(null);
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
      'Active': 'manage-posts-status-active',
      'Removed': 'manage-posts-status-removed',
      'Resolved': 'manage-posts-status-resolved'
    };
    return statusMap[status] || 'manage-posts-status-active';
  };

  // Get type badge class
  const getTypeClass = (type) => {
    const typeMap = {
      'found': 'manage-posts-type-found',
      'lost': 'manage-posts-type-lost',
      'for sale': 'manage-posts-type-sale',
      'looking to buy': 'manage-posts-type-buy',
      'service offered': 'manage-posts-type-service',
      'help wanted': 'manage-posts-type-help'
    };
    return typeMap[type?.toLowerCase()] || 'manage-posts-type-default';
  };

  // Get stat card class for types
  const getStatCardClass = (type) => {
    const typeMap = {
      'Found': 'manage-posts-stat-found',
      'Lost': 'manage-posts-stat-lost',
      'For Sale': 'manage-posts-stat-sale',
      'Looking to Buy': 'manage-posts-stat-buy',
      'Service Offered': 'manage-posts-stat-service',
      'Help Wanted': 'manage-posts-stat-help'
    };
    return typeMap[type] || 'manage-posts-type-stat';
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

  // 🎯 UPDATED: Get report severity for posts - ADD "No Risk" like ManageUsers
  const getReportSeverity = (post) => {
    const reportCount = post.total_report_count || 0;
    
    if (reportCount >= REPORT_THRESHOLDS.CAN_DELETE) return 'high';
    if (reportCount >= REPORT_THRESHOLDS.CAN_REMOVE) return 'medium';
    return 'none'; // 🆕 No risk for posts below remove threshold
  };

  // 🎯 UPDATED: Report severity badge component - ADD "No Risk" badge
  const ReportSeverityBadge = ({ post }) => {
    const severity = getReportSeverity(post);
    
    const severityConfig = {
      high: { 
        class: 'manage-posts-report-high', 
        text: 'High Risk - Can Delete', 
        icon: faExclamationTriangle 
      },
      medium: { 
        class: 'manage-posts-report-medium', 
        text: 'Medium Risk - Can Remove', 
        icon: faFlag 
      },
      none: { 
        class: 'manage-posts-report-none', 
        text: 'No Risk', 
        icon: faCheckCircle 
      }
    };

    const config = severityConfig[severity];

    return (
      <span className={`manage-posts-report-severity-badge ${config.class}`}>
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
            className="manage-posts-action-btn restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore Post"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className={`manage-posts-action-btn delete ${!canDeletePost(post) ? 'disabled' : ''}`}
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
            className={`manage-posts-action-btn remove ${!canRemovePost(post) ? 'disabled' : ''}`}
            onClick={() => canRemovePost(post) && handlePostAction(post.id, 'remove')}
            title={!canRemovePost(post) ? 
              `Need ${REPORT_THRESHOLDS.CAN_REMOVE}+ reports to remove` 
              : "Remove Post"}
            disabled={!canRemovePost(post)}
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          <button
            className="manage-posts-action-btn restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore to Active"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className={`manage-posts-action-btn delete ${!canDeletePost(post) ? 'disabled' : ''}`}
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
            className="manage-posts-action-btn resolve"
            onClick={() => handlePostAction(post.id, 'resolve')}
            title="Mark as Resolved"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>
          <button
            className={`manage-posts-action-btn remove ${!canRemovePost(post) ? 'disabled' : ''}`}
            onClick={() => canRemovePost(post) && handlePostAction(post.id, 'remove')}
            title={!canRemovePost(post) ? 
              `Need ${REPORT_THRESHOLDS.CAN_REMOVE}+ reports to remove` 
              : "Remove Post"}
            disabled={!canRemovePost(post)}
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          <button
            className={`manage-posts-action-btn delete ${!canDeletePost(post) ? 'disabled' : ''}`}
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
            className="manage-posts-modal-btn restore"
            onClick={() => handleModalAction('restore')}
          >
            <FontAwesomeIcon icon={faUndo} />
            Restore Post
          </button>
          <button
            className={`manage-posts-modal-btn delete ${!canDeletePost(post) ? 'disabled' : ''}`}
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
            className={`manage-posts-modal-btn remove ${!canRemovePost(post) ? 'disabled' : ''}`}
            onClick={() => canRemovePost(post) && handleModalAction('remove')}
            disabled={!canRemovePost(post)}
            title={!canRemovePost(post) ? `Need ${REPORT_THRESHOLDS.CAN_REMOVE}+ reports to remove` : ''}
          >
            <FontAwesomeIcon icon={faBan} />
            Remove Post
          </button>
          <button
            className="manage-posts-modal-btn restore"
            onClick={() => handleModalAction('restore')}
          >
            <FontAwesomeIcon icon={faUndo} />
            Restore to Active
          </button>
          <button
            className={`manage-posts-modal-btn delete ${!canDeletePost(post) ? 'disabled' : ''}`}
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
            className="manage-posts-modal-btn resolve"
            onClick={() => handleModalAction('resolve')}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            Mark as Resolved
          </button>
          <button
            className={`manage-posts-modal-btn remove ${!canRemovePost(post) ? 'disabled' : ''}`}
            onClick={() => canRemovePost(post) && handleModalAction('remove')}
            disabled={!canRemovePost(post)}
            title={!canRemovePost(post) ? `Need ${REPORT_THRESHOLDS.CAN_REMOVE}+ reports to remove` : ''}
          >
            <FontAwesomeIcon icon={faBan} />
            Remove Post
          </button>
          <button
            className={`manage-posts-modal-btn delete ${!canDeletePost(post) ? 'disabled' : ''}`}
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

  // 🆕 UPDATED: Mobile card view with user navigation and highlighting
  const MobilePostCard = ({ post }) => (
    <div 
      className={`manage-posts-mobile-card ${highlightedPost === post.id ? 'manage-posts-highlighted' : ''}`}
      data-post-id={post.id} // 🆕 ADDED for auto-scroll
    >
      <div className="manage-posts-mobile-header">
        <div className="manage-posts-mobile-title">
          <h3>
            {post.title}
            <FontAwesomeIcon 
              icon={faExternalLinkAlt} 
              className="manage-posts-external-link-icon"
              title="Click to view post details"
            />
          </h3>
          <div 
            className="manage-posts-mobile-author clickable-user"
            onClick={() => navigateToUser(post.user_id, `${post.first_name} ${post.last_name}`)}
            title="Click to view user in Manage Users"
          >
            <FontAwesomeIcon icon={faUser} />
            by {post.first_name} {post.last_name}
          </div>
        </div>
        <div className="manage-posts-mobile-badges">
          <span className={`manage-posts-mobile-status ${getStatusClass(post.status)}`}>
            <FontAwesomeIcon icon={getStatusIcon(post.status)} />
            {post.status}
          </span>
          <span className={`manage-posts-mobile-type ${getTypeClass(post.type)}`}>
            {post.type}
          </span>
        </div>
      </div>
      
      <div className="manage-posts-mobile-details">
        <div className="manage-posts-mobile-detail">
          <FontAwesomeIcon icon={faTag} />
          <span>ID: #{post.id}</span>
        </div>
        <div className="manage-posts-mobile-detail">
          <FontAwesomeIcon icon={faList} />
          <span>{post.category_name}</span>
        </div>
        <div className="manage-posts-mobile-detail">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span>{renderLocationInfo(post)}</span>
        </div>
        <div className="manage-posts-mobile-detail">
          <FontAwesomeIcon icon={faCalendar} />
          <span>{formatDate(post.created_at)}</span>
        </div>
        <div className="manage-posts-mobile-detail">
          <FontAwesomeIcon icon={faFlag} />
          <span>Total Reports: {post.total_report_count || 0}</span>
        </div>
      </div>

      {/* 🎯 ADDED: Report severity badge for mobile */}
      <div className="manage-posts-mobile-report-severity">
        <ReportSeverityBadge post={post} />
      </div>
      
      <div className="manage-posts-mobile-actions">
        <button 
          className="manage-posts-mobile-btn view"
          onClick={() => openViewModal(post)}
        >
          <FontAwesomeIcon icon={faEye} />
          View
        </button>
        {getActionButtons(post)}
      </div>
    </div>
  );

  // Get status icon (like ManageUsers)
  const getStatusIcon = (status) => {
    const iconMap = {
      'Active': faCheckCircle,
      'Removed': faBan,
      'Resolved': faCheckCircle
    };
    return iconMap[status] || faCheckCircle;
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`manage-posts-toast manage-posts-toast-${toast.type}`}>
          <div className="manage-posts-toast-content">
            <FontAwesomeIcon 
              icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="manage-posts-toast-icon" 
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="manage-posts-header">
        <div className="manage-posts-header-content">
          <p>Review and moderate community posts</p>
        </div>
        <button 
          className="manage-posts-refresh-btn"
          onClick={handleManualRefresh}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* 🆕 ENHANCED: User Filter Banner with Brown Theme */}
      {userFilter && (
        <div className="manage-posts-user-filter-banner">
          <div className="manage-posts-user-filter-content">
            <div className="manage-posts-user-filter-info">
              <FontAwesomeIcon icon={faUser} />
              <span>Showing posts by: <strong>{userName}</strong></span>
            </div>
            <button 
              className="manage-posts-user-filter-clear"
              onClick={clearUserFilter}
              title="Clear user filter"
            >
              <FontAwesomeIcon icon={faTimes} />
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* 🆕 ENHANCED: Highlighted Post Banner with Brown Theme */}
      {highlightedPost && (
        <div className="manage-posts-highlight-banner">
          <div className="manage-posts-highlight-content">
            <div className="manage-posts-highlight-info">
              <FontAwesomeIcon icon={faFlag} />
              <span>Highlighted Post: <strong>#{highlightedPost}</strong></span>
            </div>
            <button 
              className="manage-posts-highlight-clear"
              onClick={clearHighlightedPost}
              title="Clear highlight"
            >
              <FontAwesomeIcon icon={faTimes} />
              Clear Highlight
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="manage-posts-stats">
        <div 
          className={`manage-posts-stat-card ${statusFilter === 'all' && typeFilter === 'all' && !userFilter && !highlightedPost ? 'manage-posts-stat-active' : ''}`}
          onClick={() => handleStatCardClick('all', 'all')}
          style={{ cursor: 'pointer' }}
        >
          <span className="manage-posts-stat-number">{posts.length}</span>
          <span className="manage-posts-stat-label">Total Posts</span>
        </div>
        <div 
          className={`manage-posts-stat-card ${statusFilter === 'Active' ? 'manage-posts-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'Active')}
          style={{ cursor: 'pointer' }}
        >
          <span className="manage-posts-stat-number">{posts.filter(p => p.status === 'Active').length}</span>
          <span className="manage-posts-stat-label">Active</span>
        </div>
        <div 
          className={`manage-posts-stat-card ${statusFilter === 'Resolved' ? 'manage-posts-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'Resolved')}
          style={{ cursor: 'pointer' }}
        >
          <span className="manage-posts-stat-number">{posts.filter(p => p.status === 'Resolved').length}</span>
          <span className="manage-posts-stat-label">Resolved</span>
        </div>
        <div 
          className={`manage-posts-stat-card ${statusFilter === 'Removed' ? 'manage-posts-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'Removed')}
          style={{ cursor: 'pointer' }}
        >
          <span className="manage-posts-stat-number">{posts.filter(p => p.status === 'Removed').length}</span>
          <span className="manage-posts-stat-label">Removed</span>
        </div>
        
        {Object.entries(typeStats).map(([type, count]) => (
          count > 0 && (
            <div 
              key={type}
              className={`manage-posts-stat-card ${getStatCardClass(type)} ${typeFilter === type ? 'manage-posts-stat-active' : ''}`}
              onClick={() => handleStatCardClick('type', type)}
              style={{ cursor: 'pointer' }}
            >
              <span className="manage-posts-stat-number">{count}</span>
              <span className="manage-posts-stat-label">{type}</span>
            </div>
          )
        ))}
      </div>

      {/* Filters and Search */}
      <div className="manage-posts-filters">
        <div className="manage-posts-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search posts, authors, types, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="manage-posts-filter-group">
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

        <div className="manage-posts-filter-group">
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

        <div className="manage-posts-filter-group">
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
            className="manage-posts-clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}

        {selectedPosts.size > 0 && (
          <div className="manage-posts-bulk-actions">
            <span>{selectedPosts.size} selected</span>
            <button 
              className="manage-posts-bulk-btn remove"
              onClick={() => handleBulkAction('remove')}
            >
              <FontAwesomeIcon icon={faBan} />
              Remove
            </button>
            <button 
              className="manage-posts-bulk-btn restore"
              onClick={() => handleBulkAction('restore')}
            >
              <FontAwesomeIcon icon={faUndo} />
              Restore
            </button>
            <button 
              className="manage-posts-bulk-btn delete"
              onClick={() => handleBulkAction('delete')}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* 🎯 MOVED: Report Thresholds Info - NOW AFTER FILTERS (Same as ManageUsers) */}
      <div className="manage-posts-thresholds-info">
        <h3>Post Report Thresholds:</h3>
        <div className="manage-posts-thresholds-grid">
          <div className="manage-posts-threshold-item">
            <span className="manage-posts-threshold-badge manage-posts-threshold-remove">⏸️</span>
            <span className="manage-posts-threshold-text">
              <strong>{REPORT_THRESHOLDS.CAN_REMOVE}+ Total Reports:</strong> Can remove post from public view
            </span>
          </div>
          <div className="manage-posts-threshold-item"> 
            <span className="manage-posts-threshold-badge manage-posts-threshold-delete">🚫</span>
            <span className="manage-posts-threshold-text">
              <strong>{REPORT_THRESHOLDS.CAN_DELETE}+ Total Reports:</strong> Can permanently delete post
            </span>
          </div>
        </div>
      </div>

      {/* 🆕 UPDATED: Posts Table with scroll refs */}
      <div className='manage-posts-table-container' ref={tableContainerRef}>
        <div className='manage-posts-table-inner'>
          <div className='manage-posts-table-content'>
            <div className='manage-posts-table-header'>
              <h2>Posts Management</h2>
              <div className="manage-posts-header-info">
                <span className="manage-posts-count">
                  {filteredPosts.length} of {posts.length} post{filteredPosts.length !== 1 ? 's' : ''}
                  {isFilterActive() && ' (Filtered)'}
                  {userFilter && ` - User: ${userName}`}
                  {highlightedPost && ` - Highlighted: #${highlightedPost}`}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="manage-posts-loading-state">
                <div className="manage-posts-loading-spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="manage-posts-empty-state">
                <p>
                  {posts.length === 0 
                    ? "No posts have been created yet." 
                    : "No posts match your search criteria."
                  }
                </p>
                {isFilterActive() && (
                  <button 
                    className="manage-posts-retry-btn" 
                    onClick={clearAllFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div 
                  className="manage-posts-table-wrapper" 
                  style={{ display: viewMode === 'table' ? 'block' : 'none' }}
                  ref={tableWrapperRef} // 🆕 ADDED: Horizontal scroll container ref
                >
                  <table className='manage-posts-table'>
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
                        <tr 
                          key={post.id} 
                          className={`${selectedPosts.has(post.id) ? 'manage-posts-row-selected' : ''} ${
                            highlightedPost === post.id ? 'manage-posts-highlighted' : ''
                          } manage-posts-clickable-row`}
                          data-post-id={post.id} // 🆕 ADDED for auto-scroll
                          onClick={() => openViewModal(post)}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedPosts.has(post.id)}
                              onChange={() => togglePostSelection(post.id)}
                            />
                          </td>
                          <td className="manage-posts-id">#{post.id}</td>
                          <td>
                            <div className="manage-posts-user-info">
                              <strong>
                                {post.title}
                                <FontAwesomeIcon 
                                  icon={faExternalLinkAlt} 
                                  className="manage-posts-external-link-icon"
                                  title="Click to view post details"
                                />
                              </strong>
                              <div 
                                className="manage-posts-author clickable-user"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToUser(post.user_id, `${post.first_name} ${post.last_name}`);
                                }}
                                title="Click to view user in Manage Users"
                              >
                                <FontAwesomeIcon icon={faUser} />
                                by {post.first_name} {post.last_name}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`manage-posts-type-badge ${getTypeClass(post.type)}`}>
                              {post.type}
                            </span>
                          </td>
                          <td>{post.category_name}</td>
                          <td>
                            <div className="manage-posts-location-info">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="manage-posts-location-icon" />
                              <span>{renderLocationInfo(post)}</span>
                            </div>
                          </td>
                          <td>{formatDate(post.created_at)}</td>
                          <td>
                            <span className={`manage-posts-status-badge ${getStatusClass(post.status)}`}>
                              <FontAwesomeIcon icon={getStatusIcon(post.status)} />
                              {post.status}
                            </span>
                          </td>
                          <td>
                            <span className="manage-posts-report-count">
                              {post.total_report_count || 0}
                            </span>
                          </td>
                          <td>
                            <ReportSeverityBadge post={post} />
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className='manage-posts-actions'>
                              <button
                                className="manage-posts-action-btn view"
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
                <div className="manage-posts-mobile-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
                  {filteredPosts.map(post => (
                    <MobilePostCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* View Post Modal */}
      {viewModal.isOpen && viewModal.post && (
        <div className="manage-posts-modal-overlay">
          <div className="manage-posts-modal-content">
            <div className="manage-posts-modal-header">
              <h3>View Post</h3>
              <button 
                className="manage-posts-modal-close"
                onClick={closeModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="manage-posts-modal-body">
              {/* 🎯 ADDED: Report Statistics in Modal */}
              <div className="manage-posts-user-report-stats">
                <h4>Post Report Statistics:</h4>
                <div className="manage-posts-report-stats-grid">
                  <div className="manage-posts-report-stat">
                    <span className="manage-posts-stat-label">Total Reports:</span>
                    <span className="manage-posts-stat-value">{viewModal.post.total_report_count || 0}</span>
                  </div>
                  <div className="manage-posts-report-stat">
                    <span className="manage-posts-stat-label">Risk Level:</span>
                    <span className="manage-posts-stat-value">
                      <ReportSeverityBadge post={viewModal.post} />
                    </span>
                  </div>
                </div>
              </div>

              {getPhotoUrl(viewModal.post) && (
                <div className="manage-posts-photo-container">
                  <label>Post Photo:</label>
                  <div className="manage-posts-photo">
                    <img
                      src={getPhotoUrl(viewModal.post)}
                      alt={viewModal.post.title}
                      className="manage-posts-photo-display"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="manage-posts-photo-fallback" style={{ display: 'none' }}>
                      <FontAwesomeIcon icon={faImage} />
                      <span>Photo not available</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="manage-posts-details">
                <div className="manage-posts-detail-row">
                  <label>Title:</label>
                  <span>{viewModal.post.title}</span>
                </div>
                <div className="manage-posts-detail-row">
                  <label>Author:</label>
                  <div 
                    className="clickable-user"
                    onClick={() => navigateToUser(viewModal.post.user_id, `${viewModal.post.first_name} ${viewModal.post.last_name}`)}
                    title="Click to view user in Manage Users"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    {viewModal.post.first_name} {viewModal.post.last_name}
                  </div>
                </div>
                <div className="manage-posts-detail-row">
                  <label>Type:</label>
                  <span className={`manage-posts-type-badge ${getTypeClass(viewModal.post.type)}`}>
                    {viewModal.post.type}
                  </span>
                </div>
                <div className="manage-posts-detail-row">
                  <label>Category:</label>
                  <span>{viewModal.post.category_name}</span>
                </div>
                <div className="manage-posts-detail-row">
                  <label>Location:</label>
                  <span>{renderLocationInfo(viewModal.post)}</span>
                </div>
                <div className="manage-posts-detail-row">
                  <label>Status:</label>
                  <span className={`manage-posts-status-badge ${getStatusClass(viewModal.post.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(viewModal.post.status)} />
                    {viewModal.post.status}
                  </span>
                </div>
                <div className="manage-posts-detail-row">
                  <label>Date Posted:</label>
                  <span>{formatDate(viewModal.post.created_at)}</span>
                </div>
                <div className="manage-posts-detail-row manage-posts-full-width">
                  <label>Description:</label>
                  <div className="manage-posts-description">
                    {viewModal.post.description}
                  </div>
                </div>
                {viewModal.post.color && (
                  <div className="manage-posts-detail-row">
                    <label>Color:</label>
                  <span>{viewModal.post.color}</span>
                </div>
                )}
                <div className="manage-posts-detail-row manage-posts-full-width">
                  <label>Contact Info:</label>
                  <div className="manage-posts-contact-info">
                    {viewModal.post.contact_info}
                  </div>
                </div>
              </div>
            </div>
            <div className="manage-posts-modal-footer">
              <div className="manage-posts-modal-actions">
                {renderModalActions(viewModal.post)}
                <button className="manage-posts-modal-btn manage-posts-modal-close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for ALL Actions */}
      {confirmationModal.isOpen && (
        <div className="manage-posts-modal-overlay">
          <div className="manage-posts-modal-content">
            <div className="manage-posts-modal-header">
              <h3>{confirmationModal.title}</h3>
              <button 
                className="manage-posts-modal-close"
                onClick={closeModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="manage-posts-modal-body">
              <div className="manage-posts-confirmation-content">
                <div className="manage-posts-warning-icon-large">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <p>{confirmationModal.message}</p>
                
                {/* 🎯 ADDED: Report stats in confirmation modal */}
                {confirmationModal.post && (
                  <div className="manage-posts-confirmation-stats">
                    <p><strong>Current Reports:</strong> {confirmationModal.post.total_report_count || 0}</p>
                    <p><strong>Required for this action:</strong> {
                      confirmationModal.action === 'remove' ? REPORT_THRESHOLDS.CAN_REMOVE :
                      confirmationModal.action === 'delete' ? REPORT_THRESHOLDS.CAN_DELETE : 0
                    }+ reports</p>
                  </div>
                )}

                {confirmationModal.action === 'delete' && (
                  <div className="manage-posts-deletion-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>This action cannot be undone!</span>
                  </div>
                )}
              </div>
            </div>
            <div className="manage-posts-modal-footer">
              <button 
                className="manage-posts-btn-secondary"
                onClick={closeModal}
                disabled={confirmationModal.isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`manage-posts-btn-primary ${
                  confirmationModal.action === 'delete' ? 'delete' :
                  confirmationModal.action === 'remove' ? 'remove' :
                  confirmationModal.action === 'restore' ? 'restore' :
                  'resolve'
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