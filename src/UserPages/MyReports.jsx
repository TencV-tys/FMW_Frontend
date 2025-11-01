// UserPages/MyReports.jsx
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFlag, 
  faClock, 
  faSearch, 
  faCheckCircle,
  faTimesCircle,
  faTrash,
  faWarning
} from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/MyReports.css';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, under_review, resolved, dismissed
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

  const wifi = isLocalhost 
    ? 'http://localhost:8000' 
    : 'http://192.168.1.27:8000';

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${wifi}/api/reports/my-reports`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReports(data.reports);
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId, reportTitle) => {
    try {
      setDeleteLoading(true);
      
      const response = await fetch(`${wifi}/api/reports/my-reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove from local state
          setReports(prev => prev.filter(report => report.id !== reportId));
          setDeleteConfirm(null);
          
          // Show success message (you can add a toast notification here)
          console.log('Report deleted successfully');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete report. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'under_review': return faSearch;
      case 'resolved': return faCheckCircle;
      case 'dismissed': return faTimesCircle;
      default: return faClock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'under_review': return '#3498db';
      case 'resolved': return '#27ae60';
      case 'dismissed': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const canDeleteReport = (report) => {
    // Allow deletion only for pending and under_review reports
    return report.status === 'pending' || report.status === 'under_review' || report.status === 'resolved';
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="my-reports-page-fmw">
        <UserNav />
        <main className="my-reports-container-fmw">
          <div className="loading-container-fmw">
            <div className="loading-spinner-fmw"></div>
            <p>Loading your reports...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="my-reports-page-fmw">
      <UserNav />
      <main className="my-reports-container-fmw">
        <div className='reports-container-darkbrown-fmw'>
          <div className='reports-container-lightbrown-fmw'>
            <div className='reports-content-fmw'>
              
              {/* Header */}
              <div className='reports-header-fmw'>
                <h1>
                  <FontAwesomeIcon icon={faFlag} />
                  My Reports
                </h1>
                <p>Track the status of your submitted reports</p>
              </div>

              {/* Filters */}
              <div className="reports-filters-fmw">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select-fmw"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                
                <div className="reports-stats-fmw">
                  <span>{filteredReports.length} of {reports.length} reports</span>
                </div>
              </div>

              {/* Reports List */}
              {filteredReports.length === 0 ? (
                <div className="empty-state-fmw">
                  <FontAwesomeIcon icon={faFlag} className="empty-icon-fmw" />
                  <h3>No reports found</h3>
                  <p>
                    {reports.length === 0 
                      ? "You haven't submitted any reports yet." 
                      : "No reports match the selected filter."
                    }
                  </p>
                </div>
              ) : (
                <div className="reports-list-fmw">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="report-card-fmw">
                      <div className="report-header-fmw">
                        <div className="report-post-info-fmw">
                          <h3>{report.post_title}</h3>
                          <span className="report-date-fmw">
                            Reported on {formatDate(report.created_at)}
                          </span>
                        </div>
                        <div className="report-header-actions-fmw">
                          <div 
                            className="report-status-fmw"
                            style={{ color: getStatusColor(report.status) }}
                          >
                            <FontAwesomeIcon icon={getStatusIcon(report.status)} />
                            {report.status.replace('_', ' ')}
                          </div>
                          {canDeleteReport(report) && (
                            <button
                              className="delete-report-btn-fmw"
                              onClick={() => setDeleteConfirm(report)}
                              title="Delete this report"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="report-details-fmw">
                        <div className="report-reason-fmw">
                          <strong>Reason:</strong> {report.reason}
                        </div>
                        
                        {report.additional_info && (
                          <div className="report-additional-info-fmw">
                            <strong>Additional Info:</strong> {report.additional_info}
                          </div>
                        )}

                        {report.updated_at !== report.created_at && (
                          <div className="report-update-fmw">
                            <small>
                              Last updated: {formatDate(report.updated_at)}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* Delete Confirmation Modal */}
                      {deleteConfirm && deleteConfirm.id === report.id && (
                        <div className="delete-confirmation-overlay-fmw">
                          <div className="delete-confirmation-modal-fmw">
                            <div className="delete-confirmation-header-fmw">
                              <FontAwesomeIcon icon={faWarning} className="warning-icon-fmw" />
                              <h3>Delete Report</h3>
                            </div>
                            <p>Are you sure you want to delete this report?</p>
                            <p><strong>"{deleteConfirm.post_title}"</strong></p>
                            <p className="warning-text-fmw">
                              This action cannot be undone. The report will be permanently removed.
                            </p>
                            <div className="delete-confirmation-actions-fmw">
                              <button
                                className="cancel-btn-fmw"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleteLoading}
                              >
                                Cancel
                              </button>
                              <button
                                className="confirm-delete-btn-fmw"
                                onClick={() => handleDeleteReport(deleteConfirm.id, deleteConfirm.post_title)}
                                disabled={deleteLoading}
                              >
                                {deleteLoading ? (
                                  <>
                                    <div className="loading-spinner-small-fmw"></div>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faTrash} />
                                    Delete Report
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}