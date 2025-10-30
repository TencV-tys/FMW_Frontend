import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faUser,
  faPaperPlane,
  faArrowLeft,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import NavAuth from '../components/NavAuth';
import './styles/ContactUs.css';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  return (
    <div className="contact-us-page">
      <NavAuth disabled="Show" />
      
      <div className="contact-us-container">
        {/* Header */}
        <header className="contact-us-header">
          <Link to="/" className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Home
          </Link>
          <div className="header-content">
            <FontAwesomeIcon icon={faEnvelope} className="header-icon" />
            <h1>Contact Us</h1>
            <p>We're here to help! Get in touch with our support team</p>
          </div>
        </header>

        <div className="contact-us-content">
          {/* Contact Information */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <h2>Get in Touch</h2>
              <p>Have questions or need assistance? We're here to help you.</p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <FontAwesomeIcon icon={faEnvelope} className="method-icon" />
                  <div className="method-info">
                    <h4>Email Us</h4>
                    <p>afmw203@gmail.com</p>
                    <span>We'll respond within 24 hours</span>
                  </div>
                </div>
                
                <div className="contact-method">
                  <FontAwesomeIcon icon={faPhone} className="method-icon" />
                  <div className="method-info">
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                    <span>Mon-Fri, 9AM-6PM</span>
                  </div>
                </div>
                
                <div className="contact-method">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="method-icon" />
                  <div className="method-info">
                    <h4>Visit Us</h4>
                    <p>San Antonio Poruk 1</p>
                    <span>Trinidad, Panab-an </span>
                  </div>
                </div>
                
                <div className="contact-method">
                  <FontAwesomeIcon icon={faClock} className="method-icon" />
                  <div className="method-info">
                    <h4>Response Time</h4>
                    <p>24-48 Hours</p>
                    <span>For all inquiries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="contact-form-card">
              <h2>Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="success-message">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <div>
                    <h4>Message Sent Successfully!</h4>
                    <p>Thank you for contacting us. We'll get back to you soon.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Inquiry Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="account">Account Issues</option>
                    <option value="report">Report a Problem</option>
                    <option value="suggestion">Feature Suggestion</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Please provide detailed information about your inquiry..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} spin />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="faq-container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>How do I report a lost item?</h4>
                <p>Create an account, go to the bulletin board, and click "Create Post" to report a lost item with details and photos.</p>
              </div>
              
              <div className="faq-item">
                <h4>Is my personal information safe?</h4>
                <p>Yes, we take privacy seriously. Your contact information is only shared when necessary for item recovery.</p>
              </div>
              
              <div className="faq-item">
                <h4>How long are posts kept active?</h4>
                <p>Posts remain active for 30 days. You can renew them if the item hasn't been found yet.</p>
              </div>
              
              <div className="faq-item">
                <h4>Can I delete my account?</h4>
                <p>Yes, you can delete your account anytime from your profile settings. All your data will be removed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="contact-us-footer">
          <div className="footer-content">
            <p>Need immediate assistance? Check our <Link to="/user-agreement">Help Center</Link> for quick answers.</p>
            <div className="footer-links">
              <Link to="/user-agreement">Terms of Service</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/">Back to Home</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}