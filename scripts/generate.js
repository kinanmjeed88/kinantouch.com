
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
const GA_ID = 'G-63BBPLQ343'; 
const AD_CLIENT_ID = 'ca-pub-7355327732066930';
const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID'; 
const GOOGLE_SITE_VERIFICATION = ''; 

// --- SCRIPTS TEMPLATES ---

const GA_SCRIPT = `
<!-- Google Analytics 4 (Auto-Injected) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_ID}', {
    anonymize_ip: true,
    send_page_view: true
  });
</script>`;

const AD_SCRIPT = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}" crossorigin="anonymous"></script>`;

const ONESIGNAL_SCRIPT = `
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(function(OneSignal) {
    OneSignal.init({
      appId: "${ONESIGNAL_APP_ID}",
      safari_web_id: "web.onesignal.auto.xxxxx",
      notifyButton: {
        enable: true,
      },
    });
  });
</script>
`;

const ADSENSE_BLOCK = `
<div class="adsbygoogle-container w-full mx-auto my-8 py-4 bg-gray-50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800 text-center overflow-hidden">
    <div class="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">إعلان</div>
    <div style="display: flex; justify-content: center; width: 100%;">
        <ins class="adsbygoogle"
             style="display:block; width: 100%;"
             data-ad-client="${AD_CLIENT_ID}"
             data-ad-slot="auto"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
</div>
`;

const BACK_TO_TOP_BTN = `
<button id="back-to-top" aria-label="العودة للأعلى" class="fixed bottom-6 left-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 transform translate-y-10 opacity-0 invisible group">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 group-hover:-translate-y-1 transition-transform"><path d="m18 15-6-6-6 6"/></svg>
</button>
`;

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// OneSignal Worker
const WORKER_CONTENT = `importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");`;
fs.writeFileSync(path.join(ROOT_DIR, 'OneSignalSDKWorker.js'), WORKER_CONTENT);

// Files to Process
const HTML_FILES = [
    'index.html', 'articles.html', 'tools.html', 'about.html', 
    'tools-sites.html', 'tools-phones.html', 'tools-compare.html', 'tool-analysis.html',
    'privacy.html', 'site-map.html', '404.html'
];

// Load Data
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

// --- FIX: Restore renderIconHTML Definition ---
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

// Sitemap Generator
const generateSitemap = () => {
    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    const today = new Date().toISOString().split('T')[0];
    
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

    staticPages.forEach(page => {
        if (page.file === '404.html') return;
        const filePath = path.join(ROOT_DIR, page.file);
        let lastmod = today;
        if (fs.existsSync(filePath)) {
            try { lastmod = fs.statSync(filePath).mtime.toISOString().split('T')[0]; } catch(e) {}
        }
        const loc = page.url === '/' ? `${BASE_URL}/` : `${BASE_URL}${page.url}`;
        xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`;
    });

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
    console.log('✅ sitemap.xml regenerated automatically.');
};

const createCardHTML = (post) => {
    let badgeColor = 'bg-blue-600';
    let icon = 'file-text';
    if(post.category === 'apps') { badgeColor = 'bg-green-600'; icon = 'smartphone'; }
    if(post.category === 'games') { badgeColor = 'bg-purple-600'; icon = 'gamepad-2'; }
    if(post.category === 'sports') { badgeColor = 'bg-orange-600'; icon = 'trophy'; }
    
    // --- FIX: Ensure Font Size is applied ---
    const catFontSize = parseInt(aboutData.categories?.fontSize) || 14;
    const titleStyle = `font-size: ${catFontSize}px;`;
    const metaStyle = `font-size: ${Math.max(10, catFontSize - 4)}px;`;
    const descStyle = `font-size: ${Math.max(10, catFontSize - 2)}px;`;

    return `
    <a href="article-${post.slug}.html" class="group block w-full h-full animate-fade-in post-card-wrapper">
        <div class="post-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col relative w-full">
            <div class="h-40 sm:h-48 w-full overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                <img src="${post.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${post.title}" loading="lazy" decoding="async" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div class="absolute top-2 right-2 ${badgeColor} text-white font-bold rounded-full flex items-center gap-1 shadow-lg z-10" style="${metaStyle} padding: 0.3em 0.6em;">
                    <i data-lucide="${icon}" style="width: 1.2em; height: 1.2em;"></i><span>${getCatLabel(post.category)}</span>
                </div>
            </div>
            <div class="p-4 flex-1 flex flex-col w-full">
                <div class="flex items-center gap-2 text-gray-400 mb-2" style="${metaStyle}">
                    <i data-lucide="clock" style="width: 1.2em; height: 1.2em;"></i><span>${post.date}</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors break-words whitespace-normal w-full line-clamp-2" title="${post.title}" style="${titleStyle}">${post.title}</h3>
                <p class="text-gray-500 dark:text-gray-400 line-clamp-2 mb-0 flex-1 leading-relaxed break-words whitespace-normal w-full" style="${descStyle}">${post.description}</p>
            </div>
        </div>
    </a>`;
};

// --- GLOBAL SCRIPT INJECTOR ---
const updateGlobalElements = (htmlContent, fileName = '') => {
    const $ = cheerio.load(htmlContent);

    // 1. Clean old scripts
    $('script').each((i, el) => {
        const src = $(el).attr('src') || '';
        const content = $(el).html() || '';
        if (src.match(/js\?id=G-/) && !src.includes('googletagmanager.com')) { $(el).remove(); }
        if (src.includes('googletagmanager.com') || content.includes("gtag('config'") || src.includes("pagead2.googlesyndication.com") || content.includes("adsbygoogle") || src.includes("cdn.onesignal.com")) {
            $(el).remove();
        }
    });

    // 2. Inject Fresh Tracking Scripts
    $('head').prepend(GA_SCRIPT);
    $('head').append(AD_SCRIPT);
    $('head').append(ONESIGNAL_SCRIPT);
    
    // 3. Search Console Meta
    if (GOOGLE_SITE_VERIFICATION) {
        $('meta[name="google-site-verification"]').remove();
        $('head').append(`<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}" />`);
    }

    // 4. Common UI Updates - FIXES FOR USER
    
    // Fix Profile Image in Header & About Page
    // Only use direct assets link for simplicity and compatibility
    const profileImgSrc = aboutData.profileImage || 'assets/images/me.jpg';
    $('#header-profile-img').attr('src', profileImgSrc);
    
    // Fix Profile Name
    $('#header-profile-name').text(aboutData.profileName);
    
    // Fix Site Title in Header
    $('header .tracking-tight').text(aboutData.siteName || 'TechTouch');

    // Fix Social Links (Footer)
    if (aboutData.social) {
        $('footer a[href*="facebook"]').attr('href', aboutData.social.facebook || '#');
        $('footer a[href*="instagram"]').attr('href', aboutData.social.instagram || '#');
        $('footer a[href*="tiktok"]').attr('href', aboutData.social.tiktok || '#');
        $('footer a[href*="youtube"]').attr('href', aboutData.social.youtube || '#');
        $('footer a[href*="t.me"]').attr('href', aboutData.social.telegram || '#');
    }

    // Fix Ticker
    if (aboutData.ticker && $('#ticker-content').length) {
        $('#ticker-label').text(aboutData.ticker.label);
        const tickerContentDiv = $('#ticker-content');
        tickerContentDiv.removeClass().addClass('flex items-center h-full whitespace-nowrap');
        if (aboutData.ticker.animated !== false) {
            tickerContentDiv.addClass('animate-marquee absolute right-0');
        } else {
            tickerContentDiv.addClass('w-full justify-start pr-2 overflow-hidden');
        }
        
        const tickerFontSize = aboutData.ticker.fontSize || 14;
        let contentHtml = `<span class="mx-4 font-medium text-gray-100 ticker-text whitespace-nowrap inline-block" style="font-size:${tickerFontSize}px;">${aboutData.ticker.text}</span>`;
        if(aboutData.ticker.url && aboutData.ticker.url !== '#') {
            contentHtml = `<a href="${aboutData.ticker.url}" class="hover:text-blue-300 transition-colors whitespace-nowrap inline-block" style="font-size:${tickerFontSize}px;">${aboutData.ticker.text}</a>`;
        }
        tickerContentDiv.html(contentHtml);
    }
    
    // Fix Category Labels in Tabs (Index/Articles pages)
    if (aboutData.categories && aboutData.categories.labels) {
        $('[data-tab="articles"] span').text(aboutData.categories.labels.articles || 'اخبار');
        $('[data-tab="apps"] span').text(aboutData.categories.labels.apps || 'تطبيقات');
        $('[data-tab="games"] span').text(aboutData.categories.labels.games || 'ألعاب');
        $('[data-tab="sports"] span').text(aboutData.categories.labels.sports || 'رياضة');
    }
    
    // About Page Specifics
    if (fileName === 'about.html') {
        $('#about-bot-list').parent().find('h2').text(aboutData.botTitle || 'مركز خدمة الطلبات (Bot)');
        // Convert newlines to list items
        if(aboutData.botInfo) {
            const botItems = aboutData.botInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-blue-500 text-xl">✪</span><span>${i}</span></li>`).join('');
            $('#about-bot-list').html(botItems);
        }
        
        $('#about-search-list').parent().find('h2').text(aboutData.searchTitle || 'دليل الوصول الذكي للمحتوى');
        if(aboutData.searchInfo) {
            const searchItems = aboutData.searchInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-green-500 text-xl">✪</span><span>${i}</span></li>`).join('');
            $('#about-search-list').html(searchItems);
        }
        
        // Cover Image/Color
        if (aboutData.coverType === 'image' && aboutData.coverValue) {
            // Apply background image style
            $('.bg-gradient-to-r, .bg-cover').css('background', `url(${aboutData.coverValue}) center/cover no-repeat`);
        } else if (aboutData.coverValue) {
             // For gradients (Tailwind classes), we need to replace classes. 
             // Since we can't easily remove old gradient classes without knowing them, we reset the style attribute and try to add class.
             // But cheerio `addClass` appends. 
             // Best approach for static site: clear style background and assume the class is correct in HTML or we replace the class attribute.
             // Let's find the container.
             const coverContainer = $('.rounded-2xl > div').first();
             // Reset style in case image was previously used
             coverContainer.attr('style', '');
             // We can't easily swap Tailwind classes dynamically in cheerio without regex.
             // Simplest fix: Just use style for everything or ensure coverValue is a valid CSS background property if it's a gradient? No, user uses classes.
             // Let's try to overwrite the class attribute for the gradient part.
             const existingClasses = coverContainer.attr('class') || '';
             // Remove any existing bg-gradient or from- to- classes roughly
             const baseClasses = existingClasses.replace(/bg-gradient-[^ ]+|from-[^ ]+|to-[^ ]+|bg-cover|bg-center/g, '').trim();
             coverContainer.attr('class', `${baseClasses} ${aboutData.coverValue} h-40 relative`);
        }
        
        $('.prose p:first').text(aboutData.bio);
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
                // Ad Injection for Listing
                container.parent().find('.adsbygoogle-container').remove();
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
    let template = '';
    if (fs.existsSync(templatePath)) {
        template = fs.readFileSync(templatePath, 'utf8');
    } else {
        template = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>Article</title></head><body><main><article></article></main></body></html>`;
    }

    allPosts.forEach(post => {
        const $ = cheerio.load(template);
        const pageSlug = `article-${post.slug}.html`;
        const fullUrl = `${BASE_URL}/${pageSlug}`;
        const fullImageUrl = toAbsoluteUrl(post.image);
        
        $('title').text(`${post.title} | ${aboutData.siteName || "TechTouch"}`);
        $('meta[name="description"]').attr('content', post.description);
        $('h1').first().text(post.title);
        $('time').text(post.date);
        
        const $content = cheerio.load(post.content, null, false);
        $content('.adsbygoogle-container, .ad-placeholder').remove();

        const children = $content.root().children();
        const blockElements = children.filter('p, h2, h3, h4, ul, ol, div, img');
        const totalBlocks = blockElements.length;

        if (totalBlocks >= 2) {
            const midIndex = Math.floor(totalBlocks * 0.3);
            blockElements.eq(Math.max(0, midIndex)).after(ADSENSE_BLOCK);
        } else {
            $content.root().append(ADSENSE_BLOCK);
        }

        $content('img').addClass('w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700');
        $('article').html($content.html()); 
        
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
generateSitemap();

console.log('Build Complete. Auto-Injection & Data Sync Fixed.');
