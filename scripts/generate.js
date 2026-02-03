
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
    // Check if already initialized to prevent errors
    if (!OneSignal.initialized) {
        OneSignal.init({
          appId: "${ONESIGNAL_APP_ID}",
          safari_web_id: "web.onesignal.auto.xxxxx",
          notifyButton: {
            enable: true,
          },
        });
        OneSignal.initialized = true;
    }
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

// Ticker HTML Template (Updated Style)
const TICKER_HTML_TEMPLATE = `
<div id="news-ticker-bar" class="w-full bg-gray-900 text-white h-10 flex items-center overflow-hidden border-b border-gray-800 relative z-40">
    <div class="h-full flex items-center justify-center px-4 relative z-10 shrink-0">
        <div id="ticker-label" class="border-2 border-blue-500 text-blue-500 px-3 py-0.5 rounded-md font-bold text-xs shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          جديد
        </div>
    </div>
    <div class="flex-1 overflow-hidden relative h-full flex items-center bg-gray-900">
      <div id="ticker-content" class="animate-marquee whitespace-nowrap absolute right-0 flex items-center">
      </div>
    </div>
</div>
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
    'tools-sites.html', 'tools-phones.html', 'tools-compare.html',
    'tool-analysis.html', 'privacy.html', 'site-map.html', '404.html'
];

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
    ticker: { enabled: true, text: "Welcome", label: "New", url: "#" }
};
let channelsData = [];

if (fs.existsSync(path.join(DATA_DIR, 'about.json'))) {
    try { aboutData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'about.json'), 'utf8')); } catch (e) { console.error("Error parsing about.json", e); }
}
if (fs.existsSync(path.join(DATA_DIR, 'channels.json'))) {
    try { channelsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'channels.json'), 'utf8')); } catch (e) { console.error("Error parsing channels.json", e); }
}

// --- UTILITY: Clean Path Function ---
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

// --- Helper Functions ---
const renderIconHTML = (iconData, defaultIconName, defaultSize = 20) => {
    if (typeof iconData === 'string') {
        return `<i data-lucide="${iconData || defaultIconName}" class="w-5 h-5"></i>`;
    }
    if (iconData && typeof iconData === 'object') {
        if (iconData.type === 'image') {
            const size = iconData.size || defaultSize;
            return `<img src="${cleanPath(iconData.value)}" style="width:${size}px; height:${size}px; object-fit:contain; display:block;" alt="icon">`;
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

const createCardHTML = (post) => {
    let badgeColor = 'bg-blue-600';
    let icon = 'file-text';
    if(post.category === 'apps') { badgeColor = 'bg-green-600'; icon = 'smartphone'; }
    if(post.category === 'games') { badgeColor = 'bg-purple-600'; icon = 'gamepad-2'; }
    if(post.category === 'sports') { badgeColor = 'bg-orange-600'; icon = 'trophy'; }
    
    return `
    <a href="article-${post.slug}.html" class="group block w-full h-full animate-fade-in post-card-wrapper">
        <div class="post-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col relative w-full">
            <div class="h-40 sm:h-48 w-full overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                <img src="${cleanPath(post.image)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${post.title}" loading="lazy" decoding="async" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div class="absolute top-2 right-2 ${badgeColor} text-white font-bold rounded-full flex items-center gap-1 shadow-lg z-10 custom-badge-size" style="padding: 0.3em 0.6em;">
                    <i data-lucide="${icon}" style="width: 1.2em; height: 1.2em;"></i><span>${getCatLabel(post.category)}</span>
                </div>
            </div>
            <div class="p-4 flex-1 flex flex-col w-full">
                <div class="flex items-center gap-2 text-gray-400 mb-2 custom-meta-size">
                    <i data-lucide="clock" style="width: 1.2em; height: 1.2em;"></i><span>${post.date}</span>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors break-words whitespace-normal w-full line-clamp-2 custom-title-size" title="${post.title}">${post.title}</h3>
                <p class="text-gray-500 dark:text-gray-400 line-clamp-2 mb-0 flex-1 leading-relaxed break-words whitespace-normal w-full custom-desc-size">${post.description}</p>
            </div>
        </div>
    </a>`;
};

// --- GLOBAL SCRIPT INJECTOR ---
const updateGlobalElements = (htmlContent, fileName = '') => {
    // Prevent Cheerio from stripping the DOCTYPE
    const $ = cheerio.load(htmlContent, { decodeEntities: false });

    // 1. Clean old scripts
    $('script').each((i, el) => {
        const src = $(el).attr('src') || '';
        const content = $(el).html() || '';
        if (src.includes("cdn.onesignal.com") || content.includes("OneSignal")) { $(el).remove(); }
        if (src.includes('googletagmanager.com') || content.includes("gtag(") || src.includes('G-')) { $(el).remove(); }
        if (src.includes("pagead2.googlesyndication.com") || content.includes("adsbygoogle")) { $(el).remove(); }
    });

    // 2. Inject Fresh Scripts
    $('head').append(ONESIGNAL_SCRIPT);
    $('head').append(AD_SCRIPT);
    $('head').prepend(GA_SCRIPT);
    
    // 3. Search Console Meta
    if (GOOGLE_SITE_VERIFICATION) {
        $('meta[name="google-site-verification"]').remove();
        $('head').append(`<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}" />`);
    }

    // 4. Common UI Updates
    
    // A. Profile Image
    let profileImgSrc = aboutData.profileImage || 'assets/images/me.jpg';
    profileImgSrc = cleanPath(profileImgSrc);
    
    $('#header-profile-img').attr('src', profileImgSrc);
    $('.profile-img-display').attr('src', profileImgSrc);
    $('link[rel*="icon"]').attr('href', profileImgSrc);
    $('meta[property="og:image"]').attr('content', toAbsoluteUrl(profileImgSrc));
    
    // B. Profile Name
    $('#header-profile-name').text(aboutData.profileName);
    
    // C. Site Title / Logo
    let siteTitleEl = $('header a[href="index.html"]').filter((i, el) => {
        const cls = $(el).attr('class') || '';
        const content = $(el).html() || '';
        return !cls.includes('p-2') && (content.includes(aboutData.siteName) || content.includes('<img') || cls.includes('font-black'));
    }).first();

    if (siteTitleEl.length) {
        if (aboutData.logoType === 'image' && aboutData.logoUrl) {
            const logoUrl = cleanPath(aboutData.logoUrl);
            siteTitleEl.html(`<img src="${logoUrl}" alt="${aboutData.siteName}" style="max-height: 40px; width: auto; display: block;" />`);
            siteTitleEl.removeClass('text-xl text-lg font-black text-blue-600 dark:text-blue-400 tracking-tight truncate'); 
            siteTitleEl.addClass('flex items-center');
        } else {
            siteTitleEl.html(aboutData.siteName || 'TechTouch');
            siteTitleEl.removeClass('flex items-center');
            siteTitleEl.addClass('text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight truncate');
        }
    }

    // D. DYNAMIC STYLES
    const fonts = aboutData.globalFonts || { nav: 12, content: 13, titles: 14, mainTitles: 15 };
    const dynamicStyle = `
    <style id="dynamic-theme-styles">
        nav .nav-link, nav .nav-link span, .tab-btn, .tab-btn span { font-size: ${fonts.nav || 12}px !important; }
        body, p, li, .post-card .custom-desc-size, .prose p, .prose li { font-size: ${fonts.content || 13}px !important; line-height: 1.6 !important; }
        .post-card .custom-title-size, h2, h3, h4, .prose h2, .prose h3 { font-size: ${fonts.titles || 14}px !important; line-height: 1.4 !important; }
        h1, .text-3xl, .text-4xl { font-size: ${fonts.mainTitles || 15}px !important; }
        .ticker-text, .ticker-text a { font-size: ${aboutData.ticker?.fontSize || 14}px !important; }
    </style>
    `;
    $('#dynamic-theme-styles').remove();
    $('head').append(dynamicStyle);

    // E. Social Links
    if (aboutData.social) {
        $('footer a[href*="facebook"]').attr('href', aboutData.social.facebook || '#');
        $('footer a[href*="instagram"]').attr('href', aboutData.social.instagram || '#');
        $('footer a[href*="tiktok"]').attr('href', aboutData.social.tiktok || '#');
        $('footer a[href*="youtube"]').attr('href', aboutData.social.youtube || '#');
        $('footer a[href*="t.me"]').attr('href', aboutData.social.telegram || '#');
    }

    // F. TICKER LOGIC (RESTRICTED TO INDEX.HTML)
    // 1. Always remove any existing ticker first
    $('#news-ticker-bar').remove();

    // 2. Check if this is the Home Page AND Ticker is enabled
    if (fileName === 'index.html' && aboutData.ticker && aboutData.ticker.enabled !== false) {
        $('header').after(TICKER_HTML_TEMPLATE);
        
        // 3. Update the content of the newly injected ticker
        $('#ticker-label').text(aboutData.ticker.label);
        
        const tickerContentDiv = $('#ticker-content');
        tickerContentDiv.removeClass().addClass('flex items-center h-full whitespace-nowrap');
        
        if (aboutData.ticker.animated !== false) {
            tickerContentDiv.addClass('animate-marquee absolute right-0');
        } else {
            tickerContentDiv.addClass('w-full justify-start pr-2 overflow-hidden');
        }
        
        // Handle Content Type (Image vs Text)
        if (aboutData.ticker.type === 'image' && aboutData.ticker.imageUrl) {
            // Image Content
            const imgUrl = cleanPath(aboutData.ticker.imageUrl);
            const contentHtml = `<img src="${imgUrl}" alt="Ticker Banner" class="h-full object-contain mx-auto" style="max-height: 40px; width: auto;" />`;
            // Remove animation for image typically, or keep if scrolling banner is desired. 
            // For better UX, usually banner images are static or marquee. Let's keep marquee structure but ensure image fits.
            tickerContentDiv.html(contentHtml);
        } else {
            // Text Content
            let contentHtml = `<span class="mx-4 font-medium text-gray-100 ticker-text whitespace-nowrap inline-block">${aboutData.ticker.text}</span>`;
            if(aboutData.ticker.url && aboutData.ticker.url !== '#') {
                contentHtml = `<a href="${aboutData.ticker.url}" class="hover:text-blue-300 transition-colors whitespace-nowrap inline-block ticker-text text-gray-100">${aboutData.ticker.text}</a>`;
            }
            tickerContentDiv.html(contentHtml);
        }
    }
    
    // G. Category Labels
    if (aboutData.categories && aboutData.categories.labels) {
        $('[data-tab="articles"] span').text(aboutData.categories.labels.articles || 'اخبار');
        $('[data-tab="apps"] span').text(aboutData.categories.labels.apps || 'تطبيقات');
        $('[data-tab="games"] span').text(aboutData.categories.labels.games || 'ألعاب');
        $('[data-tab="sports"] span').text(aboutData.categories.labels.sports || 'رياضة');
    }
    
    // H. About Page Specifics
    if (fileName === 'about.html') {
        const coverContainer = $('#about-cover-section');
        if (coverContainer.length) {
            coverContainer.attr('style', ''); 
            if (aboutData.coverType === 'image' && aboutData.coverValue) {
                const coverUrl = cleanPath(aboutData.coverValue);
                coverContainer.css('background', `url('${coverUrl}') center/cover no-repeat`);
                coverContainer.removeClass((i, c) => (c.match(/bg-gradient-\S+/g) || []).join(' '));
                coverContainer.removeClass((i, c) => (c.match(/from-\S+/g) || []).join(' '));
                coverContainer.removeClass((i, c) => (c.match(/to-\S+/g) || []).join(' '));
            } else {
                coverContainer.css('background', ''); 
                coverContainer.removeClass((i, c) => (c.match(/bg-gradient-\S+/g) || []).join(' '));
                coverContainer.removeClass((i, c) => (c.match(/from-\S+/g) || []).join(' '));
                coverContainer.removeClass((i, c) => (c.match(/to-\S+/g) || []).join(' '));
                coverContainer.addClass(aboutData.coverValue || 'bg-gradient-to-r from-blue-700 to-blue-500');
            }
        }
        
        $('#about-bot-list').parent().find('h2').contents().last().replaceWith(' ' + (aboutData.botTitle || 'مركز خدمة الطلبات (Bot)'));
        if(aboutData.botInfo) {
            const botItems = aboutData.botInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-blue-500 text-xl">✪</span><span>${i}</span></li>`).join('');
            $('#about-bot-list').html(botItems);
        }
        
        $('#about-search-list').parent().find('h2').contents().last().replaceWith(' ' + (aboutData.searchTitle || 'دليل الوصول الذكي للمحتوى'));
        if(aboutData.searchInfo) {
            const searchItems = aboutData.searchInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-green-500 text-xl">✪</span><span>${i}</span></li>`).join('');
            $('#about-search-list').html(searchItems);
        }
        
        $('.prose p:first').text(aboutData.bio);
    }

    // I. Inject Back to Top Button
    if ($('#back-to-top').length === 0) {
        $('body').append(`
        <button id="back-to-top" class="fixed bottom-6 right-6 z-50 bg-gray-900/60 hover:bg-gray-900/80 backdrop-blur-md text-white p-2 rounded-full shadow-lg transition-all duration-300 transform translate-y-10 opacity-0 invisible hover:scale-110 hover:-translate-y-1 focus:outline-none border border-white/10 group" aria-label="العودة للأعلى">
            <i data-lucide="arrow-up" class="w-5 h-5"></i>
        </button>
        `);
    }

    // Ensure DOCTYPE
    let finalHtml = $.html();
    if (!finalHtml.trim().toLowerCase().startsWith('<!doctype html>')) {
        finalHtml = '<!DOCTYPE html>\n' + finalHtml;
    }
    return finalHtml;
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

const updateToolsPage = () => { const filePath = path.join(ROOT_DIR, 'tools.html'); if (!fs.existsSync(filePath)) return; let html = fs.readFileSync(filePath, 'utf8'); const $ = cheerio.load(html); const main = $('main'); if (main.length) { main.find('.adsbygoogle-container').remove(); main.find('a[href="tool-analysis.html"]').remove(); main.append(ADSENSE_BLOCK); } fs.writeFileSync(filePath, updateGlobalElements($.html(), 'tools.html')); };
const updateAboutPageDetails = () => { const aboutPath = path.join(ROOT_DIR, 'about.html'); if (!fs.existsSync(aboutPath)) return; let html = fs.readFileSync(aboutPath, 'utf8'); const $ = cheerio.load(html); fs.writeFileSync(aboutPath, updateGlobalElements($.html(), 'about.html')); };
const updateChannelsPage = () => {
    const toolsPath = path.join(ROOT_DIR, 'tools-sites.html'); if (!fs.existsSync(toolsPath)) return; let html = fs.readFileSync(toolsPath, 'utf8'); const $ = cheerio.load(html); const grid = $('main .grid'); grid.empty();
    channelsData.forEach(ch => {
        const renderedIcon = renderIconHTML(ch.iconData || ch.icon, 'star', 24);
        grid.append(`<a href="${ch.url}" target="_blank" class="block bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group w-full"><div class="flex items-center gap-4 h-full"><div class="w-12 h-12 bg-${ch.color}-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white overflow-hidden">${renderedIcon}</div><div class="flex-1 min-w-0"><h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1 break-words whitespace-normal">${ch.name}</h3><p class="text-xs text-gray-500 dark:text-gray-400 truncate">${ch.desc}</p></div><div class="text-gray-300 group-hover:text-${ch.color}-600 shrink-0 transition-colors"><i data-lucide="chevron-left" class="w-5 h-5"></i></div></div></a>`);
    });
    fs.writeFileSync(toolsPath, updateGlobalElements($.html(), 'tools-sites.html'));
};

const generateIndividualArticles = () => {
    const templatePath = path.join(ROOT_DIR, 'article-asus-gx10.html');
    let template = '';
    if (fs.existsSync(templatePath)) { template = fs.readFileSync(templatePath, 'utf8'); } else { template = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>Article</title></head><body><main><article></article></main></body></html>`; }

    allPosts.forEach(post => {
        const $ = cheerio.load(template);
        const pageSlug = `article-${post.slug}.html`;
        const fullUrl = `${BASE_URL}/${pageSlug}`;
        const fullImageUrl = toAbsoluteUrl(post.image);
        
        $('title').text(`${post.title} | ${aboutData.siteName || "TechTouch"}`);
        $('meta[name="description"]').attr('content', post.description);
        $('h1').first().text(post.title);
        $('time').text(post.date);
        
        // --- FIX: UPDATE MAIN FEATURED IMAGE ---
        $('main > div.rounded-2xl > img').attr('src', cleanPath(post.image));
        $('main > div.rounded-2xl > img').attr('alt', post.title);
        // ---------------------------------------

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

        // Apply cleaning to article images as well
        $content('img').each((i, img) => {
            const originalSrc = $content(img).attr('src');
            if (originalSrc) $content(img).attr('src', cleanPath(originalSrc));
        });
        
        $content('img').addClass('w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700');
        $('article').html($content.html()); 
        
        const jsonLd = { "@context": "https://schema.org", "@type": "Article", "headline": post.title, "image": [fullImageUrl], "datePublished": new Date(post.date).toISOString(), "dateModified": new Date(post.effectiveDate).toISOString(), "author": { "@type": "Person", "name": aboutData.profileName }, "publisher": { "@type": "Organization", "name": aboutData.siteName || "TechTouch", "logo": { "@type": "ImageObject", "url": toAbsoluteUrl(aboutData.profileImage) } }, "description": post.description, "mainEntityOfPage": { "@type": "WebPage", "@id": fullUrl } };
        $('script[type="application/ld+json"]').remove();
        $('head').append(`<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`);
        
        fs.writeFileSync(path.join(ROOT_DIR, pageSlug), updateGlobalElements($.html(), pageSlug));
    });
};

const updateSearchData = () => {
    const searchPath = path.join(ROOT_DIR, 'assets/js/search-data.js');
    const searchItems = [ ...allPosts.map(p => ({ title: p.title, desc: p.description, url: `article-${p.slug}.html`, category: p.category.charAt(0).toUpperCase() + p.category.slice(1), image: cleanPath(p.image) })), ...channelsData.map(c => ({ title: c.name, desc: c.desc, url: c.url, category: 'Channels', image: 'assets/images/me.jpg' })) ];
    fs.writeFileSync(searchPath, `export const searchIndex = ${JSON.stringify(searchItems, null, 2)};`);
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
