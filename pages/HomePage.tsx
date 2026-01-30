
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_ARTICLES } from '../constants';
import { Smartphone, Gamepad2, Trophy, Grid, Layers, Calendar, ArrowUpRight } from 'lucide-react';
import { CardSkeleton, AppCardSkeleton, GameCardSkeleton } from '../components/Skeleton';

type Tab = 'all' | 'Tech' | 'Apps' | 'Games' | 'Sports';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay on mount and tab change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Filter Data
  const techArticles = SAMPLE_ARTICLES.filter(a => a.category === 'Tech');
  const appArticles = SAMPLE_ARTICLES.filter(a => a.category === 'Apps');
  const gameArticles = SAMPLE_ARTICLES.filter(a => a.category === 'Games');
  const sportArticles = SAMPLE_ARTICLES.filter(a => a.category === 'Sports');

  // Get combined sorted articles for "All" view (Latest mixed)
  const allMixedArticles = [...SAMPLE_ARTICLES]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12); // Show top 12 mixed articles

  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: 'الكل', icon: <Layers className="w-4 h-4" />, color: 'bg-gray-800' },
    { id: 'Tech', label: 'اخبار', icon: <Grid className="w-4 h-4" />, color: 'bg-blue-600' },
    { id: 'Apps', label: 'تطبيقات', icon: <Smartphone className="w-4 h-4" />, color: 'bg-green-600' },
    { id: 'Games', label: 'ألعاب', icon: <Gamepad2 className="w-4 h-4" />, color: 'bg-purple-600' },
    { id: 'Sports', label: 'رياضة', icon: <Trophy className="w-4 h-4" />, color: 'bg-orange-600' },
  ];

  // Helper to get category badge styles/icon
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'Tech': return { color: 'bg-blue-600', icon: <Grid className="w-3 h-3" />, label: 'تقنية' };
      case 'Apps': return { color: 'bg-green-600', icon: <Smartphone className="w-3 h-3" />, label: 'تطبيقات' };
      case 'Games': return { color: 'bg-purple-600', icon: <Gamepad2 className="w-3 h-3" />, label: 'ألعاب' };
      case 'Sports': return { color: 'bg-orange-600', icon: <Trophy className="w-3 h-3" />, label: 'رياضة' };
      default: return { color: 'bg-gray-600', icon: <Grid className="w-3 h-3" />, label: 'عام' };
    }
  };

  return (
    <div className="pb-12 min-h-screen">
      {/* Tabs Navigation Bar */}
      <div className="sticky top-[7rem] z-20 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md py-4 mb-8 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex md:justify-center items-center gap-3 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? `${tab.color} text-white shadow-lg shadow-gray-400/20 dark:shadow-none`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-24 mt-8 animate-fade-in">
        
        {/* =========================================
            VIEW: ALL (Mixed Grid)
           ========================================= */}
        {activeTab === 'all' && (
          <section>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <Layers className="w-6 h-6 text-gray-500" />
                 <span>اخبار</span>
               </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading 
                ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
                : allMixedArticles.map((article) => {
                const catInfo = getCategoryInfo(article.category);
                return (
                  <Link key={article.id} to={`/articles/${article.slug}`} className="group h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
                        
                        {/* Image Container */}
                        <div className="h-52 overflow-hidden relative">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                            
                            {/* CATEGORY BADGE (ON IMAGE) */}
                            <div className={`absolute top-4 right-4 ${catInfo.color} text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10`}>
                                {catInfo.icon}
                                <span>{catInfo.label}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                              <Calendar className="w-3 h-3" />
                              <span>{article.date}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                {article.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                                {article.excerpt}
                            </p>
                            <div className="mt-auto flex items-center text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                                اقرأ المزيد <ArrowUpRight className="w-3 h-3 mr-1" />
                            </div>
                        </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================
            VIEW: TECH ONLY
           ========================================= */}
        {activeTab === 'Tech' && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
                    <Grid className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">اخبار تقنية</h2>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading 
                ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
                : techArticles.map((article) => (
                <Link key={article.id} to={`/articles/${article.slug}`} className="group h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                        <div className="h-52 overflow-hidden relative">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-3 font-semibold uppercase tracking-wider">
                              <span>{article.category}</span>
                              <span>•</span>
                              <span>{article.date}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                {article.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                                {article.excerpt}
                            </p>
                        </div>
                    </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* =========================================
            VIEW: APPS ONLY
           ========================================= */}
        {activeTab === 'Apps' && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-2xl">
                    <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">متجر التطبيقات</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading 
                  ? Array(8).fill(0).map((_, i) => <AppCardSkeleton key={i} />)
                  : appArticles.map((app) => (
                    <Link key={app.id} to={`/articles/${app.slug}`} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 dark:border-gray-700 flex items-center gap-5 group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md">
                            <img src={app.imageUrl} alt={app.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg group-hover:text-green-600 transition-colors">{app.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">{app.excerpt}</p>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 mt-2 inline-block px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-md">تحميل</span>
                        </div>
                    </Link>
                ))}
            </div>
          </section>
        )}

        {/* =========================================
            VIEW: GAMES ONLY
           ========================================= */}
        {activeTab === 'Games' && (
          <section className="animate-fade-in">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                    <Gamepad2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">عالم الألعاب</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isLoading 
                  ? Array(4).fill(0).map((_, i) => <GameCardSkeleton key={i} />)
                  : gameArticles.map((game) => (
                    <Link key={game.id} to={`/articles/${game.slug}`} className="group relative rounded-3xl overflow-hidden aspect-[16/9] shadow-lg hover:shadow-2xl transition-all">
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-10" />
                        <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                        
                        <div className="absolute bottom-0 right-0 p-8 z-20 w-full">
                            <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-bold mb-3 inline-block shadow-lg">جديد الألعاب</span>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight drop-shadow-md">{game.title}</h3>
                            <p className="text-gray-200 text-sm line-clamp-2 max-w-lg">{game.excerpt}</p>
                        </div>
                    </Link>
                ))}
            </div>
          </section>
        )}

        {/* =========================================
            VIEW: SPORTS ONLY
           ========================================= */}
        {activeTab === 'Sports' && (
          <section className="animate-fade-in">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-2xl">
                    <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">الرياضة</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading 
                  ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
                  : sportArticles.map((sport) => (
                    <Link key={sport.id} to={`/articles/${sport.slug}`} className="group h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                        <div className="h-48 overflow-hidden relative">
                            <img src={sport.imageUrl} alt={sport.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                                {sport.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                                {sport.excerpt}
                            </p>
                        </div>
                    </div>
                </Link>
                ))}
            </div>
          </section>
        )}
      </div>

       {/* AdSense Placeholder - Always visible */}
       <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 font-semibold">مساحة إعلانية (Banner)</span>
        </div>
       </section>
    </div>
  );
};
