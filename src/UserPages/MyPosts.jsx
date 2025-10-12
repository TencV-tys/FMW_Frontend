import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UserNav from '../UserComponents/UserDashboardNav'
import Logo1 from '../assets/Logo.jpg'
import './styles/MyPosts.css'
import { toast } from 'react-toastify'

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    fetchMyPosts();
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

  //Handle post deletion

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
      toast.success('Post deleted successfully');
      // Remove the post from local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } else {
      throw new Error(result.error || 'Failed to delete post');
    }
  } catch (err) {
    console.error('Error deleting post:', err);
    toast.error('Failed to delete post');
  }
};


  // Handle post editing
  const handleEditPost = (postId) => {
    nav(`/user/edit-post/${postId}`);
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

  //  Loading state
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
                <div className="posts-counts">
                  {posts.length} {posts.length <= 1 ? 'post' : 'posts'}
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
                            <button
                              onClick={() => handleEditPost(post.id)}
                              className="edit-btn"
                              disabled={post.status !== 'Active'}
                              title={post.status !== 'Active' ? 'Cannot edit resolved or removed posts' : 'Edit post'}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className='mypost-delete-btn'
                              title="Delete post"
                            >
                              <FontAwesomeIcon className='delete-icon' icon={faTrash} />
                            </button>
                          </div>
                        </div>

                        <div className='mypost-details-container'>
                          <div className='mypost-details'>
                            <h2 className="post-title">{post.title}</h2>
                            <p className="post-description">{post.description}</p>
                            <div className="post-meta">
                              <div className="meta-item">
                                <strong>Category:</strong> {post.category_name}
                              </div>
                              <div className="meta-item">
                                <strong>Location:</strong> {post.barangay_name}
                              </div>
                              <div className="meta-item">
                                <strong>Contact:</strong> {post.contact_info}
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