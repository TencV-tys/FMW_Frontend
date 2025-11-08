import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import NavAuth from "../components/NavAuth";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './styles/Login.css';
import { useState, useEffect } from 'react';
import { useWifiUrl } from '../hooks/useWifiUrl';
import { useCustomToast, CustomToastContainer } from '../components/CustomToast';

// Custom hook for form state management
const useLoginForm = () => {
  const [state, setState] = useState({
    email: '',
    password: '',
    isLoading: false,
    errors: {},
    showPassword: false,
    formMounted: false
  });

  const updateField = (field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: '' }
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

  const setFormMounted = (mounted) => {
    setState(prev => ({ ...prev, formMounted: mounted }));
  };

  return {
    ...state,
    updateField,
    setErrors,
    setLoading,
    togglePasswordVisibility,
    setFormMounted
  };
};

// Validation service
const validationService = {
  validateEmail: (email) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  },

  validatePassword: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }
};

export default function Login() {
  const { 
    email, 
    password, 
    isLoading, 
    errors, 
    showPassword,
    formMounted,
    updateField, 
    setErrors, 
    setLoading,
    togglePasswordVisibility,
    setFormMounted
  } = useLoginForm();
  
  // Use external toast hook
  const { toasts, removeToast, toast } = useCustomToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wifiUrl = useWifiUrl();

  // Set form mounted for animations
  useEffect(() => {
    setFormMounted(true);
  }, []);

  // API service function
  const authService = {
    login: async (credentials) => {
      const response = await fetch(`${wifiUrl}/auth/login`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data,
        status: response.status
      };
    }
  };

  useEffect(() => {
    const registered = searchParams.get('registered');
    const reset = searchParams.get('reset');
    
    if (registered === 'success') {
      toast.success('Account created successfully! Please login.', 5000);
    }
    
    if (reset === 'success') {
      toast.success('Password reset successfully! Please login.', 5000);
    }
  }, [searchParams, toast]);

  const validateForm = () => {
    const newErrors = {
      email: validationService.validateEmail(email),
      password: validationService.validatePassword(password)
    };

    const hasErrors = Object.values(newErrors).some(error => error !== '');
    setErrors(newErrors);
    
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate clicks
    if (isLoading) {
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting.', 4000);
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({ email, password });

      if (result.success) {
        const { user } = result.data;
        
        toast.success(`Welcome back, ${user.first_name}!`, 2000);

        const redirectPath = user.role === 'admin' ? '/admin' : '/user';
        setTimeout(() => navigate(redirectPath, { replace: true }), 1500);

      } else {
        handleLoginError(result);
      }

    } catch (error) {
      handleNetworkError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (result) => {
    const { data, status } = result;
    
    const errorMessages = {
      403: data.error?.includes('suspended') 
        ? 'Your account has been suspended. Please contact administrator.'
        : data.error?.includes('banned')
        ? 'Your account has been banned. Please contact administrator.'
        : data.error || 'Access denied',
      400: data.error || 'Invalid email or password',
      500: 'Server error. Please try again later.',
      default: data.error || data.message || 'Login failed'
    };

    toast.error(errorMessages[status] || errorMessages.default, 5000);
  };

  const handleNetworkError = (error) => {
    console.error('Login network error:', error);
    toast.error('Network error. Please check your connection and try again.', 4000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  const getFieldClassName = (fieldName) => {
    const hasError = errors[fieldName];
    const hasValue = fieldName === 'email' ? email : password;
    
    return `login-auth-input-group ${hasError ? 'login-auth-has-error' : ''} ${hasValue && !hasError ? 'login-auth-has-success' : ''}`;
  };

  return (
    <div className='login-auth-page'>
      <NavAuth disabled="Hide" />
      <CustomToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className={`login-auth-container ${formMounted ? 'login-auth-mounted' : ''}`}>
        <form 
          className='login-auth-form' 
          onSubmit={handleSubmit}
          noValidate
        >
          <div className='login-auth-header'>
            <h2 className='login-auth-title'>Welcome Back</h2>
            <p className='login-auth-subtitle'>Sign in to your account</p>
          </div>

          <div className='login-auth-form-group'>
            <div className={getFieldClassName('email')}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => updateField('email', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                autoComplete="email"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <span id="email-error" className="login-auth-error-text" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className={`login-auth-password-group ${getFieldClassName('password')}`}>
              <div className="login-auth-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => updateField('password', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="login-auth-password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon 
                    icon={showPassword ? faEyeSlash : faEye} 
                    className="login-auth-password-icon"
                  />
                </button>
              </div>
              {errors.password && (
                <span id="password-error" className="login-auth-error-text" role="alert">
                  {errors.password}
                </span>
              )}
            </div>
          </div>

          <div className='login-auth-options'>
            <Link to="/forgot-password" className='login-auth-forgot-link'>
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className={`login-auth-submit-btn ${isLoading ? 'login-auth-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="login-auth-spinner" spin />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <FontAwesomeIcon icon={faDoorOpen} />
              </>
            )}
          </button>

          <div className='login-auth-redirect'>
            <p>Don't have an account?</p>
            <Link 
              to="/registration" 
              className='login-auth-redirect-link'
              aria-disabled={isLoading}
            >
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}