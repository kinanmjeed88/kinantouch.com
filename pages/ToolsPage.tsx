import React from 'react';
import { Smartphone, BarChart2, Scale, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToolsPage: React.FC = () => {
  const tools = [
    {
      id: 'sites',
      name: 'جميع المواقع',
      desc: 'دليل لأهم المواقع التقنية ومواقع الذكاء الاصطناعي.',
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      path: '/tools/sites',
      color: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'phones',
      name: 'الهواتف',
      desc: 'أحدث أخبار ومواصفات الهواتف الذكية.',
      icon: <Smartphone className="w-8 h-8 text-purple-500" />,
      path: '/tools/phones',
      color: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'compare',
      name: 'مقارنة الهواتف',
      desc: 'قارن بين المواصفات والأسعار.',
      icon: <Scale className="w-8 h-8 text-orange-500" />,
      path: '/tools/compare',
      color: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 'analysis',
      name: 'تحليل',
      desc: 'تحليلات تقنية للسوق والأداء.',
      icon: <BarChart2 className="w-8 h-8 text-green-500" />,
      path: '/tools/analysis',
      color: 'bg-green-50 dark:bg-green-900/20'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">الأدوات التقنية</h1>
        <p className="text-gray-600 dark:text-gray-400">
          تصفح أدواتنا المتخصصة لتحليل السوق ومقارنة الهواتف.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link 
            key={tool.id} 
            to={tool.path}
            className={`flex items-start p-6 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all ${tool.color} hover:shadow-lg`}
          >
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {tool.icon}
            </div>
            <div className="mr-4 flex-1">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Ad Placeholder for AdSense */}
      <div className="mt-12 p-8 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
          <p className="text-gray-500 font-bold">مساحة إعلانية (Google AdSense)</p>
      </div>
    </div>
  );
};