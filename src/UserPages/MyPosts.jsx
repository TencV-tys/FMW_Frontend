import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { faEdit, faTrash, faCheckCircle, faExclamationTriangle, faEnvelope, faPlus, faTimes, faWarning } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UserNav from '../UserComponents/UserDashboardNav'
import Logo1 from '../assets/Logo.jpg'
import './styles/MyPosts.css'
import { toast } from 'react-toastify'
import {useWifiUrl} from '../hooks/useWifiUrl';
export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedContacts, setExpandedContacts] = useState({});
  const [deletionStats, setDeletionStats] = useState(null);
  const [contactAdminModal, setContactAdminModal] = useState({ isOpen: false, postId: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [resolveConfirm, setResolveConfirm] = useState(null);
  const nav = useNavigate();
  const wifi = useWifiUrl();
  

  useEffect(() => {
    fetchMyPosts();
    fetchDeletionStats();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${wifi}/api/posts/my-posts`, {
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

  const fetchDeletionStats = async () => {
    try {
      const response = await fetch(`${wifi}/api/posts/my-deletion-stats`, {
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

  const handleDeletePost = async (postId, postTitle) => {
    try {
      const response = await fetch(`${wifi}/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        
        if (result.deletionInfo) {
          const { currentMonthDeletions, monthlyLimit, remainingDeletions, limitReached } = result.deletionInfo;
          const newStats = {
            currentMonthDeletions,
            monthlyLimit,
            remainingDeletions,
            limitReached
          };
          
          setDeletionStats(newStats);

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
        
        fetchDeletionStats();
      } else {
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

  const handleContactAdmin = async () => {
    const reasonInput = document.getElementById('deletion-reason');
    const reason = reasonInput?.value?.trim();

    if (!reason) {
      alert('Please provide a reason for your deletion request.');
      return;
    }

    try {
      const response = await fetch(`${wifi}/api/contact-admin`, {
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

  const handleEditPost = (postId) => {
    nav(`/user/edit-post/${postId}`);
  };

  const handleMarkAsResolved = async (postId, postTitle) => {
    try {
      const response = await fetch(`${wifi}/api/posts/${postId}/status`, {
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


const getStatusBadge = (status) => {
  const statusConfig = {
    'Active': { class: 'myposts-status-active-fmw', text: 'Active' },
    'Resolved': { class: 'myposts-status-resolved-fmw', text: 'Resolved' },
    'Removed': { class: 'myposts-status-removed-fmw', text: 'Removed' }
  };

  return statusConfig[status] || { class: 'myposts-status-default-fmw', text: status };
};

  const toggleDescription = (postId, e) => {
    if (e) e.stopPropagation();
    setExpandedDescriptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleContact = (postId, e) => {
    if (e) e.stopPropagation();
    setExpandedContacts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const needsReadMore = (description) => {
    return description && description.length > 120;
  };

  const needsContactReadMore = (contact) => {
    return contact && contact.length > 50;
  };

  const getTruncatedDescription = (description) => {
    if (!description) return '';
    if (description.length <= 120) return description;
    return description.substring(0, 120) + '...';
  };

  const getTruncatedContact = (contact) => {
    if (!contact) return '';
    if (contact.length <= 50) return contact;
    return contact.substring(0, 50) + '...';
  };

  const renderLocationInfo = (post) => {
    let locationText = post.barangay_name || '';
    if (post.purok_name) {
      locationText += `, ${post.purok_name}`;
    }
    return locationText;
  };

  const renderDeletionLimitInfo = () => {
    if (!deletionStats) return null;

    const { currentMonthDeletions, monthlyLimit, remainingDeletions, limitReached } = deletionStats;
    const hasUsedDeletions = currentMonthDeletions > 0;

    return (
      <div className={`deletion-limit-info-fmw ${limitReached ? 'limit-reached-fmw' : hasUsedDeletions ? 'limit-warning-fmw' : ''}`}>
        <div className="deletion-stats-fmw">
          <FontAwesomeIcon 
            icon={limitReached ? faExclamationTriangle : hasUsedDeletions ? faTrash : faTrash} 
            className="deletion-icon-fmw" 
          />
          <span className="deletion-text-fmw">
            {limitReached ? (
              <>
                <strong>Monthly Limit Reached:</strong> {currentMonthDeletions}/{monthlyLimit} deletions
                <span className="limit-warning-text-fmw"> - Contact admin for additional deletions</span>
              </>
            ) : hasUsedDeletions ? (
              <>
                <strong>Monthly Deletions:</strong> {currentMonthDeletions}/{monthlyLimit} 
                <span className="remaining-text-fmw"> ({remainingDeletions} remaining)</span>
              </>
            ) : (
              <>
                <strong>Monthly Deletions:</strong> {currentMonthDeletions}/{monthlyLimit} 
                <span className="remaining-text-fmw"> (Full limit available)</span>
              </>
            )}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="myposts-container-fmw">
        <UserNav />
        <main className="myposts-content-fmw">
          <div className="loading-container-fmw">
            <div className="loading-spinner-fmw"></div>
            <p>Loading your posts...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myposts-container-fmw">
        <UserNav />
        <main className="myposts-content-fmw">
          <div className="error-container-fmw">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={fetchMyPosts} className="retry-btn-fmw">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="myposts-container-fmw">
      <UserNav />
      <main className="myposts-content-fmw">
        <div className='myposts-content-darkbrown-fmw'>
          <div className='myposts-content-lightbrown-fmw'>
            <div className='myposts-content-container-fmw'>

              <div className='myposts-content-title-fmw'>
                <h1>My Posts</h1>
                <div className="posts-header-info-fmw">
                  <div className="posts-counts-fmw">
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                  </div>
                  {renderDeletionLimitInfo()}
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="empty-state-fmws">
                  <h3>No posts yet</h3>
                  <p>You haven't created any posts. Start by creating your first lost or found item post!</p>
                  <Link to="/user/create" className="create-first-post-btn-fmw">
                    Create Your First Post
                  </Link>
                </div> 
              ) : (
                <div className='myposts-list-fmw'>
                  {posts.map((post) => {
                    const status = getStatusBadge(post.status);
                    const isLimitReached = deletionStats?.limitReached;
                   
                       const canDelete = (post.status === 'Active' || post.status === 'Removed') && !isLimitReached;
  const showRequestButton = (post.status === 'Active' || post.status === 'Removed') && isLimitReached;

                    return (
                      <div key={post.id} className='mypost-cards-fmw'>
                        <span className='myposts-pins-fmw'></span>

                        <div className='lost-type-fmw'>
                          <div className={`myposts-status-badge-fmw ${status.class}`}>
                            <span className="myposts-status-text-fmw">{status.text}</span>
                          </div>
                          <h1>{post.type} {post.category_name}</h1>
                          <div className='mypost-actions-fmw'>
                            {post.status === 'Active' && (
                              <button
                                onClick={() => setResolveConfirm({ postId: post.id, postTitle: post.title })}
                                className="resolve-btn-fmw"
                                title="Mark as resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleEditPost(post.id)}
                              className="edit-btn-fmw"
                              disabled={post.status !== 'Active'}
                              title={post.status !== 'Active' ? 'Cannot edit resolved or removed posts' : 'Edit post'}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            
                            {canDelete && (
                              <button
                                onClick={() => setDeleteConfirm({ postId: post.id, postTitle: post.title })}
                                className="mypost-delete-btn-fmw"
                                title="Delete post"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              <span className="btn-text-fmw">Delete</span>
                              </button>
                            )}
                            
                            {showRequestButton && (
                              <button
                                onClick={() => setContactAdminModal({ isOpen: true, postId: post.id })}
                                className="request-deletion-btn-fmw"
                                title="Request deletion from admin"
                              >
                                <FontAwesomeIcon icon={faEnvelope} />
                                <span className="btn-text-fmw">Request</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className='mypost-details-container-fmw'>
                          <div className='mypost-image-container-fmw'>
                            <img
                              src={post.photo ? `${wifi}/uploads/${post.photo}` : Logo1}
                              alt={post.title}
                              onError={(e) => {
                                e.target.src = Logo1;
                              }}
                            />
                          </div>
                          
                          <div className='mypost-details-fmw'>
                            <h2 className="post-title-fmw">{post.title}</h2>
                            
                            <div className="post-description-fmw">
                              <div 
                                className={`description-text-fmw ${expandedDescriptions[post.id] ? 'expanded-fmw' : ''}`}
                              >
                                {expandedDescriptions[post.id] 
                                  ? post.description 
                                  : getTruncatedDescription(post.description)
                                }
                              </div>
                              {needsReadMore(post.description) && (
                                <button 
                                  className="read-more-btn-fmw"
                                  onClick={(e) => toggleDescription(post.id, e)}
                                >
                                  {expandedDescriptions[post.id] ? 'Read Less' : 'Read More'}
                                </button>
                              )}
                            </div>
                            
                            <div className="post-meta-fmw">
                              <div className="meta-item-fmw">
                                <strong>Category:</strong> {post.category_name}
                              </div>
                              <div className="meta-item-fmw">
                                <strong>Location:</strong> {renderLocationInfo(post)}
                              </div>
                              
                              <div className="meta-item-fmw">
                                <strong>Contact:</strong>
                                <div className="contact-container-fmw">
                                  <div className={`contact-text-fmw ${expandedContacts[post.id] ? 'expanded-fmw' : ''}`}>
                                    {expandedContacts[post.id] 
                                      ? post.contact_info 
                                      : getTruncatedContact(post.contact_info)
                                    }
                                  </div>
                                  {needsContactReadMore(post.contact_info) && (
                                    <button 
                                      className="contact-read-more-btn-fmw"
                                      onClick={(e) => toggleContact(post.id, e)}
                                    >
                                      {expandedContacts[post.id] ? 'Read Less' : 'Read More'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {post.color && (
                                <div className="meta-item-fmw">
                                  <strong>Color:</strong> {post.color}
                                </div>
                              )}
                              <div className="meta-item-fmw">
                                <strong>Posted:</strong> {formatDate(post.created_at)}
                              </div>
                            </div>
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

        <Link to="/user/create" className="mobile-create-post-btn-fmw">
          <FontAwesomeIcon icon={faPlus} />
        </Link>

        {deleteConfirm && (
          <div className="modal-overlay-fmw" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content-fmw" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-fmw">
                <FontAwesomeIcon icon={faWarning} className="warning-icon-fmw" />
                <h3>Delete Post</h3>
                <button 
                  className="modal-close-fmw"
                  onClick={() => setDeleteConfirm(null)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body-fmw">
                <p>Are you sure you want to delete this post?</p>
                <p><strong>"{deleteConfirm.postTitle}"</strong></p>
                <p className="warning-text-fmw">This action cannot be undone.</p>
              </div>
              <div className="modal-footer-fmw">
                <button 
                  className="btn-secondary-fmw"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel 
                </button>
                <button 
                  className="btn-primary-fmw delete-confirm-fmw"
                  onClick={() => {
                    handleDeletePost(deleteConfirm.postId, deleteConfirm.postTitle);
                    setDeleteConfirm(null);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        )}

        {resolveConfirm && (
          <div className="modal-overlay-fmw" onClick={() => setResolveConfirm(null)}>
            <div className="modal-content-fmw" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-fmw">
                <FontAwesomeIcon icon={faCheckCircle} className="success-icon-fmw" />
                <h3>Mark as Resolved</h3>
                <button 
                  className="modal-close-fmw"
                  onClick={() => setResolveConfirm(null)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body-fmw">
                <p>Are you sure you want to mark this post as resolved?</p>
                <p><strong>"{resolveConfirm.postTitle}"</strong></p>
                <p className="info-text-fmw">This will close the post and mark it as completed.</p>
              </div>
              <div className="modal-footer-fmw">
                <button 
                  className="btn-secondary-fmw"
                  onClick={() => setResolveConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary-fmw resolve-confirm-fmw"
                  onClick={() => {
                    handleMarkAsResolved(resolveConfirm.postId, resolveConfirm.postTitle);
                    setResolveConfirm(null);
                  }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        )}

        {contactAdminModal.isOpen && (
          <div className="modal-overlay-fmw" onClick={() => setContactAdminModal({ isOpen: false, postId: null })}>
            <div className="modal-content-fmw" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-fmw">
                <h3>Monthly Deletion Limit Reached</h3>
                <button 
                  className="modal-close-fmw"
                  onClick={() => setContactAdminModal({ isOpen: false, postId: null })}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body-fmw">
                <div className="warning-banner-fmw">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  You've reached your monthly deletion limit of {deletionStats?.monthlyLimit || 3} posts.
                </div>
                
                <p>You have already deleted <strong>{deletionStats?.currentMonthDeletions || 0}</strong> posts this month.</p>
                
                <div className="form-group-fmw">
                  <label>Reason for additional deletion request:</label>
                  <textarea
                    placeholder="Please explain why you need to delete this post..."
                    rows="4"
                    id="deletion-reason"
                  /> 
                </div>

                <div className="info-box-fmw">
                  <strong>What happens next:</strong>
                  <ul>
                    <li>Your request will be sent to administrators</li>
                    <li>Admin will review your request within 24 hours</li>
                    <li>You'll receive a notification when approved</li>
                    <li>Limit resets automatically at the start of next month</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer-fmw">
                <button 
                  className="btn-secondary-fmw"
                  onClick={() => setContactAdminModal({ isOpen: false, postId: null })}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary-fmw"
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