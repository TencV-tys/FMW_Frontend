import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileContract, 
  faArrowLeft, 
  faCheckCircle,
  faShieldAlt,
  faUserLock,
  faExclamationTriangle,
  faPrint,
  faUserShield,
  faBan,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import './styles/UserAgreement.css';

export default function UserAgreement() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from registration
  useEffect(() => {
    const fromRegistration = sessionStorage.getItem('fromRegistration') === 'true' || 
                           location.state?.from === 'registration';
    
    if (fromRegistration) {
      setAccepted(true);
    }
  }, [location]);

  const handleAccept = () => {
    sessionStorage.setItem('termsAccepted', 'true');
    sessionStorage.removeItem('fromRegistration');
    
    // Navigate back to registration
    navigate('/registration');
  };

  const handleDecline = () => {
    sessionStorage.removeItem('fromRegistration');
    navigate('/');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (sessionStorage.getItem('fromRegistration') === 'true') {
      navigate('/registration');
    } else {
      navigate(-1);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="user-agreement-page">
      <div className="agreement-container"> 
        {/* Header */}
        <header className="agreement-header">
          <button 
            className="back-button"
            onClick={handleBack}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to {sessionStorage.getItem('fromRegistration') === 'true' ? 'Registration' : 'Previous'}
          </button>
          <div className="header-content">
            <FontAwesomeIcon icon={faFileContract} className="header-icon" />
            <h1 className='terms'>Terms of Service & User Agreement</h1>
            <p>Last Updated: {currentDate}</p>
          </div>
          <div className="header-actions">
            <button className="print-btn" onClick={handlePrint}>
              <FontAwesomeIcon icon={faPrint} />
              Print
            </button>
          </div>
        </header>

        {/* Quick Navigation */}
        <nav className="agreement-nav">
          <a href="#acceptance">Acceptance</a>
          <a href="#accounts">Accounts</a>
          <a href="#conduct">Conduct</a>
          <a href="#content">Content</a>
          <a href="#privacy">Privacy</a>
          <a href="#moderation">Moderation</a>
        </nav>

        {/* Agreement Content */}
        <div className="agreement-content">
          <div className="agreement-card">
            
            {/* Introduction */}
            <section id="acceptance" className="agreement-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By creating an account or using our services, you agree to be bound by these Terms of Service, 
                our Privacy Policy, and all applicable laws and regulations. If you do not agree with any part 
                of these terms, you must not use our services.
              </p>
            </section>

            {/* User Accounts */}
            <section id="accounts" className="agreement-section">
              <h2>
                <FontAwesomeIcon icon={faUserLock} />
                2. User Account Requirements
              </h2>
              <div className="terms-grid">
                <div className="term-card">
                  <FontAwesomeIcon icon={faUserShield} className="term-card-icon" />
                  <h4>Account Security</h4>
                  <p>You are responsible for maintaining your account security and password confidentiality.</p>
                </div>
                <div className="term-card">
                  <FontAwesomeIcon icon={faCheckCircle} className="term-card-icon" />
                  <h4>Accurate Information</h4>
                  <p>You must provide accurate and complete information during registration.</p>
                </div>
              
                <div className="term-card">
                  <FontAwesomeIcon icon={faClock} className="term-card-icon" />
                  <h4>Active Usage</h4>
                  <p>Accounts must be used regularly. Inactive accounts may be subject to removal.</p>
                </div>
              </div>
            </section>

            {/* User Conduct */}
            <section id="conduct" className="agreement-section">
              <h2>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                3. User Conduct & Prohibited Activities
              </h2>
              
              <div className="conduct-categories">
                <div className="conduct-category serious">
                  <h4>Zero Tolerance</h4>
                  <ul>
                    <li>Hate speech or discrimination</li>
                    <li>Harassment or threats</li>
                    <li>Impersonation</li>
                    <li>Illegal activities</li>
                  </ul>
                </div>
                
                <div className="conduct-category moderate">
                  <h4>Community Standards</h4>
                  <ul>
                    <li>Spam or unauthorized advertising</li>
                    <li>Misinformation</li>
                    <li>Multiple account creation</li>
                    <li>System abuse</li>
                  </ul>
                </div>
                
                <div className="conduct-category minor">
                  <h4>Quality Guidelines</h4>
                  <ul>
                    <li>Low-quality content</li>
                    <li>Excessive complaints</li>
                    <li>Minor rule violations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Content Policy */}
            <section id="content" className="agreement-section">
              <h2>4. Content Guidelines & Ownership</h2>
              
              <div className="content-rights">
                <div className="rights-section">
                  <h4>Your Rights</h4>
                  <ul>
                    <li>You retain ownership of your original content</li>
                    <li>You grant us license to display your content</li>
                    <li>You can delete your content at any time</li>
                  </ul>
                </div>
                
                <div className="rights-section">
                  <h4>Prohibited Content</h4>
                  <ul>
                    <li>Copyrighted material without permission</li>
                    <li>Personal information of others</li>
                    <li>Explicit or adult content</li>
                    <li>False or misleading information</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy & Data */}
            <section id="privacy" className="agreement-section">
              <h2>
                <FontAwesomeIcon icon={faShieldAlt} />
                5. Privacy & Data Protection
              </h2>
              
              <div className="privacy-grid">
                <div className="privacy-item">
                  <h4>Data Collection</h4>
                  <p>We collect only necessary information to provide and improve our services.</p>
                </div>
                <div className="privacy-item">
                  <h4>Data Usage</h4>
                  <p>Your data helps us personalize your experience and communicate important updates.</p>
                </div>
                <div className="privacy-item">
                  <h4>Data Protection</h4>
                  <p>We implement industry-standard security measures to protect your information.</p>
                </div>
                <div className="privacy-item">
                  <h4>Your Control</h4>
                  <p>You can access, correct, or request deletion of your personal data at any time.</p>
                </div>
              </div>
            </section>

            {/* Account Moderation */}
            <section id="moderation" className="agreement-section">
              <h2>6. Account Moderation & Enforcement</h2>
              
              <div className="enforcement-stages">
                <div className="enforcement-stage">
                  <div className="stage-header warning">
                    <h4>Stage 1: Warning</h4>
                    <span className="stage-duration">Minor Violations</span>
                  </div>
                  <p>For first-time or minor violations, you'll receive a warning with guidance.</p>
                </div>
                
                <div className="enforcement-stage">
                  <div className="stage-header suspension">
                    <h4>Stage 2: Suspension</h4>
                    <span className="stage-duration">3-30 Days</span>
                  </div>
                  <p>Repeated or serious violations may result in temporary account suspension.</p>
                </div>
                
                <div className="enforcement-stage">
                  <div className="stage-header permanent">
                    <h4>Stage 3: Permanent Ban</h4>
                    <span className="stage-duration">Indefinite</span>
                  </div>
                  <p>Severe or repeated violations will result in permanent account termination and email blocking.</p>
                </div>
              </div>
            </section>

            {/* Acceptance Section - Only show when coming from registration */}
            {accepted && (
              <section className="acceptance-section">
                <div className="acceptance-container">
                  <div className="acceptance-header">
                    <FontAwesomeIcon icon={faCheckCircle} className="acceptance-icon" />
                    <h3>Ready to Continue?</h3>
                  </div>
                  <p className="acceptance-text">
                    By clicking "I Accept", you acknowledge that you have read, understood, 
                    and agree to be bound by these Terms of Service and our Privacy Policy.
                  </p>
                  <div className="acceptance-actions">
                    <button className="accept-btn primary" onClick={handleAccept}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      I Accept & Continue
                    </button>
                    <button className="accept-btn secondary" onClick={handleDecline}>
                      Decline
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="agreement-footer">
          <div className="footer-content">
            <p className="footer-notice">
              <strong>Important:</strong> These terms are legally binding. We reserve the right to update 
              these terms at any time. Continued use of our services after changes constitutes acceptance.
            </p>
            <div className="footer-links">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/contact">Contact Support</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}