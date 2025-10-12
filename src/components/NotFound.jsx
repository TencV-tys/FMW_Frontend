import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './styles/NotFound.css';

export default function NotFound() {
  return (
    <section className="not-found-container">
      <div className="not-found-content">
        {/* Error Icon */}
        <div className="error-icon">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>

        {/* Error Message */}
        <div className="error-message">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
        </div>

        {/* Simple Action Buttons */}
        <div className="error-actions">
          <button 
            onClick={() => window.history.back()} 
            className="action-btn primary"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Go Back
          </button>
          <Link to="/" className="action-btn secondary">
            <FontAwesomeIcon icon={faHome} />
            Home Page
          </Link>
        </div>
      </div>
    </section>
  );
}