const fs = require('fs');
const path = require('path');

// --- SAFETY FIX: Polyfill File API if missing ---
if (typeof global.File === 'undefined') {
    try {
        const { File } = require('node:buffer');
        if (File) global.File = File;
    } catch (e) { console.warn("Polyfill check skipped"); }
}

const cheerio = require('cheerio');

// Directories
const ROOT_DIR = path.join(__dirname, '../');
const POSTS_DIR = path.join(__dirname, '../content/posts');
const DATA_DIR = path.join(__dirname, '../content/data');

// Domain Configuration
const BASE_URL = 'https://kinantouch.com';

// --- INTEGRATION CONFIGURATION ---
const GA_ID = 'G-NZVS1EN9RG'; 
const AD_CLIENT_ID = 'ca-pub-7355327732066930';
const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID'; 
const GOOGLE_SITE_VERIFICATION = ''; 

// --- HELPER: Validate Date ---
const validateDate = (d, fallback = new Date()) => {
    if (!d) return fallback;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) {
        return fallback;
    }
    return parsed;
};

// --- HELPER: Combine Date & Time with Baghdad Timezone (UTC+3) ---
const combineDateTime = (dateStr, timeStr = "00:00") => {
    const d = typeof dateStr === 'string' ? dateStr : new Date().toISOString().split('T')[0];
    const t = typeof timeStr === 'string' ? timeStr : "00:00";
    const isoString = `${d}T${t}:00+03:00`;
    const parsed = new Date(isoString);
    if (isNaN(parsed.getTime())) {
        return new Date(); 
    }
    return parsed;
};

// --- SCRIPTS TEMPLATES ---
const GA_SCRIPT = `
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>`;

const AD_SCRIPT = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}" crossorigin="anonymous"></script>`;

const ONESIGNAL_SCRIPT = `
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(function(OneSignal) {
    if (!OneSignal.initialized) {
        OneSignal.init({
          appId: "${ONESIGNAL_APP_ID}",
          safari_web_id: "web.onesignal.auto.xxxxx",
          notifyButton: { enable: true },
        });
        OneSignal.initialized = true;
    }
  });
</script>
`;

const IMG_ERROR_SCRIPT = `
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

const TICKER_HTML_TEMPLATE = `
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

// AD BANNER TEMPLATE (Placeholder, real content generated via function)
const AD_BANNER_TEMPLATE = `
<div id="custom-ad-banner" class="w-full my-6 flex justify-center">
    <div class="max-w-4xl w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
        __AD_CONTENT__
    </div>
</div>
`;

// NEW CATEGORY NAV TEMPLATE (Restructured: No Container, Scrollable)
const CATEGORY_NAV_TEMPLATE = `
<div class="w-full py-2 bg-gray-950 border-b border-gray-800">
    <div class="w-full px-3 overflow-x-auto no-scrollbar">
      <div class="flex items-center gap-2 min-w-max">
        <a href="index.html" class="cat-tab">
            <i data-lucide="file-text"></i><span>__LABEL_ARTICLES__</span>
        </a>
        <a href="apps.html" class="cat-tab">
            <i data-lucide="smartphone"></i><span>__LABEL_APPS__</span>
        </a>
        <a href="games.html" class="cat-tab">
            <i data-lucide="gamepad-2"></i><span>__LABEL_GAMES__</span>
        </a>
         <a href="sports.html" class="cat-tab">
            <i data-lucide="trophy"></i><span>__LABEL_SPORTS__</span>
        </a>
      </div>
    </div>
</div>
`;

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Load Data
let aboutData = { 
    profileName: "TechTouch", 
    bio: "", 
    profileImage: "assets/images/me.jpg", 
    siteName: "TechTouch",
    logoType: "text",
    logoUrl: "",
    categories: { labels: { articles: "اخبار", apps: "تطبيقات", games: "ألعاب", sports: "رياضة" } },
    globalFonts: { nav: 12, content: 13, titles: 14, mainTitles: 15 },
    social: {},
    socialIcons: {},
    ticker: { enabled: true, text: "Welcome", label: "New", url: "#" },
    adBanner: { enabled: false, type: "text", text: "أعلن هنا", url: "#", textColor: "#2563eb", bgColor: "rgba(37, 99, 235, 0.1)" }
};
let channelsData = [];

if (fs.existsSync(path.join(DATA_DIR, 'about.json'))) {
    try { aboutData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'about.json'), 'utf8')); } catch (e) { console.error("Error parsing about.json", e); }
}
if (fs.existsSync(path.join(DATA_DIR, 'channels.json'))) {
    try { channelsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'channels.json'), 'utf8')); } catch (e) { console.error("Error parsing channels.json", e); }
}

// --- UTILITY FUNCTIONS ---

const safeWrite = (filePath, content) => {
    try { fs.writeFileSync(filePath, content); } catch (err) { console.error(`❌ Write failed for: ${filePath}`); throw err; }
};

const escapeHtml = (str = '') => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, s =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[s])
    );
};

const cleanPath = (p) => {
    if (!p) return '';
    if (p.startsWith('http')) return p;
    return p.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
};

const toAbsoluteUrl = (url) => {
    const clean = cleanPath(url || 'assets/images/me.jpg');
    if (clean.startsWith('http')) return clean;
    return `${BASE_URL}/${clean}`;
};

const escapeXml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};

const renderIconHTML = (iconData, defaultIconName, defaultSize = 20) => {
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

// --- Updated Ad Banner Generator ---
const generateAdBannerHTML = () => {
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

const generateSocialFooter = () => {
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

const STANDARD_FOOTER = generateSocialFooter();

const parseMarkdown = (markdown) => {
    if (!markdown) return '';
    let html = markdown;
    html = html.replace(/\$1/g, '');
    html = html.replace(/@\[youtube\]\((.*?)\)/g, (match, url) => {
        let videoId = '';
        const matchId = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
        if (matchId) videoId = matchId[1];
        if (videoId) {
            return `<div class="video-container shadow-lg rounded-xl overflow-hidden border border-gray-800 w-full max-w-full"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
        }
        return '';
    });
    // Add onerror to content images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => `<div class="article-image-container"><img src="${src}" alt="${alt}" onerror="this.onerror=null;this.src='assets/images/me.jpg';"></div>`);
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, `<div class="my-6 w-full flex justify-center px-2"><a href="$2" target="_blank" class="btn-wrapped-link w-full sm:w-auto"><i data-lucide="external-link" class="shrink-0 w-4 h-4"></i><span class="break-words whitespace-normal text-center">$1</span></a></div>`);
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3 break-words whitespace-normal w-full">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-blue-600 dark:text-blue-400 mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 break-words whitespace-normal w-full">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-gray-900 dark:text-white mt-8 mb-6 break-words whitespace-normal w-full">$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc marker:text-blue-500 break-words whitespace-normal">$1</li>');
    html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-inside space-y-2 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm w-full">$&</ul>');
    
    html = html.split('\n').map(line => {
        if (line.trim() === '') return '';
        if (line.match(/^<(h|ul|li|div|img|iframe|p|script)/)) return line;
        return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base break-words whitespace-normal w-full">${line}</p>`;
    }).join('\n');
    return html;
};

// --- POST LOADING ---
const rawPosts = [];
const titleRegistry = new Set(); 

if (fs.existsSync(POSTS_DIR)) {
    fs.readdirSync(POSTS_DIR).forEach(file => {
        if (path.extname(file) === '.json') {
            try {
                const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
                if (!post.slug) post.slug = file.replace('.json', '');
                
                // SEO Safe Normalization: Stable Slug Logic
                post.slug = post.slug.trim().toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-\u0600-\u06FF]/g, '') // Allow Arabic + Alphanumeric
                    .replace(/\-\-+/g, '-') // Dedupe dashes
                    .replace(/^-+|-+$/g, '') // Trim dashes from start/end
                    .substring(0, 80); // Limit length to 80 chars

                if (post.title) {
                    const normalizedTitle = post.title.trim().toLowerCase();
                    if (titleRegistry.has(normalizedTitle)) {
                        // Suppress warnings in production to avoid log noise
                        if (process.env.NODE_ENV !== 'production') {
                            console.warn(`⚠ Duplicate title detected in "${file}": "${post.title}"`);
                        }
                    } else {
                        titleRegistry.add(normalizedTitle);
                    }
                }

                post.publishTime = post.time || "00:00";
                if (!post.date) post.date = new Date().toISOString().split('T')[0];
                if (!post.updated) post.updated = post.date;

                post.publishedAt = combineDateTime(post.date, post.publishTime);
                post.updatedAt = combineDateTime(post.updated, post.publishTime); 
                post.effectiveDate = post.publishedAt; 

                post.content = parseMarkdown(post.content);
                post._originalFile = file;
                rawPosts.push(post);
            } catch (e) { console.error(`Error reading post ${file}:`, e); }
        }
    });
}

// Sort by Date Descending (Explicit Sort)
rawPosts.sort((a, b) => b.effectiveDate - a.effectiveDate);
const allPosts = rawPosts;

// Category Map
const postsByCategory = allPosts.reduce((acc, post) => {
    const cat = post.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(post);
    return acc;
}, {});

const getCatLabel = (cat) => {
    const defaults = { 'articles': 'اخبار', 'apps': 'تطبيقات', 'games': 'ألعاب', 'sports': 'رياضة' };
    const configured = aboutData.categories?.labels || {};
    return configured[cat] || defaults[cat] || 'عام';
};

const createCardHTML = (post) => {
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
                    <i data-lucide="${icon}" style="width: 1.2em; height: 1.2em;"></i><span>${getCatLabel(post.category)}</span>
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

const updateGlobalElements = (htmlContent, fileName = '', pageTitleOverride = '') => {
    const $ = cheerio.load(htmlContent, { decodeEntities: false });

    // 1. Safe Definition - Defined at the TOP of the function scope
    const isArticle = typeof fileName === 'string' && fileName.startsWith('article-');

    // Safety fallback for fileName
    if (!fileName || typeof fileName !== 'string') {
        fileName = 'index.html';
    }

    // SEO Title Logic
    if (pageTitleOverride) {
        $('title').text(pageTitleOverride);
        $('meta[property="og:title"]').attr('content', pageTitleOverride);
    }

    // Preconnect for Performance
    const preconnectTags = `
    <link rel="preconnect" href="https://esm.sh" crossorigin>
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
    <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    `;
    $('head').prepend(preconnectTags);

    $('script').each((i, el) => {
        const src = $(el).attr('src') || '';
        const content = $(el).html() || '';
        if (src.includes("cdn.onesignal.com") || content.includes("OneSignal")) { $(el).remove(); }
        if (src.includes('googletagmanager.com') || content.includes("gtag(") || src.includes('G-')) { $(el).remove(); }
        if (src.includes("pagead2.googlesyndication.com") || content.includes("adsbygoogle")) { $(el).remove(); }
        if (content.includes("document.addEventListener('DOMContentLoaded', () => {") && content.includes("fallbackImage")) { $(el).remove(); }
        // Remove Fuse CDN injection here (handled in search-engine.js module)
        if (src.includes("fuse.js")) { $(el).remove(); }
    });

    // Conditional Script Loading - USING isArticle
    if (!isArticle) {
        $('head').append(ONESIGNAL_SCRIPT);
    }

    const noAdsPages = ['privacy.html', 'about.html'];
    if (!noAdsPages.includes(fileName)) {
        $('head').append(AD_SCRIPT);
    }
    
    $('head').prepend(GA_SCRIPT);
    $('body').append(IMG_ERROR_SCRIPT);
    
    // --- GUARANTEE SEARCH ENGINE INJECTION ---
    const SEARCH_MODULE = '<script src="assets/js/search-engine.js" type="module"></script>';
    
    // Check if Search Engine exists, if not append to body
    let hasSearch = false;
    $('script').each((i, el) => { if($(el).attr('src')?.includes('search-engine.js')) hasSearch = true; });
    if(!hasSearch) $('body').append(SEARCH_MODULE);

    // --- CRITICAL SEO: Strict Canonical Logic ---
    let canonicalUrl;
    if (fileName === 'index.html') {
        canonicalUrl = `${BASE_URL}/`;
    } else {
        canonicalUrl = `${BASE_URL}/${fileName}`;
    }
    
    $('link[rel="canonical"]').remove();
    $('head').append(`<link rel="canonical" href="${canonicalUrl}">`);

    if (GOOGLE_SITE_VERIFICATION) {
        $('meta[name="google-site-verification"]').remove();
        $('head').append(`<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}" />`);
    }

    let profileImgSrc = aboutData.profileImage || 'assets/images/me.jpg';
    profileImgSrc = cleanPath(profileImgSrc);
    $('#header-profile-img').attr('src', profileImgSrc);
    $('.profile-img-display').attr('src', profileImgSrc);
    $('link[rel*="icon"]').attr('href', profileImgSrc);
    $('meta[property="og:image"]').attr('content', toAbsoluteUrl(profileImgSrc));
    $('#header-profile-name').text(aboutData.profileName);
    
    let siteTitleEl = $('header a[href="index.html"]').filter((i, el) => {
        const cls = $(el).attr('class') || '';
        const content = $(el).html() || '';
        return !cls.includes('p-2') && (content.includes(aboutData.siteName) || content.includes('<img') || cls.includes('font-black'));
    }).first();

    if (siteTitleEl.length) {
        if (aboutData.logoType === 'image' && aboutData.logoUrl) {
            const logoUrl = cleanPath(aboutData.logoUrl);
            siteTitleEl.html(`<img src="${logoUrl}" alt="${escapeHtml(aboutData.siteName)}" style="max-height: 40px; width: auto; display: block;" />`);
            siteTitleEl.removeClass('text-xl text-lg font-black text-blue-600 dark:text-blue-400 tracking-tight truncate'); 
            siteTitleEl.addClass('flex items-center');
        } else {
            siteTitleEl.html(escapeHtml(aboutData.siteName || 'TechTouch'));
            siteTitleEl.removeClass('flex items-center');
            siteTitleEl.addClass('text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight truncate');
        }
    }

    const headerDiv = $('header > div');
    headerDiv.find('#theme-toggle').remove();
    headerDiv.find('#home-btn-header').remove();
    // Remove old search trigger from header
    headerDiv.find('#search-trigger').remove();
    headerDiv.find('a:has(i[data-lucide="arrow-right"])').remove();
    headerDiv.find('button:has(i[data-lucide="arrow-right"])').remove();

    let actionsContainer = headerDiv.find('.header-actions');
    if (actionsContainer.length === 0) {
        const lastFlex = headerDiv.find('div.flex.items-center.gap-2').last();
        if(lastFlex.length) {
            actionsContainer = lastFlex;
            actionsContainer.addClass('header-actions');
        } else {
            actionsContainer = $('<div class="flex items-center gap-1 header-actions"></div>');
            headerDiv.append(actionsContainer);
        }
    }
    actionsContainer.empty();

    // USING isArticle check
    if (!isArticle) {
        const homeBtn = `
        <a href="index.html" id="home-btn-header" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mx-1 order-1" aria-label="الرئيسية">
            <i data-lucide="home" class="w-5 h-5 text-gray-600 dark:text-gray-300"></i>
        </a>`;
        const themeBtn = `
        <button id="theme-toggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors order-3">
            <i data-lucide="moon" class="w-5 h-5 text-gray-600 dark:hidden"></i>
            <i data-lucide="sun" class="w-5 h-5 text-yellow-500 hidden dark:block"></i>
        </button>`;
        actionsContainer.append(homeBtn);
        actionsContainer.append(themeBtn);
    }

    // --- MAIN NAV RESTRUCTURING (4-Col Grid System) ---
    const mainNav = $('nav');
    
    // Replace the entire Nav structure with strict 4-column Grid
    const newNavHTML = `
    <div class="grid grid-cols-4 gap-2 px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <a href="index.html" class="nav-tab">
            <i data-lucide="home"></i>
            <span>الرئيسية</span>
        </a>
        <a href="tools.html" class="nav-tab">
            <i data-lucide="wrench"></i>
            <span>الأدوات</span>
        </a>
        <a href="about.html" class="nav-tab">
            <i data-lucide="info"></i>
            <span>حول</span>
        </a>
        <button id="nav-search-btn" class="nav-tab">
            <i data-lucide="search"></i>
            <span>بحث</span>
        </button>
    </div>
    `;
    
    // We replace the internal container of nav, preserving the wrapper if needed, 
    // or replacing the whole nav logic to fit the grid structure directly.
    // Ideally, we want to replace the standard Nav structure with this grid.
    mainNav.empty().removeClass().addClass('w-full sticky top-16 z-30').html(newNavHTML);

    const fonts = aboutData.globalFonts || { nav: 12, content: 13, titles: 14, mainTitles: 15 };
    const baseContentFont = fonts.content || 13;
    const spacingScale = baseContentFont / 13;

    const dynamicStyle = `
    <style id="dynamic-theme-styles">

/* =====================================
   STRUCTURAL PRESERVATION (No Fonts)
===================================== */
.nav-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 0;
    border-radius: 12px;
    font-weight: 600;
    color: #6b7280;
    background: transparent;
    transition: all 0.2s ease;
    width: 100%;
}
.dark .nav-tab { color: #9ca3af; }
.nav-tab i { width: 20px; height: 20px; }
.nav-tab:hover { background: #f3f4f6; color: #1f2937; }
.dark .nav-tab:hover { background: #1f2937; color: #f3f4f6; }
.nav-tab.active { background: #2563eb; color: white; }
.dark .nav-tab.active { background: #2563eb; color: white; }

.cat-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    font-weight: 600;
    border-radius: 999px;
    background: #f3f4f6;
    color: #6b7280;
    white-space: nowrap;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}
.dark .cat-tab { background: #1f2937; color: #9ca3af; }
.cat-tab i { width: 14px; height: 14px; }
.cat-tab:hover { background: #e5e7eb; color: #1f2937; }
.dark .cat-tab:hover { background: #374151; color: white; }
.cat-tab.active { background: #2563eb; color: white; border-color: #2563eb; }
.dark .cat-tab.active { background: #2563eb; color: white; }

.ticker-text, .ticker-text a { font-size: ${aboutData.ticker?.fontSize || 14}px !important; }

/* =====================================
   ROOT SCALE SYSTEM
===================================== */

:root {
  --spacing-scale: ${spacingScale};
}

/* =====================================
   NAVIGATION CONTROL
   (Main Nav + Category Nav)
===================================== */

.nav-tab,
.nav-tab span,
.cat-tab,
.cat-tab span,
nav .nav-link,
nav .nav-link span {
  font-size: ${fonts.nav || 12}px !important;
}

/* =====================================
   CONTENT BODY CONTROL
===================================== */

body,
p,
li,
.post-card .custom-desc-size,
.prose p,
.prose li,
article p,
article li {
  font-size: ${fonts.content || 14}px !important;
  line-height: 1.6 !important;
}

/* =====================================
   TITLES CONTROL (H2 / H3 / Cards)
===================================== */

h2,
h3,
h4,
.prose h2,
.prose h3,
.post-card .custom-title-size,
.related-fixed-title {
  font-size: ${fonts.titles || 18}px !important;
  margin-bottom: calc(8px * var(--spacing-scale)) !important;
}

/* =====================================
   MAIN TITLES (H1)
===================================== */

h1,
.article-header-card h1,
.text-3xl,
.text-4xl {
  font-size: ${fonts.mainTitles || 26}px !important;
  margin-bottom: calc(14px * var(--spacing-scale)) !important;
}

/* =====================================
   COMPACT SPACING SYSTEM
===================================== */

/* تقليل padding الرئيسي */
main {
  padding-top: calc(12px * var(--spacing-scale)) !important;
  padding-bottom: calc(12px * var(--spacing-scale)) !important;
}

/* تقليل المسافة بين البطاقات */
.grid {
  gap: calc(12px * var(--spacing-scale)) !important;
}

/* تقليل المسافات بين الأقسام */
section {
  margin-top: calc(16px * var(--spacing-scale)) !important;
  margin-bottom: calc(16px * var(--spacing-scale)) !important;
}

/* ضبط قسم related */
.related-posts {
  margin-top: calc(18px * var(--spacing-scale)) !important;
  padding-top: calc(12px * var(--spacing-scale)) !important;
}

/* تقليل مسافة المقال */
article {
  margin-top: 8px !important;
}

/* تقليل padding البطاقات */
.post-card .p-4 {
  padding: 12px !important;
}

#about-cover-section {
  padding: calc(30px * var(--spacing-scale)) !important;
}

</style>
    `;
    $('#dynamic-theme-styles').remove();
    $('head').append(dynamicStyle);

    $('footer').replaceWith(STANDARD_FOOTER);

    // Ticker Logic
    $('#news-ticker-bar').remove();
    const isCategoryPage = ['index.html', 'apps.html', 'games.html', 'sports.html'].includes(fileName) || fileName.match(/-page-\d+\.html$/);
    if (isCategoryPage && aboutData.ticker && aboutData.ticker.enabled !== false) {
        $('header').after(TICKER_HTML_TEMPLATE);
        $('#ticker-label').text(aboutData.ticker.label);
        const tickerContentDiv = $('#ticker-content');
        tickerContentDiv.removeClass().addClass('flex items-center h-full whitespace-nowrap');
        if (aboutData.ticker.animated !== false) {
            tickerContentDiv.addClass('animate-marquee absolute left-0');
        } else {
            tickerContentDiv.removeClass('animate-marquee absolute left-0');
        }
        if (aboutData.ticker.type === 'image' && aboutData.ticker.imageUrl) {
            const imgUrl = cleanPath(aboutData.ticker.imageUrl);
            const contentHtml = `<img src="${imgUrl}" alt="Ticker Banner" class="h-full object-contain mx-auto" style="max-height: 40px; width: auto;" onerror="this.style.display='none'"/>`;
            tickerContentDiv.html(contentHtml);
        } else {
            let contentHtml = `<span class="mx-4 font-medium text-gray-100 ticker-text whitespace-nowrap inline-block">${escapeHtml(aboutData.ticker.text)}</span>`;
            if(aboutData.ticker.url && aboutData.ticker.url !== '#') {
                contentHtml = `<a href="${aboutData.ticker.url}" class="hover:text-blue-300 transition-colors whitespace-nowrap inline-block ticker-text text-gray-100">${escapeHtml(aboutData.ticker.text)}</a>`;
            }
            tickerContentDiv.html(contentHtml);
        }
    }
    
    if (fileName === 'about.html') {
        const coverContainer = $('#about-cover-section');
        if (coverContainer.length) {
            coverContainer.attr('style', ''); 
            if (aboutData.coverType === 'image' && aboutData.coverValue) {
                const coverUrl = cleanPath(aboutData.coverValue);
                coverContainer.css('background', `url('${coverUrl}') center/cover no-repeat`);
                coverContainer.removeClass((i, c) => (c.match(/bg-gradient-\S+/g) || []).join(' '));
            } else {
                coverContainer.css('background', ''); 
                coverContainer.removeClass((i, c) => (c.match(/bg-gradient-\S+/g) || []).join(' '));
                coverContainer.addClass(aboutData.coverValue || 'bg-gradient-to-r from-blue-700 to-blue-500');
            }
        }
        $('#about-bot-list').parent().find('h2').contents().last().replaceWith(' ' + (aboutData.botTitle || 'مركز خدمة الطلبات (Bot)'));
        if(aboutData.botInfo) {
            const botItems = aboutData.botInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-blue-500 text-xl">✪</span><span>${escapeHtml(i)}</span></li>`).join('');
            $('#about-bot-list').html(botItems);
        }
        $('#about-search-list').parent().find('h2').contents().last().replaceWith(' ' + (aboutData.searchTitle || 'دليل الوصول الذكي للمحتوى'));
        if(aboutData.searchInfo) {
            const searchItems = aboutData.searchInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-green-500 text-xl">✪</span><span>${escapeHtml(i)}</span></li>`).join('');
            $('#about-search-list').html(searchItems);
        }
        $('.prose p:first').text(aboutData.bio);
    }

    if ($('#back-to-top').length === 0) {
        $('body').append(`
        <button id="back-to-top" class="fixed bottom-6 right-6 z-50 bg-gray-900/60 hover:bg-gray-900/80 backdrop-blur-md text-white p-2 rounded-full shadow-lg transition-all duration-300 transform translate-y-10 opacity-0 invisible hover:scale-110 hover:-translate-y-1 focus:outline-none border border-white/10 group" aria-label="العودة للأعلى">
            <i data-lucide="arrow-up" class="w-5 h-5"></i>
        </button>
        `);
    }

    let finalHtml = $.html();
    if (!finalHtml.trim().toLowerCase().startsWith('<!doctype html>')) {
        finalHtml = '<!DOCTYPE html>\n' + finalHtml;
    }
    return finalHtml;
};

// --- NEW PAGE GENERATION LOGIC (MPA with Static Pagination) ---
const generateCategoryPages = () => {
    // We reuse the basic structure from articles.html or index.html
    const templatePath = path.join(ROOT_DIR, 'articles.html');
    if (!fs.existsSync(templatePath)) return;
    
    let baseTemplate = fs.readFileSync(templatePath, 'utf8');
    const labels = aboutData.categories?.labels || {};

    const pages = [
        { file: 'index.html', cat: 'articles', title: labels.articles || 'الأخبار', desc: 'آخر الأخبار التقنية والمقالات الحصرية من TechTouch.' },
        { file: 'apps.html', cat: 'apps', title: labels.apps || 'تطبيقات', desc: 'أفضل تطبيقات أندرويد وآيفون المعدلة والمفيدة.' },
        { file: 'games.html', cat: 'games', title: labels.games || 'ألعاب', desc: 'أحدث الألعاب ومراجعاتها.' },
        { file: 'sports.html', cat: 'sports', title: labels.sports || 'رياضة', desc: 'تغطية الأحداث الرياضية والتقنيات المتعلقة بها.' }
    ];

    pages.forEach(p => {
        const posts = postsByCategory[p.cat] || [];
        const ITEMS_PER_PAGE = 15;
        // Strict pagination only if posts exceed 60
        const shouldPaginate = posts.length > 60;
        
        // Calculate total pages if pagination is active, else 1
        const totalPages = shouldPaginate ? Math.ceil(posts.length / ITEMS_PER_PAGE) : 1;

        // Loop for pages (at least 1 run)
        for (let i = 0; i < totalPages; i++) {
            const $ = cheerio.load(baseTemplate, { decodeEntities: false });
            
            // 1. Inject Category Nav
            const oldTabContainer = $('.w-full.py-2');
            if (oldTabContainer.length) {
                let navHtml = CATEGORY_NAV_TEMPLATE
                    .replace('__LABEL_ARTICLES__', labels.articles || 'اخبار')
                    .replace('__LABEL_APPS__', labels.apps || 'تطبيقات')
                    .replace('__LABEL_GAMES__', labels.games || 'ألعاب')
                    .replace('__LABEL_SPORTS__', labels.sports || 'رياضة');
                oldTabContainer.replaceWith(navHtml);
            }

            // 2. Set Active State
            const activeHref = p.file;
            $(`a[href="${activeHref}"]`).addClass('active');

            // 3. Populate Content
            const main = $('main');
            main.empty();
            const grid = $('<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"></div>');
            
            let currentPosts = posts;
            if (shouldPaginate) {
                const start = i * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                currentPosts = posts.slice(start, end);
            }

            if (currentPosts.length > 0) {
                currentPosts.forEach(post => grid.append(createCardHTML(post)));
            } else {
                $('head').append('<meta name="robots" content="noindex, follow">');
                grid.html('<div class="col-span-full text-center py-20 text-gray-400 text-sm">لا توجد منشورات في هذا القسم حالياً.</div>');
            }
            main.append(grid);

            // Inject Ad Banner
            const adBannerHTML = generateAdBannerHTML();
            if (adBannerHTML) {
                main.prepend(adBannerHTML);
            }

            // 4. Update Titles & Meta
            const pageTitle = i === 0 ? `${p.title} | ${aboutData.siteName || "TechTouch"}` : `${p.title} - صفحة ${i + 1} | ${aboutData.siteName || "TechTouch"}`;
            $('title').text(pageTitle);
            $('meta[name="description"]').attr('content', p.desc);
            
            // 5. SEO Link Tags
            if (shouldPaginate) {
                const baseFileName = p.file.replace('.html', '');
                const currentFileName = i === 0 ? p.file : `${baseFileName}-page-${i + 1}.html`;
                const nextFileName = `${baseFileName}-page-${i + 2}.html`;
                const prevFileName = i === 1 ? p.file : `${baseFileName}-page-${i}.html`;

                if (i > 0) {
                    $('head').append(`<link rel="prev" href="${BASE_URL}/${prevFileName}">`);
                }
                if (i < totalPages - 1) {
                    $('head').append(`<link rel="next" href="${BASE_URL}/${nextFileName}">`);
                }
            }

            // 6. Save File
            const fileName = i === 0 ? p.file : p.file.replace('.html', `-page-${i + 1}.html`);
            const filePath = path.join(ROOT_DIR, fileName);
            safeWrite(filePath, updateGlobalElements($.html(), fileName, pageTitle));
        }
    });
};

const updateToolsPage = () => { 
    const filePath = path.join(ROOT_DIR, 'tools.html'); 
    if (!fs.existsSync(filePath)) return; 
    let html = fs.readFileSync(filePath, 'utf8'); 
    const $ = cheerio.load(html); 
    const main = $('main'); 
    if (main.length) { 
        main.find('.adsbygoogle-container').remove(); 
        main.find('a[href="tool-analysis.html"]').remove(); 
    } 
    safeWrite(filePath, updateGlobalElements($.html(), 'tools.html')); 
};

const updateAboutPageDetails = () => { const aboutPath = path.join(ROOT_DIR, 'about.html'); if (!fs.existsSync(aboutPath)) return; let html = fs.readFileSync(aboutPath, 'utf8'); const $ = cheerio.load(html); safeWrite(aboutPath, updateGlobalElements($.html(), 'about.html')); };
const updateChannelsPage = () => {
    const toolsPath = path.join(ROOT_DIR, 'tools-sites.html'); if (!fs.existsSync(toolsPath)) return; let html = fs.readFileSync(toolsPath, 'utf8'); const $ = cheerio.load(html); const grid = $('main .grid'); grid.empty();
    channelsData.forEach(ch => {
        const renderedIcon = renderIconHTML(ch.iconData || ch.icon, 'star', 24);
        grid.append(`<a href="${ch.url}" target="_blank" class="block bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group w-full"><div class="flex items-center gap-4 h-full"><div class="w-12 h-12 bg-${ch.color}-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white overflow-hidden">${renderedIcon}</div><div class="flex-1 min-w-0"><h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1 break-words whitespace-normal">${escapeHtml(ch.name)}</h3><p class="text-xs text-gray-500 dark:text-gray-400 truncate">${escapeHtml(ch.desc)}</p></div><div class="text-gray-300 group-hover:text-${ch.color}-600 shrink-0 transition-colors"><i data-lucide="chevron-left" class="w-5 h-5"></i></div></div></a>`);
    });
    safeWrite(toolsPath, updateGlobalElements($.html(), 'tools-sites.html'));
};

const generateIndividualArticles = () => {
    const templatePath = path.join(ROOT_DIR, 'article-asus-gx10.html');
    let template = '';
    // Fix 4: Handle missing template gracefully
    if (fs.existsSync(templatePath)) { 
        template = fs.readFileSync(templatePath, 'utf8'); 
    } else { 
        console.error("Article template missing. Skipping article generation.");
        return;
    }

    allPosts.forEach(post => {
        const $ = cheerio.load(template);
        const pageSlug = `article-${post.slug}.html`;
        const fullUrl = `${BASE_URL}/${pageSlug}`;
        const fullImageUrl = toAbsoluteUrl(post.image);
        
        $('title').text(`${post.title} | ${aboutData.siteName || "TechTouch"}`);
        $('meta[name="description"]').attr('content', post.description);
        
        const formattedDate = post.effectiveDate.toLocaleString('ar-EG', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
        
        // --- SMART TITLE RENDERING ---
        let titleContent = '';
        const titleRaw = (post.title || '').trim();
        if (titleRaw.startsWith('<') || titleRaw.startsWith('#')) {
            titleContent = parseMarkdown(titleRaw);
        } else {
            titleContent = `<h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight break-words w-full m-0 text-center">${escapeHtml(post.title)}</h1>`;
        }

        // --- AI SUMMARY BUTTON (Moved below Meta Bar) ---
        let summaryButtonHTML = '';
        if (post.summary) {
             summaryButtonHTML = `
            <div class="w-full flex justify-center mt-3 mb-5">
                <button class="ai-summary-btn">
                    <i data-lucide="sparkles" class="w-4 h-4 text-blue-500"></i>
                    <span>تلخيص المحتوى AI</span>
                </button>
            </div>
            `;
        }

        const articleHeaderHTML = `
        <header class="mb-8 relative">
            <div class="article-header-card relative z-20">
                ${titleContent}
            </div>
            <div class="article-meta-bar flex flex-col items-center justify-center px-4 py-3 border-t border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-x-auto no-scrollbar relative z-10">
                <div class="flex items-center gap-4 sm:gap-6 w-full justify-center">
                    <div class="flex items-center gap-1.5 group" title="تاريخ النشر">
                        <i data-lucide="calendar-clock" class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform"></i>
                        <span dir="ltr" class="font-medium font-mono tracking-tight">${formattedDate}</span>
                    </div>
                    <div class="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                    <div class="flex items-center gap-1.5 view-count-wrapper group" title="المشاهدات">
                        <i data-lucide="eye" class="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform"></i>
                        <span class="view-count-display font-bold font-mono tracking-tight" data-slug="${post.slug}">—</span>
                    </div>
                </div>
            </div>
            ${summaryButtonHTML}
        </header>
        `;
        
        const existingHeader = $('main header').first();
        if(existingHeader.length) {
            existingHeader.replaceWith(articleHeaderHTML);
        } else {
            $('main').prepend(articleHeaderHTML);
        }

        $('#custom-ad-banner').remove();

        // Breadcrumbs: Point to real pages now
        let breadcrumbLabel = 'اخبار';
        let breadcrumbLink = 'index.html';
        if (post.category === 'apps') { breadcrumbLabel = 'تطبيقات'; breadcrumbLink = 'apps.html'; }
        else if (post.category === 'games') { breadcrumbLabel = 'ألعاب'; breadcrumbLink = 'games.html'; }
        else if (post.category === 'sports') { breadcrumbLabel = 'رياضة'; breadcrumbLink = 'sports.html'; }

        let breadcrumbElement = $('nav a[href="articles.html"]');
        if (!breadcrumbElement.length) {
            breadcrumbElement = $('nav a').filter((i, el) => { return $(el).text().trim() === 'اخبار'; }).first();
        }
        if (breadcrumbElement.length) {
            breadcrumbElement.text(breadcrumbLabel);
            breadcrumbElement.attr('href', breadcrumbLink);
        }
        
        $('nav span.truncate').text(post.title);
        
        const existingImgDiv = $('main > div.rounded-2xl');
        const adaptiveImageHTML = `
        <div class="article-image-container">
            <img src="${cleanPath(post.image)}" alt="${escapeHtml(post.title)}" class="article-featured-image" loading="eager" onerror="this.onerror=null;this.src='assets/images/me.jpg';" />
        </div>
        `;
        
        if (existingImgDiv.length) { existingImgDiv.replaceWith(adaptiveImageHTML); } else { $('main > header').after(adaptiveImageHTML); }

        const $content = cheerio.load(post.content, null, false);
        $content('.adsbygoogle-container, .ad-placeholder').remove();
        $content('img').each((i, img) => {
            const originalSrc = $content(img).attr('src');
            if (originalSrc) $content(img).attr('src', cleanPath(originalSrc));
            $content(img).attr('onerror', "this.onerror=null;this.src='assets/images/me.jpg';");
        });
        $content('img').addClass('w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700');
        
        $('.share-buttons-container').remove();

        $('article').html($content.html()); 

        // --- AI SUMMARY CONTENT ---
        $('#ai-summary-container').remove();
        if (post.summary) {
            const summaryHTML = post.summary
              .split('\n')
              .map(line => parseMarkdown(line))
              .join('');

            const summaryContentHTML = `
            <div class="ai-summary-box hidden w-full max-w-2xl mx-auto my-6 transition-all duration-300 transform scale-95 opacity-0">
              <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700/50">
                    <span class="text-blue-500 animate-pulse">
                        <i data-lucide="bot" class="w-4 h-4"></i>
                    </span>
                    <h3 class="font-bold text-sm text-gray-800 dark:text-gray-200">الخلاصة الذكية</h3>
                    <button class="ai-summary-close mr-auto text-gray-400 hover:text-red-500 transition-colors"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
              </div>
              <div class="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  ${summaryHTML}
              </div>
            </div>`;
            $('article').append(summaryContentHTML);
        }

        const tags = [getCatLabel(post.category)];
        if(post.title) {
            const words = post.title.split(' ').filter(w => w.length > 3 && !['كيف', 'ماذا', 'لماذا', 'هذا', 'التي', 'الذي'].includes(w));
            tags.push(...words.slice(0, 4));
        }
        const uniqueTags = [...new Set(tags)];
        const tagsHTML = `
        <div class="article-tags flex flex-wrap items-center gap-2 mt-8 mb-6 p-4 border-t border-gray-100 dark:border-gray-700">
            <span class="text-sm font-bold text-gray-500 dark:text-gray-400"><i data-lucide="tag" class="w-4 h-4 inline mr-1"></i> كلمات مفتاحية:</span>
            ${uniqueTags.map(tag => `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors">#${tag}</span>`).join('')}
        </div>
        `;
        $('article').append(tagsHTML);

        const shareSectionHTML = `
        <div class="share-buttons-container mt-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
            <h3 class="font-bold text-gray-800 dark:text-white mb-4 text-sm">شارك المعلومة</h3>
            <div class="flex flex-wrap justify-center gap-4" id="dynamic-share-buttons" data-title="${escapeXml(post.title)}" data-url="${fullUrl}">
                <a href="#" class="share-btn whatsapp w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 shadow-sm transition-transform hover:scale-110" aria-label="Share on WhatsApp">
                    <i data-lucide="message-circle" class="w-5 h-5"></i>
                </a>
                <a href="#" class="share-btn telegram w-10 h-10 flex items-center justify-center rounded-full bg-[#229ED9] text-white hover:opacity-90 shadow-sm transition-transform hover:scale-110" aria-label="Share on Telegram">
                    <i data-lucide="send" class="w-5 h-5 ml-0.5"></i>
                </a>
                <a href="#" class="share-btn facebook w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 shadow-sm transition-transform hover:scale-110" aria-label="Share on Facebook">
                    <i data-lucide="facebook" class="w-5 h-5"></i>
                </a>
                <a href="#" class="share-btn instagram w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-90 shadow-sm transition-transform hover:scale-110" aria-label="Share on Instagram">
                    <i data-lucide="instagram" class="w-5 h-5"></i>
                </a>
            </div>
        </div>
        `;
        $('article').append(shareSectionHTML);
        
        // --- STRICT RELATED POSTS LOGIC (Target 12, Sorted) ---
        const otherPosts = allPosts.filter(p => p.slug !== post.slug);
        
        // 1. Gather same category & SORT EXPLICITLY
        let sameCatPosts = otherPosts.filter(p => p.category === post.category)
            .sort((a,b) => b.effectiveDate - a.effectiveDate);
        
        // 2. Gather other categories & SORT EXPLICITLY
        let diffCatPosts = otherPosts.filter(p => p.category !== post.category)
            .sort((a,b) => b.effectiveDate - a.effectiveDate);
        
        // 3. Combine: Same Cat First + Diff Cat Second
        let relatedPosts = sameCatPosts.concat(diffCatPosts);
        
        // 4. Slice to exactly 12
        relatedPosts = relatedPosts.slice(0, 12);

        if (relatedPosts.length > 0) {
            const gridPosts = relatedPosts.slice(0, 6);
            const listPosts = relatedPosts.slice(6, 12);

            let relatedHTML = `
            <section class="related-posts mt-12 border-t border-gray-100 dark:border-gray-700 pt-8">
                <h3 class="text-lg font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2"><i data-lucide="layers" class="w-5 h-5 text-blue-600"></i> قد يعجبك أيضاً</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">`;
            
            gridPosts.forEach(r => {
                relatedHTML += `
                <a href="article-${r.slug}.html" class="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group h-full">
                    <div class="h-32 overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img src="${cleanPath(r.image)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onerror="this.onerror=null;this.src='assets/images/me.jpg';" />
                    </div>
                    <div class="p-3">
                        <h4 class="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors related-fixed-title">${r.title}</h4>
                    </div>
                </a>`;
            });
            relatedHTML += `</div>`;

            // Inject Ad Banner between Grid & List
            const adHTML = generateAdBannerHTML();
            if (adHTML) {
                relatedHTML += adHTML;
            }

            if (listPosts.length > 0) {
                relatedHTML += `<div class="flex flex-col gap-3">`;
                listPosts.forEach(r => {
                    const rDate = r.effectiveDate.toISOString().split('T')[0];
                    relatedHTML += `
                    <a href="article-${r.slug}.html" class="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                        <img src="${cleanPath(r.image)}" class="w-16 h-12 object-cover rounded-lg shrink-0 bg-gray-200 dark:bg-gray-700" loading="lazy" onerror="this.onerror=null;this.src='assets/images/me.jpg';" />
                        <div class="flex-1 min-w-0">
                            <h4 class="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">${r.title}</h4>
                            <span class="text-[10px] text-gray-400 mt-0.5 block">${rDate}</span>
                        </div>
                        <div class="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors"><i data-lucide="chevron-left" class="w-4 h-4"></i></div>
                    </a>`;
                });
                relatedHTML += `</div>`;
            }

            relatedHTML += `</section>`;
            $('article').append(relatedHTML);
        }

        const safeJsonLd = { 
            "@context": "https://schema.org", 
            "@type": "Article", 
            "headline": post.title || '', 
            "image": post.image ? [fullImageUrl] : [], 
            "datePublished": post.publishedAt.toISOString(), 
            "dateModified": post.updatedAt.toISOString(), 
            "author": { "@type": "Person", "name": aboutData.profileName || "TechTouch" }, 
            "publisher": { 
                "@type": "Organization", 
                "name": aboutData.siteName || "TechTouch", 
                "logo": { "@type": "ImageObject", "url": toAbsoluteUrl(aboutData.profileImage) } 
            }, 
            "description": post.description || '', 
            "mainEntityOfPage": { "@type": "WebPage", "@id": fullUrl } 
        };
        $('script[type="application/ld+json"]').remove();
        $('head').append(`<script type="application/ld+json">${JSON.stringify(safeJsonLd, null, 2)}</script>`);
        
        safeWrite(path.join(ROOT_DIR, pageSlug), updateGlobalElements($.html(), pageSlug));
    });
};

const updateSearchData = () => {
    const searchPath = path.join(ROOT_DIR, 'assets/js/search-data.js');
    const searchItems = [ ...allPosts.map(p => ({ title: p.title, desc: p.description, url: `article-${p.slug}.html`, category: p.category.charAt(0).toUpperCase() + p.category.slice(1), image: cleanPath(p.image) })), ...channelsData.map(c => ({ title: c.name, desc: c.desc, url: c.url, category: 'Channels', image: 'assets/images/me.jpg' })) ];
    safeWrite(searchPath, `export const searchIndex = ${JSON.stringify(searchItems, null, 2)};`);
};

const generateRSS = () => {
    const feedPath = path.join(ROOT_DIR, 'feed.xml');
    const now = new Date().toUTCString();
    let xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(aboutData.siteName || "TechTouch")}</title><link>${BASE_URL}</link><description>المصدر العربي الأول للمقالات التقنية، مراجعات الهواتف، والتطبيقات.</description><language>ar</language><lastBuildDate>${now}</lastBuildDate><atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />`;
    allPosts.slice(0, 20).forEach(post => {
        const fullUrl = `${BASE_URL}/article-${post.slug}.html`;
        const fullImg = toAbsoluteUrl(post.image);
        xml += `<item><title><![CDATA[${post.title}]]></title><link>${fullUrl}</link><guid>${fullUrl}</guid><pubDate>${post.effectiveDate.toUTCString()}</pubDate><description><![CDATA[${post.description}]]></description><enclosure url="${fullImg}" type="image/jpeg" /></item>`;
    });
    xml += `</channel></rss>`;
    safeWrite(feedPath, xml);
};

const generateSitemap = () => {
    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    const today = new Date().toISOString().split('T')[0];
    const staticPages = [
        { url: '/', priority: '1.0' }, 
        { url: '/apps.html', priority: '0.9' }, 
        { url: '/games.html', priority: '0.9' }, 
        { url: '/sports.html', priority: '0.9' }, 
        { url: '/tools.html', priority: '0.9' }, 
        { url: '/about.html', priority: '0.7' }, 
        { url: '/tools-sites.html', priority: '0.8' }, 
        { url: '/tools-phones.html', priority: '0.8' }, 
        { url: '/tools-compare.html', priority: '0.7' }, 
        { url: '/tool-analysis.html', priority: '0.7' }, 
        { url: '/privacy.html', priority: '0.3' }, 
        { url: '/site-map.html', priority: '0.5' }
    ];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
    
    staticPages.forEach(page => { 
        // Ensure strictly NO index.html in sitemap locs
        const cleanUrl = page.url === '/' ? '' : page.url.replace(/^\//, '');
        const loc = `${BASE_URL}/${cleanUrl}`; 
        xml += `<url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${page.priority}</priority></url>`; 
    });
    
    allPosts.forEach(post => { 
        const fullImg = toAbsoluteUrl(post.image); 
        const pageUrl = `${BASE_URL}/article-${post.slug}.html`; 
        xml += `<url><loc>${pageUrl}</loc><lastmod>${post.effectiveDate.toISOString()}</lastmod><priority>0.8</priority><image:image><image:loc>${escapeXml(fullImg)}</image:loc><image:title>${escapeXml(post.title)}</image:title></image:image></url>`; 
    });
    
    xml += `\n</urlset>`;
    safeWrite(sitemapPath, xml);
    console.log('✅ sitemap.xml regenerated automatically.');
};

// Fix 5: Wrap execution in try/catch to catch any build errors and exit with code 1
try {
    updateAboutPageDetails();
    updateChannelsPage();
    updateToolsPage();
    generateCategoryPages(); 
    generateIndividualArticles();
    updateSearchData();
    generateRSS();
    generateSitemap();
    console.log('Build Complete. Multi-Page Architecture Hardened.');
} catch (err) {
    console.error('Build error:', err);
    process.exit(1);
}
