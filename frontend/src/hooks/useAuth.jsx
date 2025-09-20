import { useState, useEffect, createContext, useContext } from 'react';
import { mockUser } from '../data/mockdata';

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

  // Check localStorage for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Normalize role
        const role = validRoles.has(parsed.role) ? parsed.role : 'admin';
        const normalized = { ...mockUsers[role], ...parsed, role };
        setUser(normalized);
        localStorage.setItem('auth_user', JSON.stringify(normalized));
      } catch (_) {
        // Fallback to admin user if parse fails
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
  }, []);

  // Simulate login API
  const login = async (email, password, role) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ensure a valid role is always set
    const effectiveRole = validRoles.has(role) ? role : 'admin';
    const userData = { ...mockUsers[effectiveRole], email };
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  // Simulate signup API
  const signup = async (userData) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const effectiveRole = validRoles.has(userData.role) ? userData.role : 'admin';
    const newUser = {
      ...mockUsers[effectiveRole],
      name: userData.name,
      email: userData.email,
      role: effectiveRole
    };
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
