// components/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faEye, faEyeSlash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import NavAuth from './NavAuth';
import './styles/ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
   const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

      const wifi = isLocalhost 
  ? 'http://localhost:8000' 
  : 'http://192.168.1.27:8000';

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsVerifying(false);
        toast.error('Invalid reset link');
        return;
      }

      try {
        const response = await fetch(`${wifi}/auth/verify-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        
        if (data.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          toast.error(data.error || 'Invalid or expired reset link');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setTokenValid(false);
        toast.error('Network error verifying reset link');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.password_confirmation) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${wifi}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login?reset=success');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="reset-password-page">
        <NavAuth disabled="Hide" />
        <div className="reset-password-container">
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} className="spinner large" />
            <h2>Verifying Reset Link...</h2>
            <p>Please wait while we verify your reset link.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <NavAuth disabled="Hide" />
        <div className="reset-password-container">
          <div className="error-state">
            <h2>Invalid Reset Link</h2>
            <p>The password reset link is invalid or has expired.</p>
            <p>Please request a new reset link from the login page.</p>
            <button 
              onClick={() => navigate('/forgot-password')}
              className="request-new-link"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <NavAuth disabled="Hide" />
      
      <div className="reset-password-container">
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-header">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h2>Create New Password</h2>
            <p>Enter your new password below.</p>
          </div>

          <div className="input-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="New password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="input-group">
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                placeholder="Confirm new password"
                value={formData.password_confirmation}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                Resetting Password...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faLock} />
                Reset Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;