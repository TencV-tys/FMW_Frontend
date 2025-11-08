import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFlag, faExclamationTriangle, faUserSlash, faCalendarAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './styles/ReportModal.css';
import {useWifiUrl} from '../hooks/useWifiUrl';
import CustomToast from '../components/CustomToast';

export default function ReportModal({ isOpen, onClose, post }) {
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [alreadyReportedThisMonth, setAlreadyReportedThisMonth] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false); // NEW: Track if report was successful
  const wifi = useWifiUrl();

  const { toasts, removeToast, toast } = CustomToast.useCustomToast();

  const reportReasons = [
    'Inappropriate content',
    'Spam or misleading',
    'Harassment or bullying',
    'False information',
    'Privacy violation',
    'Other'
  ];

  // Fetch current user data to check if they're reporting their own post
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${wifi}/api/users/profile`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.success) {
            setCurrentUser(userData.user);
            if (post && userData.user.id === post.user_id) {
              setIsOwnPost(true);
            } else {
              setIsOwnPost(false);
            }
          }
        } else {
          console.warn('Failed to fetch user profile, using fallback method');
          try {
            const userFromStorage = localStorage.getItem('currentUser');
            if (userFromStorage) {
              const user = JSON.parse(userFromStorage);
              setCurrentUser(user);
              if (post && user.id === post.user_id) {
                setIsOwnPost(true);
              }
            }
          } catch (storageError) {
            console.error('Error getting user from storage:', storageError);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        try {
          const userFromStorage = localStorage.getItem('currentUser');
          if (userFromStorage) {
            const user = JSON.parse(userFromStorage);
            setCurrentUser(user);
            if (post && user.id === post.user_id) {
              setIsOwnPost(true);
            }
          }
        } catch (storageError) {
          console.error('Error getting user from storage:', storageError);
        }
      }
    };

    if (isOpen && post) {
      fetchCurrentUser();
      setAlreadyReportedThisMonth(false);
      setReportSubmitted(false); // Reset when modal opens
    }
  }, [isOpen, post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isOwnPost) {
      toast.error('You cannot report your own post');
      return;
    }

    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${wifi}/api/reports`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post.id,
          reason,
          additional_info: additionalInfo
        })
      });

      const result = await response.json();

      if (result.success) {
        // Show success in the modal AND toast
        setReportSubmitted(true);
        toast.success('Report submitted successfully!');
        
        // Reset form but don't close modal yet
        setReason('');
        setAdditionalInfo('');
        setAlreadyReportedThisMonth(false);
      } else {
        if (result.error && result.error.includes('this month')) {
          setAlreadyReportedThisMonth(true);
          toast.error(result.error);
        } else {
          toast.error(result.error || 'Failed to submit report');
        }
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset everything when closing
    setReason('');
    setAdditionalInfo('');
    setReportSubmitted(false);
    setAlreadyReportedThisMonth(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={handleClose}>
      <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-modal-title">
            <FontAwesomeIcon icon={faFlag} className="report-modal-icon" />
            <h2>Report Post</h2>
          </div>
          <button className="report-modal-close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="report-modal-body">
          {/* Success message */}
          {reportSubmitted && (
            <div className="report-success-message">
              <div className="report-success-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="report-success-content">
                <h3>Report Submitted Successfully!</h3>
                <p>Thank you for your report. Our admin team will review it shortly.</p>
              </div>
            </div>
          )}

          {/* Self-reporting warning */}
          {isOwnPost && (
            <div className="report-warning-message report-own-post-warning">
              <div className="report-warning-icon">
                <FontAwesomeIcon icon={faUserSlash} />
              </div>
              <div className="report-warning-content">
                <h3>Cannot Report Your Own Post</h3>
                <p>You are the owner of this post. You cannot report your own content.</p>
              </div>
            </div>
          )}

          {/* Monthly reporting limit warning */}
          {alreadyReportedThisMonth && (
            <div className="report-warning-message report-monthly-limit-warning">
              <div className="report-warning-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="report-warning-content">
                <h3>Already Reported This Month</h3>
                <p>You have already reported this post this month. You can report it again next month if the issue persists.</p>
              </div>
            </div>
          )}

          {/* Only show post preview and form if not self-reporting, not already reported, and not successful */}
          {!isOwnPost && !alreadyReportedThisMonth && !reportSubmitted && (
            <>
              {/* Post Preview */}
              <div className="report-post-preview">
                <h4>Post you're reporting:</h4>
                <div className="report-preview-content">
                  <strong>{post.title}</strong>
                  <p className="report-preview-description">
                    {post.description.length > 100 
                      ? `${post.description.substring(0, 100)}...` 
                      : post.description
                    }
                  </p>
                  <div className="report-preview-meta">
                    <span>By: {post.first_name} {post.last_name}</span>
                    <span>Type: {post.type}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="report-form">
                <div className="report-form-group">
                  <label htmlFor="reason" className="report-required">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Why are you reporting this post?
                  </label>
                  <select
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a reason</option>
                    {reportReasons.map((reasonOption, index) => (
                      <option key={index} value={reasonOption}>
                        {reasonOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="report-form-group">
                  <label htmlFor="additionalInfo">
                    Additional information (optional)
                  </label>
                  <textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Please provide any additional details that might help us review this post..."
                    rows="4"
                    disabled={loading}
                  />
                </div>

                <div className="report-note">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <p>
                    Your report will be reviewed by our admin team. We'll notify you of any updates.
                  </p>
                </div>

                <div className="report-modal-actions">
                  <button 
                    type="button" 
                    className="report-btn-cancel" 
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="report-btn-submit"
                    disabled={loading || !reason}
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Show close button for success and warning states */}
          {(reportSubmitted || isOwnPost || alreadyReportedThisMonth) && (
            <div className="report-modal-actions">
              <button 
                type="button" 
                className="report-btn-close-warning" 
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Toast Container */}
      <CustomToast.CustomToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}