import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faEye, 
  faCheckCircle, 
  faClock,
  faTimesCircle,
  faRefresh,
  faExclamationTriangle,
  faUser,  
  faNewspaper,
  faCalendar,
  faTrash,
  faWarning,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './styles/Reports.css';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewModal, setViewModal] = useState({ isOpen: false, report: null });
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    report: null, 
    action: '', 
    message: '',
    title: ''
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    report: null
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    resolved: 0,
    dismissed: 0
  });

  // 🆕 ADDED: Loading state for actions to prevent double clicks
  const [actionLoading, setActionLoading] = useState({
    statusUpdate: false,
    delete: false
  });

  // 🆕 ADDED: Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // 🆕 ADDED: Smart polling setup
  useEffect(() => {
    // Initial fetch
    fetchReports();
    fetchReportStats();

    // Set up auto-reload every 1 minute (60000ms)
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (isTabActiveRef.current) {
        // Tab became active, fetch immediately
        fetchReports();
        fetchReportStats();
        startPolling();
      } else {
        // Tab hidden, stop polling
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [statusFilter]);

  // 🆕 ADDED: Smart polling functions (60 seconds)
  const startPolling = () => {
    stopPolling(); // Clear any existing interval
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        fetchReports();
        fetchReportStats();
      }
    }, 60000); // 60 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // 🆕 ADDED: Manual refresh
  const handleManualRefresh = async () => {
    showToast('Refreshing reports...', 'success');
    await fetchReports();
    await fetchReportStats();
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const endpoint = statusFilter === 'all' 
        ? 'http://localhost:8000/api/admin/reports'
        : `http://localhost:8000/api/admin/reports/status/${statusFilter}`;
      
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/reports', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
 
      if (response.ok) {
        const data = await response.json();
        const allReports = data.reports || [];
        
        const stats = {
          total: allReports.length,
          pending: allReports.filter(r => r.status === 'pending').length,
          under_review: allReports.filter(r => r.status === 'under_review').length,
          resolved: allReports.filter(r => r.status === 'resolved').length,
          dismissed: allReports.filter(r => r.status === 'dismissed').length
        };
         
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching report stats:', error);
    }
  };

  const handleStatCardClick = (status) => {
    setStatusFilter(status === 'all' ? 'all' : status);
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/reports/${reportId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setReports(prev => prev.map(report => 
          report.id === reportId ? { ...report, status: newStatus } : report
        ));
        fetchReportStats();
        showToast(`Report marked as ${newStatus.replace('_', ' ')}`, 'success');
      } else {
        showToast('Failed to update report status', 'error');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      showToast('Error updating report status', 'error');
    }
  };

  // DELETE REPORT FUNCTION
  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setReports(prev => prev.filter(report => report.id !== reportId));
        fetchReportStats();
        showToast('Report deleted successfully', 'success');
        setDeleteModal({ isOpen: false, report: null });
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete report', 'error');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      showToast('Error deleting report', 'error');
    }
  };

  // MODAL FUNCTIONS
  const openViewModal = (report) => {
    setViewModal({ isOpen: true, report });
  };

  const openConfirmModal = (report, action) => {
    const actionMessages = {
      'under_review': 'mark this report as Under Review?',
      'resolved': 'mark this report as Resolved?',
      'dismissed': 'dismiss this report?',
      'pending': 'reopen this report?'
    };

    const actionTitles = {
      'under_review': 'Mark as Under Review',
      'resolved': 'Mark as Resolved',
      'dismissed': 'Dismiss Report',
      'pending': 'Reopen Report'
    };

    setConfirmModal({
      isOpen: true,
      report,
      action,
      message: `Are you sure you want to ${actionMessages[action]}`,
      title: actionTitles[action]
    });
  };

  const openDeleteModal = (report) => {
    setDeleteModal({
      isOpen: true,
      report
    });
  };

  const closeModals = () => {
    setViewModal({ isOpen: false, report: null });
    setConfirmModal({ isOpen: false, report: null, action: '', message: '', title: '' });
    setDeleteModal({ isOpen: false, report: null });
  };

  // 🆕 UPDATED: Handle confirm action with double-click prevention
  const handleConfirmAction = async () => {
    if (confirmModal.report && confirmModal.action && !actionLoading.statusUpdate) {
      setActionLoading(prev => ({ ...prev, statusUpdate: true }));
      
      try {
        await updateReportStatus(confirmModal.report.id, confirmModal.action);
        closeModals();
      } finally {
        setActionLoading(prev => ({ ...prev, statusUpdate: false }));
      }
    }
  };

  // 🆕 UPDATED: Handle delete confirm with double-click prevention
  const handleDeleteConfirm = async () => {
    if (deleteModal.report && !actionLoading.delete) {
      setActionLoading(prev => ({ ...prev, delete: true }));
      
      try {
        await deleteReport(deleteModal.report.id);
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.additional_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.post_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'rm-status-pending',
      under_review: 'rm-status-under-review',
      resolved: 'rm-status-resolved',
      dismissed: 'rm-status-dismissed'
    };
    return statusMap[status] || 'rm-status-pending';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: faClock,
      under_review: faExclamationTriangle,
      resolved: faCheckCircle,
      dismissed: faTimesCircle
    };
    return iconMap[status] || faClock;
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
    return statusFilter !== 'all' || searchTerm !== '';
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
  };

  const getActionButtonClass = (action) => {
    const classMap = {
      'under_review': 'rm-btn-warning',
      'resolved': 'rm-btn-success',
      'dismissed': 'rm-btn-danger',
      'pending': 'rm-btn-secondary'
    };
    return classMap[action] || 'rm-btn-secondary';
  };

  const getActionIcon = (action) => {
    const iconMap = {
      'under_review': faExclamationTriangle,
      'resolved': faCheckCircle,
      'dismissed': faTimesCircle,
      'pending': faRefresh
    };
    return iconMap[action] || faExclamationTriangle;
  };

  // Check if report can be deleted (only dismissed or resolved)
  const canDeleteReport = (report) => {
    return report.status === 'dismissed' || report.status === 'resolved';
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`rm-toast rm-toast-${toast.type}`}>
          <div className="rm-toast-content">
            <FontAwesomeIcon 
              icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="rm-toast-icon" 
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="rm-header">
        <div className="rm-header-content">
          <p>Review and manage user-submitted reports</p>
        </div>
        <button 
          className="rm-refresh-btn"
          onClick={handleManualRefresh}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="rm-stats">
        <div 
          className={`rm-stat-card ${statusFilter === 'all' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
          title="Show all reports"
        >
          <span className="rm-stat-number">{stats.total}</span>
          <span className="rm-stat-label">Total Reports</span>
        </div>
        <div 
          className={`rm-stat-card ${statusFilter === 'pending' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('pending')}
          style={{ cursor: 'pointer' }}
          title="Show pending reports"
        >
          <span className="rm-stat-number">{stats.pending}</span>
          <span className="rm-stat-label">Pending</span>
        </div>
        <div 
          className={`rm-stat-card ${statusFilter === 'under_review' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('under_review')}
          style={{ cursor: 'pointer' }}
          title="Show reports under review"
        >
          <span className="rm-stat-number">{stats.under_review}</span>
          <span className="rm-stat-label">Under Review</span>
        </div>
        <div 
          className={`rm-stat-card ${statusFilter === 'resolved' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('resolved')}
          style={{ cursor: 'pointer' }}
          title="Show resolved reports"
        >
          <span className="rm-stat-number">{stats.resolved}</span>
          <span className="rm-stat-label">Resolved</span>
        </div>
        <div 
          className={`rm-stat-card ${statusFilter === 'dismissed' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('dismissed')}
          style={{ cursor: 'pointer' }}
          title="Show dismissed reports"
        >
          <span className="rm-stat-number">{stats.dismissed}</span>
          <span className="rm-stat-label">Dismissed</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rm-filters">
        <div className="rm-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search reports by reason, details, or reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="rm-filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {isFilterActive() && (
          <button 
            className="rm-clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Reports Table */}
      <div className='rm-table-container'>
        <div className='rm-table-content'>
          <div className='rm-table-title'>
            <h2>Reports Management</h2>
            <div className="rm-header-info">
              <span className="rm-count">
                {filteredReports.length} of {reports.length} reports
                {isFilterActive() && ` (Filtered)`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="rm-loading">
              <div className="rm-loading-spinner"></div>
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rm-empty">
              <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
              <h3>No reports found</h3>
              <p>
                {reports.length === 0 
                  ? "No reports have been submitted yet." 
                  : "No reports match your search criteria."
                }
              </p>
              {isFilterActive() && (
                <button 
                  className="rm-retry-btn" 
                  onClick={clearAllFilters}
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="rm-table-wrapper">
              <table className='rm-table'>
                <thead>
                  <tr>
                    <th>Report Details</th>
                    <th>Reporter</th>
                    <th>Reported Post</th>
                    <th>Date Reported</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report.id}>
                      <td>
                        <div className="rm-details">
                          <strong className="rm-reason">{report.reason}</strong>
                          {report.additional_info && (
                            <small className="rm-additional">
                              {report.additional_info}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="rm-user-info">
                          <FontAwesomeIcon icon={faUser} />
                          <span>{report.reporter_name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rm-post-info">
                          <FontAwesomeIcon icon={faNewspaper} />
                          <span className="rm-post-title">{report.post_title}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rm-date-info">
                          <FontAwesomeIcon icon={faCalendar} />
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`rm-status-badge ${getStatusClass(report.status)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(report.status)} />
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className='rm-actions'>
                          <button
                            className="rm-action-btn view"
                            onClick={() => openViewModal(report)}
                            title="View Report Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          
                          {report.status === 'pending' && (
                            <>
                              <button
                                className="rm-action-btn review"
                                onClick={() => openConfirmModal(report, 'under_review')}
                                title="Mark as Under Review"
                              >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                              </button>
                              <button
                                className="rm-action-btn resolve"
                                onClick={() => openConfirmModal(report, 'resolved')}
                                title="Mark as Resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                              <button
                                className="rm-action-btn dismiss"
                                onClick={() => openConfirmModal(report, 'dismissed')}
                                title="Dismiss Report"
                              >
                                <FontAwesomeIcon icon={faTimesCircle} />
                              </button>
                            </>
                          )}
                          
                          {report.status === 'under_review' && (
                            <>
                              <button
                                className="rm-action-btn resolve"
                                onClick={() => openConfirmModal(report, 'resolved')}
                                title="Mark as Resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                              <button
                                className="rm-action-btn dismiss"
                                onClick={() => openConfirmModal(report, 'dismissed')}
                                title="Dismiss Report"
                              >
                                <FontAwesomeIcon icon={faTimesCircle} />
                              </button>
                            </>
                          )}
                          
                          {(report.status === 'resolved' || report.status === 'dismissed') && (
                            <button
                              className="rm-action-btn pending"
                              onClick={() => openConfirmModal(report, 'pending')}
                              title="Reopen Report"
                            >
                              <FontAwesomeIcon icon={faRefresh} />
                            </button>
                          )}

                          {/* DELETE BUTTON - Only show for dismissed or resolved reports */}
                          {canDeleteReport(report) && (
                            <button
                              className="rm-action-btn delete"
                              onClick={() => openDeleteModal(report)}
                              title="Delete Report"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
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

      {/* View Report Modal */}
      {viewModal.isOpen && viewModal.report && (
        <div className="rm-modal-overlay" onClick={closeModals}>
          <div className="rm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h2>Report Details</h2>
              <button className="rm-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="rm-modal-body">
              <div className="rm-details-modal">
                <div className="rm-detail-section">
                  <h3>Report Information</h3>
                  <div className="rm-detail-row">
                    <label>Report ID:</label>
                    <span>#{viewModal.report.id}</span>
                  </div>
                  <div className="rm-detail-row">
                    <label>Status:</label>
                    <span className={`rm-status-badge ${getStatusClass(viewModal.report.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(viewModal.report.status)} />
                      {viewModal.report.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="rm-detail-row">
                    <label>Reason:</label>
                    <span>{viewModal.report.reason}</span>
                  </div>
                  {viewModal.report.additional_info && (
                    <div className="rm-detail-row full-width">
                      <label>Additional Information:</label>
                      <div className="rm-additional-info">
                        {viewModal.report.additional_info}
                      </div>
                    </div>
                  )}
                  <div className="rm-detail-row">
                    <label>Date Reported:</label>
                    <span>{formatDate(viewModal.report.created_at)}</span>
                  </div>
                </div>

                <div className="rm-detail-section">
                  <h3>Reporter Information</h3>
                  <div className="rm-detail-row">
                    <label>Reporter Name:</label>
                    <span>{viewModal.report.reporter_name}</span>
                  </div>
                  <div className="rm-detail-row">
                    <label>Reporter ID:</label>
                    <span>#{viewModal.report.reporter_id}</span>
                  </div>
                </div>

                <div className="rm-detail-section">
                  <h3>Reported Post</h3>
                  <div className="rm-detail-row">
                    <label>Post Title:</label>
                    <span>{viewModal.report.post_title}</span>
                  </div>
                  <div className="rm-detail-row">
                    <label>Post ID:</label>
                    <span>#{viewModal.report.post_id}</span>
                  </div>
                  <div className="rm-detail-row">
                    <label>Post Author:</label>
                    <span>{viewModal.report.post_author_name || 'Unknown Author'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rm-modal-footer">
              <div className="rm-modal-actions">
                {viewModal.report.status === 'pending' && (
                  <>
                    <button
                      className="rm-btn rm-btn-warning"
                      onClick={() => openConfirmModal(viewModal.report, 'under_review')}
                    >
                      Mark Under Review
                    </button>
                    <button
                      className="rm-btn rm-btn-success"
                      onClick={() => openConfirmModal(viewModal.report, 'resolved')}
                    >
                      Mark Resolved
                    </button>
                    <button
                      className="rm-btn rm-btn-danger"
                      onClick={() => openConfirmModal(viewModal.report, 'dismissed')}
                    >
                      Dismiss
                    </button>
                  </>
                )}
                {viewModal.report.status === 'under_review' && (
                  <>
                    <button
                      className="rm-btn rm-btn-success"
                      onClick={() => openConfirmModal(viewModal.report, 'resolved')}
                    >
                      Mark Resolved
                    </button>
                    <button
                      className="rm-btn rm-btn-danger"
                      onClick={() => openConfirmModal(viewModal.report, 'dismissed')}
                    >
                      Dismiss
                    </button>
                  </>
                )}
                {(viewModal.report.status === 'resolved' || viewModal.report.status === 'dismissed') && (
                  <>
                    <button
                      className="rm-btn rm-btn-secondary"
                      onClick={() => openConfirmModal(viewModal.report, 'pending')}
                    >
                      Reopen Report
                    </button>
                    {/* DELETE BUTTON in modal - Only for dismissed or resolved */}
                    {canDeleteReport(viewModal.report) && (
                      <button
                        className="rm-btn rm-btn-danger"
                        onClick={() => openDeleteModal(viewModal.report)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete Report
                      </button>
                    )}
                  </>
                )}
                <button className="rm-btn rm-btn-primary" onClick={closeModals}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.report && (
        <div className="rm-modal-overlay" onClick={closeModals}>
          <div className="rm-modal-content rm-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h2>{confirmModal.title}</h2>
              <button className="rm-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="rm-modal-body">
              <div className="rm-confirm-content">
                <div className="rm-confirm-icon">
                  <FontAwesomeIcon icon={getActionIcon(confirmModal.action)} />
                </div>
                <h3>Are you sure?</h3>
                <p>{confirmModal.message}</p>
                <div className="rm-confirm-details">
                  <strong>Report #{confirmModal.report.id}</strong>
                  <span>{confirmModal.report.reason}</span>
                  <small>Reporter: {confirmModal.report.reporter_name}</small>
                </div>
              </div>
            </div>
            <div className="rm-modal-footer">
              <div className="rm-modal-actions">
                <button 
                  className="rm-btn rm-btn-secondary" 
                  onClick={closeModals}
                  disabled={actionLoading.statusUpdate}
                >
                  Cancel
                </button>
                <button 
                  className={`rm-btn ${getActionButtonClass(confirmModal.action)}`}
                  onClick={handleConfirmAction}
                  disabled={actionLoading.statusUpdate}
                >
                  <FontAwesomeIcon 
                    icon={actionLoading.statusUpdate ? faRefresh : getActionIcon(confirmModal.action)} 
                    spin={actionLoading.statusUpdate}
                  />
                  {actionLoading.statusUpdate ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.report && (
        <div className="rm-modal-overlay" onClick={closeModals}>
          <div className="rm-modal-content rm-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h2>Delete Report</h2>
              <button className="rm-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="rm-modal-body">
              <div className="rm-confirm-content">
                <div className="rm-confirm-icon">
                  <FontAwesomeIcon icon={faWarning} style={{ color: '#ef4444' }} />
                </div>
                <h3>Delete Report?</h3>
                <p>Are you sure you want to permanently delete this report?</p>
                <div className="rm-confirm-details">
                  <strong>Report #{deleteModal.report.id}</strong>
                  <span>{deleteModal.report.reason}</span>
                  <small>Reporter: {deleteModal.report.reporter_name}</small>
                  <small>Status: {deleteModal.report.status}</small>
                </div>
                <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '1rem' }}>
                  This action cannot be undone!
                </p>
              </div>
            </div>
            <div className="rm-modal-footer">
              <div className="rm-modal-actions">
                <button 
                  className="rm-btn rm-btn-secondary" 
                  onClick={closeModals}
                  disabled={actionLoading.delete}
                >
                  Cancel
                </button>
                <button 
                  className="rm-btn rm-btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading.delete}
                >
                  <FontAwesomeIcon 
                    icon={actionLoading.delete ? faRefresh : faTrash} 
                    spin={actionLoading.delete}
                  />
                  {actionLoading.delete ? 'Deleting...' : 'Delete Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}