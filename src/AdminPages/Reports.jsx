import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faEye, 
  faCheckCircle, 
  faClock,
  faTimesCircle,
  faBan,
  faRefresh,
  faExclamationTriangle,
  faUser,
  faNewspaper,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import './styles/Reports.css';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewModal, setViewModal] = useState({ isOpen: false, report: null });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    resolved: 0,
    dismissed: 0
  });

  useEffect(() => {
    fetchReports();
    fetchReportStats();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const endpoint = statusFilter === 'all' 
        ? 'http://localhost:8000/api/reports'
        : `http://localhost:8000/api/reports/status/${statusFilter}`;
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched reports:', data.reports);
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
      const response = await fetch('http://localhost:8000/api/reports', {
        credentials: 'include'
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
      const response = await fetch(`http://localhost:8000/api/reports/${reportId}/status`, {
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
        alert(`Report marked as ${newStatus}`);
      } else {
        alert('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Error updating report status');
    }
  };

  const openViewModal = (report) => {
    console.log('Opening modal with report:', report);
    setViewModal({ isOpen: true, report });
  };

  const closeModals = () => {
    setViewModal({ isOpen: false, report: null });
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
      pending: 'reports-status-pending',
      under_review: 'reports-status-under-review',
      resolved: 'reports-status-resolved',
      dismissed: 'reports-status-dismissed'
    };
    return statusMap[status] || 'reports-status-pending';
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
    return statusFilter !== 'all';
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
  };

  return (
    <>
      {/* Header Section */}
      <div className="reports-management-header">
        <div className="reports-header-content">
        
          <p>Review and manage user-submitted reports</p>
        </div>
        <button 
          className="reports-refresh-btn"
          onClick={fetchReports}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* Stats Summary - UPDATED TO MATCH MANAGEUSERS */}
      <div className="reports-management-stats">
        <div 
          className={`reports-stat-card ${statusFilter === 'all' ? 'reports-stat-active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
          title="Show all reports"
        >
          <span className="reports-stat-number">{stats.total}</span>
          <span className="reports-stat-label">Total Reports</span>
        </div>
        <div 
          className={`reports-stat-card ${statusFilter === 'pending' ? 'reports-stat-active' : ''}`}
          onClick={() => handleStatCardClick('pending')}
          style={{ cursor: 'pointer' }}
          title="Show pending reports"
        >
          <span className="reports-stat-number">{stats.pending}</span>
          <span className="reports-stat-label">Pending</span>
        </div>
        <div 
          className={`reports-stat-card ${statusFilter === 'under_review' ? 'reports-stat-active' : ''}`}
          onClick={() => handleStatCardClick('under_review')}
          style={{ cursor: 'pointer' }}
          title="Show reports under review"
        >
          <span className="reports-stat-number">{stats.under_review}</span>
          <span className="reports-stat-label">Under Review</span>
        </div>
        <div 
          className={`reports-stat-card ${statusFilter === 'resolved' ? 'reports-stat-active' : ''}`}
          onClick={() => handleStatCardClick('resolved')}
          style={{ cursor: 'pointer' }}
          title="Show resolved reports"
        >
          <span className="reports-stat-number">{stats.resolved}</span>
          <span className="reports-stat-label">Resolved</span>
        </div>
        <div 
          className={`reports-stat-card ${statusFilter === 'dismissed' ? 'reports-stat-active' : ''}`}
          onClick={() => handleStatCardClick('dismissed')}
          style={{ cursor: 'pointer' }}
          title="Show dismissed reports"
        >
          <span className="reports-stat-number">{stats.dismissed}</span>
          <span className="reports-stat-label">Dismissed</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="reports-management-filters">
        <div className="reports-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search reports by reason, details, or reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="reports-filter-group">
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
            className="reports-clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {isFilterActive() && (
        <div className="reports-active-filters-section">
          <span className="reports-active-filters-label">Active filter:</span>
          <div className="reports-filter-tags">
            <span className="reports-filter-tag">
              Status: {statusFilter}
            </span>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className='reports-management-table-container'>
        <div className='reports-management-table-content'>
          <div className='reports-management-table-title'>
            <h2>Reports Management</h2>
            <div className="reports-management-header-info">
              <span className="reports-management-count">
                {filteredReports.length} of {reports.length} reports
                {isFilterActive() && ` (Filtered by: ${statusFilter})`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="reports-loading-state">
              <div className="reports-loading-spinner"></div>
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="reports-empty-state">
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
                  className="reports-retry-btn" 
                  onClick={clearAllFilters}
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="reports-table-wrapper">
              <table className='reports-management-table'>
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
                        <div className="reports-management-details">
                          <strong className="reports-management-reason">{report.reason}</strong>
                          {report.additional_info && (
                            <small className="reports-management-additional">
                              {report.additional_info}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="reports-user-info">
                          <FontAwesomeIcon icon={faUser} />
                          <span>{report.reporter_name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="reports-post-info">
                          <FontAwesomeIcon icon={faNewspaper} />
                          <span className="reports-post-title">{report.post_title}</span>
                        </div>
                      </td>
                      <td>
                        <div className="reports-date-info">
                          <FontAwesomeIcon icon={faCalendar} />
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`reports-status-badge ${getStatusClass(report.status)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(report.status)} />
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className='reports-management-actions'>
                          <button
                            className="reports-action-btn view"
                            onClick={() => openViewModal(report)}
                            title="View Report Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          
                          {report.status === 'pending' && (
                            <>
                              <button
                                className="reports-action-btn review"
                                onClick={() => updateReportStatus(report.id, 'under_review')}
                                title="Mark as Under Review"
                              >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                              </button>
                              <button
                                className="reports-action-btn resolve"
                                onClick={() => updateReportStatus(report.id, 'resolved')}
                                title="Mark as Resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                              <button
                                className="reports-action-btn dismiss"
                                onClick={() => updateReportStatus(report.id, 'dismissed')}
                                title="Dismiss Report"
                              >
                                <FontAwesomeIcon icon={faTimesCircle} />
                              </button>
                            </>
                          )}
                          
                          {report.status === 'under_review' && (
                            <>
                              <button
                                className="reports-action-btn resolve"
                                onClick={() => updateReportStatus(report.id, 'resolved')}
                                title="Mark as Resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                              <button
                                className="reports-action-btn dismiss"
                                onClick={() => updateReportStatus(report.id, 'dismissed')}
                                title="Dismiss Report"
                              >
                                <FontAwesomeIcon icon={faTimesCircle} />
                              </button>
                            </>
                          )}
                          
                          {(report.status === 'resolved' || report.status === 'dismissed') && (
                            <button
                              className="reports-action-btn pending"
                              onClick={() => updateReportStatus(report.id, 'pending')}
                              title="Reopen Report"
                            >
                              <FontAwesomeIcon icon={faRefresh} />
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
        <div className="reports-modal-overlay" onClick={closeModals}>
          <div className="reports-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="reports-modal-header">
              <h2>Report Details</h2>
              <button className="reports-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            <div className="reports-modal-body">
              <div className="reports-details-modal">
                <div className="reports-detail-section">
                  <h3>Report Information</h3>
                  <div className="reports-detail-row">
                    <label>Report ID:</label>
                    <span>#{viewModal.report.id}</span>
                  </div>
                  <div className="reports-detail-row">
                    <label>Status:</label>
                    <span className={`reports-status-badge ${getStatusClass(viewModal.report.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(viewModal.report.status)} />
                      {viewModal.report.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="reports-detail-row">
                    <label>Reason:</label>
                    <span>{viewModal.report.reason}</span>
                  </div>
                  {viewModal.report.additional_info && (
                    <div className="reports-detail-row full-width">
                      <label>Additional Information:</label>
                      <div className="reports-additional-info">
                        {viewModal.report.additional_info}
                      </div>
                    </div>
                  )}
                  <div className="reports-detail-row">
                    <label>Date Reported:</label>
                    <span>{formatDate(viewModal.report.created_at)}</span>
                  </div>
                </div>

                <div className="reports-detail-section">
                  <h3>Reporter Information</h3>
                  <div className="reports-detail-row">
                    <label>Reporter Name:</label>
                    <span>{viewModal.report.reporter_name}</span>
                  </div>
                  <div className="reports-detail-row">
                    <label>Reporter ID:</label>
                    <span>#{viewModal.report.reporter_id}</span>
                  </div>
                </div>

                <div className="reports-detail-section">
                  <h3>Reported Post</h3>
                  <div className="reports-detail-row">
                    <label>Post Title:</label>
                    <span>{viewModal.report.post_title}</span>
                  </div>
                  <div className="reports-detail-row">
                    <label>Post ID:</label>
                    <span>#{viewModal.report.post_id}</span>
                  </div>
                  <div className="reports-detail-row">
                    <label>Post Author:</label>
                    <span>{viewModal.report.post_author_name || 'Unknown Author'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="reports-modal-footer">
              <div className="reports-modal-actions">
                {viewModal.report.status === 'pending' && (
                  <>
                    <button
                      className="reports-btn reports-btn-warning"
                      onClick={() => {
                        updateReportStatus(viewModal.report.id, 'under_review');
                        closeModals();
                      }}
                    >
                      Mark Under Review
                    </button>
                    <button
                      className="reports-btn reports-btn-success"
                      onClick={() => {
                        updateReportStatus(viewModal.report.id, 'resolved');
                        closeModals();
                      }}
                    >
                      Mark Resolved
                    </button>
                    <button
                      className="reports-btn reports-btn-danger"
                      onClick={() => {
                        updateReportStatus(viewModal.report.id, 'dismissed');
                        closeModals();
                      }}
                    >
                      Dismiss
                    </button>
                  </>
                )}
                {viewModal.report.status === 'under_review' && (
                  <>
                    <button
                      className="reports-btn reports-btn-success"
                      onClick={() => {
                        updateReportStatus(viewModal.report.id, 'resolved');
                        closeModals();
                      }}
                    >
                      Mark Resolved
                    </button>
                    <button
                      className="reports-btn reports-btn-danger"
                      onClick={() => {
                        updateReportStatus(viewModal.report.id, 'dismissed');
                        closeModals();
                      }}
                    >
                      Dismiss
                    </button>
                  </>
                )}
                {(viewModal.report.status === 'resolved' || viewModal.report.status === 'dismissed') && (
                  <button
                    className="reports-btn reports-btn-secondary"
                    onClick={() => {
                      updateReportStatus(viewModal.report.id, 'pending');
                      closeModals();
                    }}
                  >
                    Reopen Report
                  </button>
                )}
                <button className="reports-btn reports-btn-primary" onClick={closeModals}>
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