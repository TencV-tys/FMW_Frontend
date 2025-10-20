// components/UserDashboardNav.jsx - Updated version
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Add useLocation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faFileAlt, 
  faPlus, 
  faBullhorn,
  faCaretDown,
  faSignOutAlt,
  faBell,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import Logo from '../assets/Logo2.jpg';
import Profile from '../assets/download.png';
import LogoutButton from '../components/LogoutButton';
import './styles/UserDashboardNav.css';

export default function UserDashboardNav() {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  // 🎯 Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // 🎯 Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/notifications/unread-count', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // 🎯 Sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🎯 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🎯 Check if a link is active
  const isActiveLink = (path) => {
    if (path === '/user') {
      return location.pathname === '/user';
    }
    return location.pathname.startsWith(path);
  };

  // 🎯 Get user profile image
  const getUserImage = () => {
    if (user?.profile_photo) {
      return `http://localhost:8000/uploads/${user.profile_photo}`;
    }
    return Profile;
  };

  // 🎯 Get user display name
  const getUserName = () => {
    if (user?.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    return 'User';
  };

  return (
    <header className={`nav-container ${isSticky ? 'sticky' : ''}`}>
      <nav className='user-nav'>
        
        {/* 🎯 Left Side - Logo & Navigation Links */}
        <div className='user-links'>
          <div className='user-page-logo-container'>
            <img 
              src={Logo} 
              className='user-page-Logo' 
              alt="FindMyWay Logo"
              onClick={() => navigate('/user')}
              style={{ cursor: 'pointer' }}
            />
          </div>
          
          <div className='nav-links-group'>
            <div className='user-link-container'>
              <Link 
                to='/user' 
                className={`user-nav-link ${isActiveLink('/user') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faBullhorn} />
                <span>Bulletin Board</span>
              </Link>
            </div>
            
            <div className='user-link-container'>
              <Link 
                to='/user/myposts' 
                className={`user-nav-link ${isActiveLink('/user/myposts') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faFileAlt} />
                <span>My Posts</span>
              </Link>
            </div>
            
            <div className='user-link-container'>
              <Link 
                to='/user/create' 
                className={`user-nav-link create-post-link ${isActiveLink('/user/create') ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Create Post</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 🎯 Right Side - User Profile & Dropdown */}
        <div className='user-profile-container' ref={dropdownRef}>
          {/* 🎯 Notification Bell with Badge */}
          <div className="notification-bell-container">
            <Link 
              to="/user/user-notification" 
              className={`notification-bell ${isActiveLink('/user/user-notification') ? 'active' : ''}`}
              title="Notifications"
            >
              <FontAwesomeIcon icon={faBell} />
              {notificationCount > 0 && (
                <span className="notification-badge">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Link>
          </div>

          <div 
            className='user-profile-sub' 
            onClick={() => setOpen(!open)}
            onMouseEnter={() => setOpen(true)}
          >
            <div className="user-info">
              <p className="user-name">{getUserName()}</p>
              <p className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Community Member'}</p>
            </div>
            
            <div className="profile-image-container">
              <img 
                src={getUserImage()} 
                className='Profile'
                alt="User Profile"
                onError={(e) => {
                  e.target.src = Profile;
                }}
              />
              <FontAwesomeIcon 
                icon={faCaretDown} 
                className={`dropdown-arrow ${open ? 'open' : ''}`}
              />
            </div>
          </div>

          {/* 🎯 Dropdown Menu */}
          {open && (
            <div 
              className='profile-dropdown-menu'
              onMouseLeave={() => setOpen(false)}
            >
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <img 
                    src={getUserImage()} 
                    alt="Profile"
                    onError={(e) => {
                      e.target.src = Profile;
                    }}
                  />
                  <div>
                    <p className="dropdown-name">{getUserName()}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className='dropdown-link-container'>
                <Link 
                  to='/user/profile' 
                  className={`dropdown-link ${isActiveLink('/user/profile') ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>My Profile</span>
                </Link>
              </div>
              
              <div className='dropdown-link-container'>
                <Link 
                  to='/user/myposts' 
                  className={`dropdown-link ${isActiveLink('/user/myposts') ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                  <span>My Posts</span>
                </Link>
              </div>
              
              <div className='dropdown-link-container'>
                <Link 
                  to='/user/my-reports' 
                  className={`dropdown-link ${isActiveLink('/user/my-reports') ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faFlag} />
                  <span>My Reports</span>
                </Link>
              </div>
              
              <div className='dropdown-link-container'>
                <Link 
                  to='/user/user-notification' 
                  className={`dropdown-link notification-dropdown-link ${isActiveLink('/user/user-notification') ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faBell} />
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <span className="dropdown-notification-badge">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className='dropdown-link-container logout-container'>
                <LogoutButton 
                  isDropdown={true}
                  className="dropdown-link logout-link"
                  onLogout={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </LogoutButton>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}