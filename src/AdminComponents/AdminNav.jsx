import {Link} from 'react-router-dom';
import './AdminStyles/AdminNav.css';
import Logo from '../assets/Logo2.jpg';
export default function AdminNav(){


return(
    <header className="admin-nav-container">
        <nav className='admin-link-container'>
            <div className='admin-logo'>
              <img className='logo' src={Logo}/>
            </div>
            <div className='admin-links'>
          <Link className='nav-link'>Dashboard</Link>
          </div>
          <div className='admin-links'>
          <Link className='nav-link'>Manage Page</Link>
          </div>
          <div className='admin-links'>
          <Link className='nav-link'>Settings</Link>
          </div>
        </nav>
    </header>
)

}