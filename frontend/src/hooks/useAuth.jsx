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
        const role = validRoles.has(parsed.role) ? parsed.role : (mockUser.role || 'admin');
        const normalized = { ...mockUser, ...parsed, role };
        setUser(normalized);
        localStorage.setItem('auth_user', JSON.stringify(normalized));
      } catch (_) {
        // Fallback to mock user if parse fails
        const fallback = { ...mockUser };
        setUser(fallback);
        localStorage.setItem('auth_user', JSON.stringify(fallback));
      }
    } else {
      // First load: seed with mock user for demo (admin)
      const seed = { ...mockUser };
      setUser(seed);
      localStorage.setItem('auth_user', JSON.stringify(seed));
    }
    setIsLoading(false);
  }, []);

  // Simulate login API
  const login = async (email, password, role) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Ensure a valid role is always set
    const effectiveRole = validRoles.has(role) ? role : (mockUser.role || 'admin');
    const userData = { ...mockUser, email, role: effectiveRole };
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
