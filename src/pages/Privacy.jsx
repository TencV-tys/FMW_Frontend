import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt,
  faDatabase,
  faUserLock,
  faEye,
  faTrash,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import NavAuth from '../components/NavAuth';
import './styles/Privacy.css';

export default function Privacy() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="privacy-policy-page-fmwcp">
      <NavAuth />
      
      <div className="privacy-policy-container-fmwcp">
        {/* Header */}
        <header className="privacy-policy-header-fmwcp">
          <div className="header-content-fmwcp">
            <FontAwesomeIcon icon={faShieldAlt} className="header-icon-fmwcp" />
            <h1>Privacy Policy</h1>
            <p>Last Updated: {currentDate}</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="privacy-policy-content-fmwcp">
          <div className="policy-card-fmwcp">
            {/* Introduction */}
            <section className="policy-section-fmwcp">
              <h2>1. Introduction</h2>
              <p>
                Welcome to FindMyWay Community Portal. We are committed to protecting your privacy 
                and ensuring the security of your personal information. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="policy-section-fmwcp">
              <h2>
                <FontAwesomeIcon icon={faDatabase} />
                2. Information We Collect
              </h2>
              
              <div className="info-categories-fmwcp">
                <div className="info-category-fmwcp">
                  <h3>Personal Information</h3>
                  <ul>
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Gender (optional)</li>
                    <li>Profile information</li>
                  </ul>
                </div>
                
                <div className="info-category-fmwcp">
                  <h3>Post Information</h3>
                  <ul>
                    <li>Lost/Found item descriptions</li>
                    <li>Location data (barangay, purok)</li>
                    <li>Contact information for item recovery</li>
                    <li>Photos of items (optional)</li>
                  </ul>
                </div>
                
                <div className="info-category-fmwcp">
                  <h3>Technical Information</h3>
                  <ul>
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Usage statistics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="policy-section-fmwcp">
              <h2>3. How We Use Your Information</h2>
              <div className="usage-grid-fmwcp">
                <div className="usage-item-fmwcp">
                  <FontAwesomeIcon icon={faUserLock} />
                  <h4>Account Management</h4>
                  <p>Create and maintain your user account</p>
                </div>
                <div className="usage-item-fmwcp">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <h4>Platform Security</h4>
                  <p>Protect against fraud and abuse</p>
                </div>
                <div className="usage-item-fmwcp">
                  <FontAwesomeIcon icon={faEye} />
                  <h4>Service Operation</h4>
                  <p>Facilitate lost and found item matching</p>
                </div>
                <div className="usage-item-fmwcp">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <h4>Support</h4>
                  <p>Provide customer support and assistance</p>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="policy-section-fmwcp">
              <h2>4. Data Sharing & Disclosure</h2>
              <p>We do not sell your personal information to third parties. We may share information only in these circumstances:</p>
              
              <div className="sharing-categories-fmwcp">
                <div className="sharing-category-fmwcp">
                  <h4>With Other Users</h4>
                  <ul>
                    <li>Your name and contact information when you post items</li>
                    <li>Location information for item matching</li>
                  </ul>
                </div>
                
                <div className="sharing-category-fmwcp">
                  <h4>Legal Requirements</h4>
                  <ul>
                    <li>When required by law or legal process</li>
                    <li>To protect our rights and safety</li>
                    <li>To prevent fraud or security issues</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section className="policy-section-fmwcp">
              <h2>5. Data Retention</h2>
              <p>We retain your personal information only for as long as necessary to:</p>
              <ul>
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p>You can request deletion of your account and associated data at any time.</p>
            </section>

            {/* Your Rights */}
            <section className="policy-section-fmwcp">
              <h2>6. Your Rights</h2>
              <div className="rights-grid-fmwcp">
                <div className="right-item-fmwcp">
                  <FontAwesomeIcon icon={faEye} />
                  <h4>Right to Access</h4>
                  <p>View the personal data we hold about you</p>
                </div>
                <div className="right-item-fmwcp">
                  <FontAwesomeIcon icon={faTrash} />
                  <h4>Right to Delete</h4>
                  <p>Request deletion of your personal data</p>
                </div>
                <div className="right-item-fmwcp">
                  <FontAwesomeIcon icon={faUserLock} />
                  <h4>Right to Control</h4>
                  <p>Control how your information is shared</p>
                </div>
                <div className="right-item-fmwcp">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <h4>Right to Information</h4>
                  <p>Know how your data is being used</p>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="policy-section-fmwcp">
              <h2>7. Security Measures</h2>
              <p>We implement appropriate security measures to protect your personal information, including:</p>
              <ul>
                <li>Encryption of sensitive data</li>
                <li>Secure server infrastructure</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section className="policy-section-fmwcp">
              <h2>8. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="contact-info-fmwcp">
                <p><strong>Email:</strong> privacy@findmyway.com</p>
                <p><strong>Support:</strong> support@findmyway.com</p>
                <Link to="/contact" className="contact-link-fmwcp">Contact Form</Link>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="policy-section-fmwcp">
              <h2>9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>
          </div>
        </div>

        {/* UNIQUE FOOTER - Centered for desktop */}
        <footer className="privacy-policy-footer-fmwcp-unique">
          <div className="privacy-footer-content-fmwcp">
            <p>By using FindMyWay Community Portal, you agree to the terms of this Privacy Policy.</p>
            <div className="privacy-footer-links-fmwcp">
              <Link to="/user-agreement" className="privacy-footer-link-fmwcp">Terms of Service</Link>
              <Link to="/contact" className="privacy-footer-link-fmwcp">Contact Support</Link>
              <Link to="/" className="privacy-footer-link-fmwcp">Back to Home</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  ); 
} 