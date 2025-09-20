import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  FileText,
  Building2,
  ShoppingCart,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // Sidebar: only Sales Orders and Purchase Orders
  const navigation = [
    { name: 'Sales Orders', href: '/orders/sales', icon: FileText, roles: ['admin', 'accountant'] },
    { name: 'Purchase Orders', href: '/orders/purchase', icon: ShoppingCart, roles: ['admin', 'accountant'] },
  ];

  const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role || 'contact'));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left Section - Logo & Search */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-heading-4">Shiv Furnitures</h1>
              </div>
            </div>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search..."
                className="form-input pl-10 pr-4 py-2 w-80"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)'
                }}
              />
            </div>
          </div>

          {/* Right Section - Notifications & Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg transition-colors hover:bg-gray-50">
              <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)} 
                className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-body-small font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user?.name}
                  </p>
                  <p className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
                    {user?.role}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg border shadow-lg py-2"
                    style={{ 
                      borderColor: 'var(--border-light)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <a 
                      href="/settings" 
                      className="flex items-center px-4 py-2 text-body-small transition-colors hover:bg-gray-50"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </a>
                    <button 
                      onClick={logout} 
                      className="flex items-center w-full px-4 py-2 text-body-small transition-colors hover:bg-gray-50"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Collapsible Side Panel - Only for Admin/Accountant */}
      {filteredNavigation.length > 0 && (
        <div 
          className="fixed left-0 top-20 z-40"
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          {/* Trigger Tab */}
          <motion.div
            className="bg-blue-600 text-white p-2 rounded-r-lg cursor-pointer flex items-center"
            style={{ boxShadow: 'var(--shadow-md)' }}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>

          {/* Expanded Panel */}
          <AnimatePresence>
            {sidebarHovered && (
              <motion.div
                initial={{ x: -240, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -240, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-0 left-0 w-60 bg-white border rounded-r-lg"
                style={{ 
                  borderColor: 'var(--border-light)',
                  boxShadow: 'var(--shadow-xl)'
                }}
              >
                <div className="flex flex-col">
                  {/* Header */}
                  <div className="flex h-12 items-center px-4 border-b bg-gray-50 rounded-tr-lg" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-heading-4">Orders</span>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <nav className="px-3 py-3 space-y-1">
                    {filteredNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink 
                          key={item.name} 
                          to={item.href} 
                          className={({ isActive }) => clsx(
                            "flex items-center px-3 py-2 text-body-small font-medium rounded-lg transition-colors",
                            isActive 
                              ? "bg-blue-50 text-blue-700" 
                              : "hover:bg-gray-50"
                          )}
                          style={({ isActive }) => ({
                            color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)'
                          })}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16">
        <main className="container py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
