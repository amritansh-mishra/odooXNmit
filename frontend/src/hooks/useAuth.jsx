import { useState, useEffect, createContext, useContext } from 'react';
import { mockUser } from '../data/mockdata';
import authService from '../services/authService';

// Create context
const AuthContext = createContext();

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const validRoles = new Set(['admin', 'accountant', 'contact']);

// Role-specific mock users
const mockUsers = {
  admin: {
    id: 1,
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'admin',
    avatar: null
  },
  accountant: {
    id: 2,
    name: 'Accountant User', 
    email: 'accountant@demo.com',
    role: 'accountant',
    avatar: null
  },
  contact: {
    id: 3,
    name: 'Client User',
    email: 'contact@demo.com', 
    role: 'contact',
    avatar: null
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for existing session and validate with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      
      if (storedUser && token) {
        try {
          // Validate token with backend
          const userData = await authService.getCurrentUser();
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } catch (error) {
          // Token invalid, clear storage and fallback to mock
          console.warn('Token validation failed, falling back to mock auth:', error.message);
          authService.logout();
          const fallback = { ...mockUsers.admin };
          setUser(fallback);
          localStorage.setItem('auth_user', JSON.stringify(fallback));
        }
      } else {
        // First load: seed with admin user for demo
        const seed = { ...mockUsers.admin };
        setUser(seed);
        localStorage.setItem('auth_user', JSON.stringify(seed));
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Real login API
  const login = async (loginId, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(loginId, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Real signup API
  const signup = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
