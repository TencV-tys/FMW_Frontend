// UserPages/MyReports.jsx
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFlag, 
  faClock, 
  faSearch, 
  faCheckCircle,
  faTimesCircle,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/MyReports.css';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, under_review, resolved, dismissed
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
      <div className="my-reports-page">
        <UserNav />
        <main className="my-reports-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your reports...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="my-reports-page">
      <UserNav />
      <main className="my-reports-container">
        <div className='reports-container-darkbrown'>
          <div className='reports-container-lightbrown'>
            <div className='reports-content'>
              
              {/* Header */}
              <div className='reports-header'>
                <h1>
                  <FontAwesomeIcon icon={faFlag} />
                  My Reports
                </h1>
                <p>Track the status of your submitted reports</p>
              </div>

              {/* Filters */}
              <div className="reports-filters">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                
                <div className="reports-stats">
                  <span>{filteredReports.length} of {reports.length} reports</span>
                </div>
              </div>

              {/* Reports List */}
              {filteredReports.length === 0 ? (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faFlag} className="empty-icon" />
                  <h3>No reports found</h3>
                  <p>
                    {reports.length === 0 
                      ? "You haven't submitted any reports yet." 
                      : "No reports match the selected filter."
                    }
                  </p>
                </div>
              ) : (
                <div className="reports-list">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="report-card">
                      <div className="report-header">
                        <div className="report-post-info">
                          <h3>{report.post_title}</h3>
                          <span className="report-date">
                            Reported on {formatDate(report.created_at)}
                          </span>
                        </div>
                        <div 
                          className="report-status"
                          style={{ color: getStatusColor(report.status) }}
                        >
                          <FontAwesomeIcon icon={getStatusIcon(report.status)} />
                          {report.status.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="report-details">
                        <div className="report-reason">
                          <strong>Reason:</strong> {report.reason}
                        </div>
                        
                        {report.additional_info && (
                          <div className="report-additional-info">
                            <strong>Additional Info:</strong> {report.additional_info}
                          </div>
                        )}

                        {report.updated_at !== report.created_at && (
                          <div className="report-update">
                            <small>
                              Last updated: {formatDate(report.updated_at)}
                            </small>
                          </div>
                        )}
                      </div>
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