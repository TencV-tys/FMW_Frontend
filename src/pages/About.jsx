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
    <div className="about-page-fmwcp">
      <NavAuth disabled="Show-fmwcp" />
      
      {/* Hero Section */}
      <section className="about-hero-fmwcp">
        <div className="container-fmwcp">
          <h1>About FindMyWay Community Portal</h1>
          <p className="hero-subtitle-fmwcp">
            Connecting Communities Through Lost and Found Items
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section-fmwcp">
        <div className="container-fmwcp">
          <div className="mission-content-fmwcp">
            <div className="mission-text-fmwcp">
              <h2>Our Mission</h2>
              <p>
                FindMyWay Community Portal was created with a simple yet powerful mission: to help people 
                reunite with their lost belongings through community collaboration. We believe 
                that by working together, we can make our neighborhoods safer, more connected, 
                and more helpful places to live.
              </p>
              <div className="mission-stats-fmwcp">
                <div className="mission-stat-fmwcp">
                  <FontAwesomeIcon icon={faUsers} className="stat-icon-fmwcp" />
                  <div>
                    <span className="stat-number-fmwcp">Community</span>
                    <span className="stat-label-fmwcp">Powered by People</span>
                  </div>
                </div>
                <div className="mission-stat-fmwcp">
                  <FontAwesomeIcon icon={faHandHoldingHeart} className="stat-icon-fmwcp" />
                  <div>
                    <span className="stat-number-fmwcp">Trust</span>
                    <span className="stat-label-fmwcp">Safe & Verified</span>
                  </div>
                </div>
                <div className="mission-stat-fmwcp">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="stat-icon-fmwcp" />
                  <div>
                    <span className="stat-number-fmwcp">Local</span>
                    <span className="stat-label-fmwcp">Location-Based</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mission-visual-fmwcp">
              <div className="visual-card-fmwcp">
                <FontAwesomeIcon icon={faHeart} className="visual-icon-fmwcp" />
                <h3>Community First</h3>
                <p>Built for neighbors, by neighbors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section-fmwcp">
        <div className="container-fmwcp">
          <h2>Our Story</h2>
          <div className="story-timeline-fmwcp">
            <div className="timeline-item-fmwcp">
              <div className="timeline-year-fmwcp">2024</div>
              <div className="timeline-content-fmwcp">
                <h3>The Beginning</h3>
                <p>
                  FindMyWay Community Portal started as a simple idea: what if we could create a platform 
                  where neighbors could easily help each other recover lost items? 
                  Inspired by community bulletin boards but enhanced with modern technology.
                </p>
              </div>
            </div>
            <div className="timeline-item-fmwcp">
              <div className="timeline-year-fmwcp">Present</div>
              <div className="timeline-content-fmwcp">
                <h3>Growing Community</h3>
                <p>
                  Today, FindMyWay Community Portal serves hundreds of users across multiple barangays, 
                  successfully reuniting people with their valuable lost items every day. 
                  Our community continues to grow as more people discover the power of helping each other.
                </p>
              </div>
            </div>
            <div className="timeline-item-fmwcp">
              <div className="timeline-year-fmwcp">Future</div>
              <div className="timeline-content-fmwcp">
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
      <section className="values-section-fmwcp">
        <div className="container-fmwcp">
          <h2>Our Values</h2>
          <div className="values-grid-fmwcp">
            <div className="value-card-fmwcp">
              <FontAwesomeIcon icon={faShieldAlt} className="value-icon-fmwcp" />
              <h3>Trust & Safety</h3>
              <p>
                We prioritize the safety and privacy of our users. All accounts are verified 
                to ensure genuine community members.
              </p>
            </div>
            <div className="value-card-fmwcp">
              <FontAwesomeIcon icon={faUsers} className="value-icon-fmwcp" />
              <h3>Community</h3>
              <p>
                We believe in the power of community. Every successful reunion strengthens 
                the bonds between neighbors.
              </p>
            </div>
            <div className="value-card-fmwcp">
              <FontAwesomeIcon icon={faBullseye} className="value-icon-fmwcp" />
              <h3>Efficiency</h3>
              <p>
                Our location-based filtering and smart search make it easy to find relevant 
                posts quickly and efficiently.
              </p>
            </div>
            <div className="value-card-fmwcp">
              <FontAwesomeIcon icon={faHandHoldingHeart} className="value-icon-fmwcp" />
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
      <section className="how-it-works-section-fmwcp">
        <div className="container-fmwcp">
          <h2>How FindMyWay Community Portal Works</h2>
          <div className="process-steps-fmwcp">
            <div className="process-step-fmwcp">
              <div className="step-number-fmwcp">1</div>
              <div className="step-content-fmwcp">
                <h3>Create an Account</h3>
                <p>Sign up as a verified community member to access all features</p>
              </div>
            </div>
            <div className="process-step-fmwcp">
              <div className="step-number-fmwcp">2</div>
              <div className="step-content-fmwcp">
                <h3>Post Your Item</h3>
                <p>Create detailed posts with photos, descriptions, and location information</p>
              </div>
            </div>
            <div className="process-step-fmwcp">
              <div className="step-number-fmwcp">3</div>
              <div className="step-content-fmwcp">
                <h3>Search & Connect</h3>
                <p>Use filters to find relevant posts and contact other users directly</p>
              </div>
            </div>
            <div className="process-step-fmwcp">
              <div className="step-number-fmwcp">4</div>
              <div className="step-content-fmwcp">
                <h3>Reunite & Help</h3>
                <p>Successfully return items and help build a stronger community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section-fmwcp">
        <div className="container-fmwcp">
          <h2>Built for the Community</h2>
          <p className="team-description-fmwcp">
            FindMyWay Community Portal is maintained by a dedicated team of developers and community moderators 
            who are passionate about making a positive impact in our neighborhoods.
          </p>
          <div className="team-placeholder-fmwcp">
            <FontAwesomeIcon icon={faUsers} className="team-icon-fmwcp" />
            <h3>Community Driven</h3>
            <p>Our strength comes from our users and their willingness to help each other</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-fmwcp">
        <div className="container-fmwcp">
          <h2>Ready to Join Our Community?</h2>
          <p>Start helping your neighbors today</p>
          <div className="cta-buttons-fmwcp">
            <Link to="/registration" className="cta-button-fmwcp primary-fmwcp">
              <FontAwesomeIcon icon={faRocket} />
              Sign Up Now
            </Link>
            <Link to="/" className="cta-button-fmwcp secondary-fmwcp">
              Learn More
            </Link>
          </div>
        </div>
      </section> 

      {/* Footer */}
    <footer className="about-footer-fmwcp-unique">
  <div className="container-fmwcp">
    <div className="about-footer-content-fmwcp">
      <div className="about-footer-brand-fmwcp">
        <h3>FindMyWay Community Portal</h3>
        <p>Reuniting lost items with their owners since 2024</p>
      </div>
      <div className="about-footer-links-fmwcp">
        <Link to="/" className="about-footer-link-fmwcp">Home</Link>
        <Link to="/user-agreement" className="about-footer-link-fmwcp">Terms</Link>
        <Link to="/privacy-policy" className="about-footer-link-fmwcp">Privacy</Link>
        <Link to="/contact" className="about-footer-link-fmwcp">Contact</Link>
      </div>
    </div>
    <div className="about-footer-bottom-fmwcp">
      <p>&copy; 2025 FindMyWay Community Portal. All rights reserved.</p>
    </div>
  </div>
</footer>
    </div>
  );
}