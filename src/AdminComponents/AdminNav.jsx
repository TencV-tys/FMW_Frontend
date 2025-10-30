import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faGauge,
    faUsers,
    faNewspaper,
    faChartBar,
    faBell,
    faComments,
    faUserLock
} from '@fortawesome/free-solid-svg-icons';

import './AdminStyles/AdminNav.css';
import Logo from '../assets/Admin.png';
import { useState, useEffect } from 'react';

export default function AdminNav({isOpen, setIsOpen}){
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/notifications/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.stats?.unread || 0);
      } else {
        fetchUserNotificationCount();
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
      fetchUserNotificationCount();
    }
  };

  const fetchUserNotificationCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/unread-count', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching user notification count:', error);
    }
  };
 
return(
    <header className={`admin-nav-main ${isOpen ? "admin-nav-open" : "admin-nav-closed"}`}>
        <nav className='admin-nav-inner'>
          {/* Toggle Button - Always Visible */}
          <div className='admin-nav-toggle'>
           <button className='admin-toggle-btn' onClick={()=>setIsOpen(!isOpen)}>
            <FontAwesomeIcon className='admin-toggle-icon' icon={isOpen ? faChevronLeft : faChevronRight}/>
           </button>
          </div>

          {/* Logo and Profile - Only show when open */}
          {isOpen && (
            <Link to='/admin' className='admin-profile-main'>
             <div className='admin-logo-main'>
              <img className='admin-logo-img' src={Logo} alt="Admin Logo"/>
             </div>
             <div className='admin-profile-info'>
                <p className='admin-welcome-text'>Welcome!</p>
                <p className='admin-role-text'>Admin</p>
             </div>
            </Link>
          )}

          {/* Navigation Links */}
          <div className='admin-nav-links-wrapper'>
            <Link to='/admin' className='admin-nav-link-item'>
              <div className='admin-nav-link-content'>
                <FontAwesomeIcon icon={faGauge} className='admin-nav-icon'/>
                {isOpen && <span className='admin-nav-text'>Dashboard</span>}
              </div>
            </Link>
            
            <Link to='/admin/manage-users' className='admin-nav-link-item'>
              <div className='admin-nav-link-content'>
                <FontAwesomeIcon icon={faUsers} className='admin-nav-icon'/>
                {isOpen && <span className='admin-nav-text'>Manage Users</span>}
              </div>
            </Link>
            
            <Link to='/admin/manage-posts' className='admin-nav-link-item'>
              <div className='admin-nav-link-content'>
                <FontAwesomeIcon icon={faNewspaper} className='admin-nav-icon'/>
                {isOpen && <span className='admin-nav-text'>Manage Posts</span>}
              </div>
            </Link>
            
            <Link to='/admin/reports' className='admin-nav-link-item'>
              <div className='admin-nav-link-content'>
                <FontAwesomeIcon icon={faChartBar} className='admin-nav-icon'/>
                {isOpen && <span className='admin-nav-text'>Reports</span>}
              </div>
            </Link>
            
            <Link to='/admin/feedback' className='admin-nav-link-item'>
              <div className='admin-nav-link-content'>
                <FontAwesomeIcon icon={faComments} className='admin-nav-icon'/>
                {isOpen && <span className='admin-nav-text'>Feedback</span>}
              </div>
            </Link>
            <Link to='/admin/deletion-requests' className='admin-nav-link-item'>
              <div className='admin-nav-link-content'>
              <FontAwesomeIcon icon={faUserLock} className='admin-nav-icon'/>
                {isOpen && <span className='admin-nav-text'>Deletion Requests</span>}
              </div>
                 </Link>
            {/* Notifications with Count */}
            <Link to='/admin/notifications' className='admin-nav-link-item'>
              <div className='admin-nav-link-content'>
                <div className='admin-notification-item'>
                  <FontAwesomeIcon icon={faBell} className='admin-nav-icon'/>
                  {isOpen && <span className='admin-nav-text'>Notifications</span>}
                  {notificationCount > 0 && (
                    <span className='admin-nav-badge'>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </nav>
    </header>
)
}