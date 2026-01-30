import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_ARTICLES } from '../constants';
import { Grid, Smartphone, Gamepad2, Trophy } from 'lucide-react';
import { CardSkeleton } from '../components/Skeleton';

interface ArticlesPageProps {
  category?: 'Tech' | 'Apps' | 'Games' | 'Sports';
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ category }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [category]);

  const filteredArticles = category 
    ? SAMPLE_ARTICLES.filter(a => a.category === category)
    : SAMPLE_ARTICLES;

  const getPageTitle = () => {
    switch (category) {
      case 'Tech': return { title: 'المقالات التقنية', icon: <Grid className="w-8 h-8 text-blue-500" /> };
      case 'Apps': return { title: 'تطبيقات مختارة', icon: <Smartphone className="w-8 h-8 text-green-500" /> };
      case 'Games': return { title: 'عالم الألعاب', icon: <Gamepad2 className="w-8 h-8 text-purple-500" /> };
      case 'Sports': return { title: 'الرياضة', icon: <Trophy className="w-8 h-8 text-orange-500" /> };
      default: return { title: 'كل المقالات والأخبار', icon: <Grid className="w-8 h-8 text-blue-500" /> };
    }
  };

  const { title, icon } = getPageTitle();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12 text-center flex flex-col items-center gap-4">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            {icon}
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400">تصفح أحدث المحتوى في هذا القسم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading 
          ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : filteredArticles.map((article) => (
          <article key={article.id} className="flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1">
            <Link to={`/articles/${article.slug}`} className="h-56 overflow-hidden block relative">
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
              <div className="absolute top-4 right-4 bg-gray-900/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                {article.category}
              </div>
            </Link>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-gray-400 text-xs">{article.date}</span>
              </div>
              <Link to={`/articles/${article.slug}`}>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 transition-colors">{article.title}</h2>
              </Link>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                {article.excerpt}
              </p>
              <Link 
                to={`/articles/${article.slug}`}
                className="mt-auto inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                اقرأ المزيد &larr;
              </Link>
            </div>
          </article>
        ))}
        {!isLoading && filteredArticles.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                لا توجد مقالات في هذا القسم حالياً.
            </div>
        )}
      </div>
    </div>
  );
};