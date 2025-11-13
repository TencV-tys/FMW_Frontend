import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  faExternalLinkAlt,
  faList,
  faTimes // 🆕 ADDED: For close icons
} from '@fortawesome/free-solid-svg-icons';
import './styles/Reports.css';

export default function Reports() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    resolved: 0,
    dismissed: 0
  });

  // Modal states
  const [viewModal, setViewModal] = useState({ 
    isOpen: false, 
    report: null 
  });

  const [confirmationModal, setConfirmationModal] = useState({ 
    isOpen: false,
    type: '', // 'statusChange' or 'delete'
    title: '',
    message: '',
    report: null,
    newStatus: '',
    isProcessing: false
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Highlight state
  const [highlightedReport, setHighlightedReport] = useState(null);

  // 🆕 ADDED: Scroll refs for auto-scrolling (like ManageUsers/ManagePosts)
  const tableContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const highlightedRowRef = useRef(null);
  const highlightedCellRef = useRef(null);

  // Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // 🆕 ADDED: Auto-scroll function with HORIZONTAL scroll to buttons
  const scrollToHighlightedReport = (reportId) => {
    // Try table view first
    const tableElement = document.querySelector(`tr[data-report-id="${reportId}"]`);
    // Try mobile card view
    const mobileElement = document.querySelector(`.rm-mobile-card[data-report-id="${reportId}"]`);
    
    const element = tableElement || mobileElement;
    
    if (element && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.clientHeight;
      
      // Calculate VERTICAL scroll position to center the element
      const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });

      // 🆕 ADDED: HORIZONTAL scrolling to show ACTION BUTTONS
      if (tableElement && tableWrapperRef.current) {
        const tableWrapper = tableWrapperRef.current;
        const actionsCell = tableElement.querySelector('td:last-child');
        
        if (actionsCell) {
          const cellLeft = actionsCell.offsetLeft;
          const cellWidth = actionsCell.offsetWidth;
          const wrapperWidth = tableWrapper.clientWidth;
          
          // Calculate HORIZONTAL scroll position to show actions column
          const scrollLeft = cellLeft - (wrapperWidth / 2) + (cellWidth / 2);
          
          tableWrapper.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
          });

          // Store ref for the highlighted cell
          highlightedCellRef.current = actionsCell;
        }
      }
      
      // Store ref for potential re-scrolling
      highlightedRowRef.current = element;
    }
  };

  // 🆕 ADDED: Re-scroll when reports data loads and highlighted report exists
  useEffect(() => {
    if (highlightedReport && reports.length > 0 && !loading) {
      setTimeout(() => {
        scrollToHighlightedReport(highlightedReport);
      }, 500);
    }
  }, [reports, loading, highlightedReport]);

  // 🆕 ADDED: Auto-scroll when highlighted report changes
  useEffect(() => {
    if (highlightedReport) {
      setTimeout(() => {
        scrollToHighlightedReport(highlightedReport);
      }, 300);
    }
  }, [highlightedReport]);

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const highlightReport = urlParams.get('highlightReport');
    
    if (highlightReport) {
      const reportId = parseInt(highlightReport);
      setHighlightedReport(reportId);
      
      // Wait for reports to load, then check status
      if (reports.length > 0) {
        const report = reports.find(r => r.id === reportId);
        
        if (!report) {
          showToast('This report has been deleted or does not exist', 'error');
        }
      }
      
      // Remove from URL without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, reports]);

  // Smart polling setup 
  useEffect(() => {
    fetchReports();
    fetchReportStats();

    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (isTabActiveRef.current) {
        fetchReports();
        fetchReportStats();
        startPolling();
      } else {
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

  // Smart polling functions
  const startPolling = () => {
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        fetchReports();
        fetchReportStats();
      }
    }, 60000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Manual refresh
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
        showToast('Error fetching reports', 'error');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast('Error fetching reports', 'error');
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

  // 🆕 ADDED: Clear highlighted report
  const clearHighlightedReport = () => {
    setHighlightedReport(null);
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (filterType) => {
    setStatusFilter(filterType);
  };

  // Navigate to post in ManagePosts
  const navigateToPost = (postId, postTitle) => {
    navigate(`/admin/manage-posts?highlightPost=${postId}`);
  };

  // Navigate to user in ManageUsers
  const navigateToUser = (userId, userName) => {
    navigate(`/admin/manage-users?highlightUser=${userId}`);
  };

  // 🆕 FIXED: Update report status - properly handle modal closing and toast
  const updateReportStatus = async (reportId, newStatus) => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal(prev => ({ ...prev, isProcessing: true }));
    
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
        
        // 🆕 FIXED: Close modal AFTER successful operation
        setTimeout(() => {
          closeConfirmationModal();
          // Also close view modal if it's open
          if (viewModal.isOpen && viewModal.report?.id === reportId) {
            closeViewModal();
          }
        }, 500);
      } else {
        throw new Error('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      showToast('Error updating report status', 'error');
      setConfirmationModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // 🆕 FIXED: Delete report - properly handle modal closing and toast
  const deleteReport = async (reportId) => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setReports(prev => prev.filter(report => report.id !== reportId));
        fetchReportStats();
        showToast('Report deleted successfully', 'success');
        
        // Clear highlight if the highlighted report was deleted
        if (highlightedReport === reportId) {
          setHighlightedReport(null);
        }
        
        // 🆕 FIXED: Close modal AFTER successful operation
        setTimeout(() => {
          closeConfirmationModal();
          // Also close view modal if it's open
          if (viewModal.isOpen && viewModal.report?.id === reportId) {
            closeViewModal();
          }
        }, 500);
      } else {
        throw new Error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      showToast('Error deleting report', 'error');
      setConfirmationModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Modal Functions
  const openViewModal = (report) => {
    setViewModal({ isOpen: true, report });
    // Clear highlight when viewing report details
    if (highlightedReport === report.id) {
      setHighlightedReport(null);
    }
  };

  const openStatusChangeConfirmation = (report, newStatus) => {
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

    setConfirmationModal({
      isOpen: true,
      type: 'statusChange',
      title: actionTitles[newStatus],
      message: `Are you sure you want to ${actionMessages[newStatus]}`,
      report: report,
      newStatus: newStatus,
      isProcessing: false
    });
  };

  const openDeleteConfirmation = (report) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Report',
      message: 'Are you sure you want to delete this report? This action cannot be undone.',
      report: report,
      newStatus: '',
      isProcessing: false
    });
  };

  const closeViewModal = () => {
    setViewModal({ isOpen: false, report: null });
  };

  const closeConfirmationModal = () => {
    if (confirmationModal.isProcessing) return;
    
    setConfirmationModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      report: null,
      newStatus: '',
      isProcessing: false
    });
  };

  // 🆕 FIXED: Handle confirm action - properly manage async operations
  const handleConfirmAction = () => {
    if (confirmationModal.isProcessing) return;
    
    if (confirmationModal.type === 'statusChange') {
      updateReportStatus(confirmationModal.report.id, confirmationModal.newStatus);
    } else if (confirmationModal.type === 'delete') {
      deleteReport(confirmationModal.report.id);
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

  // Check if any filter is active
  const isFilterActive = () => {
    return statusFilter !== 'all' || searchTerm !== '' || highlightedReport !== null;
  };

  // 🆕 UPDATED: Clear all filters (including highlight)
  const clearAllFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setHighlightedReport(null);
  };

  // Check if report can be deleted (only dismissed or resolved)
  const canDeleteReport = (report) => {
    return report.status === 'dismissed' || report.status === 'resolved';
  };

  // Get available actions based on current status
  const getAvailableActions = (report) => {
    const actions = ['view']; // Always show view button
    
    switch (report.status) {
      case 'pending':
        actions.push('under_review', 'resolved', 'dismissed');
        break;
      case 'under_review':
        actions.push('resolved', 'dismissed');
        break;
      case 'resolved':
      case 'dismissed':
        actions.push('pending'); // Only show reopen
        break;
    }
    
    // Only show delete button for resolved or dismissed
    if (canDeleteReport(report)) {
      actions.push('delete');
    }
    
    return actions;
  };

  // Mobile Report Card Component
  const MobileReportCard = ({ report }) => {
    const availableActions = getAvailableActions(report);
    
    return (
      <div 
        className={`rm-mobile-card ${highlightedReport === report.id ? 'rm-highlighted' : ''}`}
        data-report-id={report.id}
      >
        <div className="rm-mobile-header">
          <div className="rm-mobile-title">
            <h3>
              {report.reason}
              <FontAwesomeIcon 
                icon={faExternalLinkAlt} 
                className="rm-external-link-icon"
                title="Click to view report details"
              />
            </h3>
            <div className="rm-mobile-id">ID: #{report.id}</div>
          </div>
          <div className="rm-mobile-badges">
            <span className={`rm-mobile-status ${getStatusClass(report.status)}`}>
              <FontAwesomeIcon icon={getStatusIcon(report.status)} />
              {report.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="rm-mobile-details">
          <div className="rm-mobile-detail">
            <FontAwesomeIcon icon={faUser} />
            <span 
              className="rm-clickable"
              onClick={() => navigateToUser(report.reporter_id, report.reporter_name)}
              title="Click to view user in Manage Users"
            >
              {report.reporter_name}
            </span>
          </div>
          <div className="rm-mobile-detail">
            <FontAwesomeIcon icon={faNewspaper} />
            <span 
              className="rm-clickable"
              onClick={() => navigateToPost(report.post_id, report.post_title)}
              title="Click to view post in Manage Posts"
            >
              {report.post_title}
            </span>
          </div>
          <div className="rm-mobile-detail">
            <FontAwesomeIcon icon={faCalendar} />
            <span>{formatDate(report.created_at)}</span>
          </div>
          
          {report.additional_info && (
            <div className="rm-mobile-description">
              <strong>Additional Info:</strong>
              <p>{report.additional_info?.length > 150 
                ? `${report.additional_info.substring(0, 150)}...`
                : report.additional_info
              }</p>
            </div>
          )}
        </div>
        
        <div className="rm-mobile-actions">
          {availableActions.includes('view') && (
            <button
              className="rm-action-btn view"
              onClick={() => openViewModal(report)}
              title="View details"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          )}
          
          {availableActions.includes('under_review') && (
            <button
              className="rm-action-btn review"
              onClick={() => openStatusChangeConfirmation(report, 'under_review')}
              title="Mark as Under Review"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </button>
          )}
          
          {availableActions.includes('resolved') && (
            <button
              className="rm-action-btn resolve"
              onClick={() => openStatusChangeConfirmation(report, 'resolved')}
              title="Mark as Resolved"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
            </button>
          )}
          
          {availableActions.includes('dismissed') && (
            <button
              className="rm-action-btn dismiss"
              onClick={() => openStatusChangeConfirmation(report, 'dismissed')}
              title="Dismiss Report"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faTimesCircle} />
            </button>
          )}
          
          {availableActions.includes('pending') && (
            <button
              className="rm-action-btn pending"
              onClick={() => openStatusChangeConfirmation(report, 'pending')}
              title="Reopen Report"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faRefresh} />
            </button>
          )}

          {availableActions.includes('delete') && (
            <button
              className="rm-action-btn delete"
              onClick={() => openDeleteConfirmation(report)}
              title="Delete Report"
              disabled={confirmationModal.isProcessing}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </div>
    );
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
      <header className="rm-header">
        <div className="rm-header-content">
          <p>Review and manage user-submitted reports</p>
        </div>
        <div className="rm-header-actions">
          <button 
            className="rm-refresh-btn"
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faRefresh} spin={loading} />
            Refresh
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <section className="rm-stats">
        <div 
          className={`rm-stat-card ${statusFilter === 'all' && !highlightedReport ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('all')}
          style={{ cursor: 'pointer' }}
          title="Show all reports"
        >
          <div className="rm-stat-info">
            <span className="rm-stat-number">{stats.total}</span>
            <span className="rm-stat-label">Total Reports</span>
          </div>
        </div>
        <div 
          className={`rm-stat-card ${statusFilter === 'pending' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('pending')}
          style={{ cursor: 'pointer' }}
          title="Show pending reports"
        >
          <div className="rm-stat-info">
            <span className="rm-stat-number">{stats.pending}</span>
            <span className="rm-stat-label">Pending</span>
          </div>
        </div>
        <div 
          className={`rm-stat-card ${statusFilter === 'under_review' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('under_review')}
          style={{ cursor: 'pointer' }}
          title="Show reports under review"
        >
          <div className="rm-stat-info">
            <span className="rm-stat-number">{stats.under_review}</span>
            <span className="rm-stat-label">Under Review</span>
          </div>
        </div>
        <div 
          className={`rm-stat-card ${statusFilter === 'resolved' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('resolved')}
          style={{ cursor: 'pointer' }}
          title="Show resolved reports"
        >
          <div className="rm-stat-info">
            <span className="rm-stat-number">{stats.resolved}</span>
            <span className="rm-stat-label">Resolved</span>
          </div>
        </div>
        <div 
          className={`rm-stat-card ${statusFilter === 'dismissed' ? 'rm-stat-active' : ''}`}
          onClick={() => handleStatCardClick('dismissed')}
          style={{ cursor: 'pointer' }}
          title="Show dismissed reports"
        >
          <div className="rm-stat-info">
            <span className="rm-stat-number">{stats.dismissed}</span>
            <span className="rm-stat-label">Dismissed</span>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="rm-filters">
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
            className="rm-filter-select"
            disabled={confirmationModal.isProcessing}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="rm-filter-group">
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
            className="rm-clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
            disabled={confirmationModal.isProcessing}
          >
            Clear Filters
          </button>
        )}
      </section>

      {/* 🆕 UPDATED: Reports Table with scroll refs */}
      <section className="rm-table-container" ref={tableContainerRef}>
        <div className="rm-table-content">
          <div className="rm-table-title">
            <h2>Reports Management</h2>
            <div className="rm-header-info">
              <span className="rm-count">
                Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                {isFilterActive() && ` (Filtered)`}
                {highlightedReport && ` - Highlighted: #${highlightedReport}`}
              </span>
            </div>
          </div>
 
          {loading ? (
            <div className="rm-loading-state">
              <div className="rm-loading-spinner"></div>
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rm-empty-state">
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
                  disabled={confirmationModal.isProcessing}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div 
                className="rm-table-wrapper" 
                style={{ display: viewMode === 'table' ? 'block' : 'none' }}
                ref={tableWrapperRef} // 🆕 ADDED: Horizontal scroll container ref
              >
                <table className="rm-table">
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
                    {filteredReports.map(report => {
                      const availableActions = getAvailableActions(report);
                      const isHighlighted = highlightedReport === report.id;
                      
                      return (
                        <tr 
                          key={report.id} 
                          className={`${isHighlighted ? 'rm-highlighted-row' : ''} rm-clickable-row`}
                          data-report-id={report.id} // 🆕 ADDED for auto-scroll
                          onClick={() => openViewModal(report)}
                        >
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
                            <div 
                              className="rm-user-info rm-clickable"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToUser(report.reporter_id, report.reporter_name);
                              }}
                              title="Click to view user in Manage Users"
                            >
                              <FontAwesomeIcon icon={faUser} />
                              <div>
                                <span>{report.reporter_name}</span>
                                <FontAwesomeIcon 
                                  icon={faExternalLinkAlt} 
                                  className="rm-external-link-icon"
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div 
                              className="rm-post-info rm-clickable"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToPost(report.post_id, report.post_title);
                              }}
                              title="Click to view post in Manage Posts"
                            >
                              <FontAwesomeIcon icon={faNewspaper} />
                              <div>
                                <span className="rm-post-title">{report.post_title}</span>
                                <FontAwesomeIcon 
                                  icon={faExternalLinkAlt} 
                                  className="rm-external-link-icon"
                                />
                              </div>
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
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="rm-actions">
                              {availableActions.includes('view') && (
                                <button
                                  className="rm-action-btn view"
                                  onClick={() => openViewModal(report)}
                                  title="View Report Details"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                              )}
                              
                              {availableActions.includes('under_review') && (
                                <button
                                  className="rm-action-btn review"
                                  onClick={() => openStatusChangeConfirmation(report, 'under_review')}
                                  title="Mark as Under Review"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faExclamationTriangle} />
                                </button>
                              )}
                              
                              {availableActions.includes('resolved') && (
                                <button
                                  className="rm-action-btn resolve"
                                  onClick={() => openStatusChangeConfirmation(report, 'resolved')}
                                  title="Mark as Resolved"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                              )}
                              
                              {availableActions.includes('dismissed') && (
                                <button
                                  className="rm-action-btn dismiss"
                                  onClick={() => openStatusChangeConfirmation(report, 'dismissed')}
                                  title="Dismiss Report"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faTimesCircle} />
                                </button>
                              )}
                              
                              {availableActions.includes('pending') && (
                                <button
                                  className="rm-action-btn pending"
                                  onClick={() => openStatusChangeConfirmation(report, 'pending')}
                                  title="Reopen Report"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faRefresh} />
                                </button>
                              )}

                              {availableActions.includes('delete') && (
                                <button
                                  className="rm-action-btn delete"
                                  onClick={() => openDeleteConfirmation(report)}
                                  title="Delete Report"
                                  disabled={confirmationModal.isProcessing}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="rm-mobile-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
                {filteredReports.map(report => (
                  <MobileReportCard key={report.id} report={report} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* View Report Modal */}
      {viewModal.isOpen && viewModal.report && (
        <div className="rm-modal-overlay" onClick={closeViewModal}>
          <div className="rm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h2>Report Details</h2>
              <button 
                className="rm-modal-close"
                onClick={closeViewModal}
              >
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
                    <div 
                      className="rm-clickable"
                      onClick={() => navigateToUser(viewModal.report.reporter_id, viewModal.report.reporter_name)}
                      title="Click to view user in Manage Users"
                    >
                      <FontAwesomeIcon icon={faUser} />
                      {viewModal.report.reporter_name}
                      <FontAwesomeIcon 
                        icon={faExternalLinkAlt} 
                        className="rm-external-link-icon"
                      />
                    </div>
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
                    <div 
                      className="rm-clickable"
                      onClick={() => navigateToPost(viewModal.report.post_id, viewModal.report.post_title)}
                      title="Click to view post in Manage Posts"
                    >
                      <FontAwesomeIcon icon={faNewspaper} />
                      {viewModal.report.post_title}
                      <FontAwesomeIcon 
                        icon={faExternalLinkAlt} 
                        className="rm-external-link-icon"
                      />
                    </div>
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

                {/* Action Buttons in Modal */}
                <div className="rm-detail-section">
                  <h3>Quick Actions</h3>
                  <div className="rm-modal-actions">
                    {viewModal.report.status === 'pending' && (
                      <>
                        <button
                          className="rm-btn rm-btn-primary"
                          onClick={() => openStatusChangeConfirmation(viewModal.report, 'under_review')}
                          disabled={confirmationModal.isProcessing}
                        >
                          <FontAwesomeIcon icon={faExclamationTriangle} />
                          Mark as Under Review
                        </button>
                        <button
                          className="rm-btn rm-btn-success"
                          onClick={() => openStatusChangeConfirmation(viewModal.report, 'resolved')}
                          disabled={confirmationModal.isProcessing}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Mark as Resolved
                        </button>
                        <button
                          className="rm-btn rm-btn-warning"
                          onClick={() => openStatusChangeConfirmation(viewModal.report, 'dismissed')}
                          disabled={confirmationModal.isProcessing}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} />
                          Dismiss Report
                        </button>
                      </>
                    )}
                    
                    {viewModal.report.status === 'under_review' && (
                      <>
                        <button
                          className="rm-btn rm-btn-success"
                          onClick={() => openStatusChangeConfirmation(viewModal.report, 'resolved')}
                          disabled={confirmationModal.isProcessing}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Mark as Resolved
                        </button>
                        <button
                          className="rm-btn rm-btn-warning"
                          onClick={() => openStatusChangeConfirmation(viewModal.report, 'dismissed')}
                          disabled={confirmationModal.isProcessing}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} />
                          Dismiss Report
                        </button>
                      </>
                    )}
                    
                    {(viewModal.report.status === 'resolved' || viewModal.report.status === 'dismissed') && (
                      <button
                        className="rm-btn rm-btn-primary"
                        onClick={() => openStatusChangeConfirmation(viewModal.report, 'pending')}
                        disabled={confirmationModal.isProcessing}
                      >
                        <FontAwesomeIcon icon={faRefresh} />
                        Reopen Report
                      </button>
                    )}

                    {canDeleteReport(viewModal.report) && (
                      <button
                        className="rm-btn rm-btn-danger"
                        onClick={() => openDeleteConfirmation(viewModal.report)}
                        disabled={confirmationModal.isProcessing}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="rm-modal-footer">
              <button 
                className="rm-btn rm-btn-secondary"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="rm-modal-overlay" onClick={closeConfirmationModal}>
          <div className="rm-modal-content rm-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h3>{confirmationModal.title}</h3>
              <button 
                className="rm-modal-close"
                onClick={closeConfirmationModal}
                disabled={confirmationModal.isProcessing}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="rm-modal-body">
              <div className="rm-confirm-content">
                <div className="rm-confirm-icon">
                  <FontAwesomeIcon 
                    icon={confirmationModal.type === 'delete' ? faTrash : faExclamationTriangle} 
                    size="3x"
                  />
                </div>
                <p>{confirmationModal.message}</p>
                
                {confirmationModal.report && (
                  <div className="rm-confirm-details">
                    <strong>Report Details:</strong>
                    <span><strong>ID:</strong> #{confirmationModal.report.id}</span>
                    <span><strong>Reason:</strong> {confirmationModal.report.reason}</span>
                    <span><strong>Reporter:</strong> {confirmationModal.report.reporter_name}</span>
                    <span><strong>Post:</strong> {confirmationModal.report.post_title}</span>
                  </div>
                )}

                {confirmationModal.type === 'delete' && (
                  <div className="rm-deletion-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    This action cannot be undone!
                  </div>
                )}
              </div>
            </div>
            <div className="rm-modal-footer">
              <button 
                className="rm-btn rm-btn-secondary"
                onClick={closeConfirmationModal}
                disabled={confirmationModal.isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`rm-btn ${
                  confirmationModal.type === 'delete' ? 'rm-btn-danger' : 'rm-btn-primary'
                }`}
                onClick={handleConfirmAction}
                disabled={confirmationModal.isProcessing}
              >
                {confirmationModal.isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faRefresh} spin />
                    Processing...
                  </>
                ) : (
                  confirmationModal.type === 'delete' ? 'Delete Report' : 'Confirm'
                )}
              </button>
            </div>
          </div>
        </div> 
      )}
    </>
  );
}