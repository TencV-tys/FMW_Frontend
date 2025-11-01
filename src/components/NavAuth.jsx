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
      document.body.classList.add('menu-open-fmw');
    } else {
      document.body.classList.remove('menu-open-fmw');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-open-fmw');
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className='nav-auth-header-fmw'>
      <nav className='navigation-auth-fmw'>
        <div className="nav-brand-fmw">
          <Link to="/" className='logo-link-fmw' onClick={closeMobileMenu}>
            <img className='logo-pic-fmw' src={Logo} alt="FindMyWay Logo" />
            <span className="logo-text-fmw">FindMyWay</span>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-toggle-fmw"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </button>

        {/* Navigation Links and Auth Buttons */}
        <div className={`nav-content-fmw ${isMobileMenuOpen ? 'mobile-open-fmw' : ''}`}>
          <div className="nav-links-fmw">
            <Link to="/" className="nav-link-fmw home-link-fmw" onClick={closeMobileMenu}>
              <FontAwesomeIcon icon={faHome} />
              Home
            </Link>
            <Link to="/about" className="nav-link-fmw about-link-fmw" onClick={closeMobileMenu}>
              <FontAwesomeIcon icon={faInfoCircle} />
              About
            </Link>
          </div>

          <div className={`auth-buttons-fmw ${disabled}`}>
            <Link to="/registration" className='auth-button-fmw signup-btn-fmw' onClick={closeMobileMenu}>
              <span>Sign Up</span>
              <FontAwesomeIcon icon={faSignIn} />
            </Link>
            <Link to="/login" className='auth-button-fmw login-btn-fmw' onClick={closeMobileMenu}>
              <span>Login</span>
              <FontAwesomeIcon icon={faDoorOpen} />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}