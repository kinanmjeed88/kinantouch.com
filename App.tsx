import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { NewsTicker } from './components/NewsTicker';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetail } from './pages/ArticleDetail';
import { ToolsPage } from './pages/ToolsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Theme } from './types';
import ScrollToTop from './components/ScrollToTop';
import { SEO } from './components/SEO';

// Wrapper to inject SEO per route
const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <>
      <SEO title={title} />
      {children}
    </>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

  // Initialize theme from local storage or default
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === Theme.DARK);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme(Theme.DARK);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === Theme.DARK);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
        <Header darkMode={theme === Theme.DARK} toggleTheme={toggleTheme} />
        <NewsTicker />
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<PageWrapper title="الرئيسية"><HomePage /></PageWrapper>} />
            <Route path="/articles" element={<PageWrapper title="مقالات تقنية"><ArticlesPage category="Tech" /></PageWrapper>} />
            <Route path="/articles/:slug" element={<ArticleDetail />} /> {/* Detail page handles its own SEO */}
            <Route path="/apps" element={<PageWrapper title="تطبيقات"><ArticlesPage category="Apps" /></PageWrapper>} />
            <Route path="/games" element={<PageWrapper title="ألعاب"><ArticlesPage category="Games" /></PageWrapper>} />
            <Route path="/sports" element={<PageWrapper title="رياضة"><ArticlesPage category="Sports" /></PageWrapper>} />
            <Route path="/tools" element={<PageWrapper title="الأدوات"><ToolsPage /></PageWrapper>} />
            <Route path="/tools/:toolId" element={<PageWrapper title="أداة"><div className="p-8 text-center dark:text-white">صفحة الأداة تحت الإنشاء</div></PageWrapper>} />
            <Route path="/about" element={<PageWrapper title="من نحن"><AboutPage /></PageWrapper>} />
            <Route path="/privacy-policy" element={<PageWrapper title="سياسة الخصوصية"><PrivacyPolicy /></PageWrapper>} />
            <Route path="*" element={<PageWrapper title="404"><div className="p-12 text-center text-xl dark:text-white">الصفحة غير موجودة - 404</div></PageWrapper>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;