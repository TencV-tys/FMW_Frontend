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
        console.log('Fetched reports:', data.reports); // Debug log
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
      // Since we don't have a dedicated stats endpoint, we'll calculate from all reports
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

  // Handle stat card click for filtering
  const handleStatCardClick = (status) => {
    setStatusFilter(status === 'all' ? 'all' : status);
  };

  // Update report status
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

  // Open view modal
  const openViewModal = (report) => {
    console.log('Opening modal with report:', report); // Debug log
    setViewModal({ isOpen: true, report });
  };

  // Close modals
  const closeModals = () => {
    setViewModal({ isOpen: false, report: null });
  };

  // Filter reports based on search
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.additional_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.post_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      under_review: 'status-under-review',
      resolved: 'status-resolved',
      dismissed: 'status-dismissed'
    };
    return statusMap[status] || 'status-pending';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const iconMap = {
      pending: faClock,
      under_review: faExclamationTriangle,
      resolved: faCheckCircle,
      dismissed: faTimesCircle
    };
    return iconMap[status] || faClock;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if any filter is active
  const isFilterActive = () => {
    return statusFilter !== 'all';
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="reports-page">
      {/* Header Section */}
      <div className="reports-header">
        <div className="header-content">
          <h1>Reports Management</h1>
          <p>Review and manage user-submitted reports</p>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchReports}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div>

      {/* Stats Summary - Clickable Cards */}
      <div className="reports-stats">
        <div 
          className={`stat-card ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
          title="Show all reports"
        >
          <div className="stat-icon total">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Reports</p>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('pending')}
          style={{ cursor: 'pointer' }}
          title="Show pending reports"
        >
          <div className="stat-icon pending">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'under_review' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('under_review')}
          style={{ cursor: 'pointer' }}
          title="Show reports under review"
        >
          <div className="stat-icon under-review">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className="stat-info">
            <h3>{stats.under_review}</h3>
            <p>Under Review</p>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'resolved' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('resolved')}
          style={{ cursor: 'pointer' }}
          title="Show resolved reports"
        >
          <div className="stat-icon resolved">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="stat-info">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
        <div 
          className={`stat-card ${statusFilter === 'dismissed' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('dismissed')}
          style={{ cursor: 'pointer' }}
          title="Show dismissed reports"
        >
          <div className="stat-icon dismissed">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
          <div className="stat-info">
            <h3>{stats.dismissed}</h3>
            <p>Dismissed</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="reports-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search reports by reason, details, or reporter..."
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
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
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

      {/* Active Filters Display */}
      {isFilterActive() && (
        <div className="active-filters-section">
          <span className="active-filters-label">Active filter:</span>
          <div className="filter-tags">
            <span className="filter-tag">
              Status: {statusFilter}
            </span>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className='reports-table-container'>
        <div className='reports-table-content'>
          <div className='reports-table-title'>
            <h2>Reports Management</h2>
            <div className="reports-header-info">
              <span className="reports-count">
                {filteredReports.length} of {reports.length} reports
                {isFilterActive() && ` (Filtered by: ${statusFilter})`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="empty-state">
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
                  className="retry-btn" 
                  onClick={clearAllFilters}
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className='reports-table'>
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
                        <div className="report-details">
                          <strong className="report-reason">{report.reason}</strong>
                          {report.additional_info && (
                            <small className="report-additional">
                              {report.additional_info}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <FontAwesomeIcon icon={faUser} />
                          <span>{report.reporter_name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="post-info">
                          <FontAwesomeIcon icon={faNewspaper} />
                          <span className="post-title">{report.post_title}</span>
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          <FontAwesomeIcon icon={faCalendar} />
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(report.status)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(report.status)} />
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className='reports-table-actions'>
                          <button
                            className="action-btn view"
                            onClick={() => openViewModal(report)}
                            title="View Report Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          
                          {report.status === 'pending' && (
                            <>
                              <button
                                className="action-btn review"
                                onClick={() => updateReportStatus(report.id, 'under_review')}
                                title="Mark as Under Review"
                              >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                              </button>
                              <button
                                className="action-btn resolve"
                                onClick={() => updateReportStatus(report.id, 'resolved')}
                                title="Mark as Resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                              <button
                                className="action-btn dismiss"
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
                                className="action-btn resolve"
                                onClick={() => updateReportStatus(report.id, 'resolved')}
                                title="Mark as Resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                              <button
                                className="action-btn dismiss"
                                onClick={() => updateReportStatus(report.id, 'dismissed')}
                                title="Dismiss Report"
                              >
                                <FontAwesomeIcon icon={faTimesCircle} />
                              </button>
                            </>
                          )}
                          
                          {(report.status === 'resolved' || report.status === 'dismissed') && (
                            <button
                              className="action-btn pending"
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
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Details</h2>
              <button className="modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            <div className="modal-body">
              <div className="report-details-modal">
                <div className="detail-section">
                  <h3>Report Information</h3>
                  <div className="detail-row">
                    <label>Report ID:</label>
                    <span>#{viewModal.report.id}</span>
                  </div>
                  <div className="detail-row">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusClass(viewModal.report.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(viewModal.report.status)} />
                      {viewModal.report.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Reason:</label>
                    <span>{viewModal.report.reason}</span>
                  </div>
                  {viewModal.report.additional_info && (
                    <div className="detail-row full-width">
                      <label>Additional Information:</label>
                      <div className="additional-info">
                        {viewModal.report.additional_info}
                      </div>
                    </div>
                  )}
                  <div className="detail-row">
                    <label>Date Reported:</label>
                    <span>{formatDate(viewModal.report.created_at)}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Reporter Information</h3>
                  <div className="detail-row">
                    <label>Reporter Name:</label>
                    <span>{viewModal.report.reporter_name}</span>
                  </div>
                  <div className="detail-row">
                    <label>Reporter ID:</label>
                    <span>#{viewModal.report.reporter_id}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Reported Post</h3>
                  <div className="detail-row">
                    <label>Post Title:</label>
                    <span>{viewModal.report.post_title}</span>
                  </div>
                  <div className="detail-row">
                    <label>Post ID:</label>
                    <span>#{viewModal.report.post_id}</span>
                  </div>
                  <div className="detail-row">
                    <label>Post Author:</label>
                    {/* FIXED THIS LINE - using post_author_name instead of post_author */}
                    <span>{viewModal.report.post_author_name || 'Unknown Author'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-actions">
                {viewModal.report.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        updateReportStatus(viewModal.report.id, 'under_review');
                        closeModals();
                      }}
                    >
                      Mark Under Review
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        updateReportStatus(viewModal.report.id, 'resolved');
                        closeModals();
                      }}
                    >
                      Mark Resolved
                    </button>
                    <button
                      className="btn btn-danger"
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
                      className="btn btn-success"
                      onClick={() => {
                        updateReportStatus(viewModal.report.id, 'resolved');
                        closeModals();
                      }}
                    >
                      Mark Resolved
                    </button>
                    <button
                      className="btn btn-danger"
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
                    className="btn btn-secondary"
                    onClick={() => {
                      updateReportStatus(viewModal.report.id, 'pending');
                      closeModals();
                    }}
                  >
                    Reopen Report
                  </button>
                )}
                <button className="btn btn-primary" onClick={closeModals}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}