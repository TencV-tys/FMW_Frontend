import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faRefresh,
  faExclamationTriangle,
  faCheckCircle,
  faUndo,
  faClock,
  faCheck,
  faTimes,
  faUser
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
  const [actionModal, setActionModal] = useState({ 
    isOpen: false, 
    user: null, 
    action: '', 
    additionalCount: 1 
  });
  const [requestModal, setRequestModal] = useState({
    isOpen: false,
    request: null,
    action: '',
    adminNotes: ''
  });
  const [recentlyApprovedUser, setRecentlyApprovedUser] = useState(null);

  useEffect(() => {
    fetchUsersDeletionStats();
    fetchDeletionRequests();
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

  const handleResetDeletionCount = async (userId, userName) => {
    if (!window.confirm(`Reset deletion count for ${userName}? This will allow them to delete posts again this month.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/reset-deletions`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Deletion count reset successfully');
        
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, deletion_count: 0, limit_reached: false, remaining_deletions: 3 }
              : user
          )
        );
      } else {
        const errorData = await response.json(); 
        alert(errorData.error || 'Failed to reset deletion count');
      }
    } catch (error) {
      console.error('Error resetting deletion count:', error);
      alert('Error resetting deletion count');
    }
  };

  const handleGrantAdditionalDeletions = async (userId, additionalCount = 1) => {
  try {
    const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/grant-deletions`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ additional_count: additionalCount })
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message || 'Additional deletions granted successfully');
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                deletion_count: data.user.deletion_count,
                limit_reached: data.user.limit_reached,
                remaining_deletions: data.user.remaining_deletions
              }
            : user
        )
      );
      setActionModal({ isOpen: false, user: null, action: '', additionalCount: 1 });
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Failed to grant additional deletions');
    }
  } catch (error) {
    console.error('Error granting additional deletions:', error);
    alert('Error granting additional deletions');
  }
};

  const handleProcessDeletionRequest = async (requestId, action, adminNotes = '') => {
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
        alert(data.message || `Request ${action}d successfully`);
        
        // Store the approved user info for easy navigation
        if (action === 'approve') {
          const approvedRequest = deletionRequests.find(request => request.id === requestId);
          if (approvedRequest) {
            setRecentlyApprovedUser({
              id: approvedRequest.user_id,
              name: `${approvedRequest.first_name} ${approvedRequest.last_name}`,
              email: approvedRequest.email
            });
          }
        }
        
        // Remove the processed request from the list
        setDeletionRequests(prevRequests => 
          prevRequests.filter(request => request.id !== requestId)
        );
        
        // Refresh user stats to get updated deletion counts
        fetchUsersDeletionStats();
        
        setRequestModal({ isOpen: false, request: null, action: '', adminNotes: '' });
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error('Error processing deletion request:', error);
      alert('Error processing deletion request');
    }
  };

  const openGrantModal = (user, additionalCount = 1) => {
    setActionModal({
      isOpen: true,
      user,
      action: 'grant',
      additionalCount
    });
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
    setActionModal({ isOpen: false, user: null, action: '', additionalCount: 1 });
    setRequestModal({ isOpen: false, request: null, action: '', adminNotes: '' });
  };

  const handleStatCardClick = (filterType) => {
    setActiveTab('users');
    setFilterLimit(filterType);
  };

  const handleNavigateToUser = (userId) => {
    setActiveTab('users');
    setSearchTerm('');
    setFilterLimit('all');
    // Scroll to the specific user (this will be handled by the filtered list)
    setTimeout(() => {
      const userElement = document.getElementById(`user-${userId}`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        userElement.style.backgroundColor = '#fff5e6';
        setTimeout(() => {
          userElement.style.backgroundColor = '';
        }, 3000);
      }
    }, 100);
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
    setRecentlyApprovedUser(null);
  };

  const getStatusClass = (user) => {
    if (user.limit_reached) return 'deletion-status-banned';
    if (user.deletion_count >= 2) return 'deletion-status-suspended';
    return 'deletion-status-active';
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
      {/* Header Section - With content like ManageUsers */}
      <div className="manage-users-header">
        <div className="manage-users-header-content">
          <p>Manage user post deletion limits and approve additional deletions</p>
          
          {/* Recently Approved User Notification */}
          {recentlyApprovedUser && (
            <div className="deletion-recently-approved-banner">
              <FontAwesomeIcon icon={faCheckCircle} />
              Successfully approved request for {recentlyApprovedUser.name}
              <button 
                className="deletion-navigate-user-btn"
                onClick={() => handleNavigateToUser(recentlyApprovedUser.id)}
              >
                <FontAwesomeIcon icon={faUser} />
                Manage {recentlyApprovedUser.name}'s Deletions
              </button>
            </div>
          )}
        </div>
        <button 
          className="admin-deletion-refresh-btn"
          onClick={() => {
            fetchUsersDeletionStats();
            fetchDeletionRequests();
            setRecentlyApprovedUser(null);
          }}
          disabled={loading || requestsLoading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading || requestsLoading} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="deletion-requests-tabs">
        <button 
          className={`deletion-tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FontAwesomeIcon icon={faClock} />
          Pending Requests ({stats.pendingRequests})
        </button>
        <button 
          className={`deletion-tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users');
            setRecentlyApprovedUser(null);
          }}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} />
          User Statistics ({stats.totalUsers})
          {recentlyApprovedUser && (
            <span className="deletion-tab-notification-dot"></span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="users-stats">
        <div 
          className={`stat-card ${filterLimit === 'all' && activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('all')}
        >
          <span className="user-stat-number">{stats.totalUsers}</span>
          <span className="stat-label">Total Users</span>
        </div>
        
        <div 
          className={`stat-card ${filterLimit === 'limit_reached' && activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('limit_reached')}
        >
          <span className="user-stat-number">{stats.limitReached}</span>
          <span className="stat-label">Limit Reached</span>
        </div>
        
        <div 
          className={`stat-card ${filterLimit === 'approaching' && activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('approaching')}
        >
          <span className="user-stat-number">{stats.approachingLimit}</span>
          <span className="stat-label">Approaching Limit</span>
        </div>
        
        <div 
          className="stat-card"
          onClick={() => handleStatCardClick('all')}
        >
          <span className="user-stat-number">{stats.totalDeletions}</span>
          <span className="stat-label">Total Deletions</span>
        </div>
      </div>

      {/* Pending Requests Tab */}
      {activeTab === 'requests' && (
        <div className='manage-users-table-darkbrown'>
          <div className='manage-users-table-lightbrown'>
            <div className='manage-users-table-content'>
              <div className='manage-users-table-title'>
                <h2>Pending Deletion Requests</h2>
                <div className="users-header-info">
                  <span className="users-count">
                    {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {requestsLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading deletion requests...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="empty-state">
                  <p>No pending deletion requests found.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className='users-table'>
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
                            <div className="user-info">
                              <strong>{request.first_name} {request.last_name}</strong>
                              <small>{request.email}</small>
                              <div className="user-info">
                                Current Deletions: {request.current_deletions || 0}/3
                                <button 
                                  className="deletion-view-user-btn"
                                  onClick={() => handleNavigateToUser(request.user_id)}
                                  title="View and manage this user's deletion limits"
                                >
                                  <FontAwesomeIcon icon={faUser} />
                                  Manage User
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="deletion-request-details">
                              <strong>Reason:</strong>
                              <p className="deletion-request-reason">{request.reason}</p>
                              {request.post_title && (
                                <div className="deletion-post-info">
                                  <strong>Related Post:</strong> {request.post_title}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {formatDate(request.created_at)}
                          </td>
                          <td>
                            <div className="users-table-actions">
                              <button
                                className="deletion-action-btn approve"
                                onClick={() => openRequestModal(request, 'approve')}
                                title="Approve this deletion request"
                              >
                                <FontAwesomeIcon icon={faCheck} />
                                Approve
                              </button>
                              <button
                                className="deletion-action-btn reject"
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
      {activeTab === 'users' && (
        <>
          {/* Filters */}
          <div className="users-filters">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
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

            {(searchTerm || filterLimit !== 'all' || recentlyApprovedUser) && (
              <button className="deletion-clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {/* Users Table */}
          <div className='manage-users-table-darkbrown'>
            <div className='manage-users-table-lightbrown'>
              <div className='manage-users-table-content'>
                <div className='manage-users-table-title'>
                  <h2>Users Deletion Status</h2>
                  <div className="users-header-info">
                    <span className="users-count">
                      {stats.filteredUsers} of {stats.totalUsers} users
                    </span>
                    {(searchTerm || filterLimit !== 'all' || recentlyApprovedUser) && (
                      <div className="active-filters">
                        <span>Active filters:</span>
                        {searchTerm && <span className="filter-tag">Search: "{searchTerm}"</span>}
                        {filterLimit !== 'all' && <span className="filter-tag">{filterLimit === 'limit_reached' ? 'Limit Reached' : 'Approaching Limit'}</span>}
                        {recentlyApprovedUser && <span className="filter-tag highlight">Recently Approved: {recentlyApprovedUser.name}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading users deletion data...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="empty-state">
                    <p>No users found matching your criteria.</p>
                    {(searchTerm || filterLimit !== 'all') && (
                      <button 
                        className="retry-btn" 
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className='users-table'>
                      <thead>
                        <tr>
                          <th>User Information</th>
                          <th>Deletion Status</th>
                          <th>Deletion Count</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr 
                            key={user.id} 
                            id={`user-${user.id}`}
                            className={recentlyApprovedUser && recentlyApprovedUser.id === user.id ? 'deletion-recently-approved-user' : ''}
                          >
                            <td>
                              <div className="user-info">
                                <strong>{user.first_name} {user.last_name}</strong>
                                <small>{user.email}</small>
                                <div>
                                  Status: <span className={`user-status-badge user-status-${user.status}`}>
                                    {user.status}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`deletion-status-badge ${getStatusClass(user)}`}>
                                {getStatusText(user)}
                              </span>
                            </td>
                            <td>
                              <div className="deletion-progress-container">
                                <span className="deletion-progress-text">
                                  {user.deletion_count || 0} / 3
                                </span>
                                <div className="deletion-progress-bar">
                                  <div 
                                    className={`deletion-progress-fill ${
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
                            <td>
                              <div className="users-table-actions">
                                {user.limit_reached && (
                                  <>
                                    <button
                                      className="action-btn activate"
                                      onClick={() => handleResetDeletionCount(user.id, `${user.first_name} ${user.last_name}`)}
                                      title="Reset deletion count to zero"
                                    >
                                      <FontAwesomeIcon icon={faUndo} />
                                      Reset
                                    </button>
                                    <button
                                      className="action-btn activate"
                                      onClick={() => openGrantModal(user, 1)}
                                      title="Grant 1 additional deletion"
                                    >
                                      <FontAwesomeIcon icon={faCheckCircle} />
                                      +1
                                    </button>
                                    <button
                                      className="action-btn activate"
                                      onClick={() => openGrantModal(user, 3)}
                                      title="Grant 3 additional deletions"
                                    >
                                      <FontAwesomeIcon icon={faCheckCircle} />
                                      +3
                                    </button>
                                  </>
                                )}
                                {!user.limit_reached && (user.deletion_count || 0) > 0 && (
                                  <button
                                    className="action-btn activate"
                                    onClick={() => handleResetDeletionCount(user.id, `${user.first_name} ${user.last_name}`)}
                                    title="Reset deletion count"
                                  >
                                    <FontAwesomeIcon icon={faUndo} />
                                    Reset
                                  </button>
                                )}
                                {(user.deletion_count || 0) === 0 && (
                                  <span className="deletion-no-actions">No actions needed</span>
                                )}
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

      {/* Grant Deletions Modal */}
      {actionModal.isOpen && actionModal.user && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Grant Additional Deletions</h3>
              <button 
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="deletion-info-banner">
                <FontAwesomeIcon icon={faCheckCircle} />
                Grant additional deletion capacity to user
              </div>
              
              <div className="deletion-user-details">
                <p><strong>User:</strong> {actionModal.user.first_name} {actionModal.user.last_name}</p>
                <p><strong>Email:</strong> {actionModal.user.email}</p>
                <p><strong>Current Deletions:</strong> {actionModal.user.deletion_count || 0}/3</p>
                <p><strong>Additional Deletions:</strong> {actionModal.additionalCount}</p>
                <p><strong>New Total:</strong> {Math.max(0, (actionModal.user.deletion_count || 0) - actionModal.additionalCount)}/3</p>
              </div>

              <div className="deletion-info-box">
                <strong>Note:</strong>
                <ul>
                  <li>Granting additional deletions reduces their current count</li>
                  <li>User will be notified about the granted deletions</li>
                  <li>This action is logged for audit purposes</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleGrantAdditionalDeletions(actionModal.user.id, actionModal.additionalCount)}
              >
                Grant {actionModal.additionalCount} Deletion{actionModal.additionalCount > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Processing Modal */}
      {requestModal.isOpen && requestModal.request && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{requestModal.action === 'approve' ? 'Approve' : 'Reject'} Deletion Request</h3>
              <button 
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className={`deletion-info-banner ${requestModal.action === 'approve' ? 'approve' : 'reject'}`}>
                <FontAwesomeIcon icon={requestModal.action === 'approve' ? faCheck : faTimes} />
                {requestModal.action === 'approve' ? 'Approve' : 'Reject'} deletion request from {requestModal.request.first_name} {requestModal.request.last_name}
              </div>
              
              <div className="deletion-request-details-modal">
                <p><strong>User:</strong> {requestModal.request.first_name} {requestModal.request.last_name} ({requestModal.request.email})</p>
                <p><strong>Request Date:</strong> {formatDate(requestModal.request.created_at)}</p>
                <p><strong>Current Deletions:</strong> {requestModal.request.current_deletions || 0}/3</p>
                <div className="deletion-reason-section">
                  <strong>Reason:</strong>
                  <div className="deletion-reason-text">{requestModal.request.reason}</div>
                </div>
                {requestModal.request.post_title && (
                  <p><strong>Related Post:</strong> {requestModal.request.post_title}</p>
                )}
              </div>

              {requestModal.action === 'reject' && (
                <div className="form-group">
                  <label>Reason for rejection (optional):</label>
                  <textarea
                    placeholder="Explain why this request is being rejected..."
                    rows="3"
                    value={requestModal.adminNotes}
                    onChange={(e) => setRequestModal(prev => ({ ...prev, adminNotes: e.target.value }))}
                  />
                </div>
              )}

              <div className="deletion-info-box">
                <strong>What happens when {requestModal.action === 'approve' ? 'approved' : 'rejected'}:</strong>
                <ul>
                  {requestModal.action === 'approve' ? (
                    <>
                      <li>This specific post deletion will be processed</li>
                      <li>User's deletion count remains the same</li>
                      <li>You can grant additional deletions to this user in the User Statistics tab</li>
                      <li>User will receive a notification</li>
                    </>
                  ) : (
                    <>
                      <li>Request will be marked as rejected</li>
                      <li>User's deletion limit remains unchanged</li>
                      <li>User will receive a notification with your feedback</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
                className={requestModal.action === 'approve' ? 'btn-primary' : 'btn-warning'}
                onClick={() => handleProcessDeletionRequest(
                  requestModal.request.id, 
                  requestModal.action, 
                  requestModal.adminNotes
                )}
              >
                {requestModal.action === 'approve' ? 'Approve' : 'Reject'} Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}