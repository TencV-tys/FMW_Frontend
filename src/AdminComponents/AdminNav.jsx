import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faGauge,
    faUsers,
    faNewspaper,
    faChartBar,
} from '@fortawesome/free-solid-svg-icons';

import './AdminStyles/AdminNav.css';
import Logo from '../assets/Admin.png';
import LogoutButton from '../components/LogoutButton';

export default function AdminNav({isOpen, setIsOpen}){
 
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
          </div>

          {/* Logout Button - Fixed Integration */}
          <div className='logout-container'>
            <LogoutButton isOpen={isOpen} className="admin-logout"/>
          </div>
        </nav>
    </header>
)
}