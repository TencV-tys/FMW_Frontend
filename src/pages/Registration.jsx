import NavAuth from "../components/NavAuth";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
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
import {useWifiUrl} from '../hooks/useWifiUrl';
import { useCustomToast, CustomToastContainer } from '../components/CustomToast';

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
    checkingEmail: false,
    formMounted: false
  });

  const updateField = useCallback((field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: '' },
      touched: { ...prev.touched, [field]: true },
      emailVerified: field === 'email' ? false : prev.emailVerified
    }));
  }, []);

  const setErrors = useCallback((errors) => {
    setState(prev => ({ ...prev, errors }));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
  }, []);

  const setEmailVerificationStatus = useCallback((verified, checking = false) => {
    setState(prev => ({ 
      ...prev, 
      emailVerified: verified, 
      checkingEmail: checking 
    }));
  }, []);

  const setAgreedToTerms = useCallback((agreed) => {
    setState(prev => ({ ...prev, agreedToTerms: agreed }));
  }, []);

  const setFormMounted = useCallback((mounted) => {
    setState(prev => ({ ...prev, formMounted: mounted }));
  }, []);

  return {
    ...state,
    updateField,
    setErrors,
    setLoading,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    setEmailVerificationStatus,
    setAgreedToTerms,
    setFormMounted
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
    formMounted,
    updateField,
    setErrors,
    setLoading,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    setEmailVerificationStatus,
    setAgreedToTerms,
    setFormMounted
  } = useRegistrationForm();
 
  // Use the custom toast hook correctly
  const { toasts, removeToast, toast } = useCustomToast();
  const navigate = useNavigate();
  const wifi = useWifiUrl();

  // Set form mounted for animations
  useEffect(() => {
    setFormMounted(true);
  }, [setFormMounted]);

  // Email verification service
  const emailVerificationService = {
    checkEmailAvailability: async (email) => {
      try {
        const response = await fetch(`${wifi}/auth/check-email?email=${encodeURIComponent(email)}`, {
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
            available: false, 
            message: errorData.error || 'Could not verify email' 
          };
        }
      } catch (error) {
        console.error('Email verification error:', error);
        return { 
          available: false, 
          message: 'Network error - could not verify email' 
        };
      }
    }
  };

  // API service
  const registrationService = {
    register: async (userData) => {
      const response = await fetch(`${wifi}/auth/register`, {
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

  // Real-time email verification
  useEffect(() => {
    const verifyEmail = async () => {
      if (email && !errors.email && /\S+@\S+\.\S+/.test(email)) {
        setEmailVerificationStatus(false, true);
        
        const timer = setTimeout(async () => {
          try {
            const result = await emailVerificationService.checkEmailAvailability(email);
            setEmailVerificationStatus(result.available, false);
            
            if (!result.available) {
              setErrors(prev => ({ 
                ...prev, 
                email: result.message || 'This email is already registered' 
              }));
            } else {
              setErrors(prev => ({ ...prev, email: '' }));
            }
          } catch (error) {
            console.error('Email verification failed:', error);
            setEmailVerificationStatus(false, false);
          }
        }, 800);

        return () => clearTimeout(timer);
      } else {
        setEmailVerificationStatus(false, false);
      }
    };

    verifyEmail();
  }, [email, errors.email, setEmailVerificationStatus, setErrors]);

  // Real-time validation only for touched fields
  useEffect(() => {
    const newErrors = {};
    
    // Only validate fields that have been touched
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        const error = validationService.validateField(
          field, 
          { first_name, last_name, email, password, password_confirmation, agreedToTerms }[field],
          { first_name, last_name, email, password, password_confirmation, agreedToTerms }
        );
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
  }, [first_name, last_name, email, password, password_confirmation, agreedToTerms, touched, setErrors]);

  const handleViewTerms = () => {
    sessionStorage.setItem('fromRegistration', 'true');
    navigate('/user-agreement', { 
      state: { from: 'registration' } 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // PREVENT DUPLICATE CLICKS
    if (isLoading) {
      return;
    }
    
    // Mark all fields as touched when submitting
    const newTouched = {
      first_name: true, 
      last_name: true, 
      email: true, 
      password: true, 
      password_confirmation: true,
      agreedToTerms: true
    };
    
    // Validate all fields on submit
    const formErrors = validationService.validateForm({
      first_name, last_name, email, password, password_confirmation, gender, agreedToTerms
    });

    setErrors(formErrors);

    // Check if email is already taken
    if (email && !emailVerified && !checkingEmail) {
      toast.error('This email is already registered. Please use a different email.', 5000);
      return;
    }

    // Check for form validation errors
    if (Object.keys(formErrors).length > 0) {
      toast.error('Please fix the errors in the form before submitting.', 4000);
      return;
    }

    // Additional check for email verification status
    if (email && !emailVerified) {
      if (checkingEmail) {
        toast.info('Please wait while we verify your email availability...', 3000);
        return;
      } else {
        toast.error('This email is not available. Please use a different email address.', 5000);
        return;
      }
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
        toast.success('Account created successfully! Redirecting to login...', 2000);

        setTimeout(() => 
          navigate('/login?registered=success', { replace: true }), 
          1500
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

    // Only show toast for non-email errors
    if (status !== 409) {
      toast.error(errorMessages[status] || errorMessages.default, 5000);
    }

    if (data.errors) {
      setErrors(data.errors);
    } else if (status === 409) {
      setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
      setEmailVerificationStatus(false, false);
    }
  };

  const handleNetworkError = (error) => {
    console.error('Registration network error:', error);
    toast.error('Network error. Please check your connection and try again.', 4000);
  };

  const getFieldClassName = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const hasSuccess = touched[fieldName] && !errors[fieldName] && fieldName !== 'agreedToTerms';
    
    return `reg-auth-input-group ${hasError ? 'reg-auth-has-error' : ''} ${hasSuccess ? 'reg-auth-has-success' : ''}`;
  };

  const getEmailStatusIcon = () => {
    if (!email) return null;
    
    if (checkingEmail) {
      return <FontAwesomeIcon icon={faCircleNotch} className="reg-auth-email-status checking" spin />;
    } else if (emailVerified) {
      return <FontAwesomeIcon icon={faCheckCircle} className="reg-auth-email-status verified" />;
    } else if (errors.email && touched.email) {
      return <FontAwesomeIcon icon={faTimesCircle} className="reg-auth-email-status not-verified" />;
    }
    return null;
  };

  const getEmailStatusText = () => {
    if (!email) return null;
    
    if (checkingEmail) {
      return (
        <div className="reg-auth-email-verification checking">
          <FontAwesomeIcon icon={faCircleNotch} className="reg-auth-verification-icon" spin />
          Checking email availability...
        </div>
      );
    } else if (emailVerified) {
      return (
        <div className="reg-auth-email-verification verified">
          <FontAwesomeIcon icon={faCheckCircle} className="reg-auth-verification-icon" />
          Email is available
        </div>
      );
    } else if (errors.email && touched.email) {
      return (
        <div className="reg-auth-email-verification not-verified">
          <FontAwesomeIcon icon={faTimesCircle} className="reg-auth-verification-icon" />
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
    <div className="reg-auth-page">
      <NavAuth disabled="Hide" />
      
      {/* Toast Container */}
      <CustomToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className={`reg-auth-form-container ${formMounted ? 'reg-auth-mounted' : ''}`}>
        <form className="reg-auth-form" onSubmit={handleSubmit} noValidate>
          <div className="reg-auth-header">
            <h2 className="reg-auth-title">Create Your Account</h2>
            <p className="reg-auth-subtitle">Join our community today</p>
          </div>

          {/* Name Fields */}
          <div className="reg-auth-name-fields">
            <div className={getFieldClassName('first_name')}>
              <input
                type="text"
                className="reg-auth-form-input"
                placeholder="First Name"
                name="first_name"
                value={first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                disabled={isLoading}
                autoComplete="given-name"
                aria-describedby={errors.first_name ? "first-name-error" : undefined}
              />
              {errors.first_name && touched.first_name && (
                <span id="first-name-error" className="reg-auth-error-text" role="alert">
                  {errors.first_name}
                </span>
              )}
            </div>

            <div className={getFieldClassName('last_name')}>
              <input
                type="text"
                className="reg-auth-form-input"
                placeholder="Last Name"
                name="last_name"
                value={last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                disabled={isLoading}
                autoComplete="family-name"
                aria-describedby={errors.last_name ? "last-name-error" : undefined}
              />
              {errors.last_name && touched.last_name && (
                <span id="last-name-error" className="reg-auth-error-text" role="alert">
                  {errors.last_name}
                </span>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className={getFieldClassName('email')}>
            <div className="reg-auth-email-wrapper">
              <input
                className="reg-auth-form-input"
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
          <div className="reg-auth-input-group">
            <select
              name="gender"
              className="reg-auth-form-select"
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
            <div className="reg-auth-password-wrapper">
              <input
                className="reg-auth-form-input"
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
                className="reg-auth-password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon 
                  icon={showPassword ? faEyeSlash : faEye} 
                  className="reg-auth-password-icon"
                />
              </button>
            </div>
            {errors.password && touched.password && (
              <span id="password-error" className="reg-auth-error-text" role="alert">
                {errors.password}
              </span>
            )}
            {password && !errors.password && touched.password && (
              <div className="reg-auth-password-strength strong">
                <FontAwesomeIcon icon={faCheckCircle} />
                Password meets requirements
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className={getFieldClassName('password_confirmation')}>
            <div className="reg-auth-password-wrapper">
              <input
                className="reg-auth-form-input"
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
                className="reg-auth-password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon 
                  icon={showConfirmPassword ? faEyeSlash : faEye} 
                  className="reg-auth-password-icon"
                />
              </button>
            </div>
            {errors.password_confirmation && touched.password_confirmation && (
              <span id="password-confirm-error" className="reg-auth-error-text" role="alert">
                {errors.password_confirmation}
              </span>
            )}
            {password_confirmation && !errors.password_confirmation && touched.password_confirmation && (
              <div className="reg-auth-password-match success">
                <FontAwesomeIcon icon={faCheckCircle} />
                Passwords match
              </div>
            )}
          </div>

          {/* Terms Agreement Section */}
          <div className={`reg-auth-terms-section ${errors.agreedToTerms ? 'reg-auth-has-error' : ''} ${agreedToTerms ? 'reg-auth-accepted' : ''}`}>
            <div className="reg-auth-terms-header">
              <FontAwesomeIcon icon={faFileContract} className="reg-auth-terms-icon" />
              <h3>Terms & Conditions</h3>
            </div>
            
            <div className="reg-auth-terms-content">
              <p>
                By creating an account, you agree to our Terms of Service and Privacy Policy. 
                Please read them carefully before proceeding.
              </p>
              
              <div className="reg-auth-terms-highlights">
                <div className="reg-auth-term-highlight">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>Your data is protected and secure</span>
                </div>
               
                <div className="reg-auth-term-highlight">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>You must follow community guidelines</span>
                </div>
              </div>
            </div>

            <div className="reg-auth-terms-agreement">
              <label className="reg-auth-terms-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                  className="reg-auth-terms-input"
                />
                <span className="reg-auth-custom-checkbox">
                  {agreedToTerms && <FontAwesomeIcon icon={faCheckCircle} className="reg-auth-check-icon" />}
                </span>
                <span className="reg-auth-terms-text">
                  I have read and agree to the{' '}
                  <button 
                    type="button" 
                    className="reg-auth-terms-link"
                    onClick={handleViewTerms}
                    disabled={isLoading}
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button 
                    type="button" 
                    className="reg-auth-terms-link"
                    onClick={handleViewTerms}
                    disabled={isLoading}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              
              {errors.agreedToTerms && (
                <div className="reg-auth-terms-error">
                  <FontAwesomeIcon icon={faTimesCircle} />
                  {errors.agreedToTerms}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`reg-auth-submit-btn ${isLoading ? 'reg-auth-loading' : ''} ${!isFormValid() ? 'reg-auth-disabled' : ''}`}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="reg-auth-spinner" spin />
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
          <div className="reg-auth-redirect">
            <p>Already have an account?</p>
            <Link 
              to="/login" 
              className="reg-auth-redirect-link"
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