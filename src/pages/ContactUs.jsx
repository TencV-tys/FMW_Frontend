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
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import NavAuth from '../components/NavAuth';
import './styles/ContactUs.css';
import { useWifiUrl } from '../hooks/useWifiUrl';

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
  const [error, setError] = useState('');
  const wifi = useWifiUrl();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`${wifi}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
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
      } else {
        setSubmitStatus('error');
        setError(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-us-page-fmwcp">
      <NavAuth />
      
      <div className="contact-us-container-fmwcp">
        {/* Header */}
        <header className="contact-us-header-fmwcp">
          <div className="header-content-fmwcp">
            <div className="header-icon-container-fmwcp">
              <FontAwesomeIcon icon={faEnvelope} className="header-icon-fmwcp" />
            </div>
            <h1>Contact FindMyWay Community Portal</h1>
            <p>We're here to help! Get in touch with our support team</p>
          </div>
        </header>

        <div className="contact-us-content-fmwcp">
          {/* Contact Information */}
          <div className="contact-info-section-fmwcp">
            <div className="contact-info-card-fmwcp">
              <h2>Get in Touch</h2>
              <p>Have questions or need assistance? We're here to help you.</p>
              
              <div className="contact-methods-fmwcp">
                <div className="contact-method-fmwcp">
                  <FontAwesomeIcon icon={faEnvelope} className="method-icon-fmwcp" />
                  <div className="method-info-fmwcp">
                    <h4>Email Us</h4>
                    <p>afmw203@gmail.com</p>
                    <span>We'll respond within 24 hours</span>
                  </div>
                </div>
                
                <div className="contact-method-fmwcp">
                  <FontAwesomeIcon icon={faPhone} className="method-icon-fmwcp" />
                  <div className="method-info-fmwcp">
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                    <span>Mon-Fri, 9AM-6PM</span>
                  </div>
                </div>
                
                <div className="contact-method-fmwcp">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="method-icon-fmwcp" />
                  <div className="method-info-fmwcp">
                    <h4>Visit Us</h4>
                    <p>San Antonio Poruk 1</p>
                    <span>Trinidad, Panab-an</span>
                  </div>
                </div>
                
                <div className="contact-method-fmwcp">
                  <FontAwesomeIcon icon={faClock} className="method-icon-fmwcp" />
                  <div className="method-info-fmwcp">
                    <h4>Response Time</h4>
                    <p>24-48 Hours</p>
                    <span>For all inquiries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section-fmwcp">
            <div className="contact-form-card-fmwcp">
              <h2>Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="success-message-fmwcp">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <div>
                    <h4>Message Sent Successfully!</h4>
                    <p>Thank you for contacting us. We'll get back to you soon.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="error-message-fmwcp">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <div>
                    <h4>Failed to Send Message</h4>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form-fmwcp">
                <div className="form-row-fmwcp">
                  <div className="form-group-fmwcp">
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
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="form-group-fmwcp">
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group-fmwcp">
                  <label htmlFor="category">Inquiry Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="account">Account Issues</option>
                    <option value="report">Report a Problem</option>
                    <option value="suggestion">Feature Suggestion</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div className="form-group-fmwcp">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Brief description of your inquiry"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group-fmwcp">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Please provide detailed information about your inquiry..."
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-button-fmwcp"
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
        <section className="faq-section-fmwcp">
          <div className="faq-container-fmwcp">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid-fmwcp">
              <div className="faq-item-fmwcp">
                <h4>How do I report a lost item?</h4>
                <p>Create an account, go to the bulletin board, and click "Create Post" to report a lost item with details and photos.</p>
              </div>
              
              <div className="faq-item-fmwcp">
                <h4>Is my personal information safe?</h4>
                <p>Yes, we take privacy seriously. Your contact information is only shared when necessary for item recovery.</p>
              </div>
              
              <div className="faq-item-fmwcp">
                <h4>Can I edit or remove my posts?</h4>
                <p>Yes, you can edit or delete your posts at any time from your dashboard. Posts remain active until you remove them.</p>
              </div>
            </div>
          </div>
        </section>

        {/* UNIQUE FOOTER - Centered for desktop */}
        <footer className="contact-us-footer-fmwcp-unique">
          <div className="contact-footer-content-fmwcp">
            <p className="contact-footer-notice-fmwcp">
              Need immediate assistance? Check our <Link to="/user-agreement">Help Center</Link> for quick answers.
            </p>
            <div className="contact-footer-links-fmwcp">
              <Link to="/user-agreement" className="contact-footer-link-fmwcp">Terms of Service</Link>
              <Link to="/privacy-policy" className="contact-footer-link-fmwcp">Privacy Policy</Link>
              <Link to="/" className="contact-footer-link-fmwcp">Back to Home</Link>
            </div>
          </div> 
        </footer>
      </div>
    </div>
  );
}