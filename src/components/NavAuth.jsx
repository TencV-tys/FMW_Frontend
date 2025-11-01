import './styles/NavAuth.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignIn,
  faDoorOpen,
  faHome,
  faInfoCircle,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import Logo from '../assets/Logo2.jpg';

export default function NavAuth({ disabled }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className='nav-auth-header'>
      <nav className='navigation-auth'>
        <div className="nav-brand">
          <Link to="/" className='logo-link' onClick={closeMobileMenu}>
            <img className='logo-pic' src={Logo} alt="FindMyWay Logo" />
            <span className="logo-text">FindMyWay</span>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </button>

        {/* Navigation Links and Auth Buttons */}
        <div className={`nav-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            <Link to="/" className="nav-link home-link" onClick={closeMobileMenu}>
              <FontAwesomeIcon icon={faHome} />
              Home
            </Link>
            <Link to="/about" className="nav-link about-link" onClick={closeMobileMenu}>
              <FontAwesomeIcon icon={faInfoCircle} />
              About
            </Link>
          </div>

          <div className={`auth-buttons ${disabled}`}>
            <Link to="/registration" className='auth-button signup-btn' onClick={closeMobileMenu}>
              <span>Sign Up</span>
              <FontAwesomeIcon icon={faSignIn} />
            </Link>
            <Link to="/login" className='auth-button login-btn' onClick={closeMobileMenu}>
              <span>Login</span>
              <FontAwesomeIcon icon={faDoorOpen} />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}