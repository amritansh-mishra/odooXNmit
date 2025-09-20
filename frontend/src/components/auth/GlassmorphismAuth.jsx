import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const GlassmorphismAuth = () => {
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { login, signup } = useAuth();

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      icon: Shield,
      description: 'Full system access',
      gradient: 'from-red-500 to-pink-500',
      glow: 'shadow-red-500/25'
    },
    {
      id: 'accountant',
      name: 'Accountant',
      icon: Users,
      description: 'Financial management',
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/25'
    },
    {
      id: 'contact',
      name: 'Client',
      icon: UserCheck,
      description: 'Client portal access',
      gradient: 'from-green-500 to-emerald-500',
      glow: 'shadow-green-500/25'
    }
  ];

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        newValidations.loginId = value.length >= 6 && value.length <= 12;
        if (!newValidations.loginId && value.length > 0) {
          newErrors.loginId = 'Login ID must be 6-12 characters';
        } else {
          delete newErrors.loginId;
        }
        break;
      case 'password':
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        newValidations.password = value.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
        if (!newValidations.password && value.length > 0) {
          newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number & special character';
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

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', loginId: '', email: '', password: '', confirmPassword: '', role: '' });
    setErrors({});
    setValidations({});
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.1,
            y: mousePosition.y * 0.1,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 0.05,
            y: -mousePosition.y * 0.05,
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-2xl"
          animate={{
            x: mousePosition.x * 0.08,
            y: -mousePosition.y * 0.08,
            rotate: 360,
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/25"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Shiv Furnitures
            </h1>
            <p className="text-gray-300 text-lg">
              {isLogin ? 'Welcome back!' : 'Join our platform'}
            </p>
          </motion.div>

          {/* Main Form Container with Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative"
          >
            {/* Glassmorphism Card */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/20">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-sm -z-10" />

              {/* Form Toggle */}
              <div className="flex bg-white/5 rounded-2xl p-1 mb-8 backdrop-blur-sm border border-white/10">
                <motion.button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${isLogin
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-gray-300 hover:text-white'
                    }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogIn className="w-4 h-4 inline mr-2" />
                  Sign In
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${!isLogin
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-gray-300 hover:text-white'
                    }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Sign Up
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field - Sign Up Only */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Full Name"
                          className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                          required={!isLogin}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                          {validations.name === true && <CheckCircle className="h-5 w-5 text-green-400" />}
                          {validations.name === false && <XCircle className="h-5 w-5 text-red-400" />}
                        </div>
                      </div>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-2 ml-4"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login ID Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="loginId"
                      value={formData.loginId}
                      onChange={handleInputChange}
                      placeholder="Login ID"
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {validations.loginId === true && <CheckCircle className="h-5 w-5 text-green-400" />}
                      {validations.loginId === false && <XCircle className="h-5 w-5 text-red-400" />}
                    </div>
                  </div>
                  {errors.loginId && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 ml-4"
                    >
                      {errors.loginId}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email Field - Sign Up Only */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email Address"
                          className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                          required={!isLogin}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                          {validations.email === true && <CheckCircle className="h-5 w-5 text-green-400" />}
                          {validations.email === false && <XCircle className="h-5 w-5 text-red-400" />}
                        </div>
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-2 ml-4"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full pl-12 pr-20 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
                      {validations.password === true && <CheckCircle className="h-5 w-5 text-green-400" />}
                      {validations.password === false && <XCircle className="h-5 w-5 text-red-400" />}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 ml-4"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {/* Confirm Password - Sign Up Only */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm Password"
                          className="w-full pl-12 pr-20 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                          required={!isLogin}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
                          {validations.confirmPassword === true && <CheckCircle className="h-5 w-5 text-green-400" />}
                          {validations.confirmPassword === false && <XCircle className="h-5 w-5 text-red-400" />}
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-2 ml-4"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
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
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-white text-sm font-medium mb-4">Select your role:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {roles.map((role, index) => {
                          const Icon = role.icon;
                          return (
                            <motion.button
                              key={role.id}
                              type="button"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                              className={`p-4 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${formData.role === role.id
                                  ? `bg-gradient-to-r ${role.gradient} border-white/30 shadow-lg ${role.glow}`
                                  : 'bg-white/5 border-white/20 hover:border-white/30 hover:bg-white/10'
                                }`}
                            >
                              <Icon className="w-6 h-6 mx-auto mb-2 text-white" />
                              <p className="text-white text-xs font-medium">{role.name}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/25 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  )}
                </motion.button>

                {/* Error Message */}
                <AnimatePresence>
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {errors.submit}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Quick Demo Access - Login Only */}
              <AnimatePresence>
                {isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-6 border-t border-white/10"
                  >
                    <p className="text-gray-300 text-sm text-center mb-4">Quick Demo Access:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <motion.button
                            key={role.id}
                            type="button"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => quickLogin(role.id)}
                            className={`p-3 rounded-xl bg-gradient-to-r ${role.gradient} backdrop-blur-sm border border-white/20 shadow-lg ${role.glow} transition-all duration-300`}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-1 text-white" />
                            <p className="text-white text-xs font-medium">{role.name}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle Mode */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6 pt-4 border-t border-white/10"
              >
                <p className="text-gray-300 text-sm mb-2">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </p>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium hover:underline"
                >
                  {isLogin ? 'Create new account' : 'Sign in instead'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlassmorphismAuth;
