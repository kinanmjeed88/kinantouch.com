import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b pb-4 dark:border-gray-700">سياسة الخصوصية</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
            <p className="font-medium">
                نحن في موقع <strong>TechTouch</strong> نحترم خصوصية زوّارنا ونسعى لحمايتها.
            </p>

            <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Google Analytics</h3>
                    <p>
                        يستخدم الموقع خدمات Google Analytics لجمع معلومات غير شخصية مثل عدد الزيارات والصفحات التي يتم تصفحها بهدف تحسين تجربة المستخدم.
                    </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Google AdSense وملفات تعريف الارتباط</h3>
                    <p>
                        كما قد نستخدم Google AdSense لعرض الإعلانات، حيث تعتمد Google على ملفات تعريف الارتباط (Cookies).
                        يمكن للمستخدم تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح.
                    </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">الموافقة والتحديث</h3>
                    <p>
                        باستخدامك للموقع فإنك توافق على سياسة الخصوصية هذه، ونحتفظ بحق تحديثها عند الحاجة.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};