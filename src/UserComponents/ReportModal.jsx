import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFlag, faExclamationTriangle, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './styles/ReportModal.css';

export default function ReportModal({ isOpen, onClose, post }) {
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnPost, setIsOwnPost] = useState(false);

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
        const response = await fetch('http://localhost:8000/api/user', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.success) {
            setCurrentUser(userData.user);
            // Check if the current user is the post owner
            if (post && userData.user.id === post.user_id) {
              setIsOwnPost(true);
            } else {
              setIsOwnPost(false);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (isOpen && post) {
      fetchCurrentUser();
    }
  }, [isOpen, post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent self-reporting
    if (isOwnPost) {
      toast.error('You cannot report your own post', {
        position: 'top-center',
        autoClose: 2000
      });
      return;
    }

    if (!reason) {
      toast.error('Please select a reason for reporting', {
        position: 'top-right',
        autoClose: 2000
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/reports', {
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
        toast.success('Report submitted successfully!', {
          position: 'top-right',
          autoClose: 2000
        });
        onClose();
        // Reset form
        setReason('');
        setAdditionalInfo('');
      } else {
        toast.error(result.error || 'Failed to submit report', {
          position: 'top-right',
          autoClose: 2000
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Error submitting report. Please try again.', {
        position: 'top-right',
        autoClose: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-modal-title">
            <FontAwesomeIcon icon={faFlag} className="report-icon" />
            <h2>Report Post</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="report-modal-body">
          {/* Self-reporting warning */}
          {isOwnPost && (
            <div className="self-report-warning">
              <FontAwesomeIcon icon={faUserSlash} />
              <div>
                <strong>Cannot Report Your Own Post</strong>
                <p>You are the owner of this post. You cannot report your own content.</p>
              </div>
            </div>
          )}

          {/* Post Preview */}
          <div className="post-preview">
            <h4>Post you're reporting:</h4>
            <div className="preview-content">
              <strong>{post.title}</strong>
              <p className="preview-description">
                {post.description.length > 100 
                  ? `${post.description.substring(0, 100)}...` 
                  : post.description
                }
              </p>
              <div className="preview-meta">
                <span>By: {post.first_name} {post.last_name}</span>
                <span>Type: {post.type}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label htmlFor="reason" className="required">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Why are you reporting this post?
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={isOwnPost || loading}
              >
                <option value="">Select a reason</option>
                {reportReasons.map((reasonOption, index) => (
                  <option key={index} value={reasonOption}>
                    {reasonOption}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="additionalInfo">
                Additional information (optional)
              </label>
              <textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Please provide any additional details that might help us review this post..."
                rows="4"
                disabled={isOwnPost || loading}
              />
            </div>

            <div className="report-note">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p>Your report will be reviewed by our admin team. We'll notify you of any updates.</p>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isOwnPost || loading || !reason}
              >
                {loading ? 'Submitting...' : isOwnPost ? 'Cannot Report Own Post' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}