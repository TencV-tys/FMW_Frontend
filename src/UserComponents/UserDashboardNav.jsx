// components/UserDashboardNav.jsx - COMPLETE OPTIMIZED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faFileAlt, faPlus, faBullhorn,
  faCaretDown, faSignOutAlt, faBell,
  faFlag, faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import Logo from '../assets/Logo2.jpg';
import Profile from '../assets/download.png';
import LogoutButton from '../components/LogoutButton';
import './styles/UserDashboardNav.css';
import { useWifiUrl } from '../hooks/useWifiUrl';

export default function UserDashboardNav() {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const wifi = useWifiUrl();
  
  // 🎯 Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 🎯 Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${wifi}/auth/me`, { 
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
  }, [wifi]);

  // 🎯 SMART POLLING - Every 3 seconds with retry logic
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchNotificationCount = async () => {
      try {
        const response = await fetch(`${wifi}/api/notifications/unread-count`, {
          credentials: 'include',
          headers: { 
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setNotificationCount(data.count || 0);
            retryCount = 0; // Reset retry count on success
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
        if (isMounted && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retry attempt ${retryCount} for notifications...`);
          // Wait 2 seconds before retry
          setTimeout(fetchNotificationCount, 2000);
        }
      }
    };

    // Initial fetch
    fetchNotificationCount();

    // Set up polling every 3 seconds
    const interval = setInterval(fetchNotificationCount, 3000);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [wifi]);

  // 🎯 Refresh notifications when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh notifications when tab becomes active
        fetch(`${wifi}/api/notifications/unread-count`, {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        })
          .then(response => response.ok ? response.json() : { count: 0 })
          .then(data => setNotificationCount(data.count || 0))
          .catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wifi]);

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

  // 🎯 Helper functions
  const isActiveLink = (path) => {
    if (path === '/user') return location.pathname === '/user';
    return location.pathname.startsWith(path);
  };

  const getUserImage = () => {
    return user?.profile_photo ? `${wifi}/uploads/${user.profile_photo}` : Profile;
  };

  const getUserName = () => {
    return user?.first_name 
      ? `${user.first_name} ${user.last_name || ''}`.trim() 
      : 'User';
  };

  const toggleDropdown = () => setOpen(!open);
  const closeDropdown = () => setOpen(false);

  return (
    <header className={`user-nav-container ${isSticky ? 'sticky' : ''} ${isTablet ? 'tablet' : ''}`}>
      <nav className='user-dashboard-nav'>
        
        {/* Left Side - Logo & Navigation Links */}
        <div className='user-dashboard-links'>
          <div className='user-dashboard-logo-container'>
            <img 
              src={Logo} 
              className='user-dashboard-logo' 
              alt="FindMyWay Logo"
              onClick={() => navigate('/user')}
              style={{ cursor: 'pointer' }}
            />
          </div>
          
          {/* Main Navigation Links - Hidden on mobile */}
          {!isMobile && (
            <div className='user-nav-links-group'>
              <div className='user-dashboard-link-container'>
                <Link 
                  to='/user' 
                  className={`user-dashboard-nav-link ${isActiveLink('/user') ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faBullhorn} />
                  <span>Bulletin Board</span>
                </Link>
              </div>
              
              <div className='user-dashboard-link-container'>
                <Link 
                  to='/user/myposts' 
                  className={`user-dashboard-nav-link ${isActiveLink('/user/myposts') ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                  <span>My Posts</span>
                </Link>
              </div> 
              
              <div className='user-dashboard-link-container'>
                <Link 
                  to='/user/create' 
                  className={`user-dashboard-nav-link user-create-post-link ${isActiveLink('/user/create') ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create Post</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - User Profile & Dropdown */}
        <div className='user-dashboard-profile-container' ref={dropdownRef}>
          {/* Notification Bell with Badge */}
          <div className="user-notification-bell-container">
            <Link 
              to="/user/user-notification" 
              className={`user-notification-bell ${isActiveLink('/user/user-notification') ? 'active' : ''}`}
              title="Notifications"
              onClick={closeDropdown}
            >
              <FontAwesomeIcon icon={faBell} />
              {notificationCount > 0 && (
                <span className="user-notification-badge">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </Link>
          </div>

          <div 
            className='user-dashboard-profile-sub' 
            onClick={toggleDropdown}
            onMouseEnter={!isMobile ? () => setOpen(true) : undefined}
          >
            {!isMobile && (
              <div className="user-dashboard-info">
                <p className="user-dashboard-name">{getUserName()}</p>
                <p className="user-dashboard-role">
                  {user?.role === 'admin' ? 'Administrator' : 'Community Member'}
                </p>
              </div>
            )}
            
            <div className="user-dashboard-profile-image-container">
              <img 
                src={getUserImage()} 
                className='user-dashboard-profile-img'
                alt="User Profile"
                onError={(e) => { 
                  e.target.src = Profile; 
                }}
              />
              <FontAwesomeIcon 
                icon={faCaretDown} 
                className={`user-dropdown-arrow ${open ? 'open' : ''}`}
              />
            </div>
          </div>

          {/* Dropdown Menu */}
          {open && (
            <div 
              className={`user-profile-dropdown-menu ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
              onMouseLeave={!isMobile ? () => setOpen(false) : undefined}
            >
              <div className="user-dropdown-header">
                <div className="user-dropdown-user-info">
                  <img 
                    src={getUserImage()} 
                    alt="Profile"
                    onError={(e) => { 
                      e.target.src = Profile; 
                    }}
                  />
                  <div>
                    <p className="user-dropdown-name">{getUserName()}</p>
                    <p className="user-dropdown-email">{user?.email}</p>
                    {isMobile && (
                      <p className="user-dropdown-role-mobile">
                        {user?.role === 'admin' ? 'Administrator' : 'Community Member'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="user-dropdown-divider"></div>
              
              {/* Main Navigation Links - Only show in mobile dropdown */}
              {isMobile && (
                <>
                  <div className='user-dropdown-link-container'>
                    <Link 
                      to='/user' 
                      className={`user-dropdown-link ${isActiveLink('/user') ? 'active' : ''}`}
                      onClick={closeDropdown}
                    >
                      <FontAwesomeIcon icon={faBullhorn} />
                      <span>Bulletin Board</span>
                    </Link>
                  </div>
                  
                  <div className='user-dropdown-link-container'>
                    <Link 
                      to='/user/create' 
                      className={`user-dropdown-link ${isActiveLink('/user/create') ? 'active' : ''}`}
                      onClick={closeDropdown}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span>Create Post</span>
                    </Link>
                  </div>
                  
                  <div className='user-dropdown-link-container'>
                    <Link 
                      to='/user/myposts' 
                      className={`user-dropdown-link ${isActiveLink('/user/myposts') ? 'active' : ''}`}
                      onClick={closeDropdown}
                    >
                      <FontAwesomeIcon icon={faFileAlt} />
                      <span>My Posts</span>
                    </Link>
                  </div>
                  
                  <div className="user-dropdown-divider"></div>
                </>
              )}
              
              {/* User Management Links */}
              <div className='user-dropdown-link-container'>
                <Link 
                  to='/user/profile' 
                  className={`user-dropdown-link ${isActiveLink('/user/profile') ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>My Profile</span>
                </Link>
              </div>
              
              <div className='user-dropdown-link-container'>
                <Link 
                  to='/user/my-reports' 
                  className={`user-dropdown-link ${isActiveLink('/user/my-reports') ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <FontAwesomeIcon icon={faFlag} />
                  <span>My Reports</span>
                </Link>
              </div>
              
              <div className='user-dropdown-link-container'>
                <Link 
                  to='/user/feedback' 
                  className={`user-dropdown-link ${isActiveLink('/user/feedback') ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <FontAwesomeIcon icon={faCommentDots} />
                  <span>Feedback & Support</span>
                </Link>
              </div>
              
              <div className='user-dropdown-link-container'>
                <Link 
                  to='/user/user-notification' 
                  className={`user-dropdown-link user-notification-dropdown-link ${isActiveLink('/user/user-notification') ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <FontAwesomeIcon icon={faBell} />
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <span className="user-dropdown-notification-badge">
                      {notificationCount}
                    </span>
                  )} 
                </Link>
              </div>

              <div className="user-dropdown-divider"></div>
              
              <div className='user-dropdown-link-container user-dropdown-logout-container'>
                <LogoutButton 
                  isDropdown={true}
                  className="user-dropdown-logout-link"
                  onLogout={closeDropdown}
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