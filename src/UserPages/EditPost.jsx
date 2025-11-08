import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/CreatePost.css';
import {useWifiUrl} from '../hooks/useWifiUrl';
import CustomToast from '../components/CustomToast';

export default function EditPost() {
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [puroks, setPuroks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const nav = useNavigate();
  const { id } = useParams();
  const wifi = useWifiUrl();
  
  // Use custom toast
  const { toasts, removeToast, toast } = CustomToast.useCustomToast();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Lost',
    category_id: '',
    barangay_id: '',
    purok_id: '',
    color: '',
    description: '',
    contact_info: '',
    photo: null,
    currentPhoto: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [charCount, setCharCount] = useState({
    description: 0,
    contact_info: 0
  });

  const MAX_CHARS = 200;

  const requiresPhoto = () => {
    if (!formData.category_id) return false;
    
    const selectedCategory = categories.find(cat => cat.id == formData.category_id);
    if (!selectedCategory) return false;

    const categoryName = selectedCategory.name.toLowerCase();
    return categoryName.includes('person') || categoryName.includes('pet');
  };

  const hasPhoto = () => {
    return formData.currentPhoto || formData.photo;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        
        const postResponse = await fetch(`${wifi}/api/posts/${id}`, {
          credentials: 'include'
        });

        if (!postResponse.ok) {
          throw new Error('Failed to fetch post data');
        }

        const postResult = await postResponse.json();

        if (!postResult.success) {
          throw new Error(postResult.error || 'Failed to load post');
        }

        const formResponse = await fetch(`${wifi}/api/posts/form-data`, {
          credentials: 'include'
        });

        if (!formResponse.ok) {
          throw new Error('Failed to fetch form data');
        }

        const formResult = await formResponse.json();

        if (formResult.success) {
          setCategories(formResult.categories);
          setBarangays(formResult.barangays);
          setPuroks(formResult.puroks || []);
        }

        const post = postResult.post;
        setFormData({
          title: post.title || '',
          type: post.type || 'Lost',
          category_id: post.category_id || '',
          barangay_id: post.barangay_id || '',
          purok_id: post.purok_id || '',
          color: post.color || '',
          description: post.description || '',
          contact_info: post.contact_info || '',
          photo: null,
          currentPhoto: post.photo
        });

        setCharCount({
          description: post.description?.length || 0,
          contact_info: post.contact_info?.length || 0
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load post data');
        nav('/user/myposts');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, nav]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'description' || name === 'contact_info') {
      setCharCount(prev => ({
        ...prev,
        [name]: value.length
      }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      currentPhoto: null,
      photo: null
    }));
    setPhotoPreview(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category_id || !formData.barangay_id || !formData.description || !formData.contact_info) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (requiresPhoto() && !hasPhoto()) {
      toast.error('Photo is required for Person or Pets categories');
      return;
    }

    if (formData.description.length > MAX_CHARS || formData.contact_info.length > MAX_CHARS) {
      toast.error(`Text fields cannot exceed ${MAX_CHARS} characters`);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('barangay_id', formData.barangay_id);
      formDataToSend.append('purok_id', formData.purok_id);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contact_info', formData.contact_info);

      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      if (!formData.currentPhoto && !formData.photo && requiresPhoto()) {
        toast.error('Photo is required for Person or Pets categories');
        setLoading(false);
        return;
      }

      if (!formData.currentPhoto && !formData.photo) {
        formDataToSend.append('remove_photo', 'true');
      }

      const res = await fetch(`${wifi}/api/posts/${id}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Post updated successfully!');
        nav('/user/myposts');
      } else {
        toast.error('Error updating post: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Error updating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCharCounterClass = (count) => {
    if (count > MAX_CHARS) return 'error';
    if (count > MAX_CHARS * 0.8) return 'warning';
    return '';
  };

  if (fetching) {
    return (
      <div className="create-container">
        <UserNav />
        <main className="create-content">
          <div className="loading-container-fmw">
            <div className="loading-spinner-fmw"></div>
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
                disabled={loading}
              />
            </div>

            {/* Horizontal Selects - Same as CreatePost */}
            <div className='create-selects-horizontal'>
              <div className='create-select-group'>
                <select name='type' value={formData.type} onChange={handleChange} required disabled={loading}>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div className='create-select-group'>
                <select name='category_id' value={formData.category_id} onChange={handleChange} required disabled={loading}>
                  <option value="">Select Category *</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className='create-select-group'>
                <select name='barangay_id' value={formData.barangay_id} onChange={handleChange} required disabled={loading}>
                  <option value="">Select Barangay *</option>
                  {barangays.map(brgy => (
                    <option key={brgy.id} value={brgy.id}>{brgy.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Purok Select - Same styling */}
            <div className='create-select-group purok-select'>
              <select name='purok_id' value={formData.purok_id} onChange={handleChange} disabled={loading}>
                <option value="">Select Purok (Optional)</option>
                {puroks.map(purok => (
                  <option key={purok.id} value={purok.id}>{purok.name}</option>
                ))}
              </select>
            </div>

            <div className='create-input-group'>
              <input
                type='text'
                name='color'
                placeholder='Color (optional)'
                value={formData.color}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className='create-textarea-group'>
              <textarea
                name='description'
                rows={4}
                placeholder='Additional details (description, identifying features, etc.) *'
                value={formData.description}
                onChange={handleChange}
                maxLength={MAX_CHARS}
                required
                disabled={loading}
              />
              <div className={`char-counter ${getCharCounterClass(charCount.description)}`}>
                {charCount.description}/{MAX_CHARS}
              </div>
            </div>

            <div className='create-textarea-group'>
              <textarea
                name='contact_info'
                rows={4}
                placeholder='How can people reach you? (e.g., Call me: 09877666677, Email: example@example.com) *'
                value={formData.contact_info}
                onChange={handleChange}
                maxLength={MAX_CHARS}
                required
                disabled={loading}
              />
              <div className={`char-counter ${getCharCounterClass(charCount.contact_info)}`}>
                {charCount.contact_info}/{MAX_CHARS}
              </div>
            </div>

            {/* Current Photo Display */}
            {formData.currentPhoto && !photoPreview && (
              <div className="current-photo-container">
                <label>Current Photo:</label>
                <div className="current-photo">
                  <img
                    src={`${wifi}/uploads/${formData.currentPhoto}`}
                    alt="Current"
                    className="photo-preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={handleRemovePhoto}
                    disabled={loading}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}

            {/* New Photo Preview */}
            {photoPreview && (
              <div className="current-photo-container">
                <label>New Photo Preview:</label>
                <div className="current-photo">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="photo-preview"
                  />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={handleRemovePhoto}
                    disabled={loading}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}

            <div className='image-uploader-container'>
              <label>
                {formData.currentPhoto || photoPreview ? 'Change Photo' : 'Upload Photo'} 
                {requiresPhoto() ? ' * (Required for Person/Pets)' : ' (Optional)'}
              </label>
              <input
                type='file'
                name='image'
                accept='image/*'
                onChange={handleFileChange}
                required={requiresPhoto()}
                disabled={loading}
              />
              {requiresPhoto() && !hasPhoto() && (
                <div className="error-message">
                  Photo is required for Person or Pets categories
                </div>
              )}
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
                className='submit-post-btns'
                type='submit'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Updating...
                  </>
                ) : (
                  'Update Post'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Custom Toast Container */}
        <CustomToast.CustomToastContainer toasts={toasts} removeToast={removeToast} />
      </main>
    </div>
  );
}