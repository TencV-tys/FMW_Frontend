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
  faEdit,
  faWarning,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/MyReports.css';
import {useWifiUrl} from '../hooks/useWifiUrl';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({ reason: '', additional_info: '' });
  const [editLoading, setEditLoading] = useState(false);
  const wifi = useWifiUrl();
  
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
          setReports(prev => prev.filter(report => report.id !== reportId));
          setDeleteConfirm(null);
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

  // 🆕 EDIT REPORT FUNCTIONS
  const handleEditReport = (report) => {
    setEditingReport(report.id);
    setEditForm({
      reason: report.reason,
      additional_info: report.additional_info || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    setEditForm({ reason: '', additional_info: '' });
  };

  const handleUpdateReport = async (reportId) => {
    if (!editForm.reason.trim()) {
      alert('Reason is required');
      return;
    }

    try {
      setEditLoading(true);
      
      const response = await fetch(`${wifi}/api/reports/my-reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: editForm.reason.trim(),
          additional_info: editForm.additional_info.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the report in local state
          setReports(prev => prev.map(report => 
            report.id === reportId 
              ? { 
                  ...report, 
                  reason: editForm.reason.trim(),
                  additional_info: editForm.additional_info.trim(),
                  updated_at: new Date().toISOString()
                }
              : report
          ));
          setEditingReport(null);
          setEditForm({ reason: '', additional_info: '' });
          console.log('Report updated successfully');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to update report. Please try again.');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Error updating report. Please try again.');
    } finally {
      setEditLoading(false);
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

  const canEditReport = (report) => {
    // Allow editing only for pending and under_review reports
    return report.status === 'pending' || report.status === 'under_review';
  };

  const canDeleteReport = (report) => {
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
                <p>Track and manage your submitted reports</p>
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
                            {report.updated_at !== report.created_at && (
                              <> • Updated {formatDate(report.updated_at)}</>
                            )}
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
                 <div className="report-actions-fmw">
        {canEditReport(report) && (
           <button
             className="edit-report-btn-fmw"
                 onClick={() => handleEditReport(report)}
                title="Edit this report"
                  disabled={editingReport === report.id}
                  >
               <FontAwesomeIcon icon={faEdit} />
                </button>
               )}
              {canDeleteReport(report) && (
              <button
             className="delete-report-btn-fmw"
             onClick={() => setDeleteConfirm(report)}
             title="Delete this report"
              disabled={editingReport === report.id}
              >
            <FontAwesomeIcon icon={faTrash} />
         </button>
           )}
        </div>
                        </div>
                      </div>

                      <div className="report-details-fmw">
                        {/* 🆕 EDIT MODE */}
                        {editingReport === report.id ? (
                          <div className="report-edit-form-fmw">
                            <div className="edit-form-group-fmw">
                              <label>Reason:</label>
                              <select
                                value={editForm.reason}
                                onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
                                className="edit-reason-select-fmw"
                              >
                                <option value="">Select a reason</option>
                                <option value="Spam">Spam</option>
                                <option value="Inappropriate Content">Inappropriate Content</option>
                                <option value="Harassment">Harassment</option>
                                <option value="False Information">False Information</option>
                                <option value="Copyright Violation">Copyright Violation</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            
                            <div className="edit-form-group-fmw">
                              <label>Additional Information:</label>
                              <textarea
                                value={editForm.additional_info}
                                onChange={(e) => setEditForm(prev => ({ ...prev, additional_info: e.target.value }))}
                                placeholder="Provide additional details about your report..."
                                className="edit-additional-info-textarea-fmw"
                                rows="3"
                              />
                            </div>
                            
                            <div className="edit-form-actions-fmw">
                              <button
                                className="cancel-edit-btn-fmw"
                                onClick={handleCancelEdit}
                                disabled={editLoading}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                                Cancel
                              </button>
                              <button
                                className="save-edit-btn-fmw"
                                onClick={() => handleUpdateReport(report.id)}
                                disabled={editLoading || !editForm.reason.trim()}
                              >
                                {editLoading ? (
                                  <>
                                    <div className="loading-spinner-small-fmw"></div>
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faSave} />
                                    Save Changes
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* 🆕 VIEW MODE */
                          <>
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
                          </>
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