// components/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import NavAuth from './NavAuth';
import './styles/ForgotPassword.css';
import {useWifiUrl} from '../hooks/useWifiUrl';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const wifi = useWifiUrl();
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
      const response = await fetch(`${wifi}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      <div className="forgot-pw-page">
        <NavAuth disabled="Hide" />
        <div className="forgot-pw-container">
          <div className="forgot-pw-success">
            <div className="forgot-pw-success-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <h2 className="forgot-pw-success-title">Check Your Email</h2>
            <p className="forgot-pw-success-text">We've sent a password reset link to:</p>
            <p className="forgot-pw-email">{email}</p>
            <p className="forgot-pw-instructions">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <div className="forgot-pw-actions">
              <Link to="/login" className="forgot-pw-back-link">
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Login
              </Link>
            </div>
            <p className="forgot-pw-resend">
              Didn't receive the email? <button 
                onClick={() => setEmailSent(false)} 
                className="forgot-pw-resend-btn"
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
    <div className="forgot-pw-page">
      <NavAuth disabled="Hide" />
      
      <div className="forgot-pw-container">
        <form onSubmit={handleSubmit} className="forgot-pw-form">
          <div className="forgot-pw-header">
            <h2 className="forgot-pw-title">Reset Your Password</h2>
            <p className="forgot-pw-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <div className="forgot-pw-input-group">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              required
              className="forgot-pw-input"
            />
          </div>

          <button 
            type="submit" 
            className={`forgot-pw-submit-btn ${isLoading ? 'forgot-pw-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="forgot-pw-spinner" />
                Sending Reset Link...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEnvelope} />
                Send Reset Link
              </>
            )}
          </button>

          <div className="forgot-pw-footer">
            <Link to="/login" className="forgot-pw-back-link">
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