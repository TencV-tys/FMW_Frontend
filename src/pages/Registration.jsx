import NavAuth from "../components/NavAuth";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles/Registration.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
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
    isLoading: false,
    errors: {},
    touched: {}
  });

  const updateField = (field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: '' },
      touched: { ...prev.touched, [field]: true }
    }));
  };

  const setErrors = (errors) => {
    setState(prev => ({ ...prev, errors }));
  };

  const setLoading = (isLoading) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const validateField = (field, value) => {
    return validationService.validateField(field, value, state);
  };

  return {
    ...state,
    updateField,
    setErrors,
    setLoading,
    validateField
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
      }
    };

    return validators[field] ? validators[field](value, formState) : '';
  },

  validateForm: (formState) => {
    const errors = {};
    const fields = ['first_name', 'last_name', 'email', 'password', 'password_confirmation'];
    
    fields.forEach(field => {
      const error = validationService.validateField(field, formState[field], formState);
      if (error) errors[field] = error;
    });

    return errors;
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
    isLoading,
    errors,
    touched,
    updateField,
    setErrors,
    setLoading
  } = useRegistrationForm();

  const navigate = useNavigate();

  // Real-time validation for touched fields
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validationService.validateForm({
        first_name, last_name, email, password, password_confirmation, gender
      });
      setErrors(newErrors);
    }
  }, [first_name, last_name, email, password, password_confirmation, touched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allTouched = {
      first_name: true, last_name: true, email: true, 
      password: true, password_confirmation: true
    };
    
    const formErrors = validationService.validateForm({
      first_name, last_name, email, password, password_confirmation, gender
    });

    setErrors(formErrors);

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

        // Navigate to login with success state
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
      409: data.error || 'Email already exists',
      500: 'Server error. Please try again later.',
      default: data.error || data.message || 'Registration failed'
    };

    toast.error(errorMessages[status] || errorMessages.default, {
      position: 'bottom-center',
      autoClose: 4000
    });

    // Set field-specific errors from server
    if (data.errors) {
      setErrors(data.errors);
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
    return `input-group ${errors[fieldName] ? 'has-error' : ''} ${touched[fieldName] ? 'touched' : ''}`;
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
            />
            {errors.email && (
              <span id="email-error" className="error-text" role="alert">
                {errors.email}
              </span>
            )}
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
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Password Fields */}
          <div className={getFieldClassName('password')}>
            <input
              className="form-input"
              type="password"
              placeholder="Create Password"
              name="password"
              value={password}
              onChange={(e) => updateField('password', e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <span id="password-error" className="error-text" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className={getFieldClassName('password_confirmation')}>
            <input
              className="form-input"
              type="password"
              placeholder="Confirm Password"
              name="password_confirmation"
              value={password_confirmation}
              onChange={(e) => updateField('password_confirmation', e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              aria-describedby={errors.password_confirmation ? "password-confirm-error" : undefined}
            />
            {errors.password_confirmation && (
              <span id="password-confirm-error" className="error-text" role="alert">
                {errors.password_confirmation}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`register-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
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