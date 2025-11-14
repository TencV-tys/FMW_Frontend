import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { faEdit, faTrash, faCheckCircle, faExclamationTriangle, faEnvelope, faPlus, faTimes, faWarning, faFilter, faClock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UserNav from '../UserComponents/UserDashboardNav'
import Logo1 from '../assets/Logo.jpg'
import ResolutionForm from '../UserComponents/ResolutionForm'; 
import './styles/MyPosts.css'
import { useWifiUrl } from '../hooks/useWifiUrl';
import CustomToast from '../components/CustomToast';

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedContacts, setExpandedContacts] = useState({});
  const [deletionStats, setDeletionStats] = useState(null);
  const [contactAdminModal, setContactAdminModal] = useState({ isOpen: false, postId: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [resolutionRequests, setResolutionRequests] = useState([]);
  const [resolutionForm, setResolutionForm] = useState({ isOpen: false, post: null });
  const [pendingDeletionRequests, setPendingDeletionRequests] = useState(new Set());
  
  const nav = useNavigate();
  const wifi = useWifiUrl();
  
  const { toasts, removeToast, toast } = CustomToast.useCustomToast();

  useEffect(() => {
    fetchMyPosts();
    fetchDeletionStats();
    fetchResolutionRequests();
    fetchPendingDeletionRequests();
    
    const savedFilter = sessionStorage.getItem('postsFilter');
    if (savedFilter) {
      setStatusFilter(savedFilter);
      sessionStorage.removeItem('postsFilter');
    }
  }, []);

  // UPDATED: Enhanced filter logic to include pending requests
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredPosts(posts); 
    } else if (statusFilter === 'pending_resolution') {
      // Filter posts that have pending resolution requests
      const pendingResolutionPostIds = resolutionRequests
        .filter(request => request.status === 'pending')
        .map(request => request.post_id);
      
      setFilteredPosts(posts.filter(post => 
        pendingResolutionPostIds.includes(post.id)
      ));
    } else if (statusFilter === 'pending_deletion') {
      // Filter posts that have pending deletion requests
      setFilteredPosts(posts.filter(post => 
        pendingDeletionRequests.has(post.id)
      ));
    } else {
      setFilteredPosts(posts.filter(post => {
        const postStatus = post.status?.toLowerCase().trim();
        const filterStatus = statusFilter.toLowerCase().trim();
        return postStatus === filterStatus;
      }));
    }
  }, [statusFilter, posts, resolutionRequests, pendingDeletionRequests]); 

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
        setFilteredPosts(result.posts || []);
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

  const fetchResolutionRequests = async () => {
    try {
      const response = await fetch(`${wifi}/api/user/resolution-requests`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setResolutionRequests(result.requests || []);
      }
    } catch (error) {
      console.error('Error fetching resolution requests:', error);
    }
  };

  const fetchPendingDeletionRequests = async () => {
    try {
      const postsResponse = await fetch(`${wifi}/api/posts/my-posts`, {
        credentials: 'include'
      });
      const postsResult = await postsResponse.json();
      
      if (postsResult.success) {
        const posts = postsResult.posts || [];
        const pendingSet = new Set();
        
        for (const post of posts) {
          const response = await fetch(`${wifi}/api/check-pending-deletion/${post.id}`, {
            credentials: 'include'
          });
          const result = await response.json();
          
          if (result.success && result.hasPendingRequest) {
            pendingSet.add(post.id);
          }
        }
        
        setPendingDeletionRequests(pendingSet);
      }
    } catch (error) {
      console.error('Error fetching pending deletion requests:', error);
      setPendingDeletionRequests(new Set());
    }
  };

  const checkPostPendingDeletion = async (postId) => {
    try {
      const response = await fetch(`${wifi}/api/check-pending-deletion/${postId}`, {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success && result.hasPendingRequest) {
        setPendingDeletionRequests(prev => new Set([...prev, postId]));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking pending deletion:', error);
      return false;
    }
  };

  const hasPendingResolutionRequest = (postId) => {
    return resolutionRequests.some(request => 
      request.post_id === postId && request.status === 'pending'
    );
  };

  const hasPendingDeletionRequest = (postId) => {
    return pendingDeletionRequests.has(postId);
  };

  // ADDED: Count pending resolution requests
  const countPendingResolutionRequests = () => {
    return resolutionRequests.filter(request => request.status === 'pending').length;
  };

  // ADDED: Count pending deletion requests
  const countPendingDeletionRequests = () => {
    return pendingDeletionRequests.size;
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
    if (processingAction) return;
    
    setProcessingAction('delete');
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
    } finally {
      setProcessingAction(null);
    }
  };

  const handleContactAdmin = async () => {
    if (processingAction) return;
    
    setProcessingAction('contact');
    const reasonInput = document.getElementById('deletion-reason');
    const reason = reasonInput?.value?.trim();

    if (!reason) {
      toast.error('Please provide a reason for your deletion request.');
      setProcessingAction(null);
      return;
    }

    if (reason.length < 10) {
      toast.error('Reason must be at least 10 characters long.');
      setProcessingAction(null);
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

      const result = await response.json();

      if (result.success) {
        toast.success('Your request has been sent to the admin. They will review it soon.');
        setContactAdminModal({ isOpen: false, postId: null });
        
        setPendingDeletionRequests(prev => new Set([...prev, contactAdminModal.postId]));
        
        await checkPostPendingDeletion(contactAdminModal.postId);
      } else {
        if (result.error && result.error.includes('already have a pending deletion request')) {
          toast.error('You already have a pending deletion request for this post.');
          setPendingDeletionRequests(prev => new Set([...prev, contactAdminModal.postId]));
        } else {
          toast.error(result.error || 'Failed to send request. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error contacting admin:', error);
      toast.error('Error sending request. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRequestDeletionClick = async (postId) => {
    const hasPending = await checkPostPendingDeletion(postId);
    
    if (hasPending) {
      toast.info('You already have a pending deletion request for this post.');
      return;
    }
    
    setContactAdminModal({ isOpen: true, postId });
  };

  const handleEditPost = (postId) => {
    nav(`/user/edit-post/${postId}`);
  };

  const handleSubmitResolutionRequest = async (postId, resolutionData) => {
    if (processingAction) return;
    
    setProcessingAction('resolve');
    try {
      const formData = new FormData();
      formData.append('resolution_description', resolutionData.resolution_description);
      formData.append('verification_details', resolutionData.verification_details || '');
      
      if (resolutionData.resolution_photo) {
        formData.append('resolution_photo', resolutionData.resolution_photo);
      }

      const response = await fetch(`${wifi}/api/posts/${postId}/resolution-request`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Resolution request submitted! Waiting for admin approval.');
        setResolutionForm({ isOpen: false, post: null });
        
        fetchResolutionRequests();
        fetchMyPosts();
      } else {
        throw new Error(result.error || 'Failed to submit resolution request');
      }
    } catch (err) {
      console.error('Error submitting resolution request:', err);
      toast.error(err.message || 'Failed to submit resolution request');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleResolveClick = (post) => {
    setResolutionForm({ isOpen: true, post });
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
      <div className="deletion-limit-container-fmw">
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
      </div>
    );
  };

  // UPDATED: Get status counts with pending request counts
  const getStatusCounts = () => {
    const counts = {
      all: posts.length,
      active: posts.filter(post => post.status?.toLowerCase() === 'active').length,
      resolved: posts.filter(post => post.status?.toLowerCase() === 'resolved').length,
      removed: posts.filter(post => post.status?.toLowerCase() === 'removed').length,
      pending_resolution: countPendingResolutionRequests(),
      pending_deletion: countPendingDeletionRequests()
    };
    return counts;
  };

  const clearFilter = () => {
    setStatusFilter('all');
  };

  const statusCounts = getStatusCounts();

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

              {/* Centered Header */}
              <div className='myposts-content-title-fmw'>
                <h1>My Posts</h1>
                <div className="posts-header-info-fmw">
                  <div className="posts-counts-fmw">
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                  </div>
                  {renderDeletionLimitInfo()}
                </div>
              </div>

              {/* ENHANCED: Filter Section with Pending Request Filters */}
              <div className="myposts-filter-section-fmw">
                <div className="filter-header-fmw">
                  <FontAwesomeIcon icon={faFilter} />
                  <span>Filter by Status</span>
                </div>
                <div className="filter-options-fmw">
                  {[
                    { value: 'all', label: 'All', count: statusCounts.all },
                    { value: 'active', label: 'Active', count: statusCounts.active },
                    { value: 'resolved', label: 'Resolved', count: statusCounts.resolved },
                    { value: 'removed', label: 'Removed', count: statusCounts.removed },
                    { value: 'pending_resolution', label: 'Pending Resolution', count: statusCounts.pending_resolution },
                    { value: 'pending_deletion', label: 'Pending Deletion', count: statusCounts.pending_deletion }
                  ].map(option => (
                    <button
                      key={option.value}
                      className={`filter-option-fmw ${statusFilter === option.value ? 'active-fmw' : ''}`}
                      onClick={() => setStatusFilter(option.value)}
                      disabled={loading || option.count === 0}
                    >
                      <span className="filter-label-fmws">{option.label}</span>
                      <span className="filter-count-fmws">({option.count})</span>
                    </button>
                  ))}
                </div>
                {statusFilter !== 'all' && (
                  <button 
                    className="clear-filter-btn-fmw" 
                    onClick={clearFilter}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Clear Filter
                  </button>
                )}
              </div>

              {filteredPosts.length === 0 ? (
                <div className="empty-state-fmws">
                  <h3>
                    {statusFilter === 'all' 
                      ? 'No posts yet' 
                      : statusFilter === 'pending_resolution'
                      ? 'No pending resolution requests'
                      : statusFilter === 'pending_deletion'
                      ? 'No pending deletion requests'
                      : `No ${statusFilter} posts found`
                    }
                  </h3>
                  <p>
                    {statusFilter === 'all' 
                      ? 'You haven\'t created any posts. Start by creating your first lost or found item post!'
                      : statusFilter === 'pending_resolution'
                      ? 'You don\'t have any posts waiting for resolution approval.'
                      : statusFilter === 'pending_deletion'
                      ? 'You don\'t have any posts waiting for deletion approval.'
                      : `You don't have any ${statusFilter} posts.`
                    }
                  </p>
                  {statusFilter === 'all' ? (
                    <Link to="/user/create" className="create-first-post-btn-fmw">
                      Create Your First Post
                    </Link>
                  ) : (
                    <button 
                      className="create-first-post-btn-fmw"
                      onClick={clearFilter}
                    >
                      Show All Posts
                    </button>
                  )}
                </div> 
              ) : (
                <div className='myposts-list-fmw'>
                  {filteredPosts.map((post) => {
                    const status = getStatusBadge(post.status);
                    const isLimitReached = deletionStats?.limitReached;
                   
                    const canDelete = (post.status === 'Active' || post.status === 'Removed') && !isLimitReached;
                    const showRequestButton = (post.status === 'Active' || post.status === 'Removed') && isLimitReached;
                    const hasPendingResolution = hasPendingResolutionRequest(post.id);
                    const hasPendingDeletion = hasPendingDeletionRequest(post.id);

                    return (
                      <div key={post.id} className='mypost-cards-fmw'>
                        {/* Top Section: Image */}
                        <div className='mypost-image-container-fmw'>
                          <img
                            src={post.photo ? `${wifi}/uploads/${post.photo}` : Logo1}
                            alt={post.title}
                            onError={(e) => {
                              e.target.src = Logo1;
                            }}
                          />
                        </div>

                        {/* Middle Section: Status and Type */}
                        <div className='mypost-header-fmw'>
                          <div className={`myposts-status-badge-fmw ${status.class}`}>
                            <span className="myposts-status-text-fmw">{status.text}</span>
                          </div>
                          <h1 className="post-type-fmw">{post.type} {post.category_name}</h1>
                        </div>

                        {/* Bottom Section: Content and Actions */}
                        <div className='mypost-content-fmw'>
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

                          <div className='mypost-actions-fmw'>
                            {post.status === 'Active' && !hasPendingResolution && (
                              <button
                                onClick={() => handleResolveClick(post)}
                                className="resolve-btn-fmw"
                                title="Request to mark as resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span className="btn-text-fmw">Mark as Resolved</span>
                              </button>
                            )}
                            
                            {hasPendingResolution && (
                              <button
                                className="resolve-btn-fmw pending"
                                disabled
                                title="Resolution request pending admin approval"
                              >
                                <FontAwesomeIcon icon={faClock} />
                                <span className="btn-text-fmw">Pending Approval</span>
                              </button>
                            )}
                            
                            {post.status === 'Resolved' && (
                              <button
                                className="resolve-btn-fmw resolved"
                                disabled
                                title="Post has been resolved"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span className="btn-text-fmw">Resolved</span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleEditPost(post.id)}
                              className="edit-btn-fmw"
                              disabled={post.status !== 'Active'}
                              title={post.status !== 'Active' ? 'Cannot edit resolved or removed posts' : 'Edit post'}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                              <span className="btn-text-fmw">Edit</span>
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
                            
                            {showRequestButton && !hasPendingDeletion && (
                              <button
                                onClick={() => handleRequestDeletionClick(post.id)}
                                className="request-deletion-btn-fmw"
                                title="Request deletion from admin"
                              >
                                <FontAwesomeIcon icon={faEnvelope} />
                                <span className="btn-text-fmw">Request</span>
                              </button>
                            )}
                            
                            {hasPendingDeletion && (
                              <button
                                className="request-deletion-btn-fmw pending"
                                disabled
                                title="Deletion request pending admin approval"
                              >
                                <FontAwesomeIcon icon={faClock} />
                                <span className="btn-text-fmw">Pending</span>
                              </button>
                            )}
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

        {resolutionForm.isOpen && resolutionForm.post && (
          <ResolutionForm
            post={resolutionForm.post} 
            onSubmit={(resolutionData) => handleSubmitResolutionRequest(resolutionForm.post.id, resolutionData)}
            onCancel={() => setResolutionForm({ isOpen: false, post: null })}
            loading={processingAction === 'resolve'}
          />
        )}

        <CustomToast.CustomToastContainer toasts={toasts} removeToast={removeToast} />

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay-fmw" onClick={() => !processingAction && setDeleteConfirm(null)}>
            <div className="modal-content-fmw" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-fmw">
                <FontAwesomeIcon icon={faWarning} className="warning-icon-fmw" />
                <h3>Delete Post</h3>
                <button 
                  className="modal-close-fmw"
                  onClick={() => !processingAction && setDeleteConfirm(null)}
                  disabled={processingAction}
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
                  onClick={() => !processingAction && setDeleteConfirm(null)}
                  disabled={processingAction}
                >
                  Cancel 
                </button>
                <button 
                  className="btn-primary-fmw delete-confirm-fmw"
                  onClick={() => handleDeletePost(deleteConfirm.postId, deleteConfirm.postTitle)}
                  disabled={processingAction}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  {processingAction === 'delete' ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Admin Modal */}
        {contactAdminModal.isOpen && (
          <div className="modal-overlay-fmw" onClick={() => !processingAction && setContactAdminModal({ isOpen: false, postId: null })}>
            <div className="modal-content-fmw" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-fmw">
                <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon-fmw" />
                <h3>Request Additional Deletion</h3>
                <button 
                  className="modal-close-fmw"
                  onClick={() => !processingAction && setContactAdminModal({ isOpen: false, postId: null })}
                  disabled={processingAction}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body-fmw">
                <div className="warning-banner-fmw">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Monthly deletion limit reached
                </div>
                
                <p>You've used all <strong>{deletionStats?.monthlyLimit || 3}</strong> deletions this month. To delete more posts, please contact the administrator with a valid reason.</p>
                
                <div className="form-group-fmw">
                  <label htmlFor="deletion-reason">
                    <strong>Reason for deletion request: *</strong>
                  </label>
                  <textarea
                    placeholder="Please explain why you need to delete this post (minimum 10 characters)..."
                    rows="4"
                    id="deletion-reason"
                    className="form-textarea-fmw"
                    minLength="10"
                  /> 
                  <small style={{color: '#666', fontSize: '0.8rem'}}>Reason must be at least 10 characters long</small>
                </div>

                <div className="info-box-fmw">
                  <strong>What happens next:</strong>
                  <ul>
                    <li>Your request will be sent to administrators</li>
                    <li>Admin will review your request within 24 hours</li>
                    <li>You'll receive a notification when approved</li>
                    <li>You cannot submit another request for this post while pending</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer-fmw">
                <button 
                  className="btn-secondary-fmw"
                  onClick={() => !processingAction && setContactAdminModal({ isOpen: false, postId: null })}
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary-fmw"
                  onClick={handleContactAdmin}
                  disabled={processingAction}
                >
                  {processingAction === 'contact' ? 'Sending Request...' : 'Send Request to Admin'}
                </button>
              </div>
            </div>
          </div> 
        )}
      </main>
    </div> 
  ) 
} 