import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faEnvelope, faVenusMars, faCamera } from '@fortawesome/free-solid-svg-icons';
import UserDashboardNav from '../UserComponents/UserDashboardNav';
import Profile from '../assets/download.png';
import './styles/EditProfile.css';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gender: '',
    profile_photo: null,
    currentPhoto: null
  });

  // 🎯 Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('http://localhost:8000/auth/me', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const result = await response.json();
        
        if (result.user) {
          setUser(result.user);
          setFormData({
            first_name: result.user.first_name || '',
            last_name: result.user.last_name || '',
            email: result.user.email || '',
            gender: result.user.gender || '',
            profile_photo: null,
            currentPhoto: result.user.profile_photo
          });

          if (result.user.profile_photo) {
            setImagePreview(`http://localhost:8000/uploads/${result.user.profile_photo}`);
          }
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
        navigate('/user/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
        profile_photo: file
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profile_photo: null,
      currentPhoto: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields', {
        position: 'top-center',
        autoClose: 1000
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address', {
        position: 'top-center',
        autoClose: 1000
      });
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('gender', formData.gender);

      if (formData.profile_photo) {
        formDataToSend.append('profile_photo', formData.profile_photo);
      }

      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Profile updated successfully!', {
          position: 'top-center',
          autoClose: 1000
        });
        navigate('/user/profile');
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.', {
        position: 'top-center',
        autoClose: 1000
      });
    } finally {
      setSaving(false);
    }
  };

  // 🎯 Loading state
  if (loading) {
    return (
      <section className="edit-profile-page">
        <UserDashboardNav />
        <main className="edit-profile-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile data...</p>
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="edit-profile-page">
      <UserDashboardNav />
      <main className="edit-profile-content">
        
        {/* 🎯 Header with Back Button */}
        <div className='edit-profile-back'>
          <button className='action-back' onClick={() => navigate('/user/profile')}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Profile</span>
          </button>
        </div>

        <div className='edit-profile-form-container'>
          <form className='edit-profile-form' onSubmit={handleSubmit}>
            
            {/* 🎯 Form Title */}
            <div className="form-header">
              <h2>Edit Your Profile</h2>
              <p>Update your personal information and profile picture</p>
            </div>

            {/* 🎯 Profile Picture Section */}
            <div className="profile-picture-section">
              <div className="profile-picture-container">
                <div className="profile-picture">
                  <img 
                    src={imagePreview || Profile} 
                    alt="Profile preview"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div className="profile-picture-overlay">
                    <FontAwesomeIcon icon={faCamera} />
                    <span>Change Photo</span>
                  </div>
                </div>
                
                <div className="profile-picture-actions">
                  <label htmlFor="profile-photo" className="upload-btn">
                    <FontAwesomeIcon icon={faCamera} />
                    Upload New Photo
                  </label>
                  <input
                    id="profile-photo"
                    type="file"
                    accept='image/*'
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  
                  {(imagePreview || formData.currentPhoto) && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={handleRemovePhoto}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 🎯 Name Fields */}
            <div className='input-name-group'>
              <div className='edit-profile-input-group'>
                <label>
                  <FontAwesomeIcon icon={faUser} />
                  First Name *
                </label>
                <input
                  type='text'
                  name='first_name'
                  value={formData.first_name}
                  placeholder='Enter your first name'
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className='edit-profile-input-group'>
                <label>
                  <FontAwesomeIcon icon={faUser} />
                  Last Name *
                </label>
                <input
                  type='text'
                  name='last_name'
                  value={formData.last_name}
                  placeholder='Enter your last name'
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* 🎯 Email Field */}
            <div className='edit-profile-input-group full-width'>
              <label>
                <FontAwesomeIcon icon={faEnvelope} />
                Email Address *
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                placeholder='Enter your email address'
                onChange={handleChange}
                required
              />
            </div>

            {/* 🎯 Gender Field */}
            <div className='edit-profile-input-group full-width'>
              <label>
                <FontAwesomeIcon icon={faVenusMars} />
                Gender
              </label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender (Optional)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 🎯 Form Actions */}
            <div className='edit-profile-actions'>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/user/profile')}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type='submit' 
                className="save-btn"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </section>
  );
}