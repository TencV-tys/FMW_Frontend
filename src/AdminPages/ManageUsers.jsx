import { useState, useEffect } from 'react';
import AdminNav from '../AdminComponents/AdminNav';
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
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import './styles/ManageUsers.css';

export default function ManageUsers() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
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

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        alert(`User ${newStatus} successfully!`);
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.log(`Status update error: ${error.message}`);
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
    admin: users.filter(u => u.role === 'admin').length,
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

  return (
    <section className="manage-users-container">
      <AdminNav isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} />
      
      <main className='manage-users-content'
        style={{
          marginLeft: isSideBarOpen ? '200px' : '70px',
          transition: 'margin-left 0.4s ease',
          padding: '20px'
        }}
      >
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
        </div>

        {/* Stats Summary */}
        <div className="users-stats">
          <div className="stat-card">
            <span className="stat-number">{userStats.total}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{userStats.admin}</span>
            <span className="stat-label">Admin Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{userStats.active}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{userStats.suspended + userStats.banned}</span>
            <span className="stat-label">Restricted</span>
          </div>
        </div>

        {/* Users Table */}
        <div className='manage-users-table-darkbrown'>
          <div className='manage-users-table-lightbrown'>
            <div className='manage-users-table-content'>
              <div className='manage-users-table-title'>
                <h2>Users Management</h2>
                <span className="users-count">
                  {filteredUsers.length} of {users.length} users
                </span>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                  <p>No users found matching your criteria.</p>
                </div>
              ) : (
                <div className="table-wrapper">
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
                                    onClick={() => handleStatusUpdate(user.id, 'suspended')}
                                    title="Suspend User"
                                  >
                                    <FontAwesomeIcon icon={faBan} />
                                  </button>
                                  <button
                                    className="action-btn ban"
                                    onClick={() => handleStatusUpdate(user.id, 'banned')}
                                    title="Ban User"
                                  >
                                    <FontAwesomeIcon icon={faUserSlash} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="action-btn activate"
                                  onClick={() => handleStatusUpdate(user.id, 'active')}
                                  title="Activate User"
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                              )}
                              <button
                                className="action-btn delete"
                                onClick={() => handleDelete(user.id)}
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
              )}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}