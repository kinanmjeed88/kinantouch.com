import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SAMPLE_ARTICLES } from '../constants';
import { Calendar, User } from 'lucide-react';
import { DetailSkeleton } from '../components/Skeleton';
import { SEO } from '../components/SEO';
import { AdSenseUnit } from '../components/AdSenseUnit';

export const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [slug]);

  const article = SAMPLE_ARTICLES.find((a) => a.slug === slug);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <SEO title="المقال غير موجود" />
        <h1 className="text-2xl font-bold mb-4 dark:text-white">المقال غير موجود</h1>
        <Link to="/articles" className="text-blue-600 hover:underline">العودة للمقالات</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO title={article.title} description={article.excerpt} />
      
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-500">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link to="/articles" className="hover:text-blue-500">مقالات</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-300 truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time>{article.date}</time>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>TechTouch Team</span>
          </div>
        </div>
      </header>

      {/* Main Image */}
      <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
        <img src={article.imageUrl} alt={article.title} className="w-full object-cover max-h-[500px]" />
      </div>

      {/* Top Ad Unit */}
      <AdSenseUnit />

      {/* Article Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>

      {/* Bottom Ad Unit */}
      <AdSenseUnit />

      {/* Share Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4 dark:text-white">شارك المقال</h3>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">فيسبوك</button>
            <button className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600">تويتر</button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">واتساب</button>
        </div>
      </div>
    </div>
  );
};