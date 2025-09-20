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
  Calculator,
  ShoppingCart,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const NAVBAR_HEIGHT_REM = 4; // 4rem (64px)

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
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar (fixed, full width) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions, contacts..."
                className="pl-10 pr-4 py-2 w-72 sm:w-96 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="w-4 h-4 mr-3" /> Settings
                    </a>
                    <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <LogOut className="w-4 h-4 mr-3" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Collapsible Side Panel */}
      <div 
        className="fixed left-0 top-20 z-40"
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Trigger Tab */}
        <motion.div
          className="bg-blue-600 text-white p-2 rounded-r-lg shadow-lg cursor-pointer flex items-center"
          whileHover={{ x: 2 }}
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
              className="absolute top-0 left-0 w-60 bg-white border border-gray-200 rounded-r-lg shadow-xl"
            >
              <div className="flex flex-col">
                {/* Logo area */}
                <div className="flex h-12 items-center px-4 border-b border-gray-200 bg-gray-50 rounded-tr-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">Orders</span>
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
                          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        )}
                      >
                        <Icon className="w-5 h-5 mr-3" /> {item.name}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main content - full width */}
      <div className="pt-16">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
