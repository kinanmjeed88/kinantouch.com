import React from 'react';
import { Sun, Moon, User } from 'lucide-react';
import { OWNER_NAME } from '../constants';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, toggleTheme }) => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Right Side: Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center border-2 border-blue-500">
             {/* Placeholder for actual profile image */}
             <User className="w-6 h-6 text-gray-500 dark:text-gray-300" />
          </div>
          <span className="font-bold text-lg text-gray-800 dark:text-gray-100 hidden sm:block">
            {OWNER_NAME}
          </span>
        </div>

        {/* Center: Logo (Optional text) */}
        <div className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
          TechTouch
        </div>

        {/* Left Side: Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="تبديل المظهر"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </header>
  );
};