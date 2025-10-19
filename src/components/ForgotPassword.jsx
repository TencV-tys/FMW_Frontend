// components/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import NavAuth from './NavAuth';
import './styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-page">
        <NavAuth disabled="Hide" />
        <div className="forgot-password-container">
          <div className="success-message">
            <div className="success-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <h2>Check Your Email</h2>
            <p>We've sent a password reset link to:</p>
            <p className="email-display">{email}</p>
            <p className="instructions">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <div className="action-links">
              <Link to="/login" className="back-to-login">
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Login
              </Link>
            </div>
            <p className="resend-text">
              Didn't receive the email? <button 
                onClick={() => setEmailSent(false)} 
                className="resend-link"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <NavAuth disabled="Hide" />
      
      <div className="forgot-password-container">
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-header">
            <h2>Reset Your Password</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                Sending Reset Link...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEnvelope} />
                Send Reset Link
              </>
            )}
          </button>

          <div className="back-to-login-container">
            <Link to="/login" className="back-to-login">
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;