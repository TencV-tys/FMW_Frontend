// UserPages/Feedback.jsx
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
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/Feedback.css';

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'my-feedback'
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

  useEffect(() => {
    if (activeTab === 'my-feedback') {
      fetchMyFeedback();
    }
  }, [activeTab]);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/feedback/my-feedback', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMyFeedback(data.feedback);
        }
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
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
      
      const submitData = {
        ...formData,
        metadata: {
          browser: navigator.userAgent,
          timestamp: new Date().toISOString(),
          anonymous: anonymous
        }
      };

      // Remove user credentials if submitting anonymously
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      };

      // Only include credentials if not anonymous
      if (!anonymous) {
        options.credentials = 'include';
      }

      const response = await fetch('http://localhost:8000/api/feedback', options);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubmitSuccess(true);
          setFormData({
            type: 'general',
            title: '',
            description: '',
            priority: 'medium'
          });
          setTimeout(() => setSubmitSuccess(false), 5000);
          
          // Refresh my feedback list if user is logged in
          if (!anonymous) {
            fetchMyFeedback();
          }
        }
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
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
                  My Feedback
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
                      <small>Your identity will be hidden from administrators</small>
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
                                <FontAwesomeIcon icon={faCircle} />
                                {feedback.status.replace('_', ' ')}
                              </span>
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