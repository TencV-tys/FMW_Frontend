import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faVenusMars, faCalendar, faEdit } from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav';
import Logo2 from '../assets/Logo2.jpg';
import './styles/Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    activePosts: 0,
    resolvedPosts: 0
  });

  // 🎯 Fetch user data and statistics
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userResponse = await fetch('http://localhost:8000/auth/me', {
          credentials: 'include'
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // 🎯 Fetch user statistics
        const statsResponse = await fetch('http://localhost:8000/api/users/stats', {
          credentials: 'include'
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.stats);
          }
        }

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 🎯 Format registration date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 🎯 Get gender display text
  const getGenderDisplay = (gender) => {
    if (!gender) return 'Not specified';
    
    const genderMap = {
      'Male': 'Male',
      'Female': 'Female',
      'Other': 'Other'
    };
    
    return genderMap[gender] || gender;
  };

  // 🎯 Loading state
  if (loading) {
    return (
      <section className="profile-page">
        <UserNav />
        <main className="profile-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <UserNav />
      <main className="profile-content">
        
        {/* 🎯 Header Section */}
        <div className='profile-action'>
          <h1 className="profile-welcome">
            Welcome back, {user?.first_name || 'User'}! 👋
          </h1>
          <button className='profile-edit-btn'>
            <FontAwesomeIcon icon={faEdit} />
            <Link to='/user/edit-profile'>Edit Profile</Link>
          </button>
        </div>

        {/* 🎯 Statistics Cards */}
        <div className="profile-stats-container">
          <div className="stat-card">
            <div className="stat-icon posts-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalPosts}</h3>
              <p>Total Posts</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon active-icon">
              <div className="pulse-dot"></div>
            </div>
            <div className="stat-info">
              <h3>{stats.activePosts}</h3>
              <p>Active Posts</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon resolved-icon">
              <span>✓</span>
            </div>
            <div className="stat-info">
              <h3>{stats.resolvedPosts}</h3>
              <p>Resolved Cases</p>
            </div>
          </div>
        </div>

        {/* 🎯 Main Profile Card */}
        <div className='profile-data-container-darkbrown'>   
          <div className='profile-data-container-lightbrown'>  
            <div className='profile-data-container'>
              <div className='profile-data'>
                
                {/* 🎯 Profile Title */}
                <div className='profile-data-title'>
                  <h2>Profile Information</h2>
                  <div className="member-since">
                    Member since {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                  </div>
                </div>

                {/* 🎯 Profile Content */}
                <div className='profile-container'>
                  <span className='profile-pin'></span>
                  
                  {/* 🎯 Profile Picture */}
                  <div className='profile-pic-section'>
                    <div className='profile-pic'>
                      <img 
                        src={user?.profile_photo ? `http://localhost:8000/uploads/${user.profile_photo}` : Logo2} 
                        alt={`${user?.first_name} ${user?.last_name}`}
                        onError={(e) => {
                          e.target.src = Logo2;
                        }}
                      />
                      <div className="profile-pic-overlay">
                        <span>Change Photo</span>
                      </div>
                    </div>
                    <div className="profile-role-badge">
                      {user?.role === 'admin' ? 'Administrator' : 'Community Member'}
                    </div>
                  </div>

                  {/* 🎯 Profile Details */}
                  <div className='profile-details'>
                    <div className="detail-group">
                      <h3>Personal Information</h3>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faUser} className="detail-icon" />
                        <div className="detail-content">
                          <label>Full Name</label>
                          <p>{user?.first_name} {user?.last_name}</p>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
                        <div className="detail-content">
                          <label>Email Address</label>
                          <p>{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faVenusMars} className="detail-icon" />
                        <div className="detail-content">
                          <label>Gender</label>
                          <p>{getGenderDisplay(user?.gender)}</p>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faCalendar} className="detail-icon" />
                        <div className="detail-content">
                          <label>Member Since</label>
                          <p>{user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* 🎯 Quick Actions */}
                    <div className="profile-actions">
                      <h3>Quick Actions</h3>
                      <div className="action-buttons">
                        <Link to="/user/create" className="action-btn primary">
                          Create New Post
                        </Link>
                        <Link to="/user/myposts" className="action-btn secondary">
                          View My Posts
                        </Link>
                        <Link to="/user" className="action-btn outline">
                          Browse Bulletin
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>   
      </main>
    </section>
  );
}