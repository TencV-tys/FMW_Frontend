import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { faEdit, faTrash, faCheckCircle, faExclamationTriangle, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UserNav from '../UserComponents/UserDashboardNav'
import Logo1 from '../assets/Logo.jpg'
import './styles/MyPosts.css'
import { toast } from 'react-toastify'

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedContacts, setExpandedContacts] = useState({});
  const [deletionStats, setDeletionStats] = useState(null);
  const [contactAdminModal, setContactAdminModal] = useState({ isOpen: false, postId: null });
  const nav = useNavigate();

  useEffect(() => {
    fetchMyPosts();
    fetchDeletionStats();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/posts/my-posts', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch posts: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        setPosts(result.posts || []);
      } else {
        throw new Error(result.error || 'Failed to load posts');
      }

    } catch (error) {
      console.error(`Error fetching posts: ${error.message}`);
      setError(error.message);
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch deletion statistics
  const fetchDeletionStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/posts/my-deletion-stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDeletionStats(result.stats);
        }
      } else {
        console.error('Failed to fetch deletion stats');
      }
    } catch (error) {
      console.error('Error fetching deletion stats:', error);
    }
  };

  // Handle post deletion with limit checking
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        // Remove the post from local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        
        // Update deletion stats
        if (result.deletionInfo) {
          const { currentMonthDeletions, monthlyLimit, remainingDeletions, limitReached } = result.deletionInfo;
          const newStats = {
            currentMonthDeletions,
            monthlyLimit,
            remainingDeletions,
            limitReached
          };
          
          setDeletionStats(newStats);

          // Show appropriate message
          if (limitReached) {
            toast.warning(`Monthly deletion limit reached! You've deleted ${currentMonthDeletions} posts this month.`);
          } else if (remainingDeletions === 1) {
            toast.warning(`You have 1 deletion remaining this month.`);
          } else {
            toast.success(`Post deleted! You have ${remainingDeletions} deletion(s) remaining this month.`);
          }
        } else {
          toast.success('Post deleted successfully!');
        }
        
        // Refresh deletion stats
        fetchDeletionStats();
      } else {
        // Handle deletion limit error
        if (result.limitReached) {
          const newStats = {
            currentMonthDeletions: result.currentMonthDeletions,
            monthlyLimit: result.monthlyLimit,
            remainingDeletions: 0,
            limitReached: true
          };
          
          setDeletionStats(newStats);
          
          toast.error(`Deletion limit reached! You can only delete ${result.monthlyLimit} posts per month.`);
          setContactAdminModal({ isOpen: true, postId });
        } else {
          throw new Error(result.error || 'Failed to delete post');
        }
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    }
  };

  // Contact admin for additional deletions
  const handleContactAdmin = async () => {
    const reasonInput = document.getElementById('deletion-reason');
    const reason = reasonInput?.value?.trim();

    if (!reason) {
      alert('Please provide a reason for your deletion request.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/contact-admin', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason,
          type: 'deletion_request',
          post_id: contactAdminModal.postId
        })
      });

      if (response.ok) {
        toast.success('Your request has been sent to the admin. They will review it soon.');
        setContactAdminModal({ isOpen: false, postId: null });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to send request. Please try again.');
      }
    } catch (error) {
      console.error('Error contacting admin:', error);
      toast.error('Error sending request. Please try again.');
    }
  };

  // Handle post editing
  const handleEditPost = (postId) => {
    nav(`/user/edit-post/${postId}`);
  };

  // Handle marking post as resolved
  const handleMarkAsResolved = async (postId) => {
    if (!window.confirm('Are you sure you want to mark this post as resolved? This will close the post.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/posts/${postId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Resolved'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Post marked as resolved successfully');
        // Update the post status in local state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, status: 'Resolved' } : post
          )
        );
      } else {
        throw new Error(result.error || 'Failed to update post status');
      }
    } catch (err) {
      console.error('Error updating post status:', err);
      toast.error(err.message || 'Failed to mark post as resolved');
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

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'status-active', text: 'Active' },
      'Resolved': { class: 'status-resolved', text: 'Resolved' },
      'Removed': { class: 'status-removed', text: 'Removed' }
    };

    return statusConfig[status] || { class: 'status-default', text: status };
  };

  // Toggle description expansion
  const toggleDescription = (postId, e) => {
    if (e) e.stopPropagation();
    setExpandedDescriptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Toggle contact expansion
  const toggleContact = (postId, e) => {
    if (e) e.stopPropagation();
    setExpandedContacts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Check if description needs "Read More"
  const needsReadMore = (description) => {
    return description && description.length > 120;
  };

  // Check if contact needs "Read More"
  const needsContactReadMore = (contact) => {
    return contact && contact.length > 50;
  };

  // Get truncated description
  const getTruncatedDescription = (description) => {
    if (!description) return '';
    if (description.length <= 120) return description;
    return description.substring(0, 120) + '...';
  };

  // Get truncated contact
  const getTruncatedContact = (contact) => {
    if (!contact) return '';
    if (contact.length <= 50) return contact;
    return contact.substring(0, 50) + '...';
  };

  // Render location information with purok
  const renderLocationInfo = (post) => {
    let locationText = post.barangay_name || '';
    if (post.purok_name) {
      locationText += `, ${post.purok_name}`;
    }
    return locationText;
  };

  // Render deletion limit info - UPDATED LOGIC
  const renderDeletionLimitInfo = () => {
    if (!deletionStats) return null;

    const { currentMonthDeletions, monthlyLimit, remainingDeletions, limitReached } = deletionStats;

    // Only show warning if user has actually used deletions
    const hasUsedDeletions = currentMonthDeletions > 0;

    return (
      <div className={`deletion-limit-info ${limitReached ? 'limit-reached' : hasUsedDeletions ? 'limit-warning' : ''}`}>
        <div className="deletion-stats">
          <FontAwesomeIcon 
            icon={limitReached ? faExclamationTriangle : hasUsedDeletions ? faTrash : faTrash} 
            className="deletion-icon" 
          />
          <span className="deletion-text">
            {limitReached ? (
              <>
                <strong>Monthly Limit Reached:</strong> {currentMonthDeletions}/{monthlyLimit} deletions
                <span className="limit-warning"> - Contact admin for additional deletions</span>
              </>
            ) : hasUsedDeletions ? (
              <>
                <strong>Monthly Deletions:</strong> {currentMonthDeletions}/{monthlyLimit} 
                <span className="remaining-text"> ({remainingDeletions} remaining)</span>
              </>
            ) : (
              <>
                <strong>Monthly Deletions:</strong> {currentMonthDeletions}/{monthlyLimit} 
                <span className="remaining-text"> (Full limit available)</span>
              </>
            )}
          </span>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="myposts-container">
        <UserNav />
        <main className="myposts-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your posts...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="myposts-container">
        <UserNav />
        <main className="myposts-content">
          <div className="error-container">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={fetchMyPosts} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="myposts-container">
      <UserNav />
      <main className="myposts-content">
        <div className='myposts-content-darkbrown'>
          <div className='myposts-content-lightbrown'>
            <div className='myposts-content-container'>

              <div className='myposts-content-title'>
                <h1>My Posts</h1>
                <div className="posts-header-info">
                  <div className="posts-counts">
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                  </div>
                  {/* Deletion limit info */}
                  {renderDeletionLimitInfo()}
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="empty-state">
                  <h3>No posts yet</h3>
                  <p>You haven't created any posts. Start by creating your first lost or found item post!</p>
                  <Link to="/user/create" className="create-first-post-btn">
                    Create Your First Post
                  </Link>
                </div>
              ) : (
                // Posts List
                <div className='myposts-list'>
                  {posts.map((post) => {
                    const status = getStatusBadge(post.status);
                    const isLimitReached = deletionStats?.limitReached;
                    
                    // UPDATED LOGIC: Only show delete button if post is active AND limit not reached
                    const canDelete = post.status === 'Active' && !isLimitReached;
                    const showRequestButton = post.status === 'Active' && isLimitReached;

                    return (
                      <div key={post.id} className='mypost-cards'>
                        <span className='myposts-pins'></span>

                        <div className='lost-type'>
                          <div className={`status-badge ${status.class}`}>
                            {status.text}
                          </div>
                          <h1>{post.type} {post.category_name}</h1>
                          <div className='mypost-actions'>
                            {/* Mark as Resolved Button */}
                            {post.status === 'Active' && (
                              <button
                                onClick={() => handleMarkAsResolved(post.id)}
                                className="resolve-btn"
                                title="Mark as resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                            )}
                            
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditPost(post.id)}
                              className="edit-btn"
                              disabled={post.status !== 'Active'}
                              title={post.status !== 'Active' ? 'Cannot edit resolved or removed posts' : 'Edit post'}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            
                            {/* UPDATED: DELETE BUTTON - Only show when limit NOT reached AND post is active */}
                            {canDelete && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="mypost-delete-btn"
                                title="Delete post"
                              >
                                <FontAwesomeIcon className='delete-icon' icon={faTrash} />
                              </button>
                            )}
                            
                            {/* UPDATED: REQUEST DELETION BUTTON - Only show when limit IS reached AND post is active */}
                            {showRequestButton && (
                              <button
                                onClick={() => setContactAdminModal({ isOpen: true, postId: post.id })}
                                className="request-deletion-btn"
                                title="Request deletion from admin"
                              >
                                <FontAwesomeIcon icon={faEnvelope} />
                                Request
                              </button>
                            )}
                          </div>
                        </div>

                        <div className='mypost-details-container'>
                          <div className='mypost-details'>
                            <h2 className="post-title">{post.title}</h2>
                            
                            {/* Description with Read More */}
                            <div className="post-description">
                              <div 
                                className={`description-text ${expandedDescriptions[post.id] ? 'expanded' : ''}`}
                              >
                                {expandedDescriptions[post.id] 
                                  ? post.description 
                                  : getTruncatedDescription(post.description)
                                }
                              </div>
                              {needsReadMore(post.description) && (
                                <button 
                                  className="read-more-btn"
                                  onClick={(e) => toggleDescription(post.id, e)}
                                >
                                  {expandedDescriptions[post.id] ? 'Read Less' : 'Read More'}
                                </button>
                              )}
                            </div>
                            
                            <div className="post-meta">
                              <div className="meta-item">
                                <strong>Category:</strong> {post.category_name}
                              </div>
                              <div className="meta-item">
                                <strong>Location:</strong> {renderLocationInfo(post)}
                              </div>
                              
                              {/* Contact with Read More */}
                              <div className="meta-item">
                                <strong>Contact:</strong>
                                <div className="contact-container">
                                  <div className={`contact-text ${expandedContacts[post.id] ? 'expanded' : ''}`}>
                                    {expandedContacts[post.id] 
                                      ? post.contact_info 
                                      : getTruncatedContact(post.contact_info)
                                    }
                                  </div>
                                  {needsContactReadMore(post.contact_info) && (
                                    <button 
                                      className="contact-read-more-btn"
                                      onClick={(e) => toggleContact(post.id, e)}
                                    >
                                      {expandedContacts[post.id] ? 'Read Less' : 'Read More'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {post.color && (
                                <div className="meta-item">
                                  <strong>Color:</strong> {post.color}
                                </div>
                              )}
                              <div className="meta-item">
                                <strong>Posted:</strong> {formatDate(post.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className='mypost-image'>
                            <img
                              src={post.photo ? `http://localhost:8000/uploads/${post.photo}` : Logo1}
                              alt={post.title}
                              onError={(e) => {
                                e.target.src = Logo1;
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Admin Modal */}
        {contactAdminModal.isOpen && (
          <div className="modal-overlay" onClick={() => setContactAdminModal({ isOpen: false, postId: null })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Monthly Deletion Limit Reached</h3>
                <button 
                  className="modal-close"
                  onClick={() => setContactAdminModal({ isOpen: false, postId: null })}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="warning-banner">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  You've reached your monthly deletion limit of {deletionStats?.monthlyLimit || 3} posts.
                </div>
                
                <p>You have already deleted <strong>{deletionStats?.currentMonthDeletions || 0}</strong> posts this month.</p>
                
                <div className="form-group">
                  <label>Reason for additional deletion request:</label>
                  <textarea
                    placeholder="Please explain why you need to delete this post..."
                    rows="4"
                    id="deletion-reason"
                  />
                </div>

                <div className="info-box">
                  <strong>What happens next:</strong>
                  <ul>
                    <li>Your request will be sent to administrators</li>
                    <li>Admin will review your request within 24 hours</li>
                    <li>You'll receive a notification when approved</li>
                    <li>Limit resets automatically at the start of next month</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setContactAdminModal({ isOpen: false, postId: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleContactAdmin}
                >
                  Send Request to Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}