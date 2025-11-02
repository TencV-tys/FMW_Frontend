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
    <div className="landing-page-fmw">
      <NavAuth disabled="Show-fmw"/>
      
      {/* Hero Section */}
      <section className="hero-section-fmw">
        <div className="hero-content-fmw">
          <div className="hero-text-fmw">
            <h1>Find What's Lost, Return What's Found</h1>
            <p className="hero-subtitle-fmw">
              Your community-driven platform for reuniting lost items with their owners. 
              Join thousands of neighbors helping each other every day.
            </p>
            <div className="hero-stats-fmw">
              <div className="stat-fmw">
                <span className="stat-number-fmw">1,000+</span>
                <span className="stat-label-fmw">Items Reunited</span>
              </div>
              <div className="stat-fmw">
                <span className="stat-number-fmw">500+</span>
                <span className="stat-label-fmw">Active Users</span>
              </div>
              <div className="stat-fmw">
                <span className="stat-number-fmw">95%</span>
                <span className="stat-label-fmw">Success Rate</span>
              </div>
            </div>
            <div className="hero-actions-fmw">
              <Link to="/registration" className="cta-button-fmw primary-fmw">
                Get Started
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/login" className="cta-button-fmw secondary-fmw">
                Already a Member?
              </Link>
            </div>
          </div>
          <div className="hero-visual-fmw">
            <div className="floating-cards-fmw">
              <div className="card-fmw lost-fmw">
                <FontAwesomeIcon icon={faSearch} />
                <span>Lost Something?</span>
              </div>
              <div className="card-fmw found-fmw">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <span>Found an Item?</span>
              </div>
              <div className="card-fmw community-fmw">
                <FontAwesomeIcon icon={faUsers} />
                <span>Community Help</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-fmw">
        <div className="container-fmw">
          <h2>How FindMyWay Works</h2>
          <div className="steps-grid-fmw">
            <div className="step-fmw">
              <div className="step-icon-fmw">
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <h3>1. Post Your Item</h3>
              <p>Create a detailed post about your lost or found item with photos and location</p>
            </div>
            <div className="step-fmw">
              <div className="step-icon-fmw">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <h3>2. Smart Matching</h3>
              <p>Our system helps match lost and found items based on location and descriptions</p>
            </div>
            <div className="step-fmw">
              <div className="step-icon-fmw">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
              </div>
              <h3>3. Connect & Reunite</h3>
              <p>Contact the poster directly through provided contact information</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-fmw">
        <div className="container-fmw">
          <h2>Why Choose FindMyWay?</h2>
          <div className="features-grid-fmw">
            <div className="feature-fmw">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="feature-icon-fmw" />
              <h3>Location-Based</h3>
              <p>Search and filter by barangay and purok to find items in your area</p>
            </div>
            <div className="feature-fmw">
              <FontAwesomeIcon icon={faShieldAlt} className="feature-icon-fmw" />
              <h3>Secure & Verified</h3>
              <p>All users are verified community members ensuring safe interactions</p>
            </div>
            <div className="feature-fmw">
              <FontAwesomeIcon icon={faUsers} className="feature-icon-fmw" />
              <h3>Community Driven</h3>
              <p>Powered by real people helping each other in the community</p>
            </div>
            <div className="feature-fmw">
              <FontAwesomeIcon icon={faCheckCircle} className="feature-icon-fmw" />
              <h3>Easy to Use</h3>
              <p>Simple interface designed for everyone regardless of tech experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-fmw">
        <div className="container-fmw">
          <h2>Ready to Help Your Community?</h2>
          <p>Join FindMyWay today and start making a difference</p>
          <div className="cta-buttons-fmw">
            <Link to="/registration" className="cta-button-fmw primary-fmw large-fmw">
              Create Your Account
            </Link>
            <Link to="/login" className="cta-button-fmw secondary-fmw large-fmw">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-fmw">
        <div className="container-fmw">
          <div className="footer-content-fmw">
            <div className="footer-brand-fmw">
              <h3>FindMyWay</h3>
              <p>Connecting communities through lost and found items</p>
            </div>
            <div className="footer-links-fmw">
              <Link to="/user-agreement">Terms of Service</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
          <div className="footer-bottom-fmw">
            <p>&copy; 2024 FindMyWay Community Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 