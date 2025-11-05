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
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './styles/AdminDeletionRequests.css';

export default function AdminDeletionRequests() {
  const [users, setUsers] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLimit, setFilterLimit] = useState('all');
  const [activeTab, setActiveTab] = useState('requests');
  const [requestModal, setRequestModal] = useState({
    isOpen: false,
    request: null,
    action: '',
    adminNotes: ''
  });

  // 🆕 ADDED: Loading state for actions to prevent double clicks
  const [actionLoading, setActionLoading] = useState({
    process: false
  });

  // 🆕 ADDED: Toast notifications
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // 🆕 ADDED: Auto-reload reference
  const autoReloadRef = useRef(null);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // 🆕 ADDED: Check if any filter is active
  const isFilterActive = () => {
    return searchTerm !== '' || filterLimit !== 'all';
  };

  // 🆕 ADDED: Smart polling - auto reload every 1 minute
  useEffect(() => {
    // Initial fetch
    fetchUsersDeletionStats();
    fetchDeletionRequests();

    // Set up auto-reload every 1 minute (60000ms)
    autoReloadRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUsersDeletionStats();
        fetchDeletionRequests();
      }
    }, 60000);

    // Cleanup interval on component unmount
    return () => {
      if (autoReloadRef.current) {
        clearInterval(autoReloadRef.current);
      }
    };
  }, []);

  // 🆕 ADDED: Also reload when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUsersDeletionStats();
        fetchDeletionRequests();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchUsersDeletionStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/users-deletion-stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users deletion stats');
      }
    } catch (error) {
      console.error('Error fetching users deletion stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletionRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/deletion-requests', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDeletionRequests(data.requests || []);
      } else {
        console.error('Failed to fetch deletion requests');
      }
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  // 🆕 UPDATED: Handle process deletion request with double-click prevention
  const handleProcessDeletionRequest = async (requestId, action, adminNotes = '') => {
    if (actionLoading.process) return; // Prevent double-click
    
    setActionLoading(prev => ({ ...prev, process: true }));
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/deletion-requests/${requestId}/process`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: action,
          admin_notes: adminNotes 
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message || `Request ${action}d successfully`, 'success');
        
        // Remove the processed request from the list
        setDeletionRequests(prevRequests => 
          prevRequests.filter(request => request.id !== requestId)
        );
        
        // Refresh user stats to get updated deletion counts
        fetchUsersDeletionStats();
        
        setRequestModal({ isOpen: false, request: null, action: '', adminNotes: '' });
      } else {
        const errorData = await response.json();
        showToast(errorData.error || `Failed to ${action} request`, 'error');
      }
    } catch (error) {
      console.error('Error processing deletion request:', error);
      showToast('Error processing deletion request', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, process: false }));
    }
  };

  const openRequestModal = (request, action) => {
    setRequestModal({
      isOpen: true,
      request,
      action,
      adminNotes: ''
    });
  };

  const closeModal = () => {
    setRequestModal({ isOpen: false, request: null, action: '', adminNotes: '' });
  };

  const handleStatCardClick = (filterType) => {
    setActiveTab('users');
    setFilterLimit(filterType);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterLimit === 'all' || 
                         (filterLimit === 'limit_reached' && user.limit_reached) ||
                         (filterLimit === 'approaching' && user.deletion_count >= 2 && !user.limit_reached);

    return matchesSearch && matchesFilter;
  });

  const pendingRequests = deletionRequests.filter(request => request.status === 'pending');

  const stats = {
    totalUsers: users.length,
    limitReached: users.filter(u => u.limit_reached).length,
    approachingLimit: users.filter(u => u.deletion_count >= 2 && !u.limit_reached).length,
    totalDeletions: users.reduce((sum, user) => sum + (user.deletion_count || 0), 0),
    pendingRequests: pendingRequests.length,
    filteredUsers: filteredUsers.length
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterLimit('all');
  };

  const getStatusClass = (user) => {
    if (user.limit_reached) return 'adr-status-banned';
    if (user.deletion_count >= 2) return 'adr-status-suspended';
    return 'adr-status-active';
  };

  const getStatusText = (user) => {
    if (user.limit_reached) return 'Limit Reached';
    if (user.deletion_count >= 2) return 'Approaching Limit';
    return 'Within Limit';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* 🆕 ADDED: Toast Notification */}
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

      {/* Header Section */}
      <div className="adr-header">
        <div className="adr-header-content">
          <p>Manage user post deletion limits and approve additional deletions</p>
        </div>
        <button 
          className="adr-refresh-btn"
          onClick={() => {
            fetchUsersDeletionStats();
            fetchDeletionRequests();
            showToast('Data refreshed successfully', 'success');
          }}
          disabled={loading || requestsLoading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading || requestsLoading} />
          Refresh
        </button>
      </div>

      {/* 🆕 UPDATED: Tabs - ORANGE THEME */}
      <div className="adr-tabs">
        <button 
          className={`adr-tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FontAwesomeIcon icon={faClock} />
          Pending Requests ({stats.pendingRequests})
        </button>
        <button 
          className={`adr-tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} />
          User Statistics ({stats.totalUsers})
        </button>
      </div>

      {/* Stats Cards */}
      <div className="adr-stats">
        <div 
          className={`adr-stat-card ${filterLimit === 'all' && activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('all')}
        >
          <span className="adr-stat-number">{stats.totalUsers}</span>
          <span className="adr-stat-label">Total Users</span>
        </div>
        
        <div 
          className={`adr-stat-card ${filterLimit === 'limit_reached' && activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('limit_reached')}
        >
          <span className="adr-stat-number">{stats.limitReached}</span>
          <span className="adr-stat-label">Limit Reached</span>
        </div>
        
        <div 
          className={`adr-stat-card ${filterLimit === 'approaching' && activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('approaching')}
        >
          <span className="adr-stat-number">{stats.approachingLimit}</span>
          <span className="adr-stat-label">Approaching Limit</span>
        </div>
        
        <div 
          className="adr-stat-card"
          onClick={() => handleStatCardClick('all')}
        >
          <span className="adr-stat-number">{stats.totalDeletions}</span>
          <span className="adr-stat-label">Total Deletions</span>
        </div>
      </div>

      {/* Pending Requests Tab */}
      {activeTab === 'requests' && (
        <div className='adr-table-darkbrown'>
          <div className='adr-table-lightbrown'>
            <div className='adr-table-content'>
              <div className='adr-table-title'>
                <h2>Pending Deletion Requests</h2>
                <div className="adr-header-info">
                  <span className="adr-users-count">
                    {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {requestsLoading ? (
                <div className="adr-loading-state">
                  <div className="adr-loading-spinner"></div>
                  <p>Loading deletion requests...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="adr-empty-state">
                  <p>No pending deletion requests found.</p>
                </div>
              ) : (
                <div className="adr-table-wrapper">
                  <table className='adr-users-table'>
                    <thead>
                      <tr>
                        <th>User Information</th>
                        <th>Request Details</th>
                        <th>Date Requested</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.map(request => (
                        <tr key={request.id}>
                          <td>
                            <div className="adr-user-info">
                              <strong>{request.first_name} {request.last_name}</strong>
                              <small>{request.email}</small>
                              <div>
                                Current Deletions: {request.current_deletions || 0}/3
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="adr-request-details">
                              <strong>Reason:</strong>
                              <p className="adr-request-reason">{request.reason}</p>
                              {request.post_title && (
                                <div className="adr-post-info">
                                  <strong>Related Post:</strong> {request.post_title}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {formatDate(request.created_at)}
                          </td>
                          <td>
                            <div className="adr-table-actions">
                              <button
                                className="adr-action-btn approve"
                                onClick={() => openRequestModal(request, 'approve')}
                                title="Approve this deletion request"
                              >
                                <FontAwesomeIcon icon={faCheck} />
                                Approve
                              </button>
                              <button
                                className="adr-action-btn reject"
                                onClick={() => openRequestModal(request, 'reject')}
                                title="Reject this deletion request"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Statistics Tab */}
     {/* User Statistics Tab */}
{activeTab === 'users' && (
  <>
    {/* Filters */}
    <div className="adr-filters">
      <div className="adr-search-box">
        <FontAwesomeIcon icon={faSearch} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="adr-filter-group">
        <FontAwesomeIcon icon={faFilter} />
        <select 
          value={filterLimit}
          onChange={(e) => setFilterLimit(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="limit_reached">Limit Reached</option>
          <option value="approaching">Approaching Limit</option>
        </select>
      </div>

      {isFilterActive() && (
        <button className="adr-clear-filters-btn" onClick={clearFilters}>
          Clear Filters
        </button> 
      )}
    </div>

    {/* Users Table */}
    <div className='adr-table-darkbrown'>
      <div className='adr-table-lightbrown'>
        <div className='adr-table-content'>
          <div className='adr-table-title'>
            <h2>Users Deletion Status</h2>
            <div className="adr-header-info">
              {/* 🆕 UPDATED: Same filtered count display as ManageUsers */}
              <span className="adr-users-count">
                {stats.filteredUsers} of {stats.totalUsers} user{stats.filteredUsers !== 1 ? 's' : ''}
                {isFilterActive() && ' (Filtered)'}
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
              <p>No users found matching your criteria.</p>
              {isFilterActive() && (
                <button 
                  className="adr-retry-btn" 
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="adr-table-wrapper">
              <table className='adr-users-table'>
                <thead>
                  <tr>
                    <th>User Information</th>
                    <th>Deletion Status</th>
                    <th>Deletion Count</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="adr-user-info">
                          <strong>{user.first_name} {user.last_name}</strong>
                          <small>{user.email}</small>
                          <div>
                            Status: <span className={`adr-user-status-badge adr-user-status-${user.status}`}>
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`adr-status-badge ${getStatusClass(user)}`}>
                          {getStatusText(user)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}
      {/* 🆕 UPDATED: Request Processing Modal with double-click prevention */}
      {requestModal.isOpen && requestModal.request && (
        <div className="adr-modal-overlay" onClick={closeModal}>
          <div className="adr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="adr-modal-header">
              <h3>{requestModal.action === 'approve' ? 'Approve' : 'Reject'} Deletion Request</h3>
              <button 
                className="adr-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <div className="adr-modal-body">
              <div className={`adr-info-banner ${requestModal.action === 'approve' ? 'approve' : 'reject'}`}>
                <FontAwesomeIcon icon={requestModal.action === 'approve' ? faCheck : faTimes} />
                {requestModal.action === 'approve' ? 'Approve' : 'Reject'} deletion request from {requestModal.request.first_name} {requestModal.request.last_name}
              </div>
              
              <div className="adr-request-details-modal">
                <p><strong>User:</strong> {requestModal.request.first_name} {requestModal.request.last_name} ({requestModal.request.email})</p>
                <p><strong>Request Date:</strong> {formatDate(requestModal.request.created_at)}</p>
                <p><strong>Current Deletions:</strong> {requestModal.request.current_deletions || 0}/3</p>
                <div className="adr-reason-section">
                  <strong>Reason:</strong>
                  <div className="adr-reason-text">{requestModal.request.reason}</div>
                </div>
                {requestModal.request.post_title && (
                  <p><strong>Related Post:</strong> {requestModal.request.post_title}</p>
                )}
              </div>

              {requestModal.action === 'reject' && (
                <div className="adr-form-group">
                  <label>Reason for rejection (optional):</label>
                  <textarea
                    placeholder="Explain why this request is being rejected..."
                    rows="3"
                    value={requestModal.adminNotes}
                    onChange={(e) => setRequestModal(prev => ({ ...prev, adminNotes: e.target.value }))}
                  />
                </div>
              )}

              <div className="adr-info-box">
                <strong>What happens when {requestModal.action === 'approve' ? 'approved' : 'rejected'}:</strong>
                <ul>
                  {requestModal.action === 'approve' ? (
                    <>
                      <li>This specific post deletion will be processed immediately</li>
                      <li>User's deletion count will be incremented by 1</li>
                      <li>User will receive email notification about the approval</li>
                      <li>If user reaches limit, they can request additional deletions</li>
                    </>
                  ) : (
                    <>
                      <li>Request will be marked as rejected</li>
                      <li>User's deletion limit remains unchanged</li>
                      <li>User will receive a notification with your feedback</li>
                      <li>The post will not be deleted</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            <div className="adr-modal-footer">
              <button 
                className="adr-btn-secondary"
                onClick={closeModal}
                disabled={actionLoading.process}
              >
                Cancel
              </button>
              <button 
                className={requestModal.action === 'approve' ? 'adr-btn-primary' : 'adr-btn-warning'}
                onClick={() => handleProcessDeletionRequest(
                  requestModal.request.id, 
                  requestModal.action, 
                  requestModal.adminNotes
                )}
                disabled={actionLoading.process}
              >
                <FontAwesomeIcon 
                  icon={actionLoading.process ? faRefresh : 
                    requestModal.action === 'approve' ? faCheck : faTimes
                  } 
                  spin={actionLoading.process}
                />
                {actionLoading.process ? 'Processing...' : 
                  requestModal.action === 'approve' ? 'Approve Request' : 'Reject Request'
                }
              </button>
            </div>
          </div>
        </div> 
      )}
    </>
  );
}