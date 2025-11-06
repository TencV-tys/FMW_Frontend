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
  faEye,
  faBan,
  faSyncAlt,
  faTrash,
  faEdit,
  faSave,
  faTimes,
  faWarning,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/Feedback.css';
import {useWifiUrl} from '../hooks/useWifiUrl';

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('submit');
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [myFeedback, setMyFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false); // 🆕 Separate loading for submission
  const [editLoading, setEditLoading] = useState(false); // 🆕 Separate loading for editing
  const [deleteLoading, setDeleteLoading] = useState(false); // 🆕 Separate loading for deletion
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editFormData, setEditFormData] = useState({
    type: 'general',
    title: '',
    description: '',
    priority: 'medium'
  });

  const wifi = useWifiUrl();

  // Fetch feedback on component mount and when activeTab changes
  useEffect(() => {
    if (activeTab === 'my-feedback') {
      fetchMyFeedback();
    }
  }, [activeTab]);

  // Filter feedback when status filter or myFeedback changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredFeedback(myFeedback);
    } else {
      setFilteredFeedback(myFeedback.filter(feedback => feedback.status === statusFilter));
    }
  }, [statusFilter, myFeedback]);

  // Fetch initial feedback count
  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching feedback...');
      
      console.log(`Fetching user feedback from: ${wifi}/api/feedback/my-feedback`);
      
      const response = await fetch(`${wifi}/api/feedback/my-feedback`, {
        credentials: 'include'
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success) {
          setMyFeedback(data.feedback || []);
          setFilteredFeedback(data.feedback || []);
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
      setSubmitLoading(true); // 🆕 Set submit loading
      setDebugInfo('Submitting feedback...');
      
      const submitData = {
        ...formData,
        metadata: {
          browser: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📤 Submitting feedback:', submitData);

      const response = await fetch(`${wifi}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include'
      });

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
          
          // Refresh feedback list and switch to my-feedback tab
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
      setSubmitLoading(false); // 🆕 Clear submit loading
    }
  };

  const handleDeleteFeedback = async (feedbackId, feedbackTitle) => {
    try {
      setDeleteLoading(true); // 🆕 Set delete loading
      setDebugInfo(`Deleting feedback: ${feedbackTitle}`);
      
      const response = await fetch(`${wifi}/api/feedback/my-feedback/${feedbackId}`, {
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
    } finally {
      setDeleteLoading(false); // 🆕 Clear delete loading
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit button click
  const handleEditClick = (feedback) => {
    setEditingFeedback(feedback.id);
    setEditFormData({
      type: feedback.type,
      title: feedback.title,
      description: feedback.description,
      priority: feedback.priority
    });
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (feedbackId) => {
    try {
      setEditLoading(true); // 🆕 Set edit loading
      setDebugInfo(`Updating feedback: ${editFormData.title}`);
      
      const response = await fetch(`${wifi}/api/feedback/my-feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDebugInfo('Feedback updated successfully!');
          setEditingFeedback(null);
          
          // Update local state
          setMyFeedback(prev => prev.map(feedback => 
            feedback.id === feedbackId 
              ? { ...feedback, ...editFormData, updated_at: new Date().toISOString() }
              : feedback
          ));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setDebugInfo(`Update failed: ${errorData.error || response.status}`);
        alert(errorData.error || 'Failed to update feedback. Please try again.');
      }
    } catch (error) {
      setDebugInfo(`Update error: ${error.message}`);
      console.error('❌ Error updating feedback:', error);
      alert('Error updating feedback. Please try again.');
    } finally {
      setEditLoading(false); // 🆕 Clear edit loading
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setEditFormData({
      type: 'general',
      title: '',
      description: '',
      priority: 'medium'
    });
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
    return true;
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

  const clearFilter = () => {
    setStatusFilter('all');
  };

  const getStatusCounts = () => {
    const counts = {
      all: myFeedback.length,
      pending: myFeedback.filter(f => f.status === 'pending').length,
      reviewed: myFeedback.filter(f => f.status === 'reviewed').length,
      in_progress: myFeedback.filter(f => f.status === 'in_progress').length,
      completed: myFeedback.filter(f => f.status === 'completed').length,
      rejected: myFeedback.filter(f => f.status === 'rejected').length
    };
    return counts;
  };

  // Update the feedback card to include edit functionality
  const renderFeedbackCard = (feedback) => {
    if (editingFeedback === feedback.id) {
      return (
        <div key={feedback.id} className="feedback-card-fmw editing-fmw">
          <div className="edit-form-fmw">
            <div className="form-group-fmw">
              <label>Feedback Type *</label>
              <div className="type-options-fmw">
                {[
                  { value: 'bug', label: 'Bug Report', icon: faBug, description: 'Something is not working' },
                  { value: 'feature', label: 'Feature Request', icon: faLightbulb, description: 'Suggest a new feature' },
                  { value: 'suggestion', label: 'Suggestion', icon: faStar, description: 'General improvement idea' },
                  { value: 'general', label: 'General Feedback', icon: faCommentDots, description: 'Other comments' }
                ].map(type => (
                  <div 
                    key={type.value}
                    className={`type-option-fmw ${editFormData.type === type.value ? 'selected-fmw' : ''}`}
                    onClick={() => setEditFormData(prev => ({ ...prev, type: type.value }))}
                  >
                    <FontAwesomeIcon icon={type.icon} />
                    <div className="type-info-fmw">
                      <strong>{type.label}</strong>
                      <span>{type.description}</span>
                    </div>
                  </div>
                ))} 
              </div>
            </div>

            <div className="form-group-fmw">
              <label>Priority</label>
              <select 
                name="priority"
                value={editFormData.priority}
                onChange={handleEditInputChange}
                className="priority-select-fmw"
              >
                <option value="low">Low - Minor issue or enhancement</option>
                <option value="medium">Medium - Standard issue</option>
                <option value="high">High - Important issue affecting usage</option>
                <option value="critical">Critical - System breaking issue</option>
              </select>
            </div>

            <div className="form-group-fmw">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditInputChange}
                placeholder="Brief description of your feedback..."
                maxLength="100"
                required
              />
            </div>

            <div className="form-group-fmw">
              <label>Detailed Description *</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                placeholder="Please provide as much detail as possible..."
                rows="6"
                required
              />
            </div>

            <div className="edit-actions-fmw">
              <button
                className="cancel-edit-btn-fmw"
                onClick={handleCancelEdit}
                disabled={editLoading} // 🆕 Use editLoading
              >
                <FontAwesomeIcon icon={faTimes} />
                Cancel
              </button>
              <button
                className="save-edit-btn-fmw"
                onClick={() => handleEditSubmit(feedback.id)}
                disabled={editLoading || !editFormData.title.trim() || !editFormData.description.trim()} // 🆕 Use editLoading
              >
                {editLoading ? ( // 🆕 Use editLoading
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
        </div>
      );
    }

    return (
      <div key={feedback.id} className="feedback-card-fmw">
        <div className="feedback-card-header-fmw">
          <div className="feedback-type-fmw">
            <FontAwesomeIcon icon={getTypeIcon(feedback.type)} />
            <span>{feedback.type.replace('_', ' ')}</span>
          </div>
          <div className="feedback-meta-fmw">
            <span 
              className="priority-badge-fmw"
              style={{ backgroundColor: getPriorityColor(feedback.priority) }}
            >
              {feedback.priority}
            </span>
            <span 
              className="status-badge-fmw"
              style={{ color: getStatusColor(feedback.status) }}
            >
              <FontAwesomeIcon icon={getStatusIcon(feedback.status)} />
              {feedback.status.replace('_', ' ')}
            </span>
            <div className="feedback-actions-fmw">
              <button
                className="edit-feedback-btn-fmw"
                onClick={() => handleEditClick(feedback)}
                title="Edit this feedback"
                disabled={loading} // 🆕 Disable during loading
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                className="delete-feedback-btn-fmw"
                onClick={() => setDeleteConfirm(feedback)}
                title="Delete this feedback"
                disabled={loading} // 🆕 Disable during loading
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        </div>
        
        <h3>{feedback.title}</h3>
        <p className="feedback-description-fmw">{feedback.description}</p>
        
        <div className="feedback-footer-fmw">
          <span className="feedback-date-fmw">
            {feedback.updated_at !== feedback.created_at ? 'Updated' : 'Submitted'} on {formatDate(feedback.updated_at || feedback.created_at)}
          </span>
          {feedback.admin_notes && (
            <div className="admin-notes-fmw">
              <strong>Admin Response:</strong> {feedback.admin_notes}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && deleteConfirm.id === feedback.id && (
          <div className="delete-confirmation-overlay-fmw">
            <div className="delete-confirmation-modal-fmw">
              <div className="delete-confirmation-header-fmw">
                <FontAwesomeIcon icon={faWarning} className="warning-icon-fmw" />
                <h3>Delete Feedback</h3>
              </div>
              <p>Are you sure you want to delete this feedback?</p>
              <p><strong>"{deleteConfirm.title}"</strong></p>
              <p className="warning-text-fmw">This action cannot be undone.</p>
              <div className="delete-confirmation-actions-fmw">
                <button
                  className="cancel-btn-fmw"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteLoading} // 🆕 Disable during delete loading
                >
                  Cancel
                </button>
                <button
                  className="confirm-delete-btn-fmw"
                  onClick={() => handleDeleteFeedback(deleteConfirm.id, deleteConfirm.title)}
                  disabled={deleteLoading} // 🆕 Disable during delete loading
                >
                  {deleteLoading ? ( // 🆕 Show loading in delete button
                    <>
                      <div className="loading-spinner-small-fmw"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="feedback-page-fmw">
      <UserNav />
      <main className="feedback-container-fmw">
        <div className='feedback-container-darkbrown-fmw'>
          <div className='feedback-container-lightbrown-fmw'>
            <div className='feedback-content-fmw'>
              
              {/* Header */}
              <div className='feedback-header-fmw'>
                <h1>
                  <FontAwesomeIcon icon={faCommentDots} />
                  Feedback & Support
                </h1>
                <p>Help us improve the platform by sharing your thoughts and reporting issues</p>
              </div>

              {/* Debug Info */}
              {debugInfo && (
                <div className="debug-info-fmw">
                  <strong>Debug:</strong> {debugInfo}
                </div>
              )}

              {/* Tabs */}
              <div className="feedback-tabs-fmw">
                <button 
                  className={`tab-button-fmw ${activeTab === 'submit' ? 'active-fmw' : ''}`}
                  onClick={() => setActiveTab('submit')}
                  disabled={loading} // 🆕 Disable tabs during loading
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  Submit Feedback
                </button>
                <button 
                  className={`tab-button-fmw ${activeTab === 'my-feedback' ? 'active-fmw' : ''}`}
                  onClick={() => setActiveTab('my-feedback')}
                  disabled={loading} // 🆕 Disable tabs during loading
                >
                  <FontAwesomeIcon icon={faClock} />
                  My Feedback ({myFeedback.length})
                </button>
              </div>

              {/* Submit Feedback Form */}
              {activeTab === 'submit' && (
                <div className="feedback-form-container-fmw">
                  {submitSuccess && (
                    <div className="success-message-fmw">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Thank you for your feedback! We'll review it soon.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="feedback-form-fmw">
                    {/* Feedback Type */}
                    <div className="form-group-fmw">
                      <label>Feedback Type *</label>
                      <div className="type-options-fmw">
                        {[
                          { value: 'bug', label: 'Bug Report', icon: faBug, description: 'Something is not working' },
                          { value: 'feature', label: 'Feature Request', icon: faLightbulb, description: 'Suggest a new feature' },
                          { value: 'suggestion', label: 'Suggestion', icon: faStar, description: 'General improvement idea' },
                          { value: 'general', label: 'General Feedback', icon: faCommentDots, description: 'Other comments' }
                        ].map(type => (
                          <div 
                            key={type.value}
                            className={`type-option-fmw ${formData.type === type.value ? 'selected-fmw' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          >
                            <FontAwesomeIcon icon={type.icon} />
                            <div className="type-info-fmw">
                              <strong>{type.label}</strong>
                              <span>{type.description}</span>
                            </div>
                          </div>
                        ))} 
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="form-group-fmw">
                      <label>Priority</label>
                      <select 
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="priority-select-fmw"
                        disabled={submitLoading} // 🆕 Disable during submit loading
                      >
                        <option value="low">Low - Minor issue or enhancement</option>
                        <option value="medium">Medium - Standard issue</option>
                        <option value="high">High - Important issue affecting usage</option>
                        <option value="critical">Critical - System breaking issue</option>
                      </select>
                    </div>

                    {/* Title */}
                    <div className="form-group-fmw">
                      <label>Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Brief description of your feedback..."
                        maxLength="100"
                        required
                        disabled={submitLoading} // 🆕 Disable during submit loading
                      />
                    </div>

                    {/* Description */}
                    <div className="form-group-fmw">
                      <label>Detailed Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Please provide as much detail as possible..."
                        rows="6"
                        required
                        disabled={submitLoading} // 🆕 Disable during submit loading
                      />
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className="submit-button-fmw"
                      disabled={submitLoading || !formData.title.trim() || !formData.description.trim()} // 🆕 Use submitLoading
                    >
                      {submitLoading ? ( // 🆕 Use submitLoading
                        <>
                          <div className="loading-spinner-small-fmw"></div>
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
                <div className="my-feedback-container-fmw">
                  {/* Status Filter */}
                  <div className="feedback-filter-section-fmw">
                    <div className="filter-header-fmw">
                      <FontAwesomeIcon icon={faFilter} />
                      <span>Filter by Status</span>
                    </div>
                    <div className="filter-options-fmw">
                      {[
                        { value: 'all', label: 'All', count: statusCounts.all },
                        { value: 'pending', label: 'Pending', count: statusCounts.pending },
                        { value: 'reviewed', label: 'Reviewed', count: statusCounts.reviewed },
                        { value: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
                        { value: 'completed', label: 'Completed', count: statusCounts.completed },
                        { value: 'rejected', label: 'Rejected', count: statusCounts.rejected }
                      ].map(option => (
                        <button
                          key={option.value}
                          className={`filter-option-fmw ${statusFilter === option.value ? 'active-fmw' : ''}`}
                          onClick={() => setStatusFilter(option.value)}
                          disabled={loading} // 🆕 Disable filters during loading
                        >
                          <span className="filter-label-fmw">{option.label}</span>
                          <span className="filter-count-fmw">({option.count})</span>
                        </button>
                      ))}
                    </div>
                    {statusFilter !== 'all' && (
                      <button 
                        className="clear-filter-btn-fmw" 
                        onClick={clearFilter}
                        disabled={loading} // 🆕 Disable clear filter during loading
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Clear Filter
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="loading-container-fmw">
                      <div className="loading-spinner-fmw"></div>
                      <p>Loading your feedback...</p>
                    </div>
                  ) : filteredFeedback.length === 0 ? (
                    <div className="empty-state-fmw">
                      <FontAwesomeIcon icon={faCommentDots} className="empty-icon-fmw" />
                      <h3>
                        {statusFilter === 'all' 
                          ? 'No feedback submitted yet' 
                          : `No ${statusFilter} feedback found`
                        }
                      </h3>
                      <p>
                        {statusFilter === 'all' 
                          ? 'Your submitted feedback will appear here once you submit some.'
                          : `You don't have any ${statusFilter} feedback items.`
                        }
                      </p>
                      {statusFilter !== 'all' && (
                        <button 
                          className="clear-filter-btn-fmw empty-state-btn-fmw"
                          onClick={clearFilter}
                        >
                          Show All Feedback
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="feedback-list-fmw">
                      <div className="feedback-list-header-fmw">
                        <span className="showing-text-fmw">
                          Showing {filteredFeedback.length} of {myFeedback.length} feedback items
                          {statusFilter !== 'all' && ` (filtered by: ${statusFilter})`}
                        </span>
                      </div>
                      {filteredFeedback.map(renderFeedbackCard)}
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