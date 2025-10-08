import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronLeft,faChevronRight} from '@fortawesome/free-solid-svg-icons';

import './AdminStyles/AdminNav.css';
import Logo from '../assets/Logo2.jpg';
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
            <div className='admin-logo'>
              <img className='logo' src={Logo}/>
            </div>
            <div className='admin-links'>
          <Link to='/admin' className='nav-link'>Dashboard</Link>
          </div>
           <div className='admin-links'>
          <Link to='/admin/manage-users' className='nav-link'>Manage Users</Link>
          </div>
          <div className='admin-links'>
          <Link to='/admin/manage-posts' className='nav-link'>Manage Posts</Link>
          </div>
          <div className='admin-links'>
          <Link className='nav-link'>Reports</Link>
          </div>
      
           <div className='admin-links'>
          <Link className='nav-link'>
           <LogoutButton/>
          </Link>
          </div>
          </>
        )}
        </nav>
    </header>
)

}