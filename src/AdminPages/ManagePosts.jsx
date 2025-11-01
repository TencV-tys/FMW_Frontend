import { useState, useEffect } from 'react';
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
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import './styles/ManagePosts.css';

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [viewMode, setViewMode] = useState('table');
  const [viewModal, setViewModal] = useState({ isOpen: false, post: null });
  const [actionModal, setActionModal] = useState({ 
    isOpen: false, 
    post: null, 
    action: '', 
    message: '', 
    monthlyReportCount: 0,
    totalReportCount: 0,
    requiredCount: 0,
    requiresForce: false
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    post: null,
    action: '',
    title: '',
    message: ''
  });

  // Fetch posts data
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/posts', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
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
    setActionModal({ isOpen: false, post: null, action: '', message: '', monthlyReportCount: 0, totalReportCount: 0, requiredCount: 0, requiresForce: false });
    setConfirmationModal({ isOpen: false, post: null, action: '', title: '', message: '' });
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
      message
    });
  };

  // Handle post actions with confirmation modal
  const handlePostAction = async (postId, action, force = false) => {
    const post = posts.find(p => p.id === postId);
    
    // Show confirmation modal first for ALL actions
    if (!force) {
      showConfirmationModal(post, action);
      return;
    }

    // If force is true, execute the action directly
    await executePostAction(postId, action, force);
  };

  // Execute post action after confirmation
  const executePostAction = async (postId, action, force = false) => {
    try {
      let url, method, body;
      
      switch (action) {
        case 'remove':
          url = `http://localhost:8000/api/admin/posts/${postId}/remove`;
          method = 'PUT';
          body = { reason: 'Violation of community guidelines', force };
          break;
        case 'delete':
          url = `http://localhost:8000/api/admin/posts/${postId}`;
          method = 'DELETE';
          body = { reason: 'Severe violation', force };
          break;
        case 'restore':
          url = `http://localhost:8000/api/admin/posts/${postId}/restore`;
          method = 'PUT';
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
            successMessage = `Post removed from public view${data.forced ? ' (admin override)' : ''}!`;
            break;
          case 'delete':
            successMessage = `Post deleted permanently${data.forced ? ' (admin override)' : ''}!`;
            break;
          case 'restore':
            successMessage = 'Post restored successfully!';
            break;
          case 'resolve':
            successMessage = 'Post marked as resolved!';
            break;
        }
        alert(successMessage);
        closeModal();
      } else {
        if (data.canForce) {
          setActionModal({
            isOpen: true,
            post: posts.find(p => p.id === postId),
            action: action,
            message: data.error,
            monthlyReportCount: data.monthlyReportCount,
            totalReportCount: data.totalReportCount,
            requiredCount: data.requiredCount,
            requiresForce: true
          });
        } else {
          alert(data.error || 'Failed to perform action');
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error performing action');
    }
  };

  // Handle confirmed action from confirmation modal
  const handleConfirmedAction = () => {
    if (confirmationModal.post && confirmationModal.action) {
      executePostAction(confirmationModal.post.id, confirmationModal.action, false);
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

  // Handle force action from modal
  const handleForceAction = () => {
    if (actionModal.post && actionModal.action) {
      executePostAction(actionModal.post.id, actionModal.action, true);
    }
  };

  // Handle cancel from modal
  const handleCancelAction = () => {
    closeModal();
  };

  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.barangay_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.purok_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Bulk actions with confirmation
  const handleBulkAction = async (action) => {
    if (selectedPosts.size === 0) return;

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
      alert(`${selectedPosts.size} post(s) ${actionText}d successfully!`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
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
    if (selectedPosts.size === filteredPosts.length) {
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

  // Get status badge class - UNIQUE NAMES
  const getStatusClass = (status) => {
    const statusMap = {
      'Active': 'posts-status-active',
      'Removed': 'posts-status-removed',
      'Resolved': 'posts-status-resolved'
    };
    return statusMap[status] || 'posts-status-active';
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
  const handleStatCardClick = (status) => {
    setStatusFilter(status === 'all' ? 'all' : status);
  };

  // Get action buttons based on post status
  const getActionButtons = (post) => {
    if (post.status === 'Removed') {
      return (
        <>
          <button
            className="posts-action-btn posts-action-restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore Post"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className="posts-action-btn posts-action-delete"
            onClick={() => handlePostAction(post.id, 'delete')}
            title="Delete Permanently"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    } else if (post.status === 'Resolved') {
      return (
        <>
          <button
            className="posts-action-btn posts-action-remove"
            onClick={() => handlePostAction(post.id, 'remove')}
            title="Remove Post"
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          <button
            className="posts-action-btn posts-action-restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore to Active"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className="posts-action-btn posts-action-delete"
            onClick={() => handlePostAction(post.id, 'delete')}
            title="Delete Permanently"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            className="posts-action-btn posts-action-resolve"
            onClick={() => handlePostAction(post.id, 'resolve')}
            title="Mark as Resolved"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>
          <button
            className="posts-action-btn posts-action-remove"
            onClick={() => handlePostAction(post.id, 'remove')}
            title="Remove Post"
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          <button
            className="posts-action-btn posts-action-delete"
            onClick={() => handlePostAction(post.id, 'delete')}
            title="Delete Permanently"
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
      closeModal();
    }
  };

  // Mobile card view
  const MobilePostCard = ({ post }) => (
    <div className="posts-mobile-card">
      <div className="posts-mobile-header">
        <div className="posts-mobile-title">
          <h3>{post.title}</h3>
          <div className="posts-mobile-author">
            by {post.first_name} {post.last_name}
          </div>
        </div>
        <span className={`posts-mobile-status ${getStatusClass(post.status)}`}>
          {post.status}
        </span>
      </div>
      
      <div className="posts-mobile-details">
        <div className="posts-mobile-detail">
          <span className="posts-detail-label">ID</span>
          <span className="posts-detail-value">#{post.id}</span>
        </div>
        <div className="posts-mobile-detail">
          <span className="posts-detail-label">Category</span>
          <span className="posts-detail-value">{post.category_name}</span>
        </div>
        <div className="posts-mobile-detail">
          <span className="posts-detail-label">Location</span>
          <span className="posts-detail-value">{renderLocationInfo(post)}</span>
        </div>
        <div className="posts-mobile-detail">
          <span className="posts-detail-label">Date</span>
          <span className="posts-detail-value">{formatDate(post.created_at)}</span>
        </div>
      </div>
      
      <div className="posts-mobile-actions">
        <button 
          className="posts-mobile-btn posts-mobile-view"
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
      {/* Header Section */}
      <div className="posts-management-header">
        <div className="posts-header-content">
          
          <p>Review and moderate community posts</p>
        </div>
        <button 
          className="posts-refresh-btn"
          onClick={fetchPosts}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="posts-management-filters">
        <div className="posts-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search posts, authors, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="posts-filter-group">
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

        {/* View Toggle for Mobile */}
        <div className="posts-filter-group">
          <FontAwesomeIcon icon={faList} />
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="table">Table View</option>
            <option value="card">Card View</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.size > 0 && (
          <div className="posts-bulk-actions">
            <span>{selectedPosts.size} selected</span>
            <button 
              className="posts-bulk-btn posts-bulk-remove"
              onClick={() => handleBulkAction('remove')}
            >
              <FontAwesomeIcon icon={faBan} />
              Remove
            </button>
            <button 
              className="posts-bulk-btn posts-bulk-restore"
              onClick={() => handleBulkAction('restore')}
            >
              <FontAwesomeIcon icon={faUndo} />
              Restore
            </button>
            <button 
              className="posts-bulk-btn posts-bulk-delete"
              onClick={() => handleBulkAction('delete')}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="posts-management-stats">
        <div 
          className={`posts-stat-card ${statusFilter === 'all' ? 'posts-stat-active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
        >
          <span className="posts-stat-number">{posts.length}</span>
          <span className="posts-stat-label">Total Posts</span>
        </div>
        <div 
          className={`posts-stat-card ${statusFilter === 'Active' ? 'posts-stat-active' : ''}`}
          onClick={() => handleStatCardClick('Active')}
          style={{ cursor: 'pointer' }}
        >
          <span className="posts-stat-number">{posts.filter(p => p.status === 'Active').length}</span>
          <span className="posts-stat-label">Active</span>
        </div>
        <div 
          className={`posts-stat-card ${statusFilter === 'Resolved' ? 'posts-stat-active' : ''}`}
          onClick={() => handleStatCardClick('Resolved')}
          style={{ cursor: 'pointer' }}
        >
          <span className="posts-stat-number">{posts.filter(p => p.status === 'Resolved').length}</span>
          <span className="posts-stat-label">Resolved</span>
        </div>
        <div 
          className={`posts-stat-card ${statusFilter === 'Removed' ? 'posts-stat-active' : ''}`}
          onClick={() => handleStatCardClick('Removed')}
          style={{ cursor: 'pointer' }}
        >
          <span className="posts-stat-number">{posts.filter(p => p.status === 'Removed').length}</span>
          <span className="posts-stat-label">Removed</span>
        </div>
      </div>

      {/* Posts Table */}
      <div className='posts-management-table-container'>
        <div className='posts-management-table-content'>
          <div className='posts-management-table-title'>
            <h2>Posts Management</h2>
            <span className="posts-management-count">
              {filteredPosts.length} of {posts.length} posts
              {statusFilter !== 'all' && ` (Filtered by: ${statusFilter})`}
            </span>
          </div>

          {loading ? (
            <div className="posts-loading-state">
              <div className="posts-loading-spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="posts-empty-state">
              <p>No posts found matching your criteria.</p>
              {statusFilter !== 'all' && (
                <button 
                  className="posts-retry-btn" 
                  onClick={() => setStatusFilter('all')}
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="posts-table-wrapper" style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                <table className='posts-management-table'>
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
                      <th>Category</th>
                      <th>Location</th>
                      <th>Date Posted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map(post => (
                      <tr key={post.id} className={selectedPosts.has(post.id) ? 'posts-row-selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedPosts.has(post.id)}
                            onChange={() => togglePostSelection(post.id)}
                          />
                        </td>
                        <td className="posts-id">#{post.id}</td>
                        <td>
                          <div className="posts-title-author">
                            <strong className="posts-title">{post.title}</strong>
                            <span className="posts-author">
                              by {post.first_name} {post.last_name}
                            </span>
                          </div>
                        </td>
                        <td>{post.category_name}</td>
                        <td>
                          <div className="posts-location-info">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="posts-location-icon" />
                            <span>{renderLocationInfo(post)}</span>
                          </div>
                        </td>
                        <td>{formatDate(post.created_at)}</td>
                        <td>
                          <span className={`posts-status-badge ${getStatusClass(post.status)}`}>
                            {post.status}
                          </span>
                        </td>
                        <td>
                          <div className='posts-management-actions'>
                            <button
                              className="posts-action-btn posts-action-view"
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
              <div className="posts-mobile-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
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
        <div className="posts-modal-overlay" onClick={closeModal}>
          <div className="posts-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="posts-modal-header">
              <h2>View Post</h2>
              <button className="posts-modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="posts-modal-body">
              {/* Photo Display */}
              {getPhotoUrl(viewModal.post) && (
                <div className="posts-photo-container">
                  <label>Post Photo:</label>
                  <div className="posts-photo">
                    <img
                      src={getPhotoUrl(viewModal.post)}
                      alt={viewModal.post.title}
                      className="posts-photo-display"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="posts-photo-fallback" style={{ display: 'none' }}>
                      <FontAwesomeIcon icon={faImage} />
                      <span>Photo not available</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="posts-details">
                <div className="posts-detail-row">
                  <label>Title:</label>
                  <span>{viewModal.post.title}</span>
                </div>
                <div className="posts-detail-row">
                  <label>Author:</label>
                  <span>{viewModal.post.first_name} {viewModal.post.last_name}</span>
                </div>
                <div className="posts-detail-row">
                  <label>Category:</label>
                  <span>{viewModal.post.category_name}</span>
                </div>
                <div className="posts-detail-row">
                  <label>Location:</label>
                  <span>{renderLocationInfo(viewModal.post)}</span>
                </div>
                <div className="posts-detail-row">
                  <label>Status:</label>
                  <span className={`posts-status-badge ${getStatusClass(viewModal.post.status)}`}>
                    {viewModal.post.status}
                  </span>
                </div>
                <div className="posts-detail-row">
                  <label>Date Posted:</label>
                  <span>{formatDate(viewModal.post.created_at)}</span>
                </div>
                <div className="posts-detail-row posts-full-width">
                  <label>Description:</label>
                  <div className="posts-description">
                    {viewModal.post.description}
                  </div>
                </div>
                {viewModal.post.color && (
                  <div className="posts-detail-row">
                    <label>Color:</label>
                  <span>{viewModal.post.color}</span>
                </div>
              )}
              <div className="posts-detail-row posts-full-width">
                <label>Contact Info:</label>
                <div className="posts-contact-info">
                  {viewModal.post.contact_info}
                </div>
              </div>
            </div>
            </div>
            <div className="posts-modal-footer">
              <div className="posts-modal-actions">
                {/* Action buttons in modal */}
                {viewModal.post.status === 'Removed' && (
                  <>
                    <button
                      className="posts-modal-btn posts-modal-restore"
                      onClick={() => handleModalAction('restore')}
                    >
                      <FontAwesomeIcon icon={faUndo} />
                      Restore Post
                    </button>
                    <button
                      className="posts-modal-btn posts-modal-delete"
                      onClick={() => handleModalAction('delete')}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete Permanently
                    </button>
                  </>
                )}
                {viewModal.post.status === 'Resolved' && (
                  <>
                    <button
                      className="posts-modal-btn posts-modal-remove"
                      onClick={() => handleModalAction('remove')}
                    >
                      <FontAwesomeIcon icon={faBan} />
                      Remove Post
                    </button>
                    <button
                      className="posts-modal-btn posts-modal-restore"
                      onClick={() => handleModalAction('restore')}
                    >
                      <FontAwesomeIcon icon={faUndo} />
                      Restore to Active
                    </button>
                    <button
                      className="posts-modal-btn posts-modal-delete"
                      onClick={() => handleModalAction('delete')}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete Permanently
                    </button>
                  </>
                )}
                {viewModal.post.status === 'Active' && (
                  <>
                    <button
                      className="posts-modal-btn posts-modal-resolve"
                      onClick={() => handleModalAction('resolve')}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Mark as Resolved
                    </button>
                    <button
                      className="posts-modal-btn posts-modal-remove"
                      onClick={() => handleModalAction('remove')}
                    >
                      <FontAwesomeIcon icon={faBan} />
                      Remove Post
                    </button>
                    <button
                      className="posts-modal-btn posts-modal-delete"
                      onClick={() => handleModalAction('delete')}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete Permanently
                    </button>
                  </>
                )}
                <button className="posts-modal-btn posts-modal-close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for ALL Actions */}
      {confirmationModal.isOpen && (
        <div className="posts-modal-overlay" onClick={closeModal}>
          <div className="posts-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="posts-modal-header">
              <h2>{confirmationModal.title}</h2>
              <button className="posts-modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="posts-modal-body">
              <div className="posts-confirmation-content">
                <div className="posts-warning-icon-large">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <p>{confirmationModal.message}</p>
                {confirmationModal.action === 'delete' && (
                  <div className="posts-deletion-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>This action cannot be undone!</span>
                  </div>
                )}
              </div>
            </div>
            <div className="posts-modal-footer">
              <button 
                className="posts-modal-btn posts-modal-cancel" 
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
                className={`posts-modal-btn ${
                  confirmationModal.action === 'delete' ? 'posts-modal-delete' :
                  confirmationModal.action === 'remove' ? 'posts-modal-remove' :
                  confirmationModal.action === 'restore' ? 'posts-modal-restore' :
                  'posts-modal-resolve'
                }`} 
                onClick={handleConfirmedAction}
              >
                {confirmationModal.action === 'remove' && 'Remove Post'}
                {confirmationModal.action === 'delete' && 'Delete Permanently'}
                {confirmationModal.action === 'restore' && 'Restore Post'}
                {confirmationModal.action === 'resolve' && 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Validation Modal (for low reports) */}
      {actionModal.isOpen && (
        <div className="posts-modal-overlay" onClick={closeModal}>
          <div className="posts-modal-content posts-report-validation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="posts-modal-header posts-warning-header">
              <h2>
                <FontAwesomeIcon icon={faExclamationTriangle} className="posts-warning-icon" />
                Action Requires Review
              </h2>
              <button className="posts-modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="posts-modal-body">
              <div className="posts-report-validation-content">
                <div className="posts-warning-message">
                  <p>{actionModal.message}</p>
                </div>
                
                <div className="posts-report-stats">
                  <div className="posts-stat-item">
                    <FontAwesomeIcon icon={faFlag} className="posts-stat-icon" />
                    <span className="posts-stat-label">Monthly Reports:</span>
                    <span className="posts-stat-value">{actionModal.monthlyReportCount}</span>
                  </div>
                  <div className="posts-stat-item">
                    <FontAwesomeIcon icon={faCheckCircle} className="posts-stat-icon posts-required" />
                    <span className="posts-stat-label">Required Monthly:</span>
                    <span className="posts-stat-value">{actionModal.requiredCount}</span>
                  </div>
                  <div className="posts-stat-item">
                    <FontAwesomeIcon icon={faHistory} className="posts-stat-icon" />
                    <span className="posts-stat-label">All-Time Reports:</span>
                    <span className="posts-stat-value">{actionModal.totalReportCount}</span>
                  </div>
                </div>

                <div className="posts-preview">
                  <h4>Post Details:</h4>
                  <div className="posts-preview-content">
                    <p><strong>Title:</strong> {actionModal.post?.title}</p>
                    <p><strong>Author:</strong> {actionModal.post?.first_name} {actionModal.post?.last_name}</p>
                    <p><strong>Status:</strong> 
                      <span className={`posts-status-badge ${getStatusClass(actionModal.post?.status)}`}>
                        {actionModal.post?.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="posts-action-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <p>
                    <strong>Warning:</strong> Proceeding with this action will override the community reporting system. 
                    This should only be done in cases of severe policy violations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="posts-modal-footer">
              <button 
                className="posts-modal-btn posts-modal-cancel" 
                onClick={handleCancelAction}
              >
                Cancel Action
              </button>
              <button 
                className="posts-modal-btn posts-modal-force" 
                onClick={handleForceAction}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Force {actionModal.action === 'remove' ? 'Remove' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}