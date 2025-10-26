import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faSearch, 
  faFilter, 
  faEye, 
  faCheckCircle, 
  faClock,
  faTimesCircle,
  faExclamationTriangle,
  faUser,
  faBug,
  faLightbulb,
  faStar,
  faCommentDots,
  faRefresh,
  faUserShield,
  faTrash,
  faBan
} from '@fortawesome/free-solid-svg-icons';
import './styles/AdminFeedback.css';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [viewModal, setViewModal] = useState({ isOpen: false, feedback: null });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchFeedback();
    fetchFeedbackStats();
  }, [statusFilter, typeFilter, priorityFilter]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:8000/api/feedback';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/feedback/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus, adminNotes = '') => {
    try {
      const response = await fetch(`http://localhost:8000/api/feedback/${feedbackId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          admin_notes: adminNotes 
        })
      });

      if (response.ok) {
        setFeedback(prev => prev.map(item => 
          item.id === feedbackId ? { ...item, status: newStatus, admin_notes: adminNotes } : item
        ));
        fetchFeedbackStats();
        alert(`Feedback marked as ${newStatus}`);
      } else {
        alert('Failed to update feedback status');
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      alert('Error updating feedback status');
    }
  };

  // 🆕 DELETE FEEDBACK
  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setFeedback(prev => prev.filter(item => item.id !== feedbackId));
        fetchFeedbackStats();
        alert('Feedback deleted successfully');
      } else {
        alert('Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error deleting feedback');
    }
  };

  const assignFeedback = async (feedbackId, adminId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/feedback/${feedbackId}/assign`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assigned_to: adminId })
      });

      if (response.ok) {
        setFeedback(prev => prev.map(item => 
          item.id === feedbackId ? { ...item, assigned_to: adminId } : item
        ));
        alert('Feedback assigned successfully');
      } else {
        alert('Failed to assign feedback');
      }
    } catch (error) {
      console.error('Error assigning feedback:', error);
      alert('Error assigning feedback');
    }
  };

  const openViewModal = (feedbackItem) => {
    setViewModal({ isOpen: true, feedback: feedbackItem });
  };

  const closeModals = () => {
    setViewModal({ isOpen: false, feedback: null });
    setSelectedFeedback(null);
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.submitter_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.submitter_last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'feedback-status-pending',
      reviewed: 'feedback-status-reviewed',
      in_progress: 'feedback-status-in-progress',
      completed: 'feedback-status-completed',
      rejected: 'feedback-status-rejected'
    };
    return statusMap[status] || 'feedback-status-pending';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: faClock,
      reviewed: faEye,
      in_progress: faExclamationTriangle,
      completed: faCheckCircle,
      rejected: faBan
    };
    return iconMap[status] || faClock;
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      bug: faBug,
      feature: faLightbulb,
      suggestion: faStar,
      general: faCommentDots
    };
    return iconMap[type] || faCommentDots;
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      critical: 'feedback-priority-critical',
      high: 'feedback-priority-high',
      medium: 'feedback-priority-medium',
      low: 'feedback-priority-low'
    };
    return priorityMap[priority] || 'feedback-priority-medium';
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

  const isFilterActive = () => {
    return statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all';
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  return (
    <>
      {/* Header Section */}
      <div className="feedback-management-header">
        <div className="feedback-header-content">
          <h1>Feedback Management</h1>
          <p>Review and manage user-submitted feedback and suggestions</p>
        </div>
        <button 
          className="feedback-refresh-btn"
          onClick={fetchFeedback}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="feedback-management-stats">
        <div 
          className={`feedback-stat-card ${statusFilter === 'all' ? 'feedback-stat-active' : ''}`}
          onClick={() => setStatusFilter('all')}
          style={{ cursor: 'pointer' }}
          title="Show all feedback"
        >
          <span className="feedback-stat-number">{stats.total}</span>
          <span className="feedback-stat-label">Total Feedback</span>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'pending' ? 'feedback-stat-active' : ''}`}
          onClick={() => setStatusFilter('pending')}
          style={{ cursor: 'pointer' }}
          title="Show pending feedback"
        >
          <span className="feedback-stat-number">{stats.pending}</span>
          <span className="feedback-stat-label">Pending</span>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'reviewed' ? 'feedback-stat-active' : ''}`}
          onClick={() => setStatusFilter('reviewed')}
          style={{ cursor: 'pointer' }}
          title="Show reviewed feedback"
        >
          <span className="feedback-stat-number">{stats.reviewed}</span>
          <span className="feedback-stat-label">Reviewed</span>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'in_progress' ? 'feedback-stat-active' : ''}`}
          onClick={() => setStatusFilter('in_progress')}
          style={{ cursor: 'pointer' }}
          title="Show feedback in progress"
        >
          <span className="feedback-stat-number">{stats.in_progress}</span>
          <span className="feedback-stat-label">In Progress</span>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'completed' ? 'feedback-stat-active' : ''}`}
          onClick={() => setStatusFilter('completed')}
          style={{ cursor: 'pointer' }}
          title="Show completed feedback"
        >
          <span className="feedback-stat-number">{stats.completed}</span>
          <span className="feedback-stat-label">Completed</span>
        </div>
        <div 
          className={`feedback-stat-card ${statusFilter === 'rejected' ? 'feedback-stat-active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
          style={{ cursor: 'pointer' }}
          title="Show rejected feedback"
        >
          <span className="feedback-stat-number">{stats.rejected}</span>
          <span className="feedback-stat-label">Rejected</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="feedback-management-filters">
        <div className="feedback-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search feedback by title, description, or submitter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="feedback-filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="feedback-filter-group">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="suggestion">Suggestion</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="feedback-filter-group">
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {isFilterActive() && (
          <button 
            className="feedback-clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {isFilterActive() && (
        <div className="feedback-active-filters-section">
          <span className="feedback-active-filters-label">Active filters:</span>
          <div className="feedback-filter-tags">
            {statusFilter !== 'all' && (
              <span className="feedback-filter-tag">
                Status: {statusFilter}
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="feedback-filter-tag">
                Type: {typeFilter}
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="feedback-filter-tag">
                Priority: {priorityFilter}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Feedback Table */}
      <div className='feedback-management-table-container'>
        <div className='feedback-management-table-content'>
          <div className='feedback-management-table-title'>
            <h2>Feedback Management</h2>
            <div className="feedback-management-header-info">
              <span className="feedback-management-count">
                {filteredFeedback.length} of {feedback.length} feedback items
                {isFilterActive() && ' (Filtered)'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="feedback-loading-state">
              <div className="feedback-loading-spinner"></div>
              <p>Loading feedback...</p>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="feedback-empty-state">
              <FontAwesomeIcon icon={faComments} size="3x" />
              <h3>No feedback found</h3>
              <p>
                {feedback.length === 0 
                  ? "No feedback has been submitted yet." 
                  : "No feedback matches your search criteria."
                }
              </p>
              {isFilterActive() && (
                <button 
                  className="feedback-retry-btn" 
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="feedback-table-wrapper">
              <table className='feedback-management-table'>
                <thead>
                  <tr>
                    <th>Feedback Details</th>
                    <th>Submitted By</th>
                    <th>Type & Priority</th>
                    <th>Date Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedback.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="feedback-management-details">
                          <div className="feedback-title-type">
                            <FontAwesomeIcon icon={getTypeIcon(item.type)} />
                            <strong className="feedback-management-title">{item.title}</strong>
                          </div>
                          <small className="feedback-management-description">
                            {item.description.length > 100 
                              ? `${item.description.substring(0, 100)}...` 
                              : item.description
                            }
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="feedback-user-info">
                          <FontAwesomeIcon icon={faUser} />
                          <span>
                            {item.submitter_first_name && item.submitter_last_name 
                              ? `${item.submitter_first_name} ${item.submitter_last_name}`
                              : 'Anonymous User'
                            }
                          </span>
                        </div>
                        {item.submitter_email && (
                          <small className="feedback-user-email">{item.submitter_email}</small>
                        )}
                      </td>
                      <td>
                        <div className="feedback-type-priority">
                          <span className={`feedback-type-badge feedback-type-${item.type}`}>
                            {item.type}
                          </span>
                          <span className={`feedback-priority-badge ${getPriorityClass(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="feedback-date-info">
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`feedback-status-badge ${getStatusClass(item.status)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(item.status)} />
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className='feedback-management-actions'>
                          <button
                            className="feedback-action-btn view"
                            onClick={() => openViewModal(item)}
                            title="View Feedback Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          
                          {item.status === 'pending' && (
                            <>
                              <button
                                className="feedback-action-btn review"
                                onClick={() => updateFeedbackStatus(item.id, 'reviewed')}
                                title="Mark as Reviewed"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                className="feedback-action-btn progress"
                                onClick={() => updateFeedbackStatus(item.id, 'in_progress')}
                                title="Mark as In Progress"
                              >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                              </button>
                            </>
                          )}
                          
                          {item.status === 'reviewed' && (
                            <>
                              <button
                                className="feedback-action-btn progress"
                                onClick={() => updateFeedbackStatus(item.id, 'in_progress')}
                                title="Mark as In Progress"
                              >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                              </button>
                              <button
                                className="feedback-action-btn complete"
                                onClick={() => updateFeedbackStatus(item.id, 'completed')}
                                title="Mark as Completed"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                            </>
                          )}
                          
                          {item.status === 'in_progress' && (
                            <button
                              className="feedback-action-btn complete"
                              onClick={() => updateFeedbackStatus(item.id, 'completed')}
                              title="Mark as Completed"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                          )}
                          
                          {(item.status === 'completed' || item.status === 'rejected') && (
                            <button
                              className="feedback-action-btn pending"
                              onClick={() => updateFeedbackStatus(item.id, 'pending')}
                              title="Reopen Feedback"
                            >
                              <FontAwesomeIcon icon={faRefresh} />
                            </button>
                          )}
                          
                          {item.status !== 'rejected' && (
                            <button
                              className="feedback-action-btn reject"
                              onClick={() => {
                                const adminNotes = prompt('Please provide a reason for rejection:');
                                if (adminNotes !== null) {
                                  updateFeedbackStatus(item.id, 'rejected', adminNotes);
                                }
                              }}
                              title="Reject Feedback"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          )}

                          {/* 🆕 DELETE BUTTON */}
                          <button
                            className="feedback-action-btn delete"
                            onClick={() => deleteFeedback(item.id)}
                            title="Delete Feedback"
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

      {/* View Feedback Modal */}
      {viewModal.isOpen && viewModal.feedback && (
        <div className="feedback-modal-overlay" onClick={closeModals}>
          <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h2>Feedback Details</h2>
              <button className="feedback-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            <div className="feedback-modal-body">
              <div className="feedback-details-modal">
                <div className="feedback-detail-section">
                  <h3>Feedback Information</h3>
                  <div className="feedback-detail-row">
                    <label>Feedback ID:</label>
                    <span>#{viewModal.feedback.id}</span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Type:</label>
                    <span className={`feedback-type-badge feedback-type-${viewModal.feedback.type}`}>
                      {viewModal.feedback.type}
                    </span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Priority:</label>
                    <span className={`feedback-priority-badge ${getPriorityClass(viewModal.feedback.priority)}`}>
                      {viewModal.feedback.priority}
                    </span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Status:</label>
                    <span className={`feedback-status-badge ${getStatusClass(viewModal.feedback.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(viewModal.feedback.status)} />
                      {viewModal.feedback.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Title:</label>
                    <span>{viewModal.feedback.title}</span>
                  </div>
                  <div className="feedback-detail-row full-width">
                    <label>Description:</label>
                    <div className="feedback-description-full">
                      {viewModal.feedback.description}
                    </div>
                  </div>
                  <div className="feedback-detail-row">
                    <label>Date Submitted:</label>
                    <span>{formatDate(viewModal.feedback.created_at)}</span>
                  </div>
                  {viewModal.feedback.admin_notes && (
                    <div className="feedback-detail-row full-width">
                      <label>Admin Notes:</label>
                      <div className="feedback-admin-notes">
                        {viewModal.feedback.admin_notes}
                      </div>
                    </div>
                  )}
                </div>

                <div className="feedback-detail-section">
                  <h3>Submitter Information</h3>
                  <div className="feedback-detail-row">
                    <label>Submitted by:</label>
                    <span>
                      {viewModal.feedback.submitter_first_name && viewModal.feedback.submitter_last_name 
                        ? `${viewModal.feedback.submitter_first_name} ${viewModal.feedback.submitter_last_name}`
                        : 'Anonymous User'
                      }
                    </span>
                  </div>
                  {viewModal.feedback.submitter_email && (
                    <div className="feedback-detail-row">
                      <label>Email:</label>
                      <span>{viewModal.feedback.submitter_email}</span>
                    </div>
                  )}
                  {viewModal.feedback.user_id && (
                    <div className="feedback-detail-row">
                      <label>User ID:</label>
                      <span>#{viewModal.feedback.user_id}</span>
                    </div>
                  )}
                </div>

                {viewModal.feedback.assigned_admin_first_name && (
                  <div className="feedback-detail-section">
                    <h3>Assignment</h3>
                    <div className="feedback-detail-row">
                      <label>Assigned to:</label>
                      <span>
                        <FontAwesomeIcon icon={faUserShield} />
                        {viewModal.feedback.assigned_admin_first_name} {viewModal.feedback.assigned_admin_last_name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="feedback-modal-footer">
              <div className="feedback-modal-actions">
                {viewModal.feedback.status === 'pending' && (
                  <>
                    <button
                      className="feedback-btn feedback-btn-warning"
                      onClick={() => {
                        updateFeedbackStatus(viewModal.feedback.id, 'reviewed');
                        closeModals();
                      }}
                    >
                      Mark Reviewed
                    </button>
                    <button
                      className="feedback-btn feedback-btn-info"
                      onClick={() => {
                        updateFeedbackStatus(viewModal.feedback.id, 'in_progress');
                        closeModals();
                      }}
                    >
                      Mark In Progress
                    </button>
                  </>
                )}
                {viewModal.feedback.status === 'reviewed' && (
                  <>
                    <button
                      className="feedback-btn feedback-btn-info"
                      onClick={() => {
                        updateFeedbackStatus(viewModal.feedback.id, 'in_progress');
                        closeModals();
                      }}
                    >
                      Mark In Progress
                    </button>
                    <button
                      className="feedback-btn feedback-btn-success"
                      onClick={() => {
                        updateFeedbackStatus(viewModal.feedback.id, 'completed');
                        closeModals();
                      }}
                    >
                      Mark Completed
                    </button>
                  </>
                )}
                {viewModal.feedback.status === 'in_progress' && (
                  <button
                    className="feedback-btn feedback-btn-success"
                    onClick={() => {
                      updateFeedbackStatus(viewModal.feedback.id, 'completed');
                      closeModals();
                    }}
                  >
                    Mark Completed
                  </button>
                )}
                {(viewModal.feedback.status === 'completed' || viewModal.feedback.status === 'rejected') && (
                  <button
                    className="feedback-btn feedback-btn-secondary"
                    onClick={() => {
                      updateFeedbackStatus(viewModal.feedback.id, 'pending');
                      closeModals();
                    }}
                  >
                    Reopen Feedback
                  </button>
                )}
                {viewModal.feedback.status !== 'rejected' && (
                  <button
                    className="feedback-btn feedback-btn-danger"
                    onClick={() => {
                      const adminNotes = prompt('Please provide a reason for rejection:');
                      if (adminNotes !== null) {
                        updateFeedbackStatus(viewModal.feedback.id, 'rejected', adminNotes);
                        closeModals();
                      }
                    }}
                  >
                    Reject
                  </button>
                )}
                {/* 🆕 DELETE BUTTON IN MODAL */}
                <button
                  className="feedback-btn feedback-btn-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
                      deleteFeedback(viewModal.feedback.id);
                      closeModals();
                    }
                  }}
                >
                  Delete
                </button>
                <button className="feedback-btn feedback-btn-primary" onClick={closeModals}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}