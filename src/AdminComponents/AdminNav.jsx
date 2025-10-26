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
    faComments
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
    <header className={`admin-nav-container ${isOpen ? "open" : "closed"}`}>
        <nav className='admin-link-container'>
          {/* Toggle Button - Always Visible */}
          <div className='toggle'>
           <button className='toggle-icon' onClick={()=>setIsOpen(!isOpen)}>
            <FontAwesomeIcon className='icon' icon={isOpen ? faChevronLeft : faChevronRight}/>
           </button>
          </div>

          {/* Logo and Profile - Only show when open */}
          {isOpen && (
            <Link to='/admin' className='admin-profile-container'>
             <div className='admin-logo-container'>
              <img className='logo' src={Logo} alt="Admin Logo"/>
             </div>
             <div className='admin-name'>
                <p>Welcome!</p>
                <p>Admin</p>
             </div>
            </Link>
          )}

          {/* Navigation Links */}
          <div className='nav-links-wrapper'>
            <Link to='/admin' className='admin-links'>
              <div className='nav-link'>
                <FontAwesomeIcon icon={faGauge} className='nav-icons'/>
                {isOpen && "Dashboard"}
              </div>
            </Link>
            
            <Link to='/admin/manage-users' className='admin-links'>
              <div className='nav-link'>
                <FontAwesomeIcon icon={faUsers} className='nav-icons'/>
                {isOpen && "Manage Users"}
              </div>
            </Link>
            
            <Link to='/admin/manage-posts' className='admin-links'>
              <div className='nav-link'>
                <FontAwesomeIcon icon={faNewspaper} className='nav-icons'/>
                {isOpen && "Manage Posts"}
              </div>
            </Link>
            
            <Link to='/admin/reports' className='admin-links'>
              <div className='nav-link'>
                <FontAwesomeIcon icon={faChartBar} className='nav-icons'/>
                {isOpen && "Reports"}
              </div>
            </Link>
            <Link to='/admin/feedback' className='admin-links'>
          <div className='nav-link'>
         <FontAwesomeIcon icon={faComments} className='nav-icons'/>
           {isOpen && "Feedback"}
          </div>
            </Link>
            
            {/* Notifications with Count */}
            <Link to='/admin/notifications' className='admin-links'>
              <div className='nav-link'>
                <div className='notification-nav-item'>
                  <FontAwesomeIcon icon={faBell} className='nav-icons'/>
                  {isOpen && "Notifications"}
                  {notificationCount > 0 && (
                    <span className='nav-notif-badge'>
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