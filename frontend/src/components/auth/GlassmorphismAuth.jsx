import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  UserCheck,
  Building2,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ProfessionalAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    loginId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validations, setValidations] = useState({});

  const { login, signup } = useAuth();

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      icon: Shield,
      description: 'Full system access',
      color: 'text-red-600'
    },
    {
      id: 'accountant',
      name: 'Accountant',
      icon: Users,
      description: 'Financial management',
      color: 'text-blue-600'
    },
    {
      id: 'contact',
      name: 'Client',
      icon: UserCheck,
      description: 'Client portal access',
      color: 'text-green-600'
    }
  ];

  const validateField = (name, value) => {
    const newValidations = { ...validations };
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        newValidations.name = value.length >= 2;
        if (!newValidations.name && value.length > 0) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        newValidations.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!newValidations.email && value.length > 0) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'loginId':
        newValidations.loginId = value.length >= 3;
        if (!newValidations.loginId && value.length > 0) {
          newErrors.loginId = 'Login ID must be at least 3 characters';
        } else {
          delete newErrors.loginId;
        }
        break;
      case 'password':
        newValidations.password = value.length >= 6;
        if (!newValidations.password && value.length > 0) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        newValidations.confirmPassword = value === formData.password && value.length > 0;
        if (!newValidations.confirmPassword && value.length > 0) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setValidations(newValidations);
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.loginId, formData.password, formData.role);
      } else {
        await signup({
          name: formData.name,
          loginId: formData.loginId,
          email: formData.email,
          password: formData.password,
          reenteredPassword: formData.confirmPassword,
          role: formData.role
        });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role) => {
    setFormData({
      loginId: `${role}user`,
      email: `${role}@demo.com`,
      password: 'Demo123!@'
    });
    setTimeout(async () => {
      try { 
        await login(`${role}user`, 'Demo123!@', role); 
      } catch (error) {
        console.error('Quick login failed:', error);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-heading-4">Shiv Furnitures</h1>
                <p className="text-body-small">Business Management System</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-heading-2 mb-2">
              {isLogin ? 'Access Your Account' : 'Create Your Account'}
            </h2>
            <p className="text-body">
              {isLogin 
                ? 'Please enter your login credentials to continue' 
                : 'Join our business management platform'
              }
            </p>
          </div>

          {/* Auth Card */}
          <div className="card">
            <div className="card-header">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                    isLogin
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LogIn className="w-4 h-4 inline mr-2" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                    !isLogin
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Sign Up
                </button>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field - Sign Up Only */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="form-label">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="form-input pl-10 pr-10"
                          required={!isLogin}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {validations.name === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {validations.name === false && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                      </div>
                      {errors.name && <p className="form-error">{errors.name}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login ID Field */}
                <div>
                  <label className="form-label">Login ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="loginId"
                      value={formData.loginId}
                      onChange={handleInputChange}
                      placeholder="Enter your login ID"
                      className="form-input pl-10 pr-10"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {validations.loginId === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {validations.loginId === false && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                  </div>
                  {errors.loginId && <p className="form-error">{errors.loginId}</p>}
                </div>

                {/* Email Field - Sign Up Only */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="form-label">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          className="form-input pl-10 pr-10"
                          required={!isLogin}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {validations.email === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {validations.email === false && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                      </div>
                      {errors.email && <p className="form-error">{errors.email}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password Field */}
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="form-input pl-10 pr-20"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                      {validations.password === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {validations.password === false && <XCircle className="h-5 w-5 text-red-500" />}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                {/* Confirm Password - Sign Up Only */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="form-label">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          className="form-input pl-10 pr-20"
                          required={!isLogin}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                          {validations.confirmPassword === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {validations.confirmPassword === false && <XCircle className="h-5 w-5 text-red-500" />}
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Role Selection - Sign Up Only */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="form-label">Select Role</label>
                      <div className="grid grid-cols-1 gap-3">
                        {roles.map((role) => {
                          const Icon = role.icon;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                formData.role === role.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={`w-5 h-5 ${role.color}`} />
                                <div>
                                  <p className="font-medium text-gray-900">{role.name}</p>
                                  <p className="text-sm text-gray-500">{role.description}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Error Message */}
                <AnimatePresence>
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {errors.submit}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Quick Demo Access - Login Only */}
            <AnimatePresence>
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="card-footer"
                >
                  <p className="text-body-small text-center mb-4">Quick Demo Access:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => quickLogin(role.id)}
                          className="btn btn-secondary btn-sm flex-col h-auto py-3"
                        >
                          <Icon className={`w-5 h-5 mb-1 ${role.color}`} />
                          <span className="text-xs">{role.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-body-small">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAuth;
