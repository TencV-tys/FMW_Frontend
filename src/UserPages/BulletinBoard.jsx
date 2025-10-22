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
  faExpand
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBarangay, setFilterBarangay] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedContacts, setExpandedContacts] = useState({});

  useEffect(() => {
    fetchPosts();
    fetchFormData();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, filterType, filterCategory, filterBarangay]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/posts/active', {
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
      const response = await fetch('http://localhost:8000/api/posts/form-data', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories || []);
          setBarangays(data.barangays || []);
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

    setFilteredPosts(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterBarangay('all');
  };

  const isFilterActive = () => {
    return searchTerm !== '' || 
           filterType !== 'all' || 
           filterCategory !== 'all' || 
           filterBarangay !== 'all';
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
    if (user.user_photo) {
      return `http://localhost:8000/uploads/${user.user_photo}`;
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
      <div className="bulletin-page-container">
        <UserNav />
        <main className="bulletin-container">
          <div className='bulletin-board-container-darkbrown'>
            <div className='bulletin-board-container-lightbrown'>
              <div className="loading-container">
                <div className="loading-spinner"></div>
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
      <div className="bulletin-page-container">
        <UserNav />
        <main className="bulletin-container">
          <div className='bulletin-board-container-darkbrown'>
            <div className='bulletin-board-container-lightbrown'>
              <div className="error-container">
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button onClick={fetchPosts} className="retry-btn">
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
    <div className="bulletin-page-container">
      <UserNav />
      <main className="bulletin-container">
        <div className='bulletin-board-container-darkbrown'>
          <div className='bulletin-board-container-lightbrown'>
            <div className='bulletin-board-content'>
              
              {/* Header Section */}
              <div className='bulletin-board-title'>
                <h1>Lost & Found Bulletin</h1>
              </div>

              {/* Search and Filters Section */}
              <div className="search-filters-section">
                <div className='search-input-container'>
                  <div className='search-bar'>
                    <input 
                      className='search-bar-input' 
                      type='text'
                      placeholder='Search items, descriptions, locations, names...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon className='search-icon' icon={faMagnifyingGlass} />
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="filters-container">
                  <div className="filter-group">
                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Types</option>
                      <option value="Lost">Lost Items</option>
                      <option value="Found">Found Items</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <FontAwesomeIcon icon={faTag} className="filter-icon" />
                    <select 
                      value={filterCategory} 
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="filter-icon" />
                    <select 
                      value={filterBarangay} 
                      onChange={(e) => setFilterBarangay(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Barangays</option>
                      {barangays.map(barangay => (
                        <option key={barangay.id} value={barangay.id}>
                          {barangay.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isFilterActive() && (
                    <button 
                      className="clear-filters-btn"
                      onClick={resetFilters}
                      title="Clear all filters"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Posts Counter and Active Filters */}
              <div className="posts-info">
                <div className="posts-counter">
                  Showing {filteredPosts.length} of {posts.length} posts
                </div>
                
                {isFilterActive() && (
                  <div className="active-filters">
                    <span>Active filters:</span>
                    {searchTerm && (
                      <span className="filter-tag">Search: "{searchTerm}"</span>
                    )}
                    {filterType !== 'all' && (
                      <span className="filter-tag">Type: {filterType}</span>
                    )}
                    {filterCategory !== 'all' && (
                      <span className="filter-tag">
                        Category: {categories.find(c => c.id.toString() === filterCategory)?.name}
                      </span>
                    )}
                    {filterBarangay !== 'all' && (
                      <span className="filter-tag">
                        Barangay: {barangays.find(b => b.id.toString() === filterBarangay)?.name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Posts Grid */}
              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <h3>No posts found</h3>
                  <p>
                    {posts.length === 0 
                      ? "No posts available yet. Be the first to create a post!" 
                      : "No posts match your search criteria. Try adjusting your filters."
                    }
                  </p>
                  {isFilterActive() && (
                    <button onClick={resetFilters} className="retry-btn">
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className='lost-found-container'>
                  {filteredPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className='lost-found-cards post-card'
                      onClick={() => openPostModal(post)}
                    >
                      <span className='pin'></span>
                      
                      {/* Post Header with User Info */}
                      <div className="post-header">
                        <div className="user-info">
                          <div className="user-avatar">
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
                              <FontAwesomeIcon icon={faUserCircle} className="avatar-fallback" />
                            )}
                          </div>
                          <div className="user-details">
                            <span className="user-name">
                              {post.first_name} {post.last_name}
                            </span>
                            <span className="post-time">
                              {formatDate(post.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Post Header Actions */}
                        <div className="post-header-actions">
                          <div className={`post-type-badge ${post.type.toLowerCase()}`}>
                            {post.type}
                          </div>
                          <button 
                            className="report-btn"
                            onClick={(e) => openReportModal(post, e)}
                            title="Report this post"
                          >
                            <FontAwesomeIcon icon={faFlag} />
                          </button>
                        </div>
                      </div>

                      {/* Post Image */}
                      <div className="post-image-container">
                        <img 
                          src={post.photo ? `http://localhost:8000/uploads/${post.photo}` : OptionalPhoto} 
                          alt={post.title}
                          onError={(e) => {
                            e.target.src = OptionalPhoto;
                          }}
                        />
                      </div>

                      {/* Post Content */}
                      <div className='lost-found-contents'>
                        <h2 className='lost-found-category'>
                          <FontAwesomeIcon icon={faTag} /> {post.category_name}
                        </h2>
                        
                        <div className='lost-found-details'>
                          <h3 className="post-title">{post.title}</h3>
                          
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
                          
                          <div className="post-meta-info">
                            <div className="meta-item location">
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                              <span>{post.barangay_name}</span>
                            </div>
                            
                            {post.color && (
                              <div className="meta-item color">
                                <strong>Color:</strong> {post.color}
                              </div>
                            )}
                            
                            {/* 🎯 Contact with Read More */}
                            <div className="meta-item contact">
                              <FontAwesomeIcon icon={faPhone} />
                              <span>
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
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expand Overlay */}
                      <div className="expand-overlay">
                        <FontAwesomeIcon icon={faExpand} className="expand-icon" />
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
              <div className="post-modal-overlay" onClick={closePostModal}>
                <div className="post-modal-content" onClick={handleModalClick}>
                  {/* Fixed Header Layout */}
                  <div className="post-modal-header">
                    <div className="modal-user-info">
                      <div className="user-avatar">
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
                          <FontAwesomeIcon icon={faUserCircle} className="avatar-fallback" />
                        )}
                      </div>
                      <div className="modal-user-details">
                        <span className="user-name">
                          {selectedPost.first_name} {selectedPost.last_name}
                        </span>
                        <span className="post-time">
                          {formatDate(selectedPost.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="modal-actions-container">
                      <div className={`post-type-badge ${selectedPost.type.toLowerCase()}`}>
                        {selectedPost.type}
                      </div>
                      <button 
                        className="modal-report-btn"
                        onClick={() => {
                          closePostModal();
                          openReportModal(selectedPost);
                        }}
                        title="Report this post"
                      >
                        <FontAwesomeIcon icon={faFlag} />
                      </button>
                    </div>

                    <button className="post-modal-close" onClick={closePostModal}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>

                  <div className="post-modal-body">
                    <div className="post-modal-image">
                      <img 
                        src={selectedPost.photo ? `http://localhost:8000/uploads/${selectedPost.photo}` : OptionalPhoto} 
                        alt={selectedPost.title}
                        onError={(e) => {
                          e.target.src = OptionalPhoto;
                        }}
                      />
                    </div>
                    
                    <div className="post-modal-details">
                      <h2 className='lost-found-category'>
                        <FontAwesomeIcon icon={faTag} /> {selectedPost.category_name}
                      </h2>
                      
                      <h1 className="post-modal-title">{selectedPost.title}</h1>
                      <p className="post-modal-description">{selectedPost.description}</p>
                      
                      <div className="post-modal-meta">
                        <div className="meta-section">
                          <h4>Location Information</h4>
                          <div className="meta-item location">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span><strong>Barangay:</strong> {selectedPost.barangay_name}</span>
                          </div>
                        </div>
                        
                        {selectedPost.color && (
                          <div className="meta-section">
                            <h4>Item Details</h4>
                            <div className="meta-item color">
                              <strong>Color:</strong> {selectedPost.color}
                            </div>
                          </div>
                        )}
                        
                        <div className="meta-section">
                          <h4>Contact Information</h4>
                          <div className="meta-item contact">
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