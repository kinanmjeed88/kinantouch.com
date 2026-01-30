import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wrench, Info } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navItems = [
    { name: 'الرئيسية', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'الأدوات', path: '/tools', icon: <Wrench className="w-4 h-4" /> },
    { name: 'حول', path: '/about', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <nav className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-16 z-30 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-reverse space-x-6 h-12 min-w-max">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};