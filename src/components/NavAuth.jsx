import './styles/NavAuth.css';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignIn,
  faDoorOpen,
  faHome,
  faInfoCircle,
  faBars,
  faTimes,
  faFileContract,
  faShieldAlt,
  faEnvelope,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import Logo from '../assets/Logo2.jpg';

export default function NavAuth({ disabled }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open-fmw');
    } else {
      document.body.classList.remove('menu-open-fmw');
    }

    return () => {
      document.body.classList.remove('menu-open-fmw');
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
    closeDropdown();
  }, [location.pathname]);

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    }

    // Only add event listener for desktop
    if (window.innerWidth >= 769) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    // Only allow dropdown toggle on desktop
    if (window.innerWidth >= 769) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Check if any dropdown link is active
  const isDropdownActive = () => {
    const dropdownPaths = ['/', '/about', '/user-agreement', '/privacy-policy', '/contact'];
    return dropdownPaths.includes(location.pathname);
  };

  // Check if specific link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header className='nav-auth-header-fmw'>
      <nav className='navigation-auth-fmw'>
        <div className="nav-brand-fmw">
          <Link to="/" className='logo-link-fmw' onClick={closeMobileMenu}>
            <img className='logo-pic-fmw' src={Logo} alt="FindMyWay Community Portal Logo" />
            <span className="logo-text-fmw">FindMyWay Community Portal</span>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-toggle-fmw"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </button>

        {/* Navigation Links and Auth Buttons */}
        <div className={`nav-content-fmw ${isMobileMenuOpen ? 'mobile-open-fmw' : ''}`}>
          
          {/* DROPDOWN FOR DESKTOP */}
          <div className="nav-dropdown-fmw" ref={dropdownRef}>
            <button 
              className={`dropdown-toggle-fmw ${isDropdownActive() ? 'active-fmw' : ''}`}
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <FontAwesomeIcon icon={faBars} />
              <span>Menu</span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                style={{ 
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} 
              />
            </button>
            
            <div className={`dropdown-menu-fmw ${isDropdownOpen ? 'open-fmw' : ''}`}>
              <Link 
                to="/" 
                className={`dropdown-link-fmw ${isActiveLink('/') ? 'active-fmw' : ''}`}
                onClick={() => {
                  closeDropdown();
                  closeMobileMenu();
                }}
              >
                <FontAwesomeIcon icon={faHome} />
                Home
              </Link>
              <Link 
                to="/about" 
                className={`dropdown-link-fmw ${isActiveLink('/about') ? 'active-fmw' : ''}`}
                onClick={() => {
                  closeDropdown();
                  closeMobileMenu();
                }}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                About
              </Link>
              <Link 
                to="/user-agreement" 
                className={`dropdown-link-fmw ${isActiveLink('/user-agreement') ? 'active-fmw' : ''}`}
                onClick={() => {
                  closeDropdown();
                  closeMobileMenu();
                }}
              >
                <FontAwesomeIcon icon={faFileContract} />
                Terms
              </Link>
              <Link 
                to="/privacy-policy" 
                className={`dropdown-link-fmw ${isActiveLink('/privacy-policy') ? 'active-fmw' : ''}`}
                onClick={() => {
                  closeDropdown();
                  closeMobileMenu();
                }}
              >
                <FontAwesomeIcon icon={faShieldAlt} />
                Privacy
              </Link>
              <Link 
                to="/contact" 
                className={`dropdown-link-fmw ${isActiveLink('/contact') ? 'active-fmw' : ''}`}
                onClick={() => {
                  closeDropdown();
                  closeMobileMenu();
                }}
              >
                <FontAwesomeIcon icon={faEnvelope} />
                Contact
              </Link>
            </div>
          </div>

          {/* INDIVIDUAL LINKS FOR MOBILE */}
          <div className="nav-links-fmw">
            <Link 
              to="/" 
              className={`nav-link-fmw home-link-fmw ${isActiveLink('/') ? 'active-fmw' : ''}`} 
              onClick={closeMobileMenu}
            >
              <FontAwesomeIcon icon={faHome} />
              Home
            </Link>
            <Link 
              to="/about" 
              className={`nav-link-fmw about-link-fmw ${isActiveLink('/about') ? 'active-fmw' : ''}`} 
              onClick={closeMobileMenu}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              About
            </Link>
            <Link 
              to="/user-agreement" 
              className={`nav-link-fmw terms-link-fmw ${isActiveLink('/user-agreement') ? 'active-fmw' : ''}`} 
              onClick={closeMobileMenu}
            >
              <FontAwesomeIcon icon={faFileContract} />
              Terms
            </Link>
            <Link 
              to="/privacy-policy" 
              className={`nav-link-fmw privacy-link-fmw ${isActiveLink('/privacy-policy') ? 'active-fmw' : ''}`} 
              onClick={closeMobileMenu}
            >
              <FontAwesomeIcon icon={faShieldAlt} />
              Privacy
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link-fmw contact-link-fmw ${isActiveLink('/contact') ? 'active-fmw' : ''}`} 
              onClick={closeMobileMenu}
            >
              <FontAwesomeIcon icon={faEnvelope} />
              Contact
            </Link>
          </div>

          {/* AUTH BUTTONS (SEPARATE - NOT IN DROPDOWN) */}
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

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay-fmw"
            onClick={closeMobileMenu}
          />
        )}
      </nav>
    </header>
  );
}