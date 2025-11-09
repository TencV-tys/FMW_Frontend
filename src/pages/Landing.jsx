import NavAuth from "../components/NavAuth"; 
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faHandHoldingHeart, 
  faUsers,
  faShieldAlt,
  faMapMarkerAlt,
  faArrowRight,
  faBullhorn,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './styles/Landing.css';

export default function Landing() {
  return (
    <div className="landing-page-fmwcp">
      <NavAuth disabled="Show-fmwcp"/>
      
      {/* Hero Section */}
      <section className="hero-section-fmwcp">
        <div className="hero-content-fmwcp">
          <div className="hero-text-fmwcp">
            <h1>Find What's Lost, Return What's Found</h1>
            <p className="hero-subtitle-fmwcp">
              Your community-driven platform for reuniting lost items with their owners. 
              Join thousands of neighbors helping each other every day.
            </p>
            <div className="hero-stats-fmwcp">
              <div className="stat-fmwcps">
                <span className="stat-number-fmwcps">1,000+</span>
                <span className="stat-label-fmwcps">Items Reunited</span>
              </div>
              <div className="stat-fmwcps">
                <span className="stat-number-fmwcps">500+</span>
                <span className="stat-label-fmwcps">Active Users</span>
              </div>
              <div className="stat-fmwcps">
                <span className="stat-number-fmwcps">95%</span>
                <span className="stat-label-fmwcps">Success Rate</span>
              </div>
            </div> 
            <div className="hero-actions-fmwcp">
              <Link to="/registration" className="cta-button-fmwcp primary-fmwcp">
                Get Started
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/login" className="cta-button-fmwcp secondary-fmwcp">
                Already a Member?
              </Link>
            </div>
          </div>
          <div className="hero-visual-fmwcp">
            <div className="floating-cards-fmwcp">
              <div className="card-fmwcp lost-fmwcp">
                <FontAwesomeIcon icon={faSearch} />
                <span>Lost Something?</span>
              </div>
              <div className="card-fmwcp found-fmwcp">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <span>Found an Item?</span>
              </div>
              <div className="card-fmwcp community-fmwcp">
                <FontAwesomeIcon icon={faUsers} />
                <span>Community Help</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-fmwcp">
        <div className="container-fmwcp">
          <h2>How FindMyWay Community Portal Works</h2>
          <div className="steps-grid-fmwcp">
            <div className="step-fmwcp">
              <div className="step-icon-fmwcp">
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <h3>1. Post Your Item</h3>
              <p>Create a detailed post about your lost or found item with photos and location</p>
            </div>
            <div className="step-fmwcp">
              <div className="step-icon-fmwcp">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <h3>2. Smart Matching</h3>
              <p>Our system helps match lost and found items based on location and descriptions</p>
            </div>
            <div className="step-fmwcp">
              <div className="step-icon-fmwcp">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
              </div>
              <h3>3. Connect & Reunite</h3>
              <p>Contact the poster directly through provided contact information</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-fmwcp">
        <div className="container-fmwcp">
          <h2>Why Choose FindMyWay Community Portal?</h2>
          <div className="features-grid-fmwcp">
            <div className="feature-fmwcp">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="feature-icon-fmwcp" />
              <h3>Location-Based</h3>
              <p>Search and filter by barangay and purok to find items in your area</p>
            </div>
            <div className="feature-fmwcp">
              <FontAwesomeIcon icon={faShieldAlt} className="feature-icon-fmwcp" />
              <h3>Secure & Verified</h3>
              <p>All users are verified community members ensuring safe interactions</p>
            </div>
            <div className="feature-fmwcp">
              <FontAwesomeIcon icon={faUsers} className="feature-icon-fmwcp" />
              <h3>Community Driven</h3>
              <p>Powered by real people helping each other in the community</p>
            </div>
            <div className="feature-fmwcp">
              <FontAwesomeIcon icon={faCheckCircle} className="feature-icon-fmwcp" />
              <h3>Easy to Use</h3>
              <p>Simple interface designed for everyone regardless of tech experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-fmwcp">
        <div className="container-fmwcp">
          <h2>Ready to Help Your Community?</h2>
          <p>Join FindMyWay Community Portal today and start making a difference</p>
          <div className="cta-buttons-fmwcp">
            <Link to="/registration" className="cta-button-fmwcp primary-fmwcp large-fmwcp">
              Create Your Account
            </Link>
            <Link to="/login" className="cta-button-fmwcp secondary-fmwcp large-fmwcp">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
    <footer className="landing-footer-fmwcp-unique">
  <div className="container-fmwcp">
    <div className="landing-footer-content-fmwcp">
      <div className="landing-footer-brand-fmwcp">
        <h3>FindMyWay Community Portal</h3>
        <p>Connecting communities through lost and found items</p>
      </div>
      <div className="landing-footer-links-fmwcp">
        <Link to="/user-agreement" className="landing-footer-link-fmwcp">Terms of Service</Link>
        <Link to="/privacy-policy" className="landing-footer-link-fmwcp">Privacy Policy</Link>
        <Link to="/contact" className="landing-footer-link-fmwcp">Contact Us</Link>
      </div>
    </div>
    <div className="landing-footer-bottom-fmwcp">
      <p>&copy; 2025 FindMyWay Community Portal. All rights reserved.</p>
    </div>
  </div>
</footer>
    </div>
  );
}