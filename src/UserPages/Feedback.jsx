import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCommentDots, 
  faBug, 
  faLightbulb, 
  faStar,
  faPaperPlane,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faCircle,
  faEye,
  faBan,
  faSyncAlt,
  faTrash,
  faWarning
} from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/Feedback.css';

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('submit');
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (activeTab === 'my-feedback') {
      fetchMyFeedback();
    }
  }, [activeTab]);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching feedback...');
      
      console.log('🔄 Fetching user feedback from:', 'http://localhost:8000/api/feedback/my-feedback');
      
      const response = await fetch('http://localhost:8000/api/feedback/my-feedback', {
        credentials: 'include'
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success) {
          setMyFeedback(data.feedback || []);
          setDebugInfo(`Found ${data.feedback?.length || 0} feedback items`);
          console.log('✅ Feedback loaded:', data.feedback);
        } else {
          setDebugInfo(`Error: ${data.error}`);
          console.error('❌ API error:', data.error);
        }
      } else {
        const errorText = await response.text();
        setDebugInfo(`HTTP Error: ${response.status}`);
        console.error('❌ HTTP error:', response.status, errorText);
      }
    } catch (error) {
      setDebugInfo(`Network error: ${error.message}`);
      console.error('❌ Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setDebugInfo('Submitting feedback...');
      
      const submitData = {
        ...formData,
        metadata: {
          browser: navigator.userAgent,
          timestamp: new Date().toISOString(),
          anonymous: anonymous
        }
      };

      console.log('📤 Submitting feedback:', submitData);
      console.log('🔐 Anonymous mode:', anonymous);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include'
      };

      const response = await fetch('http://localhost:8000/api/feedback', options);

      console.log('📡 Submission response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Submission success:', data);
        
        if (data.success) {
          setSubmitSuccess(true);
          setFormData({
            type: 'general',
            title: '',
            description: '',
            priority: 'medium'
          });
          setDebugInfo('Feedback submitted successfully!');
          
          setTimeout(() => {
            fetchMyFeedback();
            setActiveTab('my-feedback');
          }, 1000);
          
          setTimeout(() => setSubmitSuccess(false), 5000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setDebugInfo(`Submission failed: ${errorData.error || response.status}`);
        alert(errorData.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      setDebugInfo(`Submission error: ${error.message}`);
      console.error('❌ Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId, feedbackTitle) => {
    try {
      setDebugInfo(`Deleting feedback: ${feedbackTitle}`);
      
      const response = await fetch(`http://localhost:8000/api/feedback/my-feedback/${feedbackId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDebugInfo('Feedback deleted successfully!');
          setDeleteConfirm(null);
          
          // Remove from local state
          setMyFeedback(prev => prev.filter(feedback => feedback.id !== feedbackId));
          
          // Show success message
          setTimeout(() => {
            setDebugInfo('');
          }, 3000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setDebugInfo(`Delete failed: ${errorData.error || response.status}`);
        alert(errorData.error || 'Failed to delete feedback. Please try again.');
      }
    } catch (error) {
      setDebugInfo(`Delete error: ${error.message}`);
      console.error('❌ Error deleting feedback:', error);
      alert('Error deleting feedback. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return faBug;
      case 'feature': return faLightbulb;
      case 'suggestion': return faStar;
      default: return faCommentDots;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'reviewed': return faEye;
      case 'in_progress': return faSyncAlt;
      case 'completed': return faCheckCircle;
      case 'rejected': return faBan;
      default: return faClock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'reviewed': return '#3498db';
      case 'in_progress': return '#9b59b6';
      case 'completed': return '#27ae60';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#e74c3c';
      case 'high': return '#e67e22';
      case 'medium': return '#f1c40f';
      case 'low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const canDeleteFeedback = (feedback) => {
    // Only allow deletion for pending or reviewed feedback
    return ['pending', 'reviewed'].includes(feedback.status);
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

  return (
    <div className="feedback-page">
      <UserNav />
      <main className="feedback-container">
        <div className='feedback-container-darkbrown'>
          <div className='feedback-container-lightbrown'>
            <div className='feedback-content'>
              
              {/* Header */}
              <div className='feedback-header'>
                <h1>
                  <FontAwesomeIcon icon={faCommentDots} />
                  Feedback & Support
                </h1>
                <p>Help us improve the platform by sharing your thoughts and reporting issues</p>
              </div>

              {/* Debug Info */}
              {debugInfo && (
                <div className="debug-info" style={{
                  background: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '5px',
                  marginBottom: '15px',
                  border: '1px solid #dee2e6',
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  <strong>Debug:</strong> {debugInfo}
                </div>
              )}

              {/* Tabs */}
              <div className="feedback-tabs">
                <button 
                  className={`tab-button ${activeTab === 'submit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('submit')}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  Submit Feedback
                </button>
                <button 
                  className={`tab-button ${activeTab === 'my-feedback' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my-feedback')}
                >
                  <FontAwesomeIcon icon={faClock} />
                  My Feedback ({myFeedback.length})
                </button>
              </div>

              {/* Submit Feedback Form */}
              {activeTab === 'submit' && (
                <div className="feedback-form-container">
                  {submitSuccess && (
                    <div className="success-message">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Thank you for your feedback! We'll review it soon.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="feedback-form">
                    {/* Anonymous Toggle */}
                    <div className="anonymous-toggle">
                      <label>
                        <input
                          type="checkbox"
                          checked={anonymous}
                          onChange={(e) => setAnonymous(e.target.checked)}
                        />
                        Submit anonymously
                      </label>
                      <small>
                        {anonymous 
                          ? "Your identity will be hidden from administrators" 
                          : "Your feedback will be linked to your account"
                        }
                      </small>
                    </div>

                    {/* Feedback Type */}
                    <div className="form-group">
                      <label>Feedback Type *</label>
                      <div className="type-options">
                        {[
                          { value: 'bug', label: 'Bug Report', icon: faBug, description: 'Something is not working' },
                          { value: 'feature', label: 'Feature Request', icon: faLightbulb, description: 'Suggest a new feature' },
                          { value: 'suggestion', label: 'Suggestion', icon: faStar, description: 'General improvement idea' },
                          { value: 'general', label: 'General Feedback', icon: faCommentDots, description: 'Other comments' }
                        ].map(type => (
                          <div 
                            key={type.value}
                            className={`type-option ${formData.type === type.value ? 'selected' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          >
                            <FontAwesomeIcon icon={type.icon} />
                            <div className="type-info">
                              <strong>{type.label}</strong>
                              <span>{type.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="form-group">
                      <label>Priority</label>
                      <select 
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="priority-select"
                      >
                        <option value="low">Low - Minor issue or enhancement</option>
                        <option value="medium">Medium - Standard issue</option>
                        <option value="high">High - Important issue affecting usage</option>
                        <option value="critical">Critical - System breaking issue</option>
                      </select>
                    </div>

                    {/* Title */}
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Brief description of your feedback..."
                        maxLength="100"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                      <label>Detailed Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Please provide as much detail as possible..."
                        rows="6"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner-small"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPaperPlane} />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* My Feedback List */}
              {activeTab === 'my-feedback' && (
                <div className="my-feedback-container">
                  {loading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading your feedback...</p>
                    </div>
                  ) : myFeedback.length === 0 ? (
                    <div className="empty-state">
                      <FontAwesomeIcon icon={faCommentDots} className="empty-icon" />
                      <h3>No feedback submitted yet</h3>
                      <p>Your submitted feedback will appear here once you submit some.</p>
                      <p><small>Make sure you are logged in and not submitting anonymously.</small></p>
                    </div>
                  ) : (
                    <div className="feedback-list">
                      {myFeedback.map((feedback) => (
                        <div key={feedback.id} className="feedback-card">
                          <div className="feedback-header">
                            <div className="feedback-type">
                              <FontAwesomeIcon icon={getTypeIcon(feedback.type)} />
                              <span>{feedback.type.replace('_', ' ')}</span>
                            </div>
                            <div className="feedback-meta">
                              <span 
                                className="priority-badge"
                                style={{ backgroundColor: getPriorityColor(feedback.priority) }}
                              >
                                {feedback.priority}
                              </span>
                              <span 
                                className="status-badge"
                                style={{ color: getStatusColor(feedback.status) }}
                              >
                                <FontAwesomeIcon icon={getStatusIcon(feedback.status)} />
                                {feedback.status.replace('_', ' ')}
                              </span>
                              {canDeleteFeedback(feedback) && (
                                <button
                                  className="delete-feedback-btn"
                                  onClick={() => setDeleteConfirm(feedback)}
                                  title="Delete this feedback"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <h3>{feedback.title}</h3>
                          <p className="feedback-description">{feedback.description}</p>
                          
                          <div className="feedback-footer">
                            <span className="feedback-date">
                              Submitted on {formatDate(feedback.created_at)}
                            </span>
                            {feedback.admin_notes && (
                              <div className="admin-notes">
                                <strong>Admin Response:</strong> {feedback.admin_notes}
                              </div>
                            )}
                          </div>

                          {/* Delete Confirmation Modal */}
                          {deleteConfirm && deleteConfirm.id === feedback.id && (
                            <div className="delete-confirmation-overlay">
                              <div className="delete-confirmation-modal">
                                <div className="delete-confirmation-header">
                                  <FontAwesomeIcon icon={faWarning} className="warning-icon" />
                                  <h3>Delete Feedback</h3>
                                </div>
                                <p>Are you sure you want to delete this feedback?</p>
                                <p><strong>"{deleteConfirm.title}"</strong></p>
                                <p className="warning-text">This action cannot be undone.</p>
                                <div className="delete-confirmation-actions">
                                  <button
                                    className="cancel-btn"
                                    onClick={() => setDeleteConfirm(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="confirm-delete-btn"
                                    onClick={() => handleDeleteFeedback(deleteConfirm.id, deleteConfirm.title)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                    Delete
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}