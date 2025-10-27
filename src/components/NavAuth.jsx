import './styles/NavAuth.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignIn,
  faDoorOpen,
  faHome,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Logo from '../assets/Logo2.jpg';

export default function NavAuth({ disabled }) {
  return (
    <header className='nav-auth-header'>
      <nav className='navigation-auth'>
        <div className="nav-brand">
          <Link to="/" className='logo-link'>
            <img className='logo-pic' src={Logo} alt="FindMyWay Logo" />
            <span className="logo-text">FindMyWay</span>
          </Link>
        </div>
        
        <div className="nav-links">
          <Link to="/" className="nav-link home-link">
            <FontAwesomeIcon icon={faHome} />
            Home
          </Link>
          <Link to="/about" className="nav-link about-link">
            <FontAwesomeIcon icon={faInfoCircle} />
            About
          </Link>
        </div>

        <div className={`auth-buttons ${disabled}`}>
          <Link to="/registration" className='auth-button signup-btn'>
            <span>Sign Up</span>
            <FontAwesomeIcon icon={faSignIn} />
          </Link>
          <Link to="/login" className='auth-button login-btn'>
            <span>Login</span>
            <FontAwesomeIcon icon={faDoorOpen} />
          </Link>
        </div>   
      </nav>
    </header>
  );
}