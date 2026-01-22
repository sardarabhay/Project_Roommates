import React, { useState } from 'react';
import { GoogleIcon } from './GoogleIcon';
import FormInput from './FormInput';
import Card from '../common/Card';
import { authApi } from '../../services/api';

const AuthPage = ({ onLogin, onSignupSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!isLoginView && !formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setApiError('');
    
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      
      try {
        if (isLoginView) {
          await authApi.login(formData.email, formData.password);
          onLogin();
        } else {
          await authApi.signup(formData.name, formData.email, formData.password);
          onSignupSuccess();
          setIsLoginView(true);
          setFormData({ name: '', email: '', password: '' });
        }
      } catch (error) {
        setApiError(error.message || 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setApiError('');
    
    try {
      // For demo purposes, simulate Google OAuth with a test user
      // In production, you would integrate with actual Google OAuth
      const demoEmail = 'demo@harmonyhomes.com';
      const demoName = 'Demo User';
      await authApi.googleLogin(demoEmail, demoName);
      onLogin();
    } catch (error) {
      setApiError(error.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsLoginView(true);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
  };

  const switchToSignup = () => {
    setIsLoginView(false);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400">HarmonyHomes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">The simplest way to manage your shared home.</p>
        </div>

        <Card className="!p-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            {isLoginView ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-center text-gray-500 mb-6">
            {isLoginView ? 'Sign in to continue.' : 'Get started in seconds.'}
          </p>
          
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
              
              <div className="flex items-center">
                <hr className="flex-grow border-gray-200 dark:border-gray-600"/>
                <span className="mx-4 text-sm text-gray-400">OR</span>
                <hr className="flex-grow border-gray-200 dark:border-gray-600"/>
              </div>

              {!isLoginView && (
                <FormInput 
                  label="Your Name" 
                  name="name" 
                  placeholder="e.g., Abhay" 
                  value={formData.name} 
                  onChange={handleChange} 
                  error={errors.name} 
                  disabled={isLoading}
                />
              )}
              <FormInput 
                label="Email" 
                name="email" 
                type="email" 
                placeholder="you@gmail.com" 
                value={formData.email} 
                onChange={handleChange} 
                error={errors.email}
                disabled={isLoading}
              />
              <FormInput 
                label="Password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                error={errors.password}
                disabled={isLoading}
              />
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 px-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Please wait...' : (isLoginView ? 'Login' : 'Create Account')}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={isLoginView ? switchToSignup : switchToLogin} 
              disabled={isLoading}
              className="font-semibold text-teal-600 dark:text-teal-400 hover:underline ml-1 disabled:opacity-50"
            >
              {isLoginView ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;