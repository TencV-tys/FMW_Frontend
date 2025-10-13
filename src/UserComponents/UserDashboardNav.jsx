import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
              <Link to='/user' className='user-nav-link'>
                <FontAwesomeIcon icon={faBullhorn} />
                <span>Bulletin Board</span>
              </Link>
            </div>
            
            <div className='user-link-container'>
              <Link to='/user/myposts' className='user-nav-link'>
                <FontAwesomeIcon icon={faFileAlt} />
                <span>My Posts</span>
              </Link>
            </div>
            
            <div className='user-link-container'>
              <Link to='/user/create' className='user-nav-link create-post-link'>
                <FontAwesomeIcon icon={faPlus} />
                <span>Create Post</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 🎯 Right Side - User Profile & Dropdown */}
        <div className='user-profile-container' ref={dropdownRef}>
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
                  className='dropdown-link'
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>My Profile</span>
                </Link>
              </div>
              
              <div className='dropdown-link-container'>
                <Link 
                  to='/user/myposts' 
                  className='dropdown-link'
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                  <span>My Posts</span>
                </Link>
              </div>
            <div className='dropdown-link-container'>
             <Link 
              to='/user/my-reports' 
              className='dropdown-link'
              onClick={() => setOpen(false)}
                >
              <FontAwesomeIcon icon={faFlag} />
              <span>My Reports</span>
              </Link>
              </div>
               <div className='dropdown-link-container'>
                <Link 
                  to='/user/notifications' 
                  className='dropdown-link'
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faBell} />
                  <span>Notifications</span>
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