import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 h-32 relative">
             <div className="absolute -bottom-12 right-8 w-24 h-24 bg-white dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-4xl shadow-md">
                 🧑‍💻
             </div>
        </div>
        
        <div className="pt-16 px-8 pb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 dark:border-gray-700">من نحن</h1>
          
          <div className="prose dark:prose-invert max-w-none space-y-8">
            {/* Intro */}
            <section>
                <p className="leading-relaxed text-gray-800 dark:text-gray-200 text-lg">
                    أنا <strong>كنان مجيد الصائغ</strong>، من مواليد 1988، مهتم بالأخبار والمعلومات التقنية والذكاء الاصطناعي.
                    أعمل على نشر المحتوى التقني، وأدوات وتقنيات الذكاء الاصطناعي، والتطبيقات المعدلة، والتطبيقات الرياضية، وتطبيقات الأفلام والخدمات.
                </p>
                <p className="leading-relaxed text-gray-800 dark:text-gray-200 mt-2">
                    يهدف موقع <strong>TechTouch</strong> إلى تقديم محتوى تقني مبسّط ومفيد للمستخدم العربي.
                </p>
            </section>

            {/* Telegram Bot Section */}
            <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">بوت الطلبات في التيليكرام</h2>
                <ul className="list-none space-y-3 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 text-xl">✪</span>
                        <span>ارسل اسم التطبيق مع صورته او رابط التطبيق من متجر بلي فقط.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 text-xl">✪</span>
                        <span>لا تطلب كود تطبيقات مدفوعة ولا اكستريم، كل ما يتوفر جديد مباشر انشر انت فقط تابع القنوات.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 text-xl">✪</span>
                        <span>البوت مخصص للطلبات وليس للدردشة، إذا كان لديك مشكلة او سؤال اكتب بالتعليقات.</span>
                    </li>
                </ul>
            </section>

            {/* Search Methods */}
            <section className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">طرق البحث في القنوات</h2>
                <ul className="list-none space-y-3 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                         <span className="text-green-500 text-xl">✪</span>
                         <span>ابحث بالقناة من خلال زر البحث 🔍 واكتب اسم التطبيق بشكل صحيح.</span>
                    </li>
                    <li className="flex items-start gap-2">
                         <span className="text-green-500 text-xl">✪</span>
                         <span>اكتب اسم التطبيق في التعليقات (داخل قنوات المناقشة) بإسم مضبوط (مثلاً: كاب كات).</span>
                    </li>
                    <li className="flex items-start gap-2">
                         <span className="text-green-500 text-xl">✪</span>
                         <span>في قناة المناقشات بالتعليقات اكتب كلمة بحث وأسم التطبيق (مثلاً: بحث ياسين).</span>
                    </li>
                </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};