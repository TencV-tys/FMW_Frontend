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
  faPauseCircle
} from '@fortawesome/free-solid-svg-icons';
import './styles/ManageUsers.css';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/users', {
        credentials: 'include'
      });
      const data = await res.json();
      setUsers(data); 
    } catch (error) {
      console.log(`Error fetching users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 DELETE USER with confirmation
  const handleDelete = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      if (res.ok) {
        setUsers(users.filter((user) => user.id !== id));
        alert('User deleted successfully!');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.log(`Delete error: ${error.message}`);
    }
  };

  // 🎯 SUSPEND USER with confirmation
  const handleSuspend = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to suspend user "${userName}"? They will not be able to login until restored.`)) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'suspended' })
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'suspended' } : user
        ));
        alert(`User "${userName}" suspended successfully!`);
      } else {
        alert('Failed to suspend user');
      }
    } catch (error) {
      console.log(`Suspend error: ${error.message}`);
    }
  };

  // 🎯 BAN USER with confirmation
  const handleBan = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently ban user "${userName}"? This action is irreversible.`)) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'banned' })
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'banned' } : user
        ));
        alert(`User "${userName}" banned successfully!`);
      } else {
        alert('Failed to ban user');
      }
    } catch (error) {
      console.log(`Ban error: ${error.message}`);
    }
  };

  // 🎯 ACTIVATE USER with confirmation
  const handleActivate = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to activate user "${userName}"? They will be able to login again.`)) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' })
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'active' } : user
        ));
        alert(`User "${userName}" activated successfully!`);
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

  // Stats calculation - Updated to match new requirements
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    banned: users.filter(u => u.status === 'banned').length
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      active: 'status-active',
      suspended: 'status-suspended',
      banned: 'status-banned'
    };
    return statusMap[status] || 'status-active';
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
            {user.status}
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
      </div>
      
      <div className="mobile-card-actions">
        {user.status === 'active' ? (
          <>
            <button
              className="mobile-action-btn suspend"
              onClick={() => handleSuspend(user.id, getUserName(user))}
              title="Suspend User"
            >
              <FontAwesomeIcon icon={faPauseCircle} />
              Suspend
            </button>
            <button
              className="mobile-action-btn ban"
              onClick={() => handleBan(user.id, getUserName(user))}
              title="Ban User"
            >
              <FontAwesomeIcon icon={faUserSlash} />
              Ban
            </button>
          </>
        ) : (
          <button
            className="mobile-action-btn activate"
            onClick={() => handleActivate(user.id, getUserName(user))}
            title="Activate User"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            Activate
          </button>
        )}
        <button
          className="mobile-action-btn delete"
          onClick={() => handleDelete(user.id, getUserName(user))}
          title="Delete User"
        >
          <FontAwesomeIcon icon={faTrash} />
          Delete
        </button>
      </div>
    </div>
  );

  return (
   <>
        {/* Header Section */}
        <div className="manage-users-header">
          <div className="header-content">
            <h1>Manage Users</h1>
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

        {/* Stats Summary - Updated with 4 cards: Total, Active, Suspended, Banned */}
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
                              <span className={`status-badge ${getStatusClass(user.status)}`}>
                                {user.status}
                              </span>
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
                                {user.status === 'active' ? (
                                  <>
                                    <button
                                      className="action-btn suspend"
                                      onClick={() => handleSuspend(user.id, getUserName(user))}
                                      title="Suspend User"
                                    >
                                      <FontAwesomeIcon icon={faPauseCircle} />
                                    </button>
                                    <button
                                      className="action-btn ban"
                                      onClick={() => handleBan(user.id, getUserName(user))}
                                      title="Ban User"
                                    >
                                      <FontAwesomeIcon icon={faUserSlash} />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="action-btn activate"
                                    onClick={() => handleActivate(user.id, getUserName(user))}
                                    title="Activate User"
                                  >
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                  </button>
                                )}
                                <button
                                  className="action-btn delete"
                                  onClick={() => handleDelete(user.id, getUserName(user))}
                                  title="Delete User"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
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
    </>
  );
}