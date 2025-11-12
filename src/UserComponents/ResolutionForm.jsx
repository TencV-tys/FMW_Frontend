// ResolutionForm.jsx - UPDATED WITH CUSTOM TOAST
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimes, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './styles/ResolutionForm.css';
import CustomToast from '../components/CustomToast';

export default function ResolutionForm({ 
  post, 
  onSubmit, 
  onCancel,  
  loading = false 
}) {
  const [resolutionData, setResolutionData] = useState({
    resolution_description: '',
    verification_details: '',
    resolution_photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  const modalRef = useRef();
  const fileInputRef = useRef();
  
  const { toast } = CustomToast.useCustomToast();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (!loading) {
          onCancel();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel, loading]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { 
        toast.error('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setResolutionData(prev => ({ ...prev, resolution_photo: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
      
      toast.success('Proof photo added successfully');
    }
  };

  const removePhoto = () => {
    setResolutionData(prev => ({ ...prev, resolution_photo: null }));
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Proof photo removed');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    if (!resolutionData.resolution_description.trim()) {
      toast.error('Please provide details about how this was resolved');
      return;
    }

    // Prevent double click
    if (!loading) {
      onSubmit(resolutionData);
    }
  };

  const isFormValid = resolutionData.resolution_description.trim().length > 0;

  return (
    <div className="modal-overlay-fmw resolution-modal-overlay">
      <div className="modal-content-fmw resolution-modal-content" ref={modalRef}>
        <div className="modal-header-fmw resolution-modal-header">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon-fmw" />
          <h3>Request Resolution Approval</h3>
          <button 
            className="modal-close-fmw"
            onClick={onCancel}
            disabled={loading}
            type="button"
            aria-label="Close resolution form"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="resolution-form">
          <div className="modal-body-fmw resolution-modal-body">
            <div className="warning-banner-fmw resolution-info-banner">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>
                <strong>Admin Approval Required</strong> - Provide details about how this post was resolved. Admin will review your request.
              </span>
            </div>

            <div className="post-preview-fmw">
              <h4>Post Details:</h4>
              <div className="post-preview-content">
                <strong>{post.type} {post.category_name}</strong>
                <p>"{post.title}"</p>
              </div>
            </div>

            <div className="form-group-fmw">
              <label htmlFor="resolution-description">
                <strong>How was this resolved? *</strong>
              </label>
              <textarea
                id="resolution-description"
                value={resolutionData.resolution_description}
                onChange={(e) => {
                  setResolutionData(prev => ({
                    ...prev,
                    resolution_description: e.target.value
                  }));
                  setHasAttemptedSubmit(false);
                }}
                placeholder={
                  post.type === 'lost' 
                    ? "Describe how your lost item was found/returned..."
                    : "Describe how this situation was resolved..."
                }
                rows="4"
                required
                disabled={loading}
                className={`form-textarea-fmw ${hasAttemptedSubmit && !resolutionData.resolution_description.trim() ? 'error-fmw' : ''}`}
              />
              <small>Provide clear details for admin verification</small>
              {hasAttemptedSubmit && !resolutionData.resolution_description.trim() && (
                <div className="error-message-fmw">This field is required</div>
              )}
            </div>

            <div className="form-group-fmw">
              <label htmlFor="verification-details">
                <strong>Verification Details (Optional)</strong>
              </label>
              <textarea
                id="verification-details"
                value={resolutionData.verification_details}
                onChange={(e) => setResolutionData(prev => ({
                  ...prev,
                  verification_details: e.target.value
                }))}
                placeholder="Any additional details that help verify this resolution..."
                rows="3"
                disabled={loading}
                className="form-textarea-fmw"
              />
              <small>How can we verify this was actually resolved?</small>
            </div>

            <div className="form-group-fmw">
              <label>
                <strong>Proof Photo (Optional but Recommended)</strong>
              </label>
              <div className="photo-upload-section-fmw">
                {!photoPreview ? (
                  <div className="photo-upload-placeholder-fmw">
                    <input
                      type="file"
                      id="resolution-photo"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="resolution-photo" className="photo-upload-btn-fmw">
                      <FontAwesomeIcon icon={faImage} />
                      <span>Add Proof Photo</span>
                      <small>Max 5MB - JPG, PNG, etc.</small>
                    </label>
                  </div>
                ) : (
                  <div className="photo-preview-container-fmw">
                    <div className="photo-preview-fmw">
                      <img src={photoPreview} alt="Proof preview" />
                      <button
                        type="button"
                        className="remove-photo-btn-fmw"
                        onClick={removePhoto}
                        disabled={loading}
                        aria-label="Remove photo"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <p className="photo-preview-text-fmw">Proof photo added</p>
                  </div>
                )}
              </div>
            </div>

            <div className="info-box-fmw resolution-note-box">
              <strong>What happens next:</strong>
              <ul>
                <li>Your request will be sent to administrators for review</li>
                <li>Admin will verify your resolution details</li>
                <li>You'll receive a notification when approved or rejected</li>
                <li>Post status will be updated to "Resolved" upon approval</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer-fmw">
            <button
              type="button"
              className="btn-secondary-fmw"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button> 
            <button
              type="submit"
              className="btn-primary-fmw resolve-confirm-fmw"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <div className="spinner-small-fmw"></div>
                  Submitting Request...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Submit for Approval
                </> 
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}