import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, 
  faUserCircle, 
  faMapMarkerAlt, 
  faPhone, 
  faTag,
  faFlag,
  faFilter,
  faTimes,
  faExpand,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav.jsx';
import ReportModal from '../UserComponents/ReportModal';
import OptionalPhoto from '../assets/Logo.jpg';
import './styles/BulletinBoard.css';

export default function BulletinBoard() {
  const [reportModal, setReportModal] = useState({ isOpen: false, post: null });
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [puroks, setPuroks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBarangay, setFilterBarangay] = useState('all');
  const [filterPurok, setFilterPurok] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedContacts, setExpandedContacts] = useState({});
   const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

      const wifi = isLocalhost 
  ? 'http://localhost:8000' 
  : 'http://192.168.1.27:8000';
  useEffect(() => {
    fetchPosts();
    fetchFormData();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, filterType, filterCategory, filterBarangay, filterPurok]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${wifi}/api/posts/active`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPosts(result.posts || []);
      } else {
        throw new Error(result.error || 'Failed to load posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
    
      const response = await fetch(`${wifi}/api/posts/form-data`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories || []);
          setBarangays(data.barangays || []);
          setPuroks(data.puroks || []); 
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.barangay_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.purok_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(post => post.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(post => post.category_id.toString() === filterCategory);
    }

    if (filterBarangay !== 'all') {
      filtered = filtered.filter(post => post.barangay_id.toString() === filterBarangay);
    }
    if (filterPurok !== 'all') {
      filtered = filtered.filter(post => post.purok_id?.toString() === filterPurok); 
    }
    setFilteredPosts(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterBarangay('all');
    setFilterPurok('all'); 
  };

  const isFilterActive = () => {
    return searchTerm !== '' || 
           filterType !== 'all' || 
           filterCategory !== 'all' || 
           filterBarangay !== 'all' ||
           filterPurok !== 'all';
  };

  const renderLocationInfo = (post) => {
    let locationText = post.barangay_name;
    if (post.purok_name) {
      locationText += `, ${post.purok_name}`;
    }
    return locationText;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserImage = (user) => {
     const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

      const wifi = isLocalhost 
  ? 'http://localhost:8000' 
  : 'http://192.168.1.27:8000';
    if (user.user_photo) {
      return `${wifi}/uploads/${user.user_photo}`;
    }
    return null;
  };
 
  const openReportModal = (post, e) => {
    if (e) e.stopPropagation();
    setReportModal({ isOpen: true, post });
  };

  const closeReportModal = () => {
    setReportModal({ isOpen: false, post: null });
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
  };

  const closePostModal = () => {
    setSelectedPost(null);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
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

  if (loading) {
    return (
      <div className="bulletin-board-page-container">
        <UserNav />
        <main className="bulletin-board-main-container">
          <div className='bulletin-board-darkbrown-container'>
            <div className='bulletin-board-lightbrown-container'>
              <div className="bulletin-loading-container">
                <div className="bulletin-loading-spinner"></div>
                <p>Loading posts...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bulletin-board-page-container">
        <UserNav />
        <main className="bulletin-board-main-container">
          <div className='bulletin-board-darkbrown-container'>
            <div className='bulletin-board-lightbrown-container'>
              <div className="bulletin-error-container">
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button onClick={fetchPosts} className="bulletin-retry-btn">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bulletin-board-page-container">
      <UserNav />
      <main className="bulletin-board-main-container">
        <div className='bulletin-board-darkbrown-container'>
          <div className='bulletin-board-lightbrown-container'>
            <div className='bulletin-board-content-container'>
              
              {/* Header Section */}
              <div className='bulletin-board-title-section'>
                <h1>Lost & Found Bulletin</h1>
              </div>

              {/* Search and Filters Section */}
              <div className="bulletin-search-filters-section">
                <div className='bulletin-search-input-container'>
                  <div className='bulletin-search-bar'>
                    <input 
                      className='bulletin-search-input' 
                      type='text'
                      placeholder='Search items, descriptions, locations, names...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon className='bulletin-search-icon' icon={faMagnifyingGlass} />
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="bulletin-filters-container">
                  <div className="bulletin-filter-group">
                    <FontAwesomeIcon icon={faFilter} className="bulletin-filter-icon" />
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bulletin-filter-select"
                    >
                      <option value="all">All Types</option>
                      <option value="Lost">Lost Items</option>
                      <option value="Found">Found Items</option>
                    </select>
                  </div>

                  <div className="bulletin-filter-group">
                    <FontAwesomeIcon icon={faTag} className="bulletin-filter-icon" />
                    <select 
                      value={filterCategory} 
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bulletin-filter-select"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bulletin-filter-group">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="bulletin-filter-icon" />
                    <select 
                      value={filterBarangay} 
                      onChange={(e) => setFilterBarangay(e.target.value)}
                      className="bulletin-filter-select"
                    >
                      <option value="all">All Barangays</option>
                      {barangays.map(barangay => (
                        <option key={barangay.id} value={barangay.id}>
                          {barangay.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bulletin-filter-group">
                    <FontAwesomeIcon icon={faLocationDot} className="bulletin-filter-icon" />
                    <select 
                      value={filterPurok} 
                      onChange={(e) => setFilterPurok(e.target.value)}
                      className="bulletin-filter-select"
                    >
                      <option value="all">All Puroks</option>
                      {puroks.map(purok => (
                        <option key={purok.id} value={purok.id}>
                          {purok.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isFilterActive() && (
                    <button 
                      className="bulletin-clear-filters-btn"
                      onClick={resetFilters}
                      title="Clear all filters"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Posts Counter and Active Filters */}
              <div className="bulletin-posts-info">
                <div className="bulletin-posts-counter">
                  Showing {filteredPosts.length} of {posts.length} posts
                </div>
                
                {isFilterActive() && (
                  <div className="bulletin-active-filters">
                    <span>Active filters:</span>
                    {searchTerm && (
                      <span className="bulletin-filter-tag">Search: "{searchTerm}"</span>
                    )}
                    {filterType !== 'all' && (
                      <span className="bulletin-filter-tag">Type: {filterType}</span>
                    )}
                    {filterCategory !== 'all' && (
                      <span className="bulletin-filter-tag">
                        Category: {categories.find(c => c.id.toString() === filterCategory)?.name}
                      </span>
                    )}
                    {filterBarangay !== 'all' && (
                      <span className="bulletin-filter-tag">
                        Barangay: {barangays.find(b => b.id.toString() === filterBarangay)?.name}
                      </span>
                    )}
                    {filterPurok !== 'all' && (
                      <span className="bulletin-filter-tag">
                        Purok: {puroks.find(p => p.id.toString() === filterPurok)?.name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Posts Grid */}
              {filteredPosts.length === 0 ? (
                <div className="bulletin-empty-state">
                  <h3>No posts found</h3>
                  <p>
                    {posts.length === 0 
                      ? "No posts available yet. Be the first to create a post!" 
                      : "No posts match your search criteria. Try adjusting your filters."
                    }
                  </p>
                  {isFilterActive() && (
                    <button onClick={resetFilters} className="bulletin-retry-btn">
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className='bulletin-posts-grid'>
                  {filteredPosts.map((post) => (
                    
                    <div 
                      key={post.id} 
                      className='bulletin-post-card'
                      onClick={() => openPostModal(post)}
                    >
                      <span className='bulletin-post-pin'></span>
                      
                      {/* Post Header with User Info */}
                      <div className="bulletin-post-header">
                        <div className="bulletin-user-info">
                          <div className="bulletin-user-avatar">
                            {getUserImage(post) ? (
                              <img 
                                src={getUserImage(post)} 
                                alt={`${post.first_name} ${post.last_name}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <FontAwesomeIcon icon={faUserCircle} className="bulletin-avatar-fallback" />
                            )}
                          </div>
                          <div className="bulletin-user-details">
                            <span className="bulletin-user-name">
                              {post.first_name} {post.last_name}
                            </span>
                            <span className="bulletin-post-time">
                              {formatDate(post.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Post Header Actions */}
                        <div className="bulletin-post-header-actions">
                          <div className={`bulletin-post-type-badge ${post.type.toLowerCase()}`}>
                            {post.type}
                          </div>
                          <button 
                            className="bulletin-report-btn"
                            onClick={(e) => openReportModal(post, e)}
                            title="Report this post"
                          >
                            <FontAwesomeIcon icon={faFlag} />
                          </button>
                        </div>
                      </div>

                      {/* Post Image */}
                      <div className="bulletin-post-image-container">
                        <img 
                          src={post.photo ? `${wifi}/uploads/${post.photo}` : OptionalPhoto} 
                          alt={post.title}
                          onError={(e) => {
                            e.target.src = OptionalPhoto;
                          }}
                        />
                      </div>

                      {/* Post Content */}
                      <div className='bulletin-post-contents'>
                        <h2 className='bulletin-post-category'>
                          <FontAwesomeIcon icon={faTag} /> {post.category_name}
                        </h2>
                        
                        <div className='bulletin-post-details'>
                          <h3 className="bulletin-post-title">{post.title}</h3>
                          
                          {/* 🎯 Description with Read More */}
                          <div className="bulletin-post-description">
                            <div 
                              className={`bulletin-description-text ${expandedDescriptions[post.id] ? 'expanded' : ''}`}
                            >
                              {expandedDescriptions[post.id] 
                                ? post.description 
                                : getTruncatedDescription(post.description)
                              }
                            </div>
                            {needsReadMore(post.description) && (
                              <button 
                                className="bulletin-read-more-btn"
                                onClick={(e) => toggleDescription(post.id, e)}
                              >
                                {expandedDescriptions[post.id] ? 'Read Less' : 'Read More'}
                              </button>
                            )}
                          </div>
                          
                          <div className="bulletin-post-meta-info">
                            <div className="bulletin-meta-item location">
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                              <span>{renderLocationInfo(post)}</span>
                            </div>
                            
                            {post.color && (
                              <div className="bulletin-meta-item color">
                                <strong>Color:</strong> {post.color}
                              </div>
                            )}
                            
                            {/* 🎯 Contact with Read More */}
                            <div className="bulletin-meta-item contact">
                              <FontAwesomeIcon icon={faPhone} />
                              <span>
                                <div className={`bulletin-contact-text ${expandedContacts[post.id] ? 'expanded' : ''}`}>
                                  {expandedContacts[post.id] 
                                    ? post.contact_info 
                                    : getTruncatedContact(post.contact_info)
                                  }
                                </div>
                                {needsContactReadMore(post.contact_info) && (
                                  <button 
                                    className="bulletin-contact-read-more-btn"
                                    onClick={(e) => toggleContact(post.id, e)}
                                  >
                                    {expandedContacts[post.id] ? 'Read Less' : 'Read More'}
                                  </button>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expand Overlay */}
                      <div className="bulletin-expand-overlay">
                        <FontAwesomeIcon icon={faExpand} className="bulletin-expand-icon" />
                        <span>Click to view details</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Report Modal */}
            <ReportModal 
              isOpen={reportModal.isOpen}
              onClose={closeReportModal}
              post={reportModal.post}
            />

            {/* Post Detail Modal */}
            {selectedPost && (
              <div className="bulletin-post-modal-overlay" onClick={closePostModal}>
                <div className="bulletin-post-modal-content" onClick={handleModalClick}>
                  {/* Fixed Header Layout */}
                  <div className="bulletin-post-modal-header">
                    <div className="bulletin-modal-user-info">
                      <div className="bulletin-user-avatar">
                        {getUserImage(selectedPost) ? (
                          <img 
                            src={getUserImage(selectedPost)} 
                            alt={`${selectedPost.first_name} ${selectedPost.last_name}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faUserCircle} className="bulletin-avatar-fallback" />
                        )}
                      </div>
                      <div className="bulletin-modal-user-details">
                        <span className="bulletin-user-name">
                          {selectedPost.first_name} {selectedPost.last_name}
                        </span>
                        <span className="bulletin-post-time">
                          {formatDate(selectedPost.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bulletin-modal-actions-container">
                      <div className={`bulletin-post-type-badge ${selectedPost.type.toLowerCase()}`}>
                        {selectedPost.type}
                      </div>
                      <button 
                        className="bulletin-modal-report-btn"
                        onClick={() => {
                          closePostModal();
                          openReportModal(selectedPost);
                        }}
                        title="Report this post"
                      >
                        <FontAwesomeIcon icon={faFlag} />
                      </button>
                    </div>

                    <button className="bulletin-post-modal-close" onClick={closePostModal}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>

                  <div className="bulletin-post-modal-body">
                    <div className="bulletin-post-modal-image">
                      <img 
                        src={selectedPost.photo ? `${wifi}/uploads/${selectedPost.photo}` : OptionalPhoto} 
                        alt={selectedPost.title}
                        onError={(e) => {
                          e.target.src = OptionalPhoto;
                        }}
                      />
                    </div>
                    
                    <div className="bulletin-post-modal-details">
                      <h2 className='bulletin-post-category'>
                        <FontAwesomeIcon icon={faTag} /> {selectedPost.category_name}
                      </h2>
                      
                      <h1 className="bulletin-post-modal-title">{selectedPost.title}</h1>
                      <p className="bulletin-post-modal-description">{selectedPost.description}</p>
                      
                      <div className="bulletin-post-modal-meta">
                        <div className="bulletin-meta-section">
                          <h4>Location Information</h4>
                          <div className="bulletin-meta-item location">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span><strong>Barangay:</strong> {selectedPost.barangay_name}</span>
                          </div>
                        
                          {selectedPost.purok_name && (
                            <div className="bulletin-meta-item location">
                              <FontAwesomeIcon icon={faLocationDot} />
                              <span><strong>Purok:</strong> {selectedPost.purok_name}</span>
                            </div>
                          )}
                        </div>

                        {selectedPost.color && (
                          <div className="bulletin-meta-section">
                            <h4>Item Details</h4>
                            <div className="bulletin-meta-item color">
                              <strong>Color:</strong> {selectedPost.color}
                            </div>
                          </div>
                        )}
                        
                        <div className="bulletin-meta-section">
                          <h4>Contact Information</h4>
                          <div className="bulletin-meta-item contact">
                            <FontAwesomeIcon icon={faPhone} />
                            <span><strong>Contact:</strong> {selectedPost.contact_info}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}