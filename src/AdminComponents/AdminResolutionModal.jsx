// components/AdminResolutionModal.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimes, 
  faUser, 
  faCalendar,
  faImage,
  faTag,
  faList,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import './AdminStyles/AdminResolutionModal.css';

export default function AdminResolutionModal({ 
  request, 
  onApprove, 
  onReject, 
  onClose,
  loading = false 
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeClass = (type) => {
    const typeMap = {
      'found': 'manage-posts-type-found',
      'lost': 'manage-posts-type-lost',
      'for sale': 'manage-posts-type-sale',
      'looking to buy': 'manage-posts-type-buy',
      'service offered': 'manage-posts-type-service',
      'help wanted': 'manage-posts-type-help'
    };
    return typeMap[type?.toLowerCase()] || 'manage-posts-type-default';
  };

  return (
    <div className="manage-posts-modal-overlay">
      <div className="manage-posts-modal-content resolution-details-modal">
        <div className="manage-posts-modal-header">
          <h3>
            <FontAwesomeIcon icon={faCheckCircle} />
            Resolution Request Details
          </h3>
          <button 
            className="manage-posts-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="manage-posts-modal-body">
          {/* Post Information */}
          <div className="resolution-post-info">
            <h4>
              <FontAwesomeIcon icon={faEye} />
              Post Information
            </h4>
            <div className="resolution-detail-row">
              <label>Post Title:</label>
              <span className="post-title">{request.post_title}</span>
            </div>
            <div className="resolution-detail-row">
              <label>Post Type:</label>
              <span className={`manage-posts-type-badge ${getTypeClass(request.post_type)}`}>
                {request.post_type}
              </span>
            </div>
            <div className="resolution-detail-row">
              <label>Category:</label>
              <span>{request.category_name}</span>
            </div>
            <div className="resolution-detail-row">
              <label>
                <FontAwesomeIcon icon={faUser} />
                Submitted by:
              </label>
              <span>{request.first_name} {request.last_name}</span>
            </div>
            <div className="resolution-detail-row">
              <label>
                <FontAwesomeIcon icon={faCalendar} />
                Submitted on:
              </label>
              <span>{formatDate(request.created_at)}</span>
            </div>
          </div>

          {/* Resolution Details */}
          <div className="resolution-details-section">
            <h4>
              <FontAwesomeIcon icon={faCheckCircle} />
              Resolution Details
            </h4>
            <div className="resolution-detail-row full-width">
              <label>How it was resolved:</label>
              <div className="resolution-description">
                {request.resolution_description}
              </div>
            </div>
            
            {request.verification_details && (
              <div className="resolution-detail-row full-width">
                <label>Verification Details:</label>
                <div className="verification-details">
                  {request.verification_details}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Photo */}
          {request.resolution_photo && (
            <div className="resolution-photo-section">
              <h4>
                <FontAwesomeIcon icon={faImage} />
                Proof Photo
              </h4>
              <div className="resolution-photo-container">
                <img
                  src={`http://localhost:8000/uploads/${request.resolution_photo}`}
                  alt="Resolution proof"
                  className="resolution-photo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="photo-fallback" style={{ display: 'none' }}>
                  <FontAwesomeIcon icon={faImage} />
                  <span>Photo not available</span>
                </div>
              </div>
            </div>
          )}

          {/* Original Post Description */}
          <div className="original-post-section">
            <h4>
              <FontAwesomeIcon icon={faList} />
              Original Post Description
            </h4>
            <div className="original-description">
              {request.post_description}
            </div>
          </div>

          {/* Admin Notes Section (for rejections) */}
          <div className="admin-notes-section">
            <h4>Admin Notes</h4>
            <div className="admin-notes-input">
              <textarea
                placeholder="Add notes for the user (optional)..."
                rows="3"
                id="admin-notes"
              />
              <small>These notes will be sent to the user if you reject the request</small>
            </div>
          </div>
        </div>
        
        <div className="manage-posts-modal-footer">
          <div className="resolution-actions">
            <button 
              className="manage-posts-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            <button 
              className="manage-posts-btn-primary reject"
              onClick={() => {
                const notes = document.getElementById('admin-notes')?.value || '';
                onReject(request.id, notes);
              }}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} />
              {loading ? 'Rejecting...' : 'Reject Request'}
            </button>
            <button 
              className="manage-posts-btn-primary approve"
              onClick={() => onApprove(request.id)}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              {loading ? 'Approving...' : 'Approve Resolution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}