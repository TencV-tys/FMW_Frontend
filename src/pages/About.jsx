import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart,
  faUsers,
  faShieldAlt,
  faMapMarkerAlt,
  faHandHoldingHeart,
  faBullseye,
  faRocket,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import NavAuth from '../components/NavAuth';
import './styles/About.css';

export default function About() {
  return (
    <div className="about-page">
      <NavAuth disabled="Show" />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>About FindMyWay</h1>
          <p className="hero-subtitle">
            Connecting Communities Through Lost and Found Items
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                FindMyWay was created with a simple yet powerful mission: to help people 
                reunite with their lost belongings through community collaboration. We believe 
                that by working together, we can make our neighborhoods safer, more connected, 
                and more helpful places to live.
              </p>
              <div className="mission-stats">
                <div className="mission-stat">
                  <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                  <div>
                    <span className="stat-number">Community</span>
                    <span className="stat-label">Powered by People</span>
                  </div>
                </div>
                <div className="mission-stat">
                  <FontAwesomeIcon icon={faHandHoldingHeart} className="stat-icon" />
                  <div>
                    <span className="stat-number">Trust</span>
                    <span className="stat-label">Safe & Verified</span>
                  </div>
                </div>
                <div className="mission-stat">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="stat-icon" />
                  <div>
                    <span className="stat-number">Local</span>
                    <span className="stat-label">Location-Based</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mission-visual">
              <div className="visual-card">
                <FontAwesomeIcon icon={faHeart} className="visual-icon" />
                <h3>Community First</h3>
                <p>Built for neighbors, by neighbors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <h2>Our Story</h2>
          <div className="story-timeline">
            <div className="timeline-item">
              <div className="timeline-year">2024</div>
              <div className="timeline-content">
                <h3>The Beginning</h3>
                <p>
                  FindMyWay started as a simple idea: what if we could create a platform 
                  where neighbors could easily help each other recover lost items? 
                  Inspired by community bulletin boards but enhanced with modern technology.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">Present</div>
              <div className="timeline-content">
                <h3>Growing Community</h3>
                <p>
                  Today, FindMyWay serves hundreds of users across multiple barangays, 
                  successfully reuniting people with their valuable lost items every day. 
                  Our community continues to grow as more people discover the power of helping each other.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">Future</div>
              <div className="timeline-content">
                <h3>Expanding Reach</h3>
                <p>
                  We're working on expanding to more communities and adding new features 
                  to make lost and found even more efficient and accessible for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <FontAwesomeIcon icon={faShieldAlt} className="value-icon" />
              <h3>Trust & Safety</h3>
              <p>
                We prioritize the safety and privacy of our users. All accounts are verified 
                to ensure genuine community members.
              </p>
            </div>
            <div className="value-card">
              <FontAwesomeIcon icon={faUsers} className="value-icon" />
              <h3>Community</h3>
              <p>
                We believe in the power of community. Every successful reunion strengthens 
                the bonds between neighbors.
              </p>
            </div>
            <div className="value-card">
              <FontAwesomeIcon icon={faBullseye} className="value-icon" />
              <h3>Efficiency</h3>
              <p>
                Our location-based filtering and smart search make it easy to find relevant 
                posts quickly and efficiently.
              </p>
            </div>
            <div className="value-card">
              <FontAwesomeIcon icon={faHandHoldingHeart} className="value-icon" />
              <h3>Compassion</h3>
              <p>
                We understand the stress of losing something important. Our platform is 
                built with empathy and understanding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2>How FindMyWay Works</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create an Account</h3>
                <p>Sign up as a verified community member to access all features</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Post Your Item</h3>
                <p>Create detailed posts with photos, descriptions, and location information</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Search & Connect</h3>
                <p>Use filters to find relevant posts and contact other users directly</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Reunite & Help</h3>
                <p>Successfully return items and help build a stronger community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section (Optional - can be placeholder) */}
      <section className="team-section">
        <div className="container">
          <h2>Built for the Community</h2>
          <p className="team-description">
            FindMyWay is maintained by a dedicated team of developers and community moderators 
            who are passionate about making a positive impact in our neighborhoods.
          </p>
          <div className="team-placeholder">
            <FontAwesomeIcon icon={faUsers} className="team-icon" />
            <h3>Community Driven</h3>
            <p>Our strength comes from our users and their willingness to help each other</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Join Our Community?</h2>
          <p>Start helping your neighbors today</p>
          <div className="cta-buttons">
            <Link to="/registration" className="cta-button primary">
              <FontAwesomeIcon icon={faRocket} />
              Sign Up Now
            </Link>
            <Link to="/" className="cta-button secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>FindMyWay</h3>
              <p>Reuniting lost items with their owners since 2024</p>
            </div>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/user-agreement">Terms</Link>
              <Link to="/privacy-policy">Privacy</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 FindMyWay Community Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}