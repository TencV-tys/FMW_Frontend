import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserNav from '../UserComponents/UserDashboardNav';
import './styles/CreatePost.css';
import {useWifiUrl} from '../hooks/useWifiUrl';
import CustomToast from '../components/CustomToast';

export default function CreatePost() {
  const [categories, setCategories] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [puroks, setPuroks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
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
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [charCount, setCharCount] = useState({
    description: 0,
    contact_info: 0
  });

  const MAX_CHARS = 200;

  // Check if photo is required
  const requiresPhoto = () => {
    if (!formData.category_id) return false;
    
    const selectedCategory = categories.find(cat => cat.id == formData.category_id);
    if (!selectedCategory) return false;

    const categoryName = selectedCategory.name.toLowerCase();
    return categoryName.includes('person') || categoryName.includes('pet');
  };

  // Check if color is required
  const requiresColor = () => {
    if (!formData.category_id) return false;
    
    const selectedCategory = categories.find(cat => cat.id == formData.category_id);
    if (!selectedCategory) return false;

    const categoryName = selectedCategory.name.toLowerCase();
    const colorRequiredCategories = ['bag', 'phone', 'clothes', 'accessories', 'wallet', 'gadgets', 'jewelry'];
    
    return colorRequiredCategories.some(cat => categoryName.includes(cat));
  };

  // Get current category name
  const getCurrentCategoryName = () => {
    if (!formData.category_id) return '';
    const selectedCategory = categories.find(cat => cat.id == formData.category_id);
    return selectedCategory ? selectedCategory.name.toLowerCase() : '';
  };

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
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
            toast.error('Failed to load form data. Please refresh the page.');
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, []);

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
      // Check file size (5MB limit example)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('File size too large. Please select an image under 5MB.');
        e.target.value = ''; // Clear the file input
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        e.target.value = '';
        return;
      }

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
      photo: null
    }));
    setPhotoPreview(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.category_id || !formData.barangay_id || !formData.description || !formData.contact_info) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Photo validation
    if (requiresPhoto() && !formData.photo) {
      toast.error('Photo is required for Person or Pets categories');
      return;
    }

    // Color validation
    if (requiresColor() && !formData.color) {
      const categoryName = getCurrentCategoryName();
      toast.error(`Color is required for ${categoryName} category`);
      return;
    }

    // Character limit validation
    if (formData.description.length > MAX_CHARS || formData.contact_info.length > MAX_CHARS) {
      toast.error(`Text fields cannot exceed ${MAX_CHARS} characters`);
      return;
    }

    setSubmitting(true);

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
        toast.success('Post created successfully! It is now live on the bulletin board.');
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
        setTimeout(() => {
          nav('/user');
        }, 1500);
      } else {
        toast.error('Error creating post: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error creating post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCharCounterClass = (count) => {
    if (count > MAX_CHARS) return 'error';
    if (count > MAX_CHARS * 0.8) return 'warning';
    return '';
  };

  if (loading) {
    return (
      <div className="create-container">
        <UserNav />
        <main className="create-content">
          <div className="loading-container-fmw">
            <div className="loading-spinner-fmw"></div>
            <p>Loading form data...</p>
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
            <h2 className='create-post-title'>Create a Post</h2>

            <div className='create-input-group'>
              <input
                type='text'
                name='title'
                value={formData.title}
                placeholder='Item/Person Name *'
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>
        
            <div className='create-selects-horizontal'>
              <div className='create-select-group'>
                <select 
                  name='type' 
                  value={formData.type} 
                  onChange={handleChange} 
                  required
                  disabled={submitting}
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div className='create-select-group'>
                <select 
                  name='category_id' 
                  value={formData.category_id} 
                  onChange={handleChange} 
                  required
                  disabled={submitting}
                >
                  <option value="">Select Category *</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className='create-select-group'>
                <select 
                  name='barangay_id' 
                  value={formData.barangay_id} 
                  onChange={handleChange} 
                  required
                  disabled={submitting}
                >
                  <option value="">Select Barangay *</option>
                  {barangays.map(brgy => (
                    <option key={brgy.id} value={brgy.id}>{brgy.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='create-select-group purok-select'>
              <select 
                name='purok_id' 
                value={formData.purok_id} 
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Select Purok (Optional)</option>
                {puroks.map(purok => (
                  <option key={purok.id} value={purok.id}>{purok.name}</option>
                ))}
              </select>
            </div>

            {/* Color Input - Simple Text Input with Requirements */}
            <div className='create-input-group color-input-group'>
              <input
                type='text'
                name='color'
                placeholder={requiresColor() ? 'Color * (Required for this category)' : 'Color'}
                value={formData.color}
                onChange={handleChange}
                required={requiresColor()}
                disabled={submitting}
                className={requiresColor() && !formData.color ? 'required-field' : ''}
              />
              <div className="field-requirement-note">
                {requiresColor() ? (
                  <span className="required-field">* Color is required for bags, phones, clothes, accessories, wallets, gadgets, and jewelry</span>
                ) : (
                  <span className="optional-field">Color is optional for this category</span>
                )}
              </div>
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
                disabled={submitting}
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
                disabled={submitting}
              />
              <div className={`char-counter ${getCharCounterClass(charCount.contact_info)}`}>
                {charCount.contact_info}/{MAX_CHARS}
              </div>
            </div>

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
                    disabled={submitting}
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
                disabled={submitting}
              />
              {requiresPhoto() && !formData.photo && (
                <div className="error-message">
                  Photo is required for Person or Pets categories
                </div>
              )}
            </div>

            <button 
              className='submit-post-btns' 
              type='submit'
              disabled={submitting || loading}
            >
              {submitting ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Creating Post...
                </>
              ) : (
                'Submit Post'
              )}
            </button>
          </form>
        </div>

        {/* Custom Toast Container */}
        <CustomToast.CustomToastContainer toasts={toasts} removeToast={removeToast} />
      </main>
    </div>
  );
}