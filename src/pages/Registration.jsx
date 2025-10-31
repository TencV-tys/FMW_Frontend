import NavAuth from "../components/NavAuth";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles/Registration.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserPlus, 
  faSpinner, 
  faEye, 
  faEyeSlash, 
  faCheckCircle, 
  faTimesCircle, 
  faCircleNotch,
  faFileContract,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

// Custom hook for registration form
const useRegistrationForm = () => {
  const [state, setState] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    password: "",
    password_confirmation: "",
    agreedToTerms: false,
    isLoading: false,
    errors: {},
    touched: {},
    showPassword: false,
    showConfirmPassword: false,
    emailVerified: false,
    checkingEmail: false
  });

  const updateField = (field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: '' },
      touched: { ...prev.touched, [field]: true },
      emailVerified: field === 'email' ? false : prev.emailVerified
    }));
  };

  const setErrors = (errors) => {
    setState(prev => ({ ...prev, errors }));
  };

  const setLoading = (isLoading) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const togglePasswordVisibility = () => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const toggleConfirmPasswordVisibility = () => {
    setState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
  };

  const setEmailVerificationStatus = (verified, checking = false) => {
    setState(prev => ({ 
      ...prev, 
      emailVerified: verified, 
      checkingEmail: checking 
    }));
  };

  const setAgreedToTerms = (agreed) => {
    setState(prev => ({ ...prev, agreedToTerms: agreed }));
  };

  return {
    ...state,
    updateField,
    setErrors,
    setLoading,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    setEmailVerificationStatus,
    setAgreedToTerms
  };
};

// Enhanced validation service
const validationService = {
  validateField: (field, value, formState) => {
    const validators = {
      first_name: (val) => !val?.trim() ? 'First name is required' : '',
      last_name: (val) => !val?.trim() ? 'Last name is required' : '',
      email: (val) => {
        if (!val) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(val)) return 'Please enter a valid email address';
        return '';
      },
      password: (val) => {
        if (!val) return 'Password is required';
        if (val.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(val)) return 'Password must contain both uppercase and lowercase letters';
        return '';
      },
      password_confirmation: (val, state) => {
        if (!val) return 'Please confirm your password';
        if (val !== state.password) return 'Passwords do not match';
        return '';
      },
      agreedToTerms: (val) => !val ? 'You must agree to the terms and conditions' : ''
    };

    return validators[field] ? validators[field](value, formState) : '';
  },

  validateForm: (formState) => {
    const errors = {};
    const fields = ['first_name', 'last_name', 'email', 'password', 'password_confirmation', 'agreedToTerms'];
    
    fields.forEach(field => {
      const error = validationService.validateField(field, formState[field], formState);
      if (error) errors[field] = error;
    });

    return errors;
  }
};

// Email verification service
const emailVerificationService = {
  checkEmailAvailability: async (email) => {
    try {
      const response = await fetch(`http://localhost:8000/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return { 
          available: data.available, 
          message: data.message 
        };
      } else {
        const errorData = await response.json();
        return { 
          available: true, 
          message: errorData.error || 'Could not verify email' 
        };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        available: true, 
        message: 'Network error - could not verify email' 
      };
    }
  }
};

// API service
const registrationService = {
  register: async (userData) => {
    const response = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      data,
      status: response.status
    };
  }
};

export default function Registration() {
  const {
    first_name,
    last_name,
    email,
    gender,
    password,
    password_confirmation,
    agreedToTerms,
    isLoading,
    errors,
    touched,
    showPassword,
    showConfirmPassword,
    emailVerified,
    checkingEmail,
    updateField,
    setErrors,
    setLoading,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    setEmailVerificationStatus,
    setAgreedToTerms
  } = useRegistrationForm();

  const navigate = useNavigate();

  // Real-time email verification
  useEffect(() => {
    const verifyEmail = async () => {
      if (email && !errors.email && /\S+@\S+\.\S+/.test(email)) {
        setEmailVerificationStatus(false, true);
        
        const timer = setTimeout(async () => {
          try {
            const result = await emailVerificationService.checkEmailAvailability(email);
            setEmailVerificationStatus(result.available, false);
            
            if (!result.available && result.message) {
              setErrors({ ...errors, email: result.message });
            } else if (!result.available) {
              setErrors({ ...errors, email: 'This email is already registered' });
            }
          } catch (error) {
            console.error('Email verification failed:', error);
            setEmailVerificationStatus(true, false);
          }
        }, 800);

        return () => clearTimeout(timer);
      } else {
        setEmailVerificationStatus(false, false);
      }
    };

    verifyEmail();
  }, [email, errors.email]);

  // Real-time validation for touched fields
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validationService.validateForm({
        first_name, last_name, email, password, password_confirmation, gender, agreedToTerms
      });
      setErrors(newErrors);
    }
  }, [first_name, last_name, email, password, password_confirmation, agreedToTerms, touched]);

  const handleViewTerms = () => {
    sessionStorage.setItem('fromRegistration', 'true');
    navigate('/user-agreement', { 
      state: { from: 'registration' } 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = {
      first_name: true, 
      last_name: true, 
      email: true, 
      password: true, 
      password_confirmation: true,
      agreedToTerms: true
    };
    
    const formErrors = validationService.validateForm({
      first_name, last_name, email, password, password_confirmation, gender, agreedToTerms
    });

    setErrors(formErrors);

    if (email && !emailVerified && !checkingEmail) {
      toast.error('This email is already registered. Please use a different email.', {
        position: 'bottom-center'
      });
      return;
    }

    if (Object.keys(formErrors).length > 0) {
      toast.error('Please fix the form errors before submitting', {
        position: 'bottom-center'
      });
      return;
    }

    setLoading(true);

    try {
      const result = await registrationService.register({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        gender,
        password,
        password_confirmation
      });

      if (result.success) {
        toast.success('Account created successfully! Redirecting to login...', {
          position: 'bottom-center',
          autoClose: 1000
        });

        setTimeout(() => 
          navigate('/login?registered=success', { replace: true }), 
          1000
        );

      } else {
        handleRegistrationError(result);
      }

    } catch (error) {
      handleNetworkError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationError = (result) => {
    const { data, status } = result;
    
    const errorMessages = {
      400: data.error || 'Invalid registration data',
      409: 'Email already exists. Please use a different email address.',
      500: 'Server error. Please try again later.',
      default: data.error || data.message || 'Registration failed'
    };

    toast.error(errorMessages[status] || errorMessages.default, {
      position: 'bottom-center',
      autoClose: 4000
    });

    if (data.errors) {
      setErrors(data.errors);
    } else if (status === 409) {
      setErrors({ ...errors, email: 'This email is already registered' });
      setEmailVerificationStatus(false, false);
    }
  };

  const handleNetworkError = (error) => {
    console.error('Registration network error:', error);
    toast.error('Network error. Please check your connection and try again.', {
      position: 'bottom-center',
      autoClose: 3000
    });
  };

  const getFieldClassName = (fieldName) => {
    return `input-group ${errors[fieldName] ? 'has-error' : ''} ${touched[fieldName] && !errors[fieldName] ? 'has-success' : ''}`;
  };

  const getEmailStatusIcon = () => {
    if (!email) return null;
    
    if (checkingEmail) {
      return <FontAwesomeIcon icon={faCircleNotch} className="email-status-icon checking" />;
    } else if (emailVerified) {
      return <FontAwesomeIcon icon={faCheckCircle} className="email-status-icon verified" />;
    } else if (errors.email && touched.email) {
      return <FontAwesomeIcon icon={faTimesCircle} className="email-status-icon not-verified" />;
    }
    return null;
  };

  const getEmailStatusText = () => {
    if (!email) return null;
    
    if (checkingEmail) {
      return (
        <div className="email-verification-status checking">
          <FontAwesomeIcon icon={faCircleNotch} className="verification-icon" spin />
          Checking email availability...
        </div>
      );
    } else if (emailVerified) {
      return (
        <div className="email-verification-status verified">
          <FontAwesomeIcon icon={faCheckCircle} className="verification-icon" />
          Email is available
        </div>
      );
    } else if (errors.email && touched.email) {
      return (
        <div className="email-verification-status not-verified">
          <FontAwesomeIcon icon={faTimesCircle} className="verification-icon" />
          {errors.email}
        </div>
      );
    }
    return null;
  };

  const isFormValid = () => {
    return first_name && 
           last_name && 
           email && 
           password && 
           password_confirmation && 
           agreedToTerms && 
           emailVerified && 
           Object.keys(errors).length === 0;
  };

  return (
    <div className="registration-page">
      <NavAuth disabled="Hide" />
      
      <div className="register-form-container">
        <form className="register-container" onSubmit={handleSubmit} noValidate>
          <div className="register-header">
            <h2 className="register-title">Create Your Account</h2>
            <p className="register-subtitle">Join our community today</p>
          </div>

          {/* Name Fields */}
          <div className="name-fields">
            <div className={getFieldClassName('first_name')}>
              <input
                type="text"
                className="form-input"
                placeholder="First Name"
                name="first_name"
                value={first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                disabled={isLoading}
                autoComplete="given-name"
                aria-describedby={errors.first_name ? "first-name-error" : undefined}
              />
              {errors.first_name && (
                <span id="first-name-error" className="error-text" role="alert">
                  {errors.first_name}
                </span>
              )}
            </div>

            <div className={getFieldClassName('last_name')}>
              <input
                type="text"
                className="form-input"
                placeholder="Last Name"
                name="last_name"
                value={last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                disabled={isLoading}
                autoComplete="family-name"
                aria-describedby={errors.last_name ? "last-name-error" : undefined}
              />
              {errors.last_name && (
                <span id="last-name-error" className="error-text" role="alert">
                  {errors.last_name}
                </span>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className={getFieldClassName('email')}>
            <div className="email-input-wrapper">
              <input
                className="form-input"
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                aria-describedby={errors.email ? "email-error" : undefined}
                style={{ paddingRight: '2.5rem' }}
              />
              {getEmailStatusIcon()}
            </div>
            {getEmailStatusText()}
          </div>

          {/* Gender Field */}
          <div className="input-group">
            <select
              name="gender"
              className="form-select"
              value={gender}
              onChange={(e) => updateField('gender', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select Gender (Optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Password Field */}
          <div className={getFieldClassName('password')}>
            <div className="password-input-wrapper">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                name="password"
                value={password}
                onChange={(e) => updateField('password', e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon 
                  icon={showPassword ? faEyeSlash : faEye} 
                  className="password-toggle-icon"
                />
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className="error-text" role="alert">
                {errors.password}
              </span>
            )}
            {password && !errors.password && (
              <div className="password-strength strong">
                <FontAwesomeIcon icon={faCheckCircle} />
                Password meets requirements
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className={getFieldClassName('password_confirmation')}>
            <div className="password-input-wrapper">
              <input
                className="form-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                name="password_confirmation"
                value={password_confirmation}
                onChange={(e) => updateField('password_confirmation', e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                aria-describedby={errors.password_confirmation ? "password-confirm-error" : undefined}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon 
                  icon={showConfirmPassword ? faEyeSlash : faEye} 
                  className="password-toggle-icon"
                />
              </button>
            </div>
            {errors.password_confirmation && (
              <span id="password-confirm-error" className="error-text" role="alert">
                {errors.password_confirmation}
              </span>
            )}
            {password_confirmation && !errors.password_confirmation && (
              <div className="password-match success">
                <FontAwesomeIcon icon={faCheckCircle} />
                Passwords match
              </div>
            )}
          </div>

          {/* Terms Agreement Section */}
          <div className={`terms-agreement-section ${errors.agreedToTerms ? 'has-error' : ''} ${agreedToTerms ? 'accepted' : ''}`}>
            <div className="terms-header">
              <FontAwesomeIcon icon={faFileContract} className="terms-icon" />
              <h3>Terms & Conditions</h3>
            </div>
            
            <div className="terms-content">
              <p>
                By creating an account, you agree to our Terms of Service and Privacy Policy. 
                Please read them carefully before proceeding.
              </p>
              
              <div className="terms-highlights">
                <div className="term-highlight">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>Your data is protected and secure</span>
                </div>
               
                <div className="term-highlight">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>You must follow community guidelines</span>
                </div>
              </div>
            </div>

            <div className="terms-agreement">
              <label className="terms-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                  className="terms-checkbox-input"
                />
                <span className="custom-checkbox">
                  {agreedToTerms && <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />}
                </span>
                <span className="terms-text">
                  I have read and agree to the{' '}
                  <button 
                    type="button" 
                    className="terms-link-button"
                    onClick={handleViewTerms}
                    disabled={isLoading}
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button 
                    type="button" 
                    className="terms-link-button"
                    onClick={handleViewTerms}
                    disabled={isLoading}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              
              {errors.agreedToTerms && (
                <div className="terms-error">
                  <FontAwesomeIcon icon={faTimesCircle} />
                  {errors.agreedToTerms}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`register-button ${isLoading ? 'loading' : ''} ${!isFormValid() ? 'disabled' : ''}`}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <FontAwesomeIcon icon={faUserPlus} />
              </>
            )}
          </button>

          {/* Login Redirect */}
          <div className="auth-redirect">
            <p>Already have an account?</p>
            <Link 
              to="/login" 
              className="redirect-link"
              aria-disabled={isLoading}
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}