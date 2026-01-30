import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_NAME } from '../constants';

interface SEOProps {
  title: string;
  description?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description }) => {
  const location = useLocation();

  useEffect(() => {
    // Update Title
    document.title = `${title} | ${SITE_NAME}`;
    
    // Update Meta Description if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description, location]);

  return null;
};