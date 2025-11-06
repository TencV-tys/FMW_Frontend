import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/CreatePost.css';
import {useWifiUrl} from '../hooks/useWifiUrl';
export default function CreatePost() {
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [puroks, setPuroks] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const wifi = useWifiUrl();
  const [formData, setFormData] = useState({
    title: '',
    type: 'Lost',
    category_id: '',
    barangay_id: '',
    purok_id: '', 
    color: '',
    description: '',
    contact_info: '',
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [charCount, setCharCount] = useState({
    description: 0,
    contact_info: 0
  });

  const MAX_CHARS = 200;

  // Check if current category requires photo
  const requiresPhoto = () => {
    if (!formData.category_id) return false;
    
    const selectedCategory = categories.find(cat => cat.id == formData.category_id);
    if (!selectedCategory) return false;

    // Make photo required for "Person" or "Pets" categories
    const categoryName = selectedCategory.name.toLowerCase();
    return categoryName.includes('person') || categoryName.includes('pet');
  };

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const res = await fetch(`${wifi}/api/posts/form-data`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCategories(data.categories);
            setBarangays(data.barangays);
            setPuroks(data.puroks || []);
          } else {
            console.error('Failed to fetch form data');
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchFormData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle character counting for textareas
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

      // Create preview
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
      photo: null
    }));
    setPhotoPreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
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

    // Validate photo requirement for Person/Pets categories
    if (requiresPhoto() && !formData.photo) {
      toast.error('Photo is required for Person or Pets categories', {
        position: 'top-center',
        autoClose: 1000
      });
      return;
    }

    // Validate character limits
    if (formData.description.length > MAX_CHARS || formData.contact_info.length > MAX_CHARS) {
      toast.error(`Text fields cannot exceed ${MAX_CHARS} characters`, {
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
      formDataToSend.append('purok_id', formData.purok_id);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contact_info', formData.contact_info);

      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      const res = await fetch(`${wifi}/api/posts`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Post created successfully! It is now live on the bulletin board.', {
          position: 'top-center',
          autoClose: 1000
        });
        // Reset form
        setFormData({
          title: '',
          type: 'Lost',
          category_id: '',
          barangay_id: '',
          purok_id: '',
          color: '',
          description: '',
          contact_info: '',
          photo: null
        });
        setPhotoPreview(null);
        setCharCount({ description: 0, contact_info: 0 });
        // Redirect to bulletin board
        nav('/user');
      } else {
        toast.error('Error creating post: ' + (result.error || 'Unknown error'), {
          position: 'top-center',
          autoClose: 1000
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error creating post. Please try again.', {
        position: 'top-center',
        autoClose: 1000
      });
    } finally {
      setLoading(false);
    }
  };

  const getCharCounterClass = (count) => {
    if (count > MAX_CHARS) return 'error';
    if (count > MAX_CHARS * 0.8) return 'warning';
    return '';
  };

  return (
    <div className="create-container">
      <UserNav />
      <main className="create-content">
        <div className='create-form-container'>
          <form className='create-post-form' onSubmit={handleSubmit}>
            <h2 className='create-post-title'>Create a Post</h2>

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
            <div className='create-select-group' style={{width: '400px', margin: '10px 0'}}>
                <select name='purok_id' value={formData.purok_id} onChange={handleChange}>
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
              />
              <div className={`char-counter ${getCharCounterClass(charCount.contact_info)}`}>
                {charCount.contact_info}/{MAX_CHARS}
              </div>
            </div>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="current-photo-container">
                <label>Photo Preview:</label>
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
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}

            <div className='image-uploader-container'>
              <label>
                Upload Photo {requiresPhoto() ? '* (Required for Person/Pets)' : '(Optional)'}
              </label>
              <input
                type='file'
                name='image'
                accept='image/*'
                onChange={handleFileChange}
                required={requiresPhoto()}
              />
              {requiresPhoto() && !formData.photo && (
                <div className="error-message" style={{marginTop: '5px'}}>
                  Photo is required for Person or Pets categories
                </div>
              )}
            </div>

            <button 
              className='submit-post-btn' 
              type='submit'
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Post'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}