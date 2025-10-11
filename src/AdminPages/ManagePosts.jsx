import { useState, useEffect } from 'react';
import AdminNav from '../AdminComponents/AdminNav';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faEye, 
  faEdit, 
  faTrash, 
  faBan, 
  faRefresh, 
  faFilter, 
  faCheckCircle,
  faList 
} from '@fortawesome/free-solid-svg-icons';
import './styles/ManagePosts.css';

export default function ManagePosts() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

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

  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle post actions
  const handlePostAction = async (postId, action) => {
    try {
      let url, method;
      
      switch (action) {
        case 'remove':
          url = `http://localhost:8000/api/admin/posts/${postId}/remove`;
          method = 'PUT';
          break;
        case 'restore':
          url = `http://localhost:8000/api/admin/posts/${postId}/restore`;
          method = 'PUT';
          break;
        case 'resolve':
          url = `http://localhost:8000/api/admin/posts/${postId}/resolve`;
          method = 'PUT';
          break;
        case 'delete':
          url = `http://localhost:8000/api/admin/posts/${postId}`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      const response = await fetch(url, {
        method: method,
        credentials: 'include'
      });

      if (response.ok) {
        // Update local state based on action
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
        
        // Remove from selected posts
        setSelectedPosts(prev => {
          const newSelected = new Set(prev);
          newSelected.delete(postId);
          return newSelected;
        });
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedPosts.size === 0) return;

    try {
      const promises = Array.from(selectedPosts).map(postId => 
        handlePostAction(postId, action)
      );
      await Promise.all(promises);
      setSelectedPosts(new Set());
    } catch (error) {
      console.error('Error performing bulk action:', error);
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
      active: 'status-active',
      removed: 'status-removed',
      resolved: 'status-resolved'
    };
    return statusMap[status] || 'status-active';
  };

  // Get action buttons based on post status
  const getActionButtons = (post) => {
    if (post.status === 'removed') {
      return (
        <>
          <button
            className="action-btn restore"
            onClick={() => handlePostAction(post.id, 'restore')}
            title="Restore Post"
          >
            <FontAwesomeIcon icon={faRefresh} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => {
              if (window.confirm('Are you sure you want to permanently delete this post?')) {
                handlePostAction(post.id, 'delete');
              }
            }}
            title="Delete Permanently"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    } else if (post.status === 'resolved') {
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
            className="action-btn delete"
            onClick={() => {
              if (window.confirm('Are you sure you want to permanently delete this post?')) {
                handlePostAction(post.id, 'delete');
              }
            }}
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
            onClick={() => {
              if (window.confirm('Are you sure you want to permanently delete this post?')) {
                handlePostAction(post.id, 'delete');
              }
            }}
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
          <span className="detail-label">Barangay</span>
          <span className="detail-value">{post.barangay_name}</span>
        </div>
        <div className="mobile-card-detail">
          <span className="detail-label">Date</span>
          <span className="detail-value">{formatDate(post.created_at)}</span>
        </div>
      </div>
      
      <div className="mobile-card-actions">
        <Link 
          to={`/post/${post.id}`} 
          className="mobile-action-btn view"
          target="_blank"
        >
          <FontAwesomeIcon icon={faEye} />
          View
        </Link>
        {getActionButtons(post)}
      </div>
    </div>
  );

  return (
    <section className="manage-posts-container">
      <AdminNav isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} />
      
      <main className='manage-posts-content'
        style={{
          marginLeft: isSideBarOpen ? '200px' : '70px',
          transition: 'margin-left 0.4s ease',
         
        }}
      >
        {/* Header Section */}
        <div className="manage-posts-header">
          <div className="header-content">
            <h1>Manage Posts</h1>
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
              placeholder="Search posts, authors..."
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
          <div className="stat-card">
            <span className="stat-number">{posts.length}</span>
            <span className="stat-label">Total Posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{posts.filter(p => p.status === 'Active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{posts.filter(p => p.status === 'Resolved').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{posts.filter(p => p.status === 'Removed').length}</span>
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
                          <th>Barangay</th>
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
                            <td>{post.barangay_name}</td>
                            <td>{formatDate(post.created_at)}</td>
                            <td>
                              <span className={`status-badge ${getStatusClass(post.status)}`}>
                                {post.status}
                              </span>
                            </td>
                            <td>
                              <div className='posts-table-actions'>
                                <Link 
                                  to={`/post/${post.id}`} 
                                  className="action-btn view"
                                  target="_blank"
                                  title="View Post"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Link>
                                <Link 
                                  to={`/admin/edit-post/${post.id}`}
                                  className="action-btn edit"
                                  title="Edit Post"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </Link>
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
      </main>
    </section>
  );
}