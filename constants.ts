import { Article } from './types';

export const SITE_NAME = "TechTouch";
export const OWNER_NAME = "كنان الصائغ";

export const SAMPLE_ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'asus-gx10',
    title: 'مراجعة شاملة لجهاز Asus GX10 الجديد',
    excerpt: 'هل يستحق جهاز أسوس الجديد كل هذه الضجة؟ إليك التفاصيل الكاملة للمواصفات والأداء.',
    date: '2024-05-15',
    imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
    category: 'Tech',
    content: `
      <h2>مقدمة</h2>
      <p>أطلقت شركة Asus مؤخراً جهازها الجديد GX10 الذي يعد نقلة نوعية في عالم الأجهزة المحمولة. يأتي الجهاز بتصميم عصري ومواصفات قوية تناسب اللاعبين وصناع المحتوى على حد سواء.</p>
      <div class="ad-placeholder p-8 my-6 bg-gray-200 dark:bg-gray-800 border-2 border-dashed border-gray-400 text-center rounded-lg">
        <span class="text-gray-500 font-bold">مساحة إعلانية (Google AdSense)</span>
      </div>
      <h3>الأداء والمواصفات</h3>
      <p>تحت الغطاء، يعمل الجهاز بمعالج Intel Core Ultra 9 مع ذاكرة عشوائية تصل إلى 64GB.</p>
    `
  },
  {
    id: '2',
    slug: 'ai-news-2026',
    title: 'مستقبل الذكاء الاصطناعي في عام 2026',
    excerpt: 'توقعات مثيرة حول كيفية تغيير الذكاء الاصطناعي لحياتنا اليومية خلال العامين القادمين.',
    date: '2024-05-14',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    category: 'Tech',
    content: '<p>محتوى المقال عن الذكاء الاصطناعي...</p>'
  },
  {
    id: '10',
    slug: 'iphone-16-leaks',
    title: 'تسريبات آيفون 16: ماذا ننتظر من أبل؟',
    excerpt: 'نظرة أولية على التصميم الجديد والميزات المتوقعة في الهاتف القادم.',
    date: '2024-05-04',
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80',
    category: 'Tech',
    content: '<p>تفاصيل الايفون الجديد...</p>'
  },
  {
    id: '3',
    slug: 'capcut-update',
    title: 'تحديث CapCut الجديد يضيف ميزات خرافية',
    excerpt: 'تعرف على أدوات التحرير الجديدة التي تمت إضافتها لتطبيق المونتاج الشهير.',
    date: '2024-05-12',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    category: 'Apps',
    content: '<p>محتوى المقال عن تطبيق كاب كات...</p>'
  },
  {
    id: '6',
    slug: 'telegram-premium',
    title: 'ميزات تيليجرام بريميوم الجديدة',
    excerpt: 'هل يستحق الاشتراك؟ تعرف على كافة التفاصيل والمميزات الحصرية.',
    date: '2024-05-08',
    imageUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=800&q=80',
    category: 'Apps',
    content: '<p>تفاصيل تيليجرام...</p>'
  },
  {
    id: '9',
    slug: 'lightroom-presets',
    title: 'أفضل فلاتر لايت روم للمصورين 2024',
    excerpt: 'مجموعة مختارة من الفلاتر الاحترافية لتحسين صورك بضغطة زر.',
    date: '2024-05-05',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    category: 'Apps',
    content: '<p>تفاصيل التطبيق...</p>'
  },
  {
    id: '11',
    slug: 'whatsapp-features',
    title: 'واتساب يطلق ميزة القنوات عالمياً',
    excerpt: 'كيفية إنشاء قناة خاصة بك والوصول إلى جمهور واسع عبر التطبيق.',
    date: '2024-05-03',
    imageUrl: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?auto=format&fit=crop&w=800&q=80',
    category: 'Apps',
    content: '<p>تفاصيل واتساب...</p>'
  },
  {
    id: '4',
    slug: 'gta-6-leaks',
    title: 'تسريبات GTA VI الجديدة: الموعد المتوقع',
    excerpt: 'كل ما نعرفه عن لعبة العالم المفتوح المنتظرة من روكستار وتفاصيل الخريطة.',
    date: '2024-05-10',
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
    category: 'Games',
    content: '<p>تفاصيل لعبة GTA VI...</p>'
  },
  {
    id: '7',
    slug: 'minecraft-update',
    title: 'تحديث ماينكرافت 1.21: الغرف المحاكمة',
    excerpt: 'استكشف الميزات الجديدة والوحوش التي تمت إضافتها في التحديث الأخير.',
    date: '2024-05-07',
    imageUrl: 'https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?auto=format&fit=crop&w=800&q=80',
    category: 'Games',
    content: '<p>تفاصيل ماينكرافت...</p>'
  },
  {
    id: '12',
    slug: 'pubg-mobile-update',
    title: 'تحديث ببجي موبايل: مود الديناصورات',
    excerpt: 'شرح كامل للمود الجديد وأماكن تواجد الأسلحة القوية.',
    date: '2024-05-02',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    category: 'Games',
    content: '<p>تفاصيل ببجي...</p>'
  },
  {
    id: '5',
    slug: 'ucl-app-update',
    title: 'تطبيق دوري أبطال أوروبا والذكاء الاصطناعي',
    excerpt: 'تحليل المباريات ورؤية الإحصائيات بشكل لم يسبق له مثيل في التحديث الجديد.',
    date: '2024-05-09',
    imageUrl: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    content: '<p>تفاصيل التحديث الرياضي...</p>'
  },
  {
    id: '8',
    slug: 'real-madrid-news',
    title: 'صفقات ريال مدريد الصيفية: مبابي وصل',
    excerpt: 'تغطية شاملة لانتقالات اللاعبين في الدوري الإسباني لهذا الموسم.',
    date: '2024-05-06',
    imageUrl: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    content: '<p>تفاصيل الرياضة...</p>'
  },
  {
    id: '13',
    slug: 'premier-league-winner',
    title: 'مانشستر سيتي يحسم لقب الدوري',
    excerpt: 'تحليل فني للمباراة الحاسمة وأداء الفريق طوال الموسم.',
    date: '2024-05-01',
    imageUrl: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    content: '<p>تفاصيل الدوري الانجليزي...</p>'
  },
   {
    id: '14',
    slug: 'nba-finals',
    title: 'نهائيات NBA: صراع العمالقة',
    excerpt: 'تغطية حصرية للمواجهة المنتظرة بين الشرق والغرب.',
    date: '2024-04-30',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    content: '<p>تفاصيل كرة السلة...</p>'
  }
];