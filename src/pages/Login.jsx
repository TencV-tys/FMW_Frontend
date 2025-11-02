import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import NavAuth from "../components/NavAuth";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './styles/Login.css';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Custom hook for form state management
const useLoginForm = () => {
  const [state, setState] = useState({
    email: '',
    password: '',
    isLoading: false,
    errors: {},
    showPassword: false
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

  return {
    ...state,
    updateField,
    setErrors,
    setLoading,
    togglePasswordVisibility
  };
};

// API service abstraction
const authService = {
  login: async (credentials) => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    const wifi = isLocalhost 
      ? 'http://localhost:8000' 
      : 'http://192.168.1.27:8000';
    
    const response = await fetch(`${wifi}/auth/login`, {
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
    updateField, 
    setErrors, 
    setLoading,
    togglePasswordVisibility 
  } = useLoginForm();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get('registered');
    const reset = searchParams.get('reset');
    
    if (registered === 'success') {
      toast.success('Account created successfully! Please login.', {
        position: "bottom-center"
      });
    }
    
    if (reset === 'success') {
      toast.success('Password reset successfully! Please login.', {
        position: "bottom-center"
      });
    }
  }, [searchParams]);

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
    
    if (!validateForm()) {
      toast.error('Please fix the form errors', { position: "bottom-center" });
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({ email, password });

      if (result.success) {
        const { user } = result.data;
        
        toast.success(`Welcome back, ${user.first_name}!`, {
          position: "bottom-center",
          autoClose: 1000
        });

        const redirectPath = user.role === 'admin' ? '/admin' : '/user';
        setTimeout(() => navigate(redirectPath, { replace: true }), 1000);

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

    toast.error(errorMessages[status] || errorMessages.default, {
      position: "bottom-center",
      autoClose: 4000
    });
  };

  const handleNetworkError = (error) => {
    console.error('Login network error:', error);
    toast.error('Network error. Please check your connection and try again.', {
      position: "bottom-center",
      autoClose: 3000
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <div className='login-auth-page'>
      <NavAuth disabled="Hide" />
      
      <div className='login-auth-container'>
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
            <div className={`login-auth-input-group ${errors.email ? 'login-auth-has-error' : ''}`}>
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

            <div className={`login-auth-input-group login-auth-password-group ${errors.password ? 'login-auth-has-error' : ''}`}>
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
                <FontAwesomeIcon icon={faSpinner} className="login-auth-spinner" />
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