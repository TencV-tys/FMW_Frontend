import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileContract, 
  faCheckCircle,
  faShieldAlt,
  faUserLock,
  faExclamationTriangle,
  faPrint,
  faUserShield,
  faClock,
  faExclamationCircle,
  faBridge,
  faFilter,
  faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import './styles/UserAgreement.css';
import NavAuth from '../components/NavAuth';

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

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="user-agreement-page-fmwcp">
      <NavAuth/>
      <div className="agreement-container-fmwcp"> 
        {/* Header */}
        <header className="agreement-header-fmwcp">
          <div className="header-content-fmwcp">
            <FontAwesomeIcon icon={faFileContract} className="header-icon-fmwcp" />
            <h1 className='terms-fmwcp'>Terms of Service & User Agreement</h1>
            <p className='date-updated-fmwcp'>Last Updated: {currentDate}</p>
          </div>
          <div className="header-actions-fmwcp">
            <button className="print-btn-fmwcp" onClick={handlePrint}>
              <FontAwesomeIcon icon={faPrint} />
              Print
            </button>
          </div>
        </header>

        {/* Quick Navigation */}
        <nav className="agreement-nav-fmwcp">
          <a href="#acceptance-fmwcp">Acceptance</a>
          <a href="#accounts-fmwcp">Accounts</a>
          <a href="#conduct-fmwcp">Conduct</a>
          <a href="#content-fmwcp">Content</a>
          <a href="#privacy-fmwcp">Privacy</a>
          <a href="#platform-role-fmwcp">Platform Role</a>
          <a href="#disclaimer-fmwcp">Disclaimer</a>
          <a href="#moderation-fmwcp">Moderation</a>
        </nav>

        {/* Agreement Content */}
        <div className="agreement-content-fmwcp">
          <div className="agreement-card-fmwcp">
            
            {/* Introduction */}
            <section id="acceptance-fmwcp" className="agreement-section-fmwcp">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By creating an account or using our services, you agree to be bound by these Terms of Service, 
                our Privacy Policy, and all applicable laws and regulations. If you do not agree with any part 
                of these terms, you must not use our services.
              </p>
            </section>

            {/* User Accounts */}
            <section id="accounts-fmwcp" className="agreement-section-fmwcp">
              <h2>
                <FontAwesomeIcon icon={faUserLock} />
                2. User Account Requirements
              </h2>
              <div className="terms-grid-fmwcp">
                <div className="term-card-fmwcp">
                  <FontAwesomeIcon icon={faUserShield} className="term-card-icon-fmwcp" />
                  <h4>Account Security</h4>
                  <p>You are responsible for maintaining your account security and password confidentiality.</p>
                </div>
                <div className="term-card-fmwcp">
                  <FontAwesomeIcon icon={faCheckCircle} className="term-card-icon-fmwcp" />
                  <h4>Accurate Information</h4>
                  <p>You must provide accurate and complete information during registration.</p>
                </div>
              
            
              </div>
            </section>

            {/* User Conduct */}
            <section id="conduct-fmwcp" className="agreement-section-fmwcp">
              <h2>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                3. User Conduct & Prohibited Activities
              </h2>
              
              <div className="conduct-categories-fmwcp">
                <div className="conduct-category-fmwcp serious-fmwcp">
                  <h4>Zero Tolerance</h4>
                  <ul>
                    <li>Hate speech or discrimination</li>
                    <li>Harassment or threats</li>
                    <li>Impersonation</li>
                    <li>Illegal activities</li>
                  </ul>
                </div>
                
                <div className="conduct-category-fmwcp moderate-fmwcp">
                  <h4>Community Standards</h4>
                  <ul>
                    <li>Spam or unauthorized advertising</li>
                    <li>Misinformation</li>
                    <li>Multiple account creation</li>
                    <li>System abuse</li>
                  </ul>
                </div>
                
                <div className="conduct-category-fmwcp minor-fmwcp">
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
            <section id="content-fmwcp" className="agreement-section-fmwcp">
              <h2>4. Content Guidelines & Ownership</h2>
              
              <div className="content-rights-fmwcp">
                <div className="rights-section-fmwcp">
                  <h4>Your Rights</h4>
                  <ul>
                    <li>You retain ownership of your original content</li>
                    <li>You grant us license to display your content</li>
                    <li>You can delete your content at any time</li>
                  </ul>
                </div>
                 
                <div className="rights-section-fmwcp">
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
            <section id="privacy-fmwcp" className="agreement-section-fmwcp">
              <h2>
                <FontAwesomeIcon icon={faShieldAlt} />
                5. Privacy & Data Protection
              </h2>
              
              <div className="privacy-grid-fmwcp">
                <div className="privacy-item-fmwcp">
                  <h4>Data Collection</h4>
                  <p>We collect only necessary information to provide and improve our services.</p>
                </div>
                <div className="privacy-item-fmwcp">
                  <h4>Data Usage</h4>
                  <p>Your data helps us personalize your experience and communicate important updates.</p>
                </div>
                <div className="privacy-item-fmwcp">
                  <h4>Data Protection</h4>
                  <p>We implement industry-standard security measures to protect your information.</p>
                </div>
                <div className="privacy-item-fmwcp">
                  <h4>Your Control</h4>
                  <p>You can access, correct, or request deletion of your personal data at any time.</p>
                </div>
              </div>
            </section>

            {/* Platform Role & Communication */}
            <section id="platform-role-fmwcp" className="agreement-section-fmwcp">
              <h2>
                <FontAwesomeIcon icon={faFilter} />
                6. Platform Role & Information Sharing
              </h2>
              
              <div className="platform-role-content-fmwcp">
                <div className="role-item-fmwcp">
                  <FontAwesomeIcon icon={faBridge} className="role-icon-fmwcp" />
                  <div className="role-text-fmwcp">
                    <h4>Information Bridge Only</h4>
                    <p>
                      Our platform serves as an information bridge - we do not facilitate direct communication 
                      between users. We only provide the necessary information to help users find what they're 
                      looking for through our advanced filtering system.
                    </p>
                  </div>
                </div>

                <div className="role-item-fmwcp">
                  <FontAwesomeIcon icon={faCheckDouble} className="role-icon-fmwcp" />
                  <div className="role-text-fmwcp">
                    <h4>Post Resolution Process</h4>
                    <p>
                      When a lost or found item is resolved:
                    </p>
                    <ul>
                      <li>Users remove their own posts when items are successfully returned</li>
                      <li>Administrators are notified of resolved cases</li>
                      <li>The platform tracks successful reunions for community statistics</li>
                      <li>No further action is required from the platform</li>
                    </ul>
                  </div>
                </div>

                <div className="role-item-fmwcp">
                  <FontAwesomeIcon icon={faExclamationCircle} className="role-icon-fmwcp" />
                  <div className="role-text-fmwcp">
                    <h4>No Communication Facilitation</h4>
                    <p>
                      We do not provide messaging systems, chat features, or any communication tools. 
                      Users must arrange their own methods of contact and item exchange outside our platform.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Disclaimer Section */}
            <section id="disclaimer-fmwcp" className="agreement-section-fmwcp">
              <h2>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                7. Important Disclaimers
              </h2>
              
              <div className="disclaimer-content-fmwcp">
                <div className="disclaimer-warning-fmwcp">
                  <h4>User Responsibility</h4>
                  <p>
                    <strong>You are solely responsible for:</strong>
                  </p>
                  <ul>
                    <li>Verifying the identity and credibility of other users</li>
                    <li>Ensuring safe meeting arrangements in public places</li>
                    <li>Verifying item ownership and authenticity</li>
                    <li>Protecting your personal information and safety</li>
                    <li>Arranging your own communication methods</li>
                    <li>Reporting suspicious activities to appropriate authorities</li>
                  </ul>
                </div>
                
                <div className="disclaimer-note-fmwcp">
                  <h4>Platform Purpose</h4>
                  <p>
                    FindMyWay Community Portal is designed specifically to help people in Trinidad post and 
                    find lost items within their community using our location-based filtering system. We help 
                    connect people through information sharing only.
                  </p>
                  <p>
                    <strong>Remember:</strong> We provide the platform and filtering tools - you provide the 
                    caution, common sense, and arrange your own communication.
                  </p>
                </div>
              </div>
            </section>

            {/* Account Moderation */}
            <section id="moderation-fmwcp" className="agreement-section-fmwcp">
              <h2>8. Account Moderation & Enforcement</h2>
              
              <div className="enforcement-stages-fmwcp">
                <div className="enforcement-stage-fmwcp">
                  <div className="stage-header-fmwcp warning-fmwcp">
                    <h4>Stage 1: Warning</h4>
                    <span className="stage-duration-fmwcp">Minor Violations</span>
                  </div>
                  <p>For first-time or minor violations, you'll receive a warning with guidance.</p>
                </div>
                
                <div className="enforcement-stage-fmwcp">
                  <div className="stage-header-fmwcp suspension-fmwcp">
                    <h4>Stage 2: Suspension</h4>
                    <span className="stage-duration-fmwcp">3-30 Days</span>
                  </div>
                  <p>Repeated or serious violations may result in temporary account suspension.</p>
                </div>
                
                <div className="enforcement-stage-fmwcp">
                  <div className="stage-header-fmwcp permanent-fmwcp">
                    <h4>Stage 3: Permanent Ban</h4>
                    <span className="stage-duration-fmwcp">Indefinite</span>
                  </div>
                  <p>Severe or repeated violations will result in permanent account termination.</p>
                </div>
              </div>
            </section>

            {/* Acceptance Section - Only show when coming from registration */}
            {accepted && (
              <section className="acceptance-section-fmwcp">
                <div className="acceptance-container-fmwcp">
                  <div className="acceptance-header-fmwcp">
                    <FontAwesomeIcon icon={faCheckCircle} className="acceptance-icon-fmwcp" />
                    <h3>Ready to Continue?</h3>
                  </div>
                  <p className="acceptance-text-fmwcp">
                    By clicking "I Accept", you acknowledge that you have read, understood, 
                    and agree to be bound by these Terms of Service and our Privacy Policy.
                    <strong> You understand that FindMyWay Community Portal is an information-sharing 
                    platform only and does not facilitate communication between users.</strong>
                  </p>
                  <div className="acceptance-actions-fmwcp">
                    <button className="accept-btn-fmwcp primary-fmwcp" onClick={handleAccept}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      I Accept & Continue
                    </button>
                    <button className="accept-btn-fmwcp secondary-fmwcp" onClick={handleDecline}>
                      Decline
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* UNIQUE FOOTER - Centered for desktop */}
        <footer className="agreement-footer-fmwcp-unique">
          <div className="agreement-footer-content-fmwcp">
            <p className="agreement-footer-notice-fmwcp">
              <strong>Important:</strong> These terms are legally binding. We reserve the right to update 
              these terms at any time. Continued use of our services after changes constitutes acceptance.
            </p>
            <div className="agreement-footer-links-fmwcp">
              <Link to="/privacy-policy" className="agreement-footer-link-fmwcp">Privacy Policy</Link>
              <Link to="/contact" className="agreement-footer-link-fmwcp">Contact Support</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 