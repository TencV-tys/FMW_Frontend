import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';
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
    errors: {}
  });

  const updateField = (field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: '' } // Clear error when typing
    }));
  };

  const setErrors = (errors) => {
    setState(prev => ({ ...prev, errors }));
  };

  const setLoading = (isLoading) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  return {
    ...state,
    updateField,
    setErrors,
    setLoading
  };
};

// API service abstraction
const authService = {
  login: async (credentials) => {
    const response = await fetch('http://localhost:8000/auth/login', {
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
  const { email, password, isLoading, errors, updateField, setErrors, setLoading } = useLoginForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle redirects from registration or other pages
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

        // Role-based navigation with proper cleanup
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
    <div className='login-page'>
      <NavAuth disabled="Hide" />
      
      <div className='login-form-container'>
        <form 
          className='login-container' 
          onSubmit={handleSubmit}
          noValidate
        >
          <div className='login-header'>
            <h2 className='login-form-title'>Welcome Back</h2>
            <p className='login-subtitle'>Sign in to your account</p>
          </div>

          <div className='form-group'>
            <div className={`input-group ${errors.email ? 'has-error' : ''}`}>
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
                <span id="email-error" className="error-text" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className={`input-group ${errors.password ? 'has-error' : ''}`}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => updateField('password', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                autoComplete="current-password"
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <span id="password-error" className="error-text" role="alert">
                  {errors.password}
                </span>
              )}
            </div>
          </div>

          <div className='form-options'>
            <Link to="/forgot-password" className='forgot-password-link'>
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <FontAwesomeIcon icon={faDoorOpen} />
              </>
            )}
          </button>

          <div className='auth-redirect'>
            <p>Don't have an account?</p>
            <Link 
              to="/registration" 
              className='redirect-link'
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