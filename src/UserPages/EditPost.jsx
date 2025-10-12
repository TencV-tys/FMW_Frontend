import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/CreatePost.css';

export default function EditPost() {
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const nav = useNavigate();
  const { id } = useParams(); // Get post ID from URL

  const [formData, setFormData] = useState({
    title: '',
    type: 'Lost',
    category_id: '',
    barangay_id: '',
    color: '',
    description: '',
    contact_info: '',
    photo: null,
    currentPhoto: null // For displaying current image
  });

  // 🎯 Fetch post data and form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        
        // Fetch post data
        const postResponse = await fetch(`http://localhost:8000/api/posts/${id}`, {
          credentials: 'include'
        });

        if (!postResponse.ok) {
          throw new Error('Failed to fetch post data');
        }

        const postResult = await postResponse.json();

        if (!postResult.success) {
          throw new Error(postResult.error || 'Failed to load post');
        }

        // Fetch categories and barangays
        const formResponse = await fetch('http://localhost:8000/api/posts/form-data', {
          credentials: 'include'
        });

        if (!formResponse.ok) {
          throw new Error('Failed to fetch form data');
        }

        const formResult = await formResponse.json();

        if (formResult.success) {
          setCategories(formResult.categories);
          setBarangays(formResult.barangays);
        }

        // 🎯 Populate form with existing post data
        const post = postResult.post;
        setFormData({
          title: post.title || '',
          type: post.type || 'Lost',
          category_id: post.category_id || '',
          barangay_id: post.barangay_id || '',
          color: post.color || '',
          description: post.description || '',
          contact_info: post.contact_info || '',
          photo: null, // New photo file
          currentPhoto: post.photo // Current photo filename
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load post data');
        nav('/user/myposts'); // Redirect back to my posts
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, nav]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.category_id || !formData.barangay_id || !formData.description || !formData.contact_info) {
      toast.error('Please fill in all required fields', {
        position: 'top-center',
        autoClose: 1000
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('barangay_id', formData.barangay_id);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contact_info', formData.contact_info);

      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      const res = await fetch(`http://localhost:8000/api/posts/${id}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Post updated successfully!', {
          position: 'top-center',
          autoClose: 1000
        });
        // Redirect to my posts
        nav('/user/myposts');
      } else {
        toast.error('Error updating post: ' + (result.error || 'Unknown error'), {
          position: 'top-center',
          autoClose: 1000
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Error updating post. Please try again.', {
        position: 'top-center',
        autoClose: 1000
      });
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Remove current photo
  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      currentPhoto: null,
      photo: null
    }));
  };

  // 🎯 Loading state while fetching data
  if (fetching) {
    return (
      <div className="create-container">
        <UserNav />
        <main className="create-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading post data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="create-container">
      <UserNav />
      <main className="create-content">
        <div className='create-form-container'>
          <form className='create-post-form' onSubmit={handleSubmit}>
            <h2 className='create-post-title'>Edit Post</h2>

            <div className='create-input-group'>
              <input
                type='text'
                name='title'
                value={formData.title}
                placeholder='Item/Person Name *'
                onChange={handleChange}
                required
              />
            </div>

            <div className='create-select-container'>
              <div className='create-select-group'>
                <select name='type' value={formData.type} onChange={handleChange} required>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div className='create-select-group'>
                <select name='category_id' value={formData.category_id} onChange={handleChange} required>
                  <option value="">Select Category *</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className='create-select-group'>
                <select name='barangay_id' value={formData.barangay_id} onChange={handleChange} required>
                  <option value="">Select Barangay *</option>
                  {barangays.map(brgy => (
                    <option key={brgy.id} value={brgy.id}>{brgy.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='create-input-group'>
              <input
                type='text'
                name='color'
                placeholder='Color (optional)'
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className='create-textarea-group'>
              <textarea
                name='description'
                rows={4}
                placeholder='Additional details (description, identifying features, etc.) *'
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className='create-textarea-group'>
              <textarea
                name='contact_info'
                rows={4}
                placeholder='How can people reach you? (e.g., Call me: 09877666677, Email: example@example.com) *'
                value={formData.contact_info}
                onChange={handleChange}
                required
              />
            </div>

            {/* 🎯 Current Photo Display */}
            {formData.currentPhoto && (
              <div className="current-photo-container">
                <label>Current Photo:</label>
                <div className="current-photo">
                  <img
                    src={`http://localhost:8000/uploads/${formData.currentPhoto}`}
                    alt="Current"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={handleRemovePhoto}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}

            <div className='image-uploader-container'>
              <label>{formData.currentPhoto ? 'Change Photo (optional):' : 'Upload Photo (optional):'}</label>
              <input
                type='file'
                name='image'
                accept='image/*'
                onChange={handleFileChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="edit-cancel-btn"
                onClick={() => nav('/user/myposts')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className='submit-post-btn'
                type='submit'
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}