import { useState, useEffect } from 'react';
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

  const handleNavigateToUser = (userId) => {
    setActiveTab('users');
    setSearchTerm('');
    setFilterLimit('all');
    // Scroll to the specific user
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
      {/* Header Section */}
      <div className="adr-header">
        <div className="adr-header-content">
          <p>Manage user post deletion limits and approve additional deletions</p>
          
          {/* Recently Approved User Notification */}
          {recentlyApprovedUser && (
            <div className="adr-recently-approved-banner">
              <FontAwesomeIcon icon={faCheckCircle} />
              Successfully approved request for {recentlyApprovedUser.name}
              <button 
                className="adr-navigate-user-btn"
                onClick={() => handleNavigateToUser(recentlyApprovedUser.id)}
              >
                <FontAwesomeIcon icon={faUser} />
                Manage {recentlyApprovedUser.name}'s Deletions
              </button>
            </div>
          )}
        </div>
        <button 
          className="adr-refresh-btn"
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
          onClick={() => {
            setActiveTab('users');
            setRecentlyApprovedUser(null);
          }}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} />
          User Statistics ({stats.totalUsers})
          {recentlyApprovedUser && (
            <span className="adr-tab-notification-dot"></span>
          )}
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
                              <div className="adr-user-info">
                                Current Deletions: {request.current_deletions || 0}/3
                                <button 
                                  className="adr-view-user-btn"
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

            {(searchTerm || filterLimit !== 'all' || recentlyApprovedUser) && (
              <button className="adr-clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button> 
            )}
          </div>

          {/* Users Table - REMOVED ACTIONS COLUMN */}
          <div className='adr-table-darkbrown'>
            <div className='adr-table-lightbrown'>
              <div className='adr-table-content'>
                <div className='adr-table-title'>
                  <h2>Users Deletion Status</h2>
                  <div className="adr-header-info">
                    <span className="adr-users-count">
                      {stats.filteredUsers} of {stats.totalUsers} users
                    </span>
                    {(searchTerm || filterLimit !== 'all' || recentlyApprovedUser) && (
                      <div className="adr-active-filters">
                        <span>Active filters:</span>
                        {searchTerm && <span className="adr-filter-tag">Search: "{searchTerm}"</span>}
                        {filterLimit !== 'all' && <span className="adr-filter-tag">{filterLimit === 'limit_reached' ? 'Limit Reached' : 'Approaching Limit'}</span>}
                        {recentlyApprovedUser && <span className="adr-filter-tag highlight">Recently Approved: {recentlyApprovedUser.name}</span>}
                      </div>
                    )}
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
                    {(searchTerm || filterLimit !== 'all') && (
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
                          {/* REMOVED ACTIONS COLUMN HEADER */}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr 
                            key={user.id} 
                            id={`user-${user.id}`}
                            className={recentlyApprovedUser && recentlyApprovedUser.id === user.id ? 'adr-recently-approved-user' : ''}
                          >
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
                            {/* REMOVED ACTIONS COLUMN TD */}
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

      {/* Request Processing Modal */}
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
              >
                {requestModal.action === 'approve' ? 'Approve Request' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}