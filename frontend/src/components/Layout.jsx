import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  User,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
  BookOpen,
  Search,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Home', to: '/', icon: <Home size={20} /> },
  { label: 'Trending', to: '/trending', icon: <TrendingUp size={20} /> },
  { label: 'Create Post', to: '/create', icon: <PlusCircle size={20} /> },
  { label: 'Search', to: '/search', icon: <Search size={20} /> },
];

const userItems = [
  { label: 'Profile', to: '/profile', icon: <User size={20} /> },
  { label: 'Settings', to: '/settings', icon: <Settings size={20} /> },
];

const authItems = [
  { label: 'Sign In', to: '/login', icon: <LogIn size={20} /> },
  { label: 'Sign Up', to: '/register', icon: <UserPlus size={20} /> },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-neutral-900">
      {/* Sidebar */}
      <aside className={`fixed z-30 inset-y-0 left-0 w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:block`}> 
        <div className="flex items-center h-16 px-6 border-b border-neutral-800">
          <span className="text-xl font-bold text-white tracking-tight">BlogVista</span>
          <button className="ml-auto lg:hidden text-neutral-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <div>
            <p className="text-xs uppercase text-neutral-500 mb-2 px-2">Main</p>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors mb-1 ${
                    isActive || location.pathname === item.to
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
          {user && (
            <div>
              <p className="text-xs uppercase text-neutral-500 mb-2 px-2">Account</p>
              {userItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors mb-1 ${
                      isActive || location.pathname === item.to
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors w-full mt-2"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          )}
          {!user && (
            <div>
              <p className="text-xs uppercase text-neutral-500 mb-2 px-2">Auth</p>
              {authItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors mb-1 ${
                      isActive || location.pathname === item.to
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 h-16 bg-neutral-950 border-b border-neutral-800 flex items-center px-6 shadow-sm">
          <button className="lg:hidden text-neutral-400 hover:text-white mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
          <h1 className="text-lg font-semibold text-white tracking-tight">{getPageTitle(location.pathname)}</h1>
          <div className="ml-auto flex items-center gap-4">
            {user && (
              <Link to="/profile" className="flex items-center gap-2">
                <img
                  src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&background=27272a&color=fff'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-blue-600 object-cover"
                />
                <span className="text-neutral-200 font-medium">{user.name}</span>
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 bg-neutral-900 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

function getPageTitle(path) {
  switch (path) {
    case '/': return 'Home';
    case '/trending': return 'Trending';
    case '/create': return 'Create Post';
    case '/profile': return 'Profile';
    case '/settings': return 'Settings';
    case '/search': return 'Search';
    default: return '';
  }
}

export default Layout; 