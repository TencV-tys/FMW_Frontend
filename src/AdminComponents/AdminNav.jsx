import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronLeft,
        faChevronRight,
        faGauge,
        faUsers,
        faNewspaper,
        faChartBar,
} 
  from '@fortawesome/free-solid-svg-icons';

import './AdminStyles/AdminNav.css';
import Logo from '../assets/Admin.png';
import LogoutButton from '../components/LogoutButton';
export default function AdminNav({isOpen, setIsOpen}){
 
return(
    <header className={`admin-nav-container ${isOpen ? "open" : "closed"}`}>
        <nav className='admin-link-container'>
          <div className='toggle'>
           <button className='toggle-icon' onClick={()=>setIsOpen(!isOpen)}>
            <FontAwesomeIcon  className='icon' icon={ isOpen ? faChevronLeft : faChevronRight}/>
           </button>
          </div>
          { isOpen &&(
            <>
            <Link to='/admin' className='admin-profile-container'>
             <div className='admin-logo-container'>
              <img className='logo' src={Logo}/>
              </div>
              <div className='admin-name'>
                <p>Welcome!</p>
                <p>admin</p>
              </div>
            </Link>
            <Link to='/admin' className='admin-links'>
          <div  className='nav-link'>
          <FontAwesomeIcon icon={faGauge} className='nav-icons'/>
          Dashboard
          </div>
          </Link>
           <Link to='/admin/manage-users' className='admin-links'>
          <div  className='nav-link'>
          <FontAwesomeIcon icon={faUsers} className='nav-icons'/>
          Manage Users
          </div>
          </Link>
          <Link to='/admin/manage-posts' className='admin-links'>
          <div  className='nav-link'>
          <FontAwesomeIcon icon={faNewspaper} className='nav-icons'/>
          Manage Posts</div>
          </Link>
          <Link className='admin-links'>
          <div className='nav-link'>
          <FontAwesomeIcon icon={faChartBar} className='nav-icons'/>
           Reports
          </div>
          </Link>
      
           <Link className='admin-links logout'>
        
           <LogoutButton/>
        
          </Link>
          </>
        )}
        </nav>
    </header>
)

}