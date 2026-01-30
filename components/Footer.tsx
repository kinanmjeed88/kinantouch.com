import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center space-x-reverse space-x-6 mb-4">
          <Link to="/privacy-policy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
          <Link to="/contact" className="hover:text-white transition-colors">اتصل بنا</Link>
          <Link to="/about" className="hover:text-white transition-colors">من نحن</Link>
        </div>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} TechTouch. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};