import { escapeHtml, cleanPath } from '../utils/helpers.js';

export const GA_SCRIPT = (id) => `
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${id}');
</script>`;

export const AD_SCRIPT = (clientId) => `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}" crossorigin="anonymous"></script>`;

export const ONESIGNAL_SCRIPT = (appId) => `
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(function(OneSignal) {
    if (!OneSignal.initialized) {
        OneSignal.init({
          appId: "${appId}",
          safari_web_id: "web.onesignal.auto.xxxxx",
          notifyButton: { enable: true },
        });
        OneSignal.initialized = true;
    }
  });
</script>
`;

export const IMG_ERROR_SCRIPT = `
<script>
document.addEventListener('DOMContentLoaded', () => {
    // Image Fallback
    const fallbackImage = 'assets/images/me.jpg';
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            if (this.src.includes(fallbackImage)) return;
            this.src = fallbackImage;
            this.alt = 'Image unavailable';
            this.classList.add('img-fallback-active');
        };
        if (img.naturalWidth === 0 && img.complete) {
             img.src = fallbackImage;
        }
    });

    // Dynamic Active State for Nav Tabs
    const current = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-tab, .cat-tab").forEach(tab => {
      const href = tab.getAttribute("href");
      if (href && (href === current || (current === 'index.html' && href === 'index.html'))) {
        tab.classList.add("active");
      }
    });
});
</script>
`;

export const TICKER_HTML_TEMPLATE = `
<div id="news-ticker-bar" class="w-full bg-gray-900 text-white flex items-center overflow-hidden border-b border-gray-800 relative z-40">
    <div class="h-full flex items-center justify-center px-0 relative z-10 shrink-0">
        <div id="ticker-label" class="border-l border-white/10 text-blue-500 px-1 py-0.5 font-bold text-xs">
          جديد
        </div>
    </div>
    <div class="flex-1 overflow-hidden relative h-full flex items-center bg-gray-900">
      <div id="ticker-content" class="animate-marquee whitespace-nowrap absolute left-0 flex items-center">
      </div>
    </div>
</div>
`;

export const CATEGORY_NAV_TEMPLATE = `
<div class="w-full py-2 bg-gray-950 border-b border-gray-800">
    <div class="w-full px-3 overflow-x-auto no-scrollbar">
      <div class="flex items-center gap-2 min-w-max">
        <a href="index.html" class="cat-tab">
            <span>__LABEL_ARTICLES__</span>
        </a>
        <a href="apps.html" class="cat-tab">
            <span>__LABEL_APPS__</span>
        </a>
        <a href="games.html" class="cat-tab">
            <span>__LABEL_GAMES__</span>
        </a>
         <a href="sports.html" class="cat-tab">
            <span>__LABEL_SPORTS__</span>
        </a>
      </div>
    </div>
</div>
`;

export const renderIconHTML = (iconData, defaultIconName, defaultSize = 20) => {
    if (typeof iconData === 'string') {
        return `<i data-lucide="${iconData || defaultIconName}" style="width:${defaultSize}px; height:${defaultSize}px;"></i>`;
    }
    if (iconData && typeof iconData === 'object') {
        const size = iconData.size || defaultSize;
        if (iconData.type === 'image') {
            return `<img src="${cleanPath(iconData.value)}" style="width:${size}px; height:${size}px; object-fit:contain; display:block;" alt="icon" onerror="this.src='assets/images/me.jpg'">`;
        } else if (iconData.type === 'svg') {
            return `<svg viewBox="${iconData.viewBox || '0 0 24 24'}" fill="${iconData.fill || 'none'}" stroke="${iconData.stroke || 'currentColor'}" stroke-width="${iconData.strokeWidth || '2'}" style="width:${size}px; height:${size}px;">${iconData.value}</svg>`;
        } else {
            return `<i data-lucide="${iconData.value || defaultIconName}" style="width:${size}px; height:${size}px;"></i>`;
        }
    }
    return `<i data-lucide="${defaultIconName}" style="width:${defaultSize}px; height:${defaultSize}px;"></i>`;
};

export const generateAdBannerHTML = (aboutData) => {
    if (!aboutData.adBanner || aboutData.adBanner.enabled === false) return '';

    const ad = aboutData.adBanner;

    if (ad.type === 'image' && ad.imageUrl) {
        return `
        <div class="my-6 w-full flex justify-center">
            <a href="${ad.url || '#'}" target="_blank" class="block">
                <img src="${cleanPath(ad.imageUrl)}" 
                     alt="Advertisement" 
                     class="rounded-xl shadow-md max-w-full h-auto border border-gray-200 dark:border-gray-700"
                     onerror="this.style.display='none'">
            </a>
        </div>`;
    }

    return `
    <div class="my-6 w-full flex justify-center">
        <a href="${ad.url || '#'}"
           target="_blank"
           class="px-6 py-3 rounded-xl shadow-md font-bold transition-all"
           style="background:${ad.bgColor || 'rgba(37,99,235,0.1)'}; color:${ad.textColor || '#2563eb'};">
           ${escapeHtml(ad.text || 'أعلن هنا')}
        </a>
    </div>`;
};

export const generateSocialFooter = (aboutData) => {
    const socialKeys = ['facebook', 'instagram', 'tiktok', 'youtube', 'telegram'];
    const brandColors = {
        facebook: 'hover:bg-[#1877F2]',
        instagram: 'hover:bg-[#E4405F]',
        tiktok: 'hover:bg-black hover:border-gray-600',
        youtube: 'hover:bg-[#FF0000]',
        telegram: 'hover:bg-[#229ED9]'
    };
    const defaultIcons = {
        facebook: 'facebook', instagram: 'instagram', tiktok: 'video', youtube: 'youtube', telegram: 'send'
    };

    let iconsHTML = '';
    socialKeys.forEach(key => {
        const url = aboutData.social?.[key];
        if (url && url !== '#') {
            let iconData = aboutData.socialIcons?.[key];
            if (!iconData) iconData = defaultIcons[key];
            const iconHTML = renderIconHTML(iconData, defaultIcons[key], 20);
            const hoverClass = brandColors[key] || 'hover:bg-blue-600';
            iconsHTML += `<a href="${url}" target="_blank" class="social-icon-btn ${hoverClass} hover:text-white shadow-lg" aria-label="${key}">${iconHTML}</a>`;
        }
    });

    return `
    <footer class="bg-gray-900 text-gray-300 py-10 mt-auto border-t border-gray-800 footer-dynamic">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div class="flex items-center justify-center gap-4 mb-4 social-links-container">
                ${iconsHTML}
            </div>
            <p class="text-sm text-gray-500 font-medium">© 2026 ${aboutData.siteName || "TechTouch"}. جميع الحقوق محفوظة.</p>
        </div>
    </footer>
    `;
};

export const getCatLabel = (cat, aboutData) => {
    const defaults = { 'articles': 'اخبار', 'apps': 'تطبيقات', 'games': 'ألعاب', 'sports': 'رياضة' };
    const configured = aboutData.categories?.labels || {};
    return configured[cat] || defaults[cat] || 'عام';
};

export const createCardHTML = (post, aboutData) => {
    let badgeColor = 'bg-blue-600';
    let icon = 'file-text';
    if(post.category === 'apps') { badgeColor = 'bg-green-600'; icon = 'smartphone'; }
    if(post.category === 'games') { badgeColor = 'bg-purple-600'; icon = 'gamepad-2'; }
    if(post.category === 'sports') { badgeColor = 'bg-orange-600'; icon = 'trophy'; }
    
    const dateStr = post.effectiveDate.toLocaleString('ar-EG', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    return `
    <a href="article-${post.slug}.html" class="group block w-full h-full animate-fade-in post-card-wrapper">
        <div class="post-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col relative w-full">
            <div class="h-40 sm:h-48 w-full overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                <img src="${cleanPath(post.image)}" width="400" height="300" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${escapeHtml(post.title)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/images/me.jpg';" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div class="absolute top-2 right-2 ${badgeColor} text-white font-bold rounded-full flex items-center gap-1 shadow-lg z-10 custom-badge-size" style="padding: 0.3em 0.6em;">
                    <i data-lucide="${icon}" style="width: 1.2em; height: 1.2em;"></i><span>${getCatLabel(post.category, aboutData)}</span>
                </div>
            </div>
            <div class="p-4 flex-1 flex flex-col w-full">
                <div class="flex items-center gap-2 text-gray-400 mb-2 custom-meta-size">
                    <i data-lucide="clock" style="width: 1.2em; height: 1.2em;"></i><span dir="ltr" class="text-xs font-bold">${dateStr}</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors break-words whitespace-normal w-full line-clamp-2 custom-title-size" title="${escapeHtml(post.title)}">${post.title}</h3>
                <p class="text-gray-500 dark:text-gray-400 line-clamp-2 mb-0 flex-1 leading-relaxed break-words whitespace-normal w-full custom-desc-size">${post.description}</p>
            </div>
        </div>
    </a>`;
};
