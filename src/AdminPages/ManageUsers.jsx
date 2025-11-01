import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faTrash, 
  faBan, 
  faCheckCircle, 
  faRefresh,
  faUser,
  faUserShield,
  faUserSlash,
  faFilter,
  faList,
  faEnvelope,
  faVenusMars,
  faCalendar,
  faPauseCircle,
  faClock,
  faFlag,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './styles/ManageUsers.css';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  
  // Modal states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [suspensionDuration, setSuspensionDuration] = useState('7');
  const [customDays, setCustomDays] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/admin/users-with-reports', {
        credentials: 'include'
      });
      const data = await res.json();
      setUsers(data); 
    } catch (error) {
      console.log(`Error fetching users with reports: ${error.message}`);
      // Fallback to basic user data
      try {
        const fallbackRes = await fetch('http://localhost:8000/api/users', {
          credentials: 'include'
        });
        const fallbackData = await fallbackRes.json();
        // Add default report stats for fallback
        const usersWithDefaultStats = fallbackData.map(user => ({
          ...user,
          monthly_report_count: 0,
          total_report_count: 0,
          active_posts_with_reports: 0
        }));
        setUsers(usersWithDefaultStats);
      } catch (fallbackError) {
        console.log(`Fallback error: ${fallbackError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🎯 OPEN MODAL FUNCTIONS
  const openSuspendModal = (user) => {
    setSelectedUser(user);
    setSuspensionDuration('7');
    setCustomDays('');
    setSuspensionReason('');
    setShowSuspendModal(true);
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setBanReason('');
    setShowBanModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openActivateModal = (user) => {
    setSelectedUser(user);
    setShowActivateModal(true);
  };

  // 🎯 CLOSE ALL MODALS
  const closeAllModals = () => {
    setShowSuspendModal(false);
    setShowBanModal(false);
    setShowDeleteModal(false);
    setShowActivateModal(false);
    setSelectedUser(null);
  };

  // 🎯 DELETE USER with modal confirmation
  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      if (res.ok) {
        setUsers(users.filter((user) => user.id !== selectedUser.id));
        alert('User deleted successfully!');
        closeAllModals();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.log(`Delete error: ${error.message}`);
    }
  };

  // 🎯 SUSPEND USER with duration
  const handleSuspend = async () => {
    if (!selectedUser) return;
    
    if (!suspensionReason.trim()) {
      alert('Please provide a reason for suspension.');
      return;
    }

    if (suspensionDuration === 'custom' && (!customDays || customDays < 1)) {
      alert('Please enter a valid number of days for custom suspension.');
      return;
    }

    try {
      const suspendData = {
        status: 'suspended',
        reason: suspensionReason,
        duration: suspensionDuration
      };

      if (suspensionDuration === 'custom') {
        suspendData.customDays = customDays;
      }

      const res = await fetch(`http://localhost:8000/api/users/${selectedUser.id}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suspendData)
      });
      
      if (res.ok) {
        const result = await res.json();
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { 
            ...user, 
            status: 'suspended',
            suspended_until: result.data.suspended_until
          } : user
        ));
        alert(`User "${getUserName(selectedUser)}" suspended for ${result.data.duration} day(s)!`);
        closeAllModals();
      } else {
        alert('Failed to suspend user');
      }
    } catch (error) {
      console.log(`Suspend error: ${error.message}`);
    }
  };

  // 🎯 BAN USER with modal
  const handleBan = async () => {
    if (!selectedUser) return;
    
    if (!banReason.trim()) {
      alert('Please provide a reason for banning.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/users/${selectedUser.id}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'banned',
          reason: banReason.trim()
        })
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, status: 'banned' } : user
        ));
        alert(`User "${getUserName(selectedUser)}" banned successfully!`);
        closeAllModals();
      } else {
        alert('Failed to ban user');
      }
    } catch (error) {
      console.log(`Ban error: ${error.message}`);
    }
  };

  // 🎯 ACTIVATE USER with modal confirmation
  const handleActivate = async () => {
    if (!selectedUser) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/users/${selectedUser.id}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' })
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, status: 'active', suspended_until: null } : user
        ));
        alert(`User "${getUserName(selectedUser)}" activated successfully!`);
        closeAllModals();
      } else {
        alert('Failed to activate user');
      }
    } catch (error) {
      console.log(`Activate error: ${error.message}`);
    }
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(value === 'all' ? 'all' : value);
    } else if (filterType === 'role') {
      setRoleFilter(value === 'all' ? 'all' : value);
    } else if (filterType === 'all') {
      setStatusFilter('all');
      setRoleFilter('all');
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Stats calculation
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    banned: users.filter(u => u.status === 'banned').length
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      active: 'user-status-active',
      suspended: 'user-status-suspended',
      banned: 'user-status-banned'
    };
    return statusMap[status] || 'user-status-active';
  };

  // Get status display text
  const getStatusDisplayText = (user) => {
    if (user.status === 'suspended' && user.suspended_until) {
      const untilDate = new Date(user.suspended_until);
      const now = new Date();
      const diffTime = untilDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        return `Suspended (${diffDays} day${diffDays !== 1 ? 's' : ''} left)`;
      }
    }
    
    const statusMap = {
      active: 'Active',
      suspended: 'Suspended',
      banned: 'Banned'
    };
    return statusMap[user.status] || 'Active';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const iconMap = {
      active: faCheckCircle,
      suspended: faPauseCircle,
      banned: faUserSlash
    };
    return iconMap[status] || faCheckCircle;
  };

  // Get role badge class
  const getRoleClass = (role) => {
    return role === 'admin' ? 'role-admin' : 'role-user';
  };

  // Get user full name
  const getUserName = (user) => {
    return `${user.first_name} ${user.last_name}`;
  };

  // Check if any filter is active
  const isFilterActive = () => {
    return statusFilter !== 'all' || roleFilter !== 'all';
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all');
    setRoleFilter('all');
  };

  // Get appropriate action buttons based on user status
  const getActionButtons = (user) => {
    if (user.status === 'active') {
      return (
        <>
          <button
            className="action-btn suspend"
            onClick={() => openSuspendModal(user)}
            title="Suspend User"
          >
            <FontAwesomeIcon icon={faPauseCircle} />
          </button>
          <button
            className="action-btn ban"
            onClick={() => openBanModal(user)}
            title="Ban User"
          >
            <FontAwesomeIcon icon={faUserSlash} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => openDeleteModal(user)}
            title="Delete User"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            className="action-btn activate"
            onClick={() => openActivateModal(user)}
            title="Activate User"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => openDeleteModal(user)}
            title="Delete User"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    }
  };

  // Report severity indicator
  const getReportSeverity = (user) => {
    const monthlyReports = user.monthly_report_count || 0;
    const totalReports = user.total_report_count || 0;
    
    if (monthlyReports >= 5 || totalReports >= 15) return 'high';
    if (monthlyReports >= 3 || totalReports >= 8) return 'medium';
    if (monthlyReports >= 1 || totalReports >= 3) return 'low';
    return 'none';
  };

  // Report severity badge
  const ReportSeverityBadge = ({ user }) => {
    const severity = getReportSeverity(user);
    if (severity === 'none') return null;

    const severityConfig = {
      high: { class: 'report-high', text: 'High Risk', icon: faExclamationTriangle },
      medium: { class: 'report-medium', text: 'Medium Risk', icon: faFlag },
      low: { class: 'report-low', text: 'Low Risk', icon: faFlag }
    };

    const config = severityConfig[severity];

    return (
      <span className={`report-severity-badge ${config.class}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  // Mobile User Card Component
  const MobileUserCard = ({ user }) => (
    <div className="mobile-user-card">
      <div className="mobile-card-header">
        <div className="mobile-card-title">
          <h3>{user.first_name} {user.last_name}</h3>
          <div className="mobile-card-id">ID: #{user.id}</div>
        </div>
        <div className="mobile-card-badges">
          <span className={`mobile-card-status ${getStatusClass(user.status)}`}>
            <FontAwesomeIcon icon={getStatusIcon(user.status)} />
            {getStatusDisplayText(user)}
          </span>
          <span className={`mobile-card-role ${getRoleClass(user.role)}`}>
            <FontAwesomeIcon icon={user.role === 'admin' ? faUserShield : faUser} />
            {user.role}
          </span>
        </div>
      </div>
      
      <div className="mobile-card-details">
        <div className="mobile-card-detail">
          <FontAwesomeIcon icon={faEnvelope} />
          <span>{user.email}</span>
        </div>
        <div className="mobile-card-detail">
          <FontAwesomeIcon icon={faVenusMars} />
          <span>{user.gender || 'Not specified'}</span>
        </div>
        <div className="mobile-card-detail">
          <FontAwesomeIcon icon={faCalendar} />
          <span>{new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}</span>
        </div>
        
        {/* Report Statistics */}
        <div className="mobile-card-detail">
          <FontAwesomeIcon icon={faFlag} />
          <span>Monthly Reports: {user.monthly_report_count || 0}</span>
        </div>
        <div className="mobile-card-detail">
          <FontAwesomeIcon icon={faFlag} />
          <span>Total Reports: {user.total_report_count || 0}</span>
        </div>
        <div className="mobile-card-detail">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>Problem Posts: {user.active_posts_with_reports || 0}</span>
        </div>

        {user.status === 'suspended' && user.suspended_until && (
          <div className="mobile-card-detail">
            <FontAwesomeIcon icon={faClock} />
            <span>Until: {new Date(user.suspended_until).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Report Severity Indicator */}
      <div className="mobile-card-report-severity">
        <ReportSeverityBadge user={user} />
      </div>
      
      <div className="mobile-card-actions">
        {getActionButtons(user)}
      </div>
    </div>
  );

  return (
    <>
      {/* Header Section */}
      <div className="manage-users-header">
        <div className="manage-users-header-content">
          <p>Admin panel for user management and moderation</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchUsers}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <div className="filter-group">
          <FontAwesomeIcon icon={faUser} />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* View Toggle */}
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

        {/* Clear Filters Button */}
        {isFilterActive() && (
          <button 
            className="clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="users-stats">
        <div 
          className={`stat-card ${!isFilterActive() ? 'active' : ''}`}
          onClick={() => handleStatCardClick('all', 'all')}
          style={{ cursor: 'pointer' }}
          title="Show all users"
        >
          <span className="user-stat-number">{userStats.total}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'active' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('status', 'active')}
          style={{ cursor: 'pointer' }}
          title="Filter by Active status"
        >
          <span className="user-stat-number">{userStats.active}</span>
          <span className="stat-label">Active Users</span>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'suspended' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('status', 'suspended')}
          style={{ cursor: 'pointer' }}
          title="Filter by Suspended status"
        >
          <span className="user-stat-number">{userStats.suspended}</span>
          <span className="stat-label">Suspended Users</span>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'banned' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('status', 'banned')}
          style={{ cursor: 'pointer' }}
          title="Filter by Banned status"
        >
          <span className="user-stat-number">{userStats.banned}</span>
          <span className="stat-label">Banned Users</span>
        </div>
      </div>

      {/* Users Table */}
      <div className='manage-users-table-darkbrown'>
        <div className='manage-users-table-lightbrown'>
          <div className='manage-users-table-content'>
            <div className='manage-users-table-title'>
              <h2>Users Management</h2>
              <div className="users-header-info">
                <span className="users-count">
                  {filteredUsers.length} of {users.length} users
                </span>
                {isFilterActive() && (
                  <div className="active-filters">
                    <span>Active filters:</span>
                    {statusFilter !== 'all' && (
                      <span className="filter-tag">Status: {statusFilter}</span>
                    )}
                    {roleFilter !== 'all' && (
                      <span className="filter-tag">Role: {roleFilter}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <p>No users found matching your criteria.</p>
                {isFilterActive() && (
                  <button 
                    className="retry-btn" 
                    onClick={clearAllFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="table-wrapper" style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                  <table className='users-table'>
                    <thead>
                      <tr>
                        <th>User Info</th>
                        <th>Contact</th>
                        <th>Gender</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Monthly Reports</th>
                        <th>Total Reports</th>
                        <th>Problem Posts</th>
                        <th>Risk Level</th>
                        <th>Joined Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-info">
                              <strong>{user.first_name} {user.last_name}</strong>
                              <small>ID: #{user.id}</small>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.gender || '-'}</td>
                          <td>
                            <span className={`role-badge ${getRoleClass(user.role)}`}>
                              <FontAwesomeIcon icon={user.role === 'admin' ? faUserShield : faUser} />
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`user-status-badge ${getStatusClass(user.status)}`}>
                              <FontAwesomeIcon icon={getStatusIcon(user.status)} />
                              {getStatusDisplayText(user)}
                            </span>
                          </td>
                          <td>
                            <span className="report-count">
                              {user.monthly_report_count || 0}
                            </span>
                          </td>
                          <td>
                            <span className="report-count">
                              {user.total_report_count || 0}
                            </span>
                          </td>
                          <td>
                            <span className="problem-posts">
                              {user.active_posts_with_reports || 0}
                            </span>
                          </td>
                          <td>
                            <ReportSeverityBadge user={user} />
                          </td>
                          <td>
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td>
                            <div className='users-table-actions'>
                              {getActionButtons(user)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="mobile-users-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
                  {filteredUsers.map(user => (
                    <MobileUserCard key={user.id} user={user} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Suspend User</h3>
              <button 
                className="modal-close"
                onClick={closeAllModals}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>You are about to suspend <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})</p>
              
              {/* Report Statistics in Modal */}
              <div className="user-report-stats">
                <h4>User Report Statistics:</h4>
                <div className="report-stats-grid">
                  <div className="report-stat">
                    <span className="stat-label">Monthly Reports:</span>
                    <span className="stat-value">{selectedUser.monthly_report_count || 0}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Total Reports:</span>
                    <span className="stat-value">{selectedUser.total_report_count || 0}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Problem Posts:</span>
                    <span className="stat-value">{selectedUser.active_posts_with_reports || 0}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="suspensionReason">Reason for Suspension *</label>
                <textarea
                  id="suspensionReason"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter the reason for suspension..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="suspensionDuration">Suspension Duration *</label>
                <select
                  id="suspensionDuration"
                  value={suspensionDuration}
                  onChange={(e) => setSuspensionDuration(e.target.value)}
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="custom">Custom duration</option>
                </select>
              </div>

              {suspensionDuration === 'custom' && (
                <div className="form-group">
                  <label htmlFor="customDays">Number of Days *</label>
                  <input
                    type="number"
                    id="customDays"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="Enter number of days"
                    min="1"
                    max="365"
                    required
                  />
                </div>
              )}

              <div className="suspension-preview">
                <p><strong>Preview:</strong> User will be suspended for {
                  suspensionDuration === 'custom' ? `${customDays} day(s)` : `${suspensionDuration} day(s)`
                }</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button 
                className="btn-primary suspend"
                onClick={handleSuspend}
                disabled={!suspensionReason.trim() || (suspensionDuration === 'custom' && !customDays)}
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ban User</h3>
              <button 
                className="modal-close"
                onClick={closeAllModals}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-banner">
                <FontAwesomeIcon icon={faBan} />
                <strong>Warning: This action is permanent!</strong>
              </div>
              <p>You are about to <strong>permanently ban</strong> <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})</p>
              
              {/* Report Statistics in Modal */}
              <div className="user-report-stats">
                <h4>User Report Statistics:</h4>
                <div className="report-stats-grid">
                  <div className="report-stat">
                    <span className="stat-label">Monthly Reports:</span>
                    <span className="stat-value">{selectedUser.monthly_report_count || 0}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Total Reports:</span>
                    <span className="stat-value">{selectedUser.total_report_count || 0}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Problem Posts:</span>
                    <span className="stat-value">{selectedUser.active_posts_with_reports || 0}</span>
                  </div>
                </div>
              </div>

              <div className="ban-consequences">
                <h4>Consequences of Banning:</h4>
                <ul>
                  <li>User will be permanently blocked from the platform</li>
                  <li>All their posts and content will be removed</li>
                  <li>They will not be able to create a new account with the same email</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>

              <div className="form-group">
                <label htmlFor="banReason">Reason for Ban *</label>
                <textarea
                  id="banReason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter the reason for permanent ban..."
                  rows="3"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button 
                className="btn-primary ban"
                onClick={handleBan}
                disabled={!banReason.trim()}
              >
                Confirm Permanent Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete User</h3>
              <button 
                className="modal-close"
                onClick={closeAllModals}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-banner">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <strong>Warning: This action cannot be undone!</strong>
              </div>
              <p>You are about to <strong>permanently delete</strong> user <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})</p>
              
              {/* Report Statistics in Modal */}
              <div className="user-report-stats">
                <h4>User Report Statistics:</h4>
                <div className="report-stats-grid">
                  <div className="report-stat">
                    <span className="stat-label">Monthly Reports:</span>
                    <span className="stat-value">{selectedUser.monthly_report_count || 0}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Total Reports:</span>
                    <span className="stat-value">{selectedUser.total_report_count || 0}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Problem Posts:</span>
                    <span className="stat-value">{selectedUser.active_posts_with_reports || 0}</span>
                  </div>
                </div>
              </div>

              <div className="deletion-consequences">
                <h4>Consequences of Deletion:</h4>
                <ul>
                  <li>All user data will be permanently removed</li>
                  <li>All their posts and content will be deleted</li>
                  <li>This action cannot be undone</li>
                  <li>User will receive notification about account deletion</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button 
                className="btn-primary delete"
                onClick={handleDelete}
              >
                Confirm Permanent Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate User Modal */}
      {showActivateModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Activate User</h3>
              <button 
                className="modal-close"
                onClick={closeAllModals}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="success-banner">
                <FontAwesomeIcon icon={faCheckCircle} />
                <strong>Activate User Account</strong>
              </div>
              <p>You are about to activate user <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})</p>
              
              <p>This will restore their access to the platform and allow them to login again.</p>

              <div className="activation-details">
                <h4>Current Status: <span className={`user-status-badge ${getStatusClass(selectedUser.status)}`}>
                  {selectedUser.status}
                </span></h4>
                
                {selectedUser.suspended_until && (
                  <p><strong>Suspended until:</strong> {new Date(selectedUser.suspended_until).toLocaleDateString()}</p>
                )}
                {selectedUser.suspension_reason && (
                  <p><strong>Previous reason:</strong> {selectedUser.suspension_reason}</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button 
                className="btn-primary activate"
                onClick={handleActivate}
              >
                Confirm Activation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}