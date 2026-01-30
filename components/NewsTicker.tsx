import React from 'react';

export const NewsTicker: React.FC = () => {
  return (
    <div className="w-full bg-gray-900 text-white h-10 flex items-center overflow-hidden border-b border-gray-800 relative z-40">
      {/* Label with Red Background and White Glow */}
      <div className="h-full px-6 bg-red-600 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 shrink-0 relative">
        إعلان
      </div>
      
      {/* Scrolling Content */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center bg-gray-900">
        <div className="animate-marquee whitespace-nowrap absolute right-0 flex items-center">
          <span className="mx-4 text-sm font-medium text-gray-100">
            أهلاً بكم في موقعنا المختص بنشر الأخبار التقنية والتطبيقات والمزيد ..
          </span>
           <span className="mx-4 text-sm font-medium text-gray-400">
             | TechTouch بوابتك لعالم التقنية | تحديثات يومية | أدوات الذكاء الاصطناعي
          </span>
        </div>
      </div>
    </div>
  );
};