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
  faFlag
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
    reportCount: 0, 
    requiredCount: 0 
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
    setActionModal({ isOpen: false, post: null, action: '', message: '', reportCount: 0, requiredCount: 0 });
  };

  // Handle post actions with report validation modal
  const handlePostAction = async (postId, action, force = false) => {
    if (force) {
      await executePostAction(postId, action, force);
      return;
    }

    try {
      let url, method, body;
      
      switch (action) {
        case 'remove':
          url = `http://localhost:8000/api/admin/posts/${postId}/remove`;
          method = 'PUT';
          body = { reason: 'Violation of community guidelines', force: false };
          break;
        case 'delete':
          url = `http://localhost:8000/api/admin/posts/${postId}`;
          method = 'DELETE';
          body = { reason: 'Severe violation', force: false };
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
      } else {
        if (data.canForce) {
          setActionModal({
            isOpen: true,
            post: posts.find(p => p.id === postId),
            action: action,
            message: data.error,
            reportCount: data.reportCount,
            requiredCount: data.requiredCount
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

  // Execute post action
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

      if (response.ok) {
        updatePostsAfterAction(postId, action);
        let successMessage = '';
        switch (action) {
          case 'remove':
            successMessage = `Post removed from public view${force ? ' (admin override)' : ''}!`;
            break;
          case 'delete':
            successMessage = `Post deleted permanently${force ? ' (admin override)' : ''}!`;
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
        const data = await response.json();
        alert(data.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error performing action');
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
        handlePostAction(postId, action)
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

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      'Active': 'status-active',
      'Removed': 'status-removed',
      'Resolved': 'status-resolved'
    };
    return statusMap[status] || 'status-active';
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
            className="action-btn restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore Post"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className="action-btn delete"
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
            className="action-btn remove"
            onClick={() => handlePostAction(post.id, 'remove')}
            title="Remove Post"
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          <button
            className="action-btn restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore to Active"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className="action-btn delete"
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
            className="action-btn resolve"
            onClick={() => handlePostAction(post.id, 'resolve')}
            title="Mark as Resolved"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>
          <button
            className="action-btn remove"
            onClick={() => handlePostAction(post.id, 'remove')}
            title="Remove Post"
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => handlePostAction(post.id, 'delete')}
            title="Delete Permanently"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    }
  };

  // Mobile card view
  const MobilePostCard = ({ post }) => (
    <div className="mobile-post-card">
      <div className="mobile-card-header">
        <div className="mobile-card-title">
          <h3>{post.title}</h3>
          <div className="mobile-card-author">
            by {post.first_name} {post.last_name}
          </div>
        </div>
        <span className={`mobile-card-status ${getStatusClass(post.status)}`}>
          {post.status}
        </span>
      </div>
      
      <div className="mobile-card-details">
        <div className="mobile-card-detail">
          <span className="detail-label">ID</span>
          <span className="detail-value">#{post.id}</span>
        </div>
        <div className="mobile-card-detail">
          <span className="detail-label">Category</span>
          <span className="detail-value">{post.category_name}</span>
        </div>
        <div className="mobile-card-detail">
          <span className="detail-label">Location</span>
          <span className="detail-value">{renderLocationInfo(post)}</span>
        </div>
        <div className="mobile-card-detail">
          <span className="detail-label">Date</span>
          <span className="detail-value">{formatDate(post.created_at)}</span>
        </div>
      </div>
      
      <div className="mobile-card-actions">
        <button 
          className="mobile-action-btn view"
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
      <div className="manage-posts-header">
        <div className="header-content">
        
          <p>Review and moderate community posts</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchPosts}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="posts-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search posts, authors, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
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
        <div className="filter-group">
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
          <div className="bulk-actions">
            <span>{selectedPosts.size} selected</span>
            <button 
              className="bulk-btn remove"
              onClick={() => handleBulkAction('remove')}
            >
              <FontAwesomeIcon icon={faBan} />
              Remove
            </button>
            <button 
              className="bulk-btn restore"
              onClick={() => handleBulkAction('restore')}
            >
              <FontAwesomeIcon icon={faUndo} />
              Restore
            </button>
            <button 
              className="bulk-btn delete"
              onClick={() => handleBulkAction('delete')}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="posts-stats">
        <div 
          className={`stat-card ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
        >
          <span className="post-stat-number">{posts.length}</span>
          <span className="stat-label">Total Posts</span>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'Active' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('Active')}
          style={{ cursor: 'pointer' }}
        >
          <span className="post-stat-number">{posts.filter(p => p.status === 'Active').length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'Resolved' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('Resolved')}
          style={{ cursor: 'pointer' }}
        >
          <span className="post-stat-number">{posts.filter(p => p.status === 'Resolved').length}</span>
          <span className="stat-label">Resolved</span>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'Removed' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('Removed')}
          style={{ cursor: 'pointer' }}
        >
          <span className="post-stat-number">{posts.filter(p => p.status === 'Removed').length}</span>
          <span className="stat-label">Removed</span>
        </div>
      </div>

      {/* Posts Table */}
      <div className='manage-posts-table-darkbrown'>
        <div className='manage-posts-table-lightbrown'>
          <div className='manage-posts-table-content'>
            <div className='manage-posts-table-title'>
              <h2>Posts Management</h2>
              <span className="posts-count">
                {filteredPosts.length} of {posts.length} posts
                {statusFilter !== 'all' && ` (Filtered by: ${statusFilter})`}
              </span>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <p>No posts found matching your criteria.</p>
                {statusFilter !== 'all' && (
                  <button 
                    className="retry-btn" 
                    onClick={() => setStatusFilter('all')}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="table-wrapper" style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                  <table className='posts-table'>
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
                        <tr key={post.id} className={selectedPosts.has(post.id) ? 'selected' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedPosts.has(post.id)}
                              onChange={() => togglePostSelection(post.id)}
                            />
                          </td>
                          <td className="post-id">#{post.id}</td>
                          <td>
                            <div className="post-title-author">
                              <strong className="post-title">{post.title}</strong>
                              <span className="post-author">
                                by {post.first_name} {post.last_name}
                              </span>
                            </div>
                          </td>
                          <td>{post.category_name}</td>
                          <td>
                            <div className="location-info">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                              <span>{renderLocationInfo(post)}</span>
                            </div>
                          </td>
                          <td>{formatDate(post.created_at)}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(post.status)}`}>
                              {post.status}
                            </span>
                          </td>
                          <td>
                            <div className='posts-table-actions'>
                              <button
                                className="action-btn view"
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
                <div className="mobile-posts-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
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
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>View Post</h2>
              <button className="modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {/* Photo Display */}
              {getPhotoUrl(viewModal.post) && (
                <div className="post-photo-container">
                  <label>Post Photo:</label>
                  <div className="post-photo">
                    <img
                      src={getPhotoUrl(viewModal.post)}
                      alt={viewModal.post.title}
                      className="photo-display"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="photo-fallback" style={{ display: 'none' }}>
                      <FontAwesomeIcon icon={faImage} />
                      <span>Photo not available</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="post-details">
                <div className="detail-row">
                  <label>Title:</label>
                  <span>{viewModal.post.title}</span>
                </div>
                <div className="detail-row">
                  <label>Author:</label>
                  <span>{viewModal.post.first_name} {viewModal.post.last_name}</span>
                </div>
                <div className="detail-row">
                  <label>Category:</label>
                  <span>{viewModal.post.category_name}</span>
                </div>
                <div className="detail-row">
                  <label>Location:</label>
                  <span>{renderLocationInfo(viewModal.post)}</span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusClass(viewModal.post.status)}`}>
                    {viewModal.post.status}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Date Posted:</label>
                  <span>{formatDate(viewModal.post.created_at)}</span>
                </div>
                <div className="detail-row full-width">
                  <label>Description:</label>
                  <div className="post-description">
                    {viewModal.post.description}
                  </div>
                </div>
                {viewModal.post.color && (
                  <div className="detail-row">
                    <label>Color:</label>
                    <span>{viewModal.post.color}</span>
                  </div>
                )}
                <div className="detail-row full-width">
                  <label>Contact Info:</label>
                  <div className="contact-info">
                    {viewModal.post.contact_info}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Validation Modal */}
      {actionModal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content report-validation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header warning">
              <h2>
                <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
                Action Requires Review
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="report-validation-content">
                <div className="warning-message">
                  <p>{actionModal.message}</p>
                </div>
                
                <div className="report-stats">
                  <div className="stat-item">
                    <FontAwesomeIcon icon={faFlag} className="stat-icon" />
                    <span className="stat-label">Current Reports:</span>
                    <span className="stat-value">{actionModal.reportCount}</span>
                  </div>
                  <div className="stat-item">
                    <FontAwesomeIcon icon={faCheckCircle} className="stat-icon required" />
                    <span className="stat-label">Required Reports:</span>
                    <span className="stat-value">{actionModal.requiredCount}</span>
                  </div>
                </div>

                <div className="post-preview">
                  <h4>Post Details:</h4>
                  <div className="preview-content">
                    <p><strong>Title:</strong> {actionModal.post?.title}</p>
                    <p><strong>Author:</strong> {actionModal.post?.first_name} {actionModal.post?.last_name}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${getStatusClass(actionModal.post?.status)}`}>
                        {actionModal.post?.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="action-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <p>
                    <strong>Warning:</strong> Proceeding with this action will override the community reporting system. 
                    This should only be done in cases of severe policy violations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelAction}
              >
                Cancel Action
              </button>
              <button 
                className="btn btn-warning" 
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