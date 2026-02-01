
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

// AdSense Configuration
const AD_CLIENT_ID = 'ca-pub-7355327732066930';
const AD_SCRIPT = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}" crossorigin="anonymous"></script>`;

// Google Analytics Configuration
const GA_ID = 'G-63BBPLQ343';
const GA_SCRIPT = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>`;

// AdSense HTML Block
const ADSENSE_BLOCK = `
<div class="adsbygoogle-container w-full max-w-full overflow-hidden mx-auto my-6 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-xl p-1 text-center">
    <div class="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">إعلان</div>
    <div style="width: 100%; max-width: 100%; overflow: hidden; display: flex; justify-content: center;">
        <ins class="adsbygoogle block"
             style="display:block; width: 100%; min-width: 250px; max-width: 100%;"
             data-ad-client="${AD_CLIENT_ID}"
             data-ad-slot="auto"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
</div>
`;

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Static Pages Config
const HTML_FILES = [
    'index.html', 'articles.html', 'tools.html', 'about.html', 
    'tools-sites.html', 'tools-phones.html', 'tools-compare.html', 
    'tool-analysis.html', 'privacy.html', 'site-map.html', '404.html'
];

// Load Config Data
let aboutData = { 
    profileName: "TechTouch", 
    bio: "", 
    profileImage: "assets/images/me.jpg", 
    siteName: "TechTouch",
    categories: { labels: { articles: "اخبار", apps: "تطبيقات", games: "ألعاب", sports: "رياضة" }, fontSize: 14 },
    social: {} 
};
let channelsData = [];

if (fs.existsSync(path.join(DATA_DIR, 'about.json'))) {
    try { aboutData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'about.json'), 'utf8')); } catch (e) {}
}
if (fs.existsSync(path.join(DATA_DIR, 'channels.json'))) {
    try { channelsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'channels.json'), 'utf8')); } catch (e) {}
}

const toAbsoluteUrl = (url) => {
    if (!url) return `${BASE_URL}/assets/images/me.jpg`;
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/${cleanPath}`;
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
        return `<i data-lucide="${iconData || defaultIconName}" class="w-5 h-5"></i>`;
    }
    if (iconData && typeof iconData === 'object') {
        if (iconData.type === 'image') {
            const size = iconData.size || defaultSize;
            return `<img src="${iconData.value}" style="width:${size}px; height:${size}px; object-fit:contain; display:block;" alt="icon">`;
        } else {
            const size = iconData.size || defaultSize;
            return `<i data-lucide="${iconData.value}" style="width:${size}px; height:${size}px;"></i>`;
        }
    }
    return `<i data-lucide="${defaultIconName}" class="w-5 h-5"></i>`;
};

// Markdown Parser
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
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => `<img src="${src}" alt="${alt}" class="w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700">`);
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

// Load Posts
const allPosts = [];
if (fs.existsSync(POSTS_DIR)) {
    fs.readdirSync(POSTS_DIR).forEach(file => {
        if (path.extname(file) === '.json') {
            try {
                const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
                post.content = parseMarkdown(post.content);
                post.effectiveDate = post.updated || post.date;
                allPosts.push(post);
            } catch (e) { console.error(`Error reading post ${file}:`, e); }
        }
    });
}
allPosts.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));

const getCatLabel = (cat) => {
    const defaults = { 'articles': 'اخبار', 'apps': 'تطبيقات', 'games': 'ألعاب', 'sports': 'رياضة' };
    const configured = aboutData.categories?.labels || {};
    return configured[cat] || defaults[cat] || 'عام';
};

// RSS Generator
const generateRSS = () => {
    const feedPath = path.join(ROOT_DIR, 'feed.xml');
    const now = new Date().toUTCString();
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>${escapeXml(aboutData.siteName || "TechTouch")}</title>
    <link>${BASE_URL}</link>
    <description>المصدر العربي الأول للمقالات التقنية، مراجعات الهواتف، والتطبيقات.</description>
    <language>ar</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />`;

    allPosts.slice(0, 20).forEach(post => {
        const fullUrl = `${BASE_URL}/article-${post.slug}.html`;
        const fullImg = toAbsoluteUrl(post.image);
        xml += `
    <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${fullUrl}</link>
        <guid>${fullUrl}</guid>
        <pubDate>${new Date(post.effectiveDate).toUTCString()}</pubDate>
        <description><![CDATA[${post.description}]]></description>
        <enclosure url="${fullImg}" type="image/jpeg" />
    </item>`;
    });
    xml += `</channel></rss>`;
    fs.writeFileSync(feedPath, xml);
};

// --- DYNAMIC SITEMAP GENERATOR (OPTIMIZED) ---
const generateSitemap = () => {
    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    const today = new Date().toISOString().split('T')[0];
    
    // Mapping Pages to Canonical URLs (Optimized: No index.html for root)
    const staticPages = [
        { file: 'index.html', url: '/', priority: '1.0' },
        { file: 'articles.html', url: '/articles.html', priority: '0.9' },
        { file: 'tools.html', url: '/tools.html', priority: '0.9' },
        { file: 'about.html', url: '/about.html', priority: '0.7' },
        { file: 'tools-sites.html', url: '/tools-sites.html', priority: '0.8' },
        { file: 'tools-phones.html', url: '/tools-phones.html', priority: '0.8' },
        { file: 'tools-compare.html', url: '/tools-compare.html', priority: '0.7' },
        { file: 'tool-analysis.html', url: '/tool-analysis.html', priority: '0.7' },
        { file: 'privacy.html', url: '/privacy.html', priority: '0.3' },
        { file: 'site-map.html', url: '/site-map.html', priority: '0.5' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    // Static Pages Loop
    staticPages.forEach(page => {
        if (page.file === '404.html') return;
        const filePath = path.join(ROOT_DIR, page.file);
        let lastmod = today;
        
        // Get actual file modification date if possible
        if (fs.existsSync(filePath)) {
            try { lastmod = fs.statSync(filePath).mtime.toISOString().split('T')[0]; } catch(e) {}
        }
        
        // Construct URL: Remove trailing slash if it's not root to avoid //
        const loc = page.url === '/' ? `${BASE_URL}/` : `${BASE_URL}${page.url}`;

        xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Dynamic Articles Loop (Auto-detected from JSONs)
    allPosts.forEach(post => {
        const fullImg = toAbsoluteUrl(post.image);
        const pageUrl = `${BASE_URL}/article-${post.slug}.html`;
        const postDate = new Date(post.effectiveDate).toISOString().split('T')[0];
        
        xml += `
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${postDate}</lastmod>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${escapeXml(fullImg)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>
  </url>`;
    });

    xml += `\n</urlset>`;
    fs.writeFileSync(sitemapPath, xml);
    console.log('✅ sitemap.xml regenerated automatically (Optimized for SEO).');
};

const createCardHTML = (post) => {
    let badgeColor = 'bg-blue-600';
    let icon = 'file-text';
    if(post.category === 'apps') { badgeColor = 'bg-green-600'; icon = 'smartphone'; }
    if(post.category === 'games') { badgeColor = 'bg-purple-600'; icon = 'gamepad-2'; }
    if(post.category === 'sports') { badgeColor = 'bg-orange-600'; icon = 'trophy'; }
    const catFontSize = aboutData.categories?.fontSize || 14;
    const badgeStyle = `font-size: ${Math.max(8, catFontSize - 4)}px; padding: 0.3em 0.6em;`; 

    return `
    <a href="article-${post.slug}.html" class="group block w-full h-full animate-fade-in post-card-wrapper">
        <div class="post-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col relative w-full">
            <div class="h-40 sm:h-48 w-full overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                <img src="${post.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${post.title}" loading="lazy" decoding="async" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div class="absolute top-2 right-2 ${badgeColor} text-white font-bold rounded-full flex items-center gap-1 shadow-lg z-10" style="${badgeStyle}">
                    <i data-lucide="${icon}" style="width: 1.2em; height: 1.2em;"></i><span>${getCatLabel(post.category)}</span>
                </div>
            </div>
            <div class="p-4 flex-1 flex flex-col w-full">
                <div class="flex items-center gap-2 text-gray-400 mb-2" style="font-size: ${Math.max(8, catFontSize - 4)}px;">
                    <i data-lucide="clock" style="width: 1.2em; height: 1.2em;"></i><span>${post.date}</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors break-words whitespace-normal w-full line-clamp-2" title="${post.title}" style="font-size: ${catFontSize}px;">${post.title}</h3>
                <p class="text-gray-500 dark:text-gray-400 line-clamp-2 mb-0 flex-1 leading-relaxed break-words whitespace-normal w-full" style="font-size: ${Math.max(8, catFontSize - 2)}px;">${post.description}</p>
            </div>
        </div>
    </a>`;
};

const updateGlobalElements = (htmlContent, fileName = '') => {
    const $ = cheerio.load(htmlContent);

    // Scripts & Ads
    if (!$('script[src*="adsbygoogle.js"]').length) $('head').append(AD_SCRIPT);
    
    // --- CLEANUP: Remove ImportMap and React/Vite garbage ---
    $('script[type="importmap"]').remove();
    $('script').each((i, el) => {
        const content = $(el).html() || '';
        const src = $(el).attr('src') || '';
        if (src.includes('googletagmanager.com') || 
            content.includes("gtag('config'") ||
            content.includes("react-router-dom") ||
            src.includes("vite") || 
            src.includes("@vitejs")
           ) {
            $(el).remove();
        }
    });
    
    // Add Favicon
    if (!$('link[rel="icon"], link[rel="shortcut icon"]').length) {
        $('head').append(`<link rel="shortcut icon" href="${toAbsoluteUrl(aboutData.profileImage)}" type="image/jpeg">`);
    }

    $('head').prepend(GA_SCRIPT);

    // Canonical & Meta
    if (fileName) {
        // Canonical FIX: If fileName is index.html, use root URL.
        const canonicalUrl = fileName === 'index.html' ? `${BASE_URL}/` : `${BASE_URL}/${fileName}`;
        $('link[rel="canonical"]').remove();
        $('head').append(`<link rel="canonical" href="${canonicalUrl}">`);
    }
    $('meta[name="robots"]').remove();
    if(fileName !== '404.html') { $('head').append('<meta name="robots" content="index, follow">'); }

    const pageTitle = $('title').text() || aboutData.profileName;
    const pageDesc = $('meta[name="description"]').attr('content') || aboutData.bio;
    let pageImage = $('main img').first().attr('src');
    if (!pageImage || pageImage.includes('data:')) pageImage = aboutData.profileImage;
    const fullImageUrl = toAbsoluteUrl(pageImage);
    const fullPageUrl = fileName ? `${BASE_URL}/${fileName}` : BASE_URL;

    const setMeta = (prop, val) => { $('meta[property="' + prop + '"]').remove(); $('head').append(`<meta property="${prop}" content="${val}">`); };
    const setName = (name, val) => { $('meta[name="' + name + '"]').remove(); $('head').append(`<meta name="${name}" content="${val}">`); };

    setMeta('og:type', 'website'); setMeta('og:url', fullPageUrl); setMeta('og:title', pageTitle);
    setMeta('og:description', pageDesc); setMeta('og:image', fullImageUrl);
    setName('twitter:card', 'summary_large_image'); setName('twitter:url', fullPageUrl);
    setName('twitter:title', pageTitle); setName('twitter:description', pageDesc); setName('twitter:image', fullImageUrl);
    $('head').append(`<link rel="alternate" type="application/rss+xml" title="TechTouch Feed" href="${BASE_URL}/feed.xml" />`);

    // UI Updates
    
    // --- 1. Profile Image Fix (Universal Selector - Stronger) ---
    const profileImageUrl = aboutData.profileImage.trim();
    // Specifically target by ID for best accuracy
    $('#header-profile-img').attr('src', profileImageUrl);
    
    // Also target container for styling to handle w-8 vs w-10 differences gracefully
    const profileImg = $('#header-profile-img');
    if (profileImg.length) {
        const container = profileImg.parent();
        container.removeClass('border-white').addClass('border-gray-100 dark:border-gray-700 bg-gray-200 dark:bg-gray-700');
        profileImg.addClass('object-cover w-full h-full');
    }

    // Backup: Update any small rounded profile images found in headers
    $('img[alt="Profile photo"]').attr('src', profileImageUrl);

    $('#header-profile-name').text(aboutData.profileName); // Displays "KinanTouch" based on user input for "Display Name"
    
    // Update Logo (Site Name) - "كنان الصائغ" based on user input
    const logoLink = $('header a.text-xl.font-black, header a.text-lg.font-black');
    if (logoLink.length) logoLink.text(aboutData.siteName || "TechTouch");

    // Navigation Scaling
    const catFontSize = parseInt(aboutData.categories?.fontSize) || 14;
    const catLabels = aboutData.categories?.labels || {};
    const updateTabBtn = (tabId, label) => { const btn = $(`button.tab-btn[data-tab="${tabId}"]`); if (btn.length) btn.find('span').text(label); };
    updateTabBtn('articles', catLabels.articles || "اخبار");
    updateTabBtn('apps', catLabels.apps || "تطبيقات");
    updateTabBtn('games', catLabels.games || "ألعاب");
    updateTabBtn('sports', catLabels.sports || "رياضة");

    // --- 2. Font Size Fix (Dynamic Calculation) ---
    const applyResponsiveScaling = (selector) => {
        $(selector).each((i, el) => {
            const $el = $(el);
            // Removing Tailwind default spacing classes to enforce custom strict values
            $el.removeClass('px-3 py-1.5 px-4 gap-1.5 text-xs text-sm').find('svg, i').removeClass('w-3 h-3 w-3.5 h-3.5 w-4 h-4 w-5 h-5');
            
            // Dynamic Compact Style: Uses variables from CMS
            // Uses 'em' units for padding/gap so they scale perfectly with font-size
            const compactStyle = `
                font-size: ${catFontSize}px !important; 
                padding: 0.5em 1em !important; 
                gap: 0.4em !important; 
                display: inline-flex; 
                align-items: center; 
                min-height: 2.2em !important;
                line-height: 1 !important;
                border-radius: 9999px;
            `;
            
            $el.attr('style', compactStyle.replace(/\s+/g, ' '));
            
            // Icons scaled relative to text (1.2em = 120% of font size)
            $el.find('svg, i').attr('style', `width: 1.2em !important; height: 1.2em !important; display: block;`);
        });
    };
    
    applyResponsiveScaling('.nav-link');
    applyResponsiveScaling('.tab-btn');

    // Social Footer
    const socialLinksContainer = $('footer .flex.items-center.justify-center.gap-4').first();
    if (socialLinksContainer.length) {
        socialLinksContainer.empty();
        const networks = [
            { key: 'facebook', defaultIcon: 'facebook', colorClass: 'hover:bg-[#1877F2]' },
            { key: 'instagram', defaultIcon: 'instagram', colorClass: 'hover:bg-[#E4405F]' },
            { key: 'tiktok', defaultIcon: 'video', colorClass: 'hover:bg-black hover:border-gray-600' }, 
            { key: 'youtube', defaultIcon: 'youtube', colorClass: 'hover:bg-[#FF0000]' },
            { key: 'telegram', defaultIcon: 'send', colorClass: 'hover:bg-[#229ED9]' }
        ];
        networks.forEach(net => {
            if (aboutData.social && aboutData.social[net.key]) {
                const iconData = (aboutData.socialIcons && aboutData.socialIcons[net.key]) || net.defaultIcon;
                let content = '';
                if (net.key === 'tiktok' && iconData === 'video') {
                     content = `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`;
                } else if (iconData.type === 'image') {
                    content = `<img src="${iconData.value}" style="width:100%; height:100%; object-fit:cover;">`;
                } else {
                    content = renderIconHTML(iconData, net.defaultIcon, 20);
                }
                socialLinksContainer.append(`<a href="${aboutData.social[net.key]}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 ${net.colorClass} hover:text-white transition-all transform hover:scale-110 shadow-lg border border-gray-700 overflow-hidden relative">${content}</a>`);
            }
        });
    }

    // Ticker Logic (Styling Update: Outline Only)
    if (aboutData.ticker && $('#ticker-content').length) {
        // Redesigned Label: Transparent background, blue border, blue text
        const labelEl = $('#ticker-label');
        if (labelEl.length) {
            labelEl.text(aboutData.ticker.label);
            // Remove old classes and apply new "Outline" style
            labelEl.removeClass().addClass('h-6 px-3 flex items-center justify-center font-bold text-xs border border-blue-500 text-blue-500 rounded-full mx-2 shadow-[0_0_8px_rgba(59,130,246,0.4)] bg-transparent z-10 shrink-0');
        }

        const fontSize = aboutData.ticker.fontSize || 14;
        const isAnimated = aboutData.ticker.animated !== false;
        const tickerContentDiv = $('#ticker-content');
        
        // --- TICKER FIX: Alignment when stopped ---
        tickerContentDiv.removeClass().addClass('flex items-center h-full whitespace-nowrap');
        if (isAnimated) {
            tickerContentDiv.addClass('animate-marquee absolute right-0');
        } else {
            // When stopped, use justify-start (for RTL this is right) and add padding-right
            // This places the text close to the "New" label
            tickerContentDiv.addClass('w-full justify-start pr-2 overflow-hidden');
        }
        
        let contentHtml = `<span class="mx-4 font-medium text-gray-100 ticker-text whitespace-nowrap inline-block" style="font-size:${fontSize}px;">${aboutData.ticker.text}</span>`;
        if(aboutData.ticker.url && aboutData.ticker.url !== '#') contentHtml = `<a href="${aboutData.ticker.url}" class="hover:text-blue-300 transition-colors whitespace-nowrap inline-block">${contentHtml}</a>`;
        tickerContentDiv.html(contentHtml);
    }

    return $.html();
};

const updateListingPages = () => {
    const pagesToUpdate = [{ file: 'index.html', limit: 12 }, { file: 'articles.html', limit: 1000 }];
    pagesToUpdate.forEach(pageInfo => {
        const filePath = path.join(ROOT_DIR, pageInfo.file);
        if (!fs.existsSync(filePath)) return;
        let html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);
        const fillContainer = (catId, posts) => {
            const container = $(`#tab-${catId} .grid`);
            if (container.length) {
                container.empty();
                posts.slice(0, pageInfo.limit).forEach(post => container.append(createCardHTML(post)));
                if (posts.length === 0) container.html('<div class="col-span-full text-center py-10 text-gray-400 text-sm">لا توجد منشورات في هذا القسم حالياً.</div>');
                const parent = container.parent();
                parent.find('.adsbygoogle-container').remove();
                container.after(ADSENSE_BLOCK);
            }
        };
        fillContainer('articles', allPosts.filter(p => p.category === 'articles'));
        fillContainer('apps', allPosts.filter(p => p.category === 'apps'));
        fillContainer('games', allPosts.filter(p => p.category === 'games'));
        fillContainer('sports', allPosts.filter(p => p.category === 'sports'));
        fs.writeFileSync(filePath, updateGlobalElements($.html(), pageInfo.file));
    });
};

const updateToolsPage = () => {
    const filePath = path.join(ROOT_DIR, 'tools.html');
    if (!fs.existsSync(filePath)) return;
    let html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    const main = $('main');
    if (main.length) {
        const introText = main.find('.text-center.max-w-2xl');
        if(introText.length) {
            introText.removeClass('mb-12').addClass('mb-4');
            introText.find('p').remove();
        }
        main.find('.adsbygoogle-container').remove();
        main.append(ADSENSE_BLOCK);
    }
    fs.writeFileSync(filePath, updateGlobalElements($.html(), 'tools.html'));
};

const updateAboutPageDetails = () => {
    const aboutPath = path.join(ROOT_DIR, 'about.html');
    if (!fs.existsSync(aboutPath)) return;
    let html = fs.readFileSync(aboutPath, 'utf8');
    const $ = cheerio.load(html);
    const bioSection = $('div.prose section').first();
    if(aboutData.bio) bioSection.find('p').first().html(aboutData.bio.replace(/\n/g, '<br>'));
    
    // --- FIX: Update Bot Section Title + List (Safe Method) ---
    const botList = $('#about-bot-list');
    if(botList.length) {
        // Update Title (H2) safely
        const botSectionH2 = botList.parent().find('h2');
        if (botSectionH2.length) {
            const icon = botSectionH2.find('i, svg').clone(); // Preserve icon
            const newTitle = aboutData.botTitle || "مركز خدمة الطلبات (Bot)";
            botSectionH2.empty().append(icon).append(' ' + newTitle);
        }
        
        // Update List Content
        botList.empty();
        if (aboutData.botInfo) aboutData.botInfo.split('\n').filter(l => l.trim()).forEach(line => botList.append(`<li class="flex items-start gap-2"><span class="text-blue-500 text-lg font-bold">✪</span><span>${line}</span></li>`));
    }

    // --- FIX: Update Search Section Title + List (Safe Method) ---
    const searchList = $('#about-search-list');
    if(searchList.length) {
        // Update Title (H2) safely
        const searchSectionH2 = searchList.parent().find('h2');
        if (searchSectionH2.length) {
            const icon = searchSectionH2.find('i, svg').clone(); // Preserve icon
            const newTitle = aboutData.searchTitle || "دليل الوصول الذكي للمحتوى";
            searchSectionH2.empty().append(icon).append(' ' + newTitle);
        }

        // Update List Content
        searchList.empty();
        if (aboutData.searchInfo) aboutData.searchInfo.split('\n').filter(l => l.trim()).forEach(line => searchList.append(`<li class="flex items-start gap-2"><span class="text-green-500 text-lg font-bold">✪</span><span>${line}</span></li>`));
    }

    const coverDiv = $('div.bg-gradient-to-r, div.bg-cover').first();
    coverDiv.removeClass().addClass('h-40 relative');
    if (aboutData.coverType === 'image') { coverDiv.addClass('bg-cover bg-center').attr('style', `background-image: url('${aboutData.coverValue}');`); }
    else { coverDiv.removeAttr('style').addClass(aboutData.coverValue); }
    const profileImgContainer = coverDiv.find('div.rounded-full');
    if(profileImgContainer.length) {
        profileImgContainer.removeClass('border-[6px] border-white dark:border-gray-800');
        profileImgContainer.find('img').attr('src', aboutData.profileImage).addClass('object-cover w-full h-full');
    }
    fs.writeFileSync(aboutPath, updateGlobalElements($.html(), 'about.html'));
};

const updateChannelsPage = () => {
    const toolsPath = path.join(ROOT_DIR, 'tools-sites.html');
    if (!fs.existsSync(toolsPath)) return;
    let html = fs.readFileSync(toolsPath, 'utf8');
    const $ = cheerio.load(html);
    const grid = $('main .grid');
    grid.empty();
    channelsData.forEach(ch => {
        const renderedIcon = renderIconHTML(ch.iconData || ch.icon, 'star', 24);
        grid.append(`
            <a href="${ch.url}" target="_blank" class="block bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group w-full">
                <div class="flex items-center gap-4 h-full">
                    <div class="w-12 h-12 bg-${ch.color}-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white overflow-hidden">${renderedIcon}</div>
                    <div class="flex-1 min-w-0"><h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1 break-words whitespace-normal">${ch.name}</h3><p class="text-xs text-gray-500 dark:text-gray-400 truncate">${ch.desc}</p></div>
                    <div class="text-gray-300 group-hover:text-${ch.color}-600 shrink-0 transition-colors"><i data-lucide="chevron-left" class="w-5 h-5"></i></div>
                </div>
            </a>`);
    });
    fs.writeFileSync(toolsPath, updateGlobalElements($.html(), 'tools-sites.html'));
};

const generateIndividualArticles = () => {
    const templatePath = path.join(ROOT_DIR, 'article-asus-gx10.html');
    if (!fs.existsSync(templatePath)) return;
    let template = fs.readFileSync(templatePath, 'utf8');
    allPosts.forEach(post => {
        const $ = cheerio.load(template);
        const pageSlug = `article-${post.slug}.html`;
        const fullUrl = `${BASE_URL}/${pageSlug}`;
        const fullImageUrl = toAbsoluteUrl(post.image);
        const catLabel = getCatLabel(post.category);
        $('title').text(`${post.title} | ${aboutData.siteName || "TechTouch"}`);
        $('meta[name="description"]').attr('content', post.description);
        $('main').removeClass('pt-20').addClass('py-6');
        $('h1').first().text(post.title).addClass('break-words whitespace-normal w-full');
        $('time').text(post.date);
        $('nav').removeClass().addClass('flex items-center text-xs text-gray-500 mb-4 w-full overflow-hidden whitespace-nowrap').html(`
            <a href="index.html" class="hover:text-blue-500 shrink-0 transition-colors">الرئيسية</a><span class="mx-1 shrink-0 text-gray-300">/</span>
            <a href="articles.html" class="hover:text-blue-500 shrink-0 transition-colors">${catLabel}</a><span class="mx-1 shrink-0 text-gray-300">/</span>
            <span class="text-gray-800 dark:text-gray-300 truncate flex-1 min-w-0 block font-medium" title="${post.title}">${post.title}</span>`);
        const $content = cheerio.load(post.content, null, false);
        $content('img').each((i, el) => {
            const $img = cheerio(el);
            if (i === 0) { $img.attr('fetchpriority', 'high').attr('loading', 'eager').attr('decoding', 'async'); if ($img.attr('src')) $('head').append(`<link rel="preload" as="image" href="${$img.attr('src')}" fetchpriority="high">`); } 
            else { $img.attr('loading', 'lazy').attr('decoding', 'async'); }
            $img.addClass('w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700');
        });
        const coverImg = $('img.object-cover').first();
        if(coverImg.length) coverImg.attr('src', post.image).attr('alt', post.title).attr('fetchpriority', 'high').attr('decoding', 'async').removeAttr('loading');
        $('article').html($content.html()); 
        $('article').find('.adsbygoogle-container').remove();
        $('article').append(ADSENSE_BLOCK);
        const jsonLd = {
            "@context": "https://schema.org", "@type": "Article", "headline": post.title,
            "image": [fullImageUrl], "datePublished": new Date(post.date).toISOString(),
            "dateModified": new Date(post.effectiveDate).toISOString(),
            "author": { "@type": "Person", "name": aboutData.profileName },
            "publisher": { "@type": "Organization", "name": aboutData.siteName || "TechTouch", "logo": { "@type": "ImageObject", "url": toAbsoluteUrl(aboutData.profileImage) } },
            "description": post.description, "mainEntityOfPage": { "@type": "WebPage", "@id": fullUrl }
        };
        $('script[type="application/ld+json"]').remove();
        $('head').append(`<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`);
        $('meta[property="og:type"]').attr('content', 'article');
        fs.writeFileSync(path.join(ROOT_DIR, pageSlug), updateGlobalElements($.html(), pageSlug));
    });
};

const updateSearchData = () => {
    const searchPath = path.join(ROOT_DIR, 'assets/js/search-data.js');
    const searchItems = [
        ...allPosts.map(p => ({ title: p.title, desc: p.description, url: `article-${p.slug}.html`, category: p.category.charAt(0).toUpperCase() + p.category.slice(1), image: p.image })),
        ...channelsData.map(c => ({ title: c.name, desc: c.desc, url: c.url, category: 'Channels', image: 'assets/images/me.jpg' }))
    ];
    fs.writeFileSync(searchPath, `export const searchIndex = ${JSON.stringify(searchItems, null, 2)};`);
};

// Execution Sequence
updateAboutPageDetails();
updateChannelsPage();
updateToolsPage();
HTML_FILES.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) fs.writeFileSync(filePath, updateGlobalElements(fs.readFileSync(filePath, 'utf8'), file));
});
updateListingPages();
generateIndividualArticles();
updateSearchData();
generateRSS();
generateSitemap(); // Auto-generates updated sitemap

console.log('Build Complete. Domain updated to: ' + BASE_URL);
