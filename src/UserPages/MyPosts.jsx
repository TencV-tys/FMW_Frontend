import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { faEdit, faTrash, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
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

  // 🎯 NEW: Fetch deletion statistics
  const fetchDeletionStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/posts/deletion-stats', {
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
      }
    } catch (error) {
      console.error('Error fetching deletion stats:', error);
    }
  };

  // Handle post deletion with limit checking
  const handleDeletePost = async (postId) => {
    // 🎯 NEW: Check deletion stats before confirming
    if (deletionStats && deletionStats.limitReached) {
      toast.error(
        <div>
          <strong>Monthly Deletion Limit Reached!</strong>
          <br />
          You've already deleted {deletionStats.currentMonthDeletions} posts this month. 
          The limit will reset next month.
        </div>,
        { autoClose: 5000 }
      );
      return;
    }

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
        
        // 🎯 NEW: Update deletion stats
        if (result.deletionInfo) {
          const { currentMonthDeletions, monthlyLimit, remainingDeletions } = result.deletionInfo;
          setDeletionStats({
            currentMonthDeletions,
            monthlyLimit,
            remainingDeletions,
            limitReached: remainingDeletions <= 0
          });

          // Show appropriate message based on remaining deletions
          if (remainingDeletions === 0) {
            toast.warning(
              <div>
                <FontAwesomeIcon icon={faExclamationTriangle} style={{color: '#ffc107', marginRight: '8px'}} />
                <strong>Monthly Deletion Limit Reached!</strong>
                <br />
                You've deleted {currentMonthDeletions} posts this month. 
                The limit will reset at the start of next month.
              </div>,
              { autoClose: 6000 }
            );
          } else if (remainingDeletions === 1) {
            toast.warning(
              <div>
                <FontAwesomeIcon icon={faExclamationTriangle} style={{color: '#ffc107', marginRight: '8px'}} />
                <strong>One Deletion Remaining</strong>
                <br />
                You can delete 1 more post this month.
              </div>,
              { autoClose: 5000 }
            );
          } else {
            toast.success(
              <div>
                <strong>Post deleted successfully!</strong>
                <br />
                You have {remainingDeletions} deletion(s) remaining this month.
              </div>,
              { autoClose: 4000 }
            );
          }
        } else {
          toast.success('Post deleted successfully!');
        }
      } else {
        // 🎯 NEW: Handle deletion limit error specifically
        if (result.limitReached) {
          setDeletionStats({
            currentMonthDeletions: result.currentMonthDeletions,
            monthlyLimit: result.monthlyLimit,
            remainingDeletions: 0,
            limitReached: true
          });
          
          toast.error(
            <div>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{color: '#dc3545', marginRight: '8px'}} />
              <strong>Monthly Deletion Limit Reached!</strong>
              <br />
              You can only delete {result.monthlyLimit} posts per month. 
              Contact admin if you need to delete more posts.
            </div>,
            { autoClose: 6000 }
          );
        } else {
          throw new Error(result.error || 'Failed to delete post');
        }
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(err.message || 'Failed to delete post');
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

  // 🎯 Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'status-active', text: 'Active' },
      'Resolved': { class: 'status-resolved', text: 'Resolved' },
      'Removed': { class: 'status-removed', text: 'Removed' }
    };

    return statusConfig[status] || { class: 'status-default', text: status };
  };

  // 🎯 Toggle description expansion
  const toggleDescription = (postId, e) => {
    if (e) e.stopPropagation();
    setExpandedDescriptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // 🎯 Toggle contact expansion
  const toggleContact = (postId, e) => {
    if (e) e.stopPropagation();
    setExpandedContacts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // 🎯 Check if description needs "Read More"
  const needsReadMore = (description) => {
    return description.length > 120;
  };

  // 🎯 Check if contact needs "Read More"
  const needsContactReadMore = (contact) => {
    return contact.length > 50;
  };

  // 🎯 Get truncated description
  const getTruncatedDescription = (description) => {
    if (description.length <= 120) return description;
    return description.substring(0, 120) + '...';
  };

  // 🎯 Get truncated contact
  const getTruncatedContact = (contact) => {
    if (contact.length <= 50) return contact;
    return contact.substring(0, 50) + '...';
  };

  // 🎯 Render location information with purok
  const renderLocationInfo = (post) => {
    let locationText = post.barangay_name;
    if (post.purok_name) {
      locationText += `, ${post.purok_name}`;
    }
    return locationText;
  };

  // 🎯 NEW: Render deletion limit info
  const renderDeletionLimitInfo = () => {
    if (!deletionStats) return null;

    const { currentMonthDeletions, monthlyLimit, remainingDeletions, limitReached } = deletionStats;

    return (
      <div className={`deletion-limit-info ${limitReached ? 'limit-reached' : ''}`}>
        <div className="deletion-stats">
          <FontAwesomeIcon 
            icon={limitReached ? faExclamationTriangle : faTrash} 
            className="deletion-icon" 
          />
          <span className="deletion-text">
            {limitReached ? (
              <>
                <strong>Monthly Limit Reached:</strong> {currentMonthDeletions}/{monthlyLimit} deletions
                <span className="limit-warning"> - Resets next month</span>
              </>
            ) : (
              <>
                <strong>Monthly Deletions:</strong> {currentMonthDeletions}/{monthlyLimit} 
                <span className="remaining-text"> ({remainingDeletions} remaining)</span>
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
                    {posts.length} {posts.length <= 1 ? 'post' : 'posts'}
                  </div>
                  {/* 🎯 NEW: Deletion limit info */}
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
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className={`mypost-delete-btn ${deletionStats?.limitReached ? 'disabled' : ''}`}
                              disabled={deletionStats?.limitReached}
                              title={
                                deletionStats?.limitReached 
                                  ? `Monthly deletion limit reached (${deletionStats.currentMonthDeletions}/${deletionStats.monthlyLimit})`
                                  : "Delete post"
                              }
                            >
                              <FontAwesomeIcon className='delete-icon' icon={faTrash} />
                            </button>
                          </div>
                        </div>

                        <div className='mypost-details-container'>
                          <div className='mypost-details'>
                            <h2 className="post-title">{post.title}</h2>
                            
                            {/* 🎯 Description with Read More */}
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
                              
                              {/* 🎯 Contact with Read More */}
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
      </main>
    </div>
  )
}