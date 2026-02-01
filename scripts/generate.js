
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

// AdSense HTML Block (Strictly Contained for Mobile)
const ADSENSE_BLOCK = `
<div class="adsbygoogle-container w-full overflow-hidden mx-auto my-6 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-xl p-1 text-center">
    <div class="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">إعلان</div>
    <div style="width: 100%; max-width: 100%; overflow: hidden; display: flex; justify-content: center;">
        <ins class="adsbygoogle block"
             style="display:block; width: 100%; min-width: 250px;"
             data-ad-client="${AD_CLIENT_ID}"
             data-ad-slot="auto"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
</div>
`;

// Create directories if they don't exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Files to update (Static Pages)
const HTML_FILES = [
    'index.html', 'articles.html', 'tools.html', 'about.html', 
    'tools-sites.html', 'tools-phones.html', 'tools-compare.html', 
    'tool-analysis.html', 'privacy.html', 'site-map.html', '404.html'
];

// 1. Load Data
let aboutData = { profileName: "TechTouch", bio: "", profileImage: "assets/images/me.jpg", social: {} };
let channelsData = [];

if (fs.existsSync(path.join(DATA_DIR, 'about.json'))) {
    try {
        aboutData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'about.json'), 'utf8'));
    } catch (e) { console.error("Error parsing about.json", e); }
}
if (fs.existsSync(path.join(DATA_DIR, 'channels.json'))) {
    try {
        channelsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'channels.json'), 'utf8'));
    } catch (e) { console.error("Error parsing channels.json", e); }
}

const toAbsoluteUrl = (url) => {
    if (!url) return `${BASE_URL}/assets/images/me.jpg`;
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/${cleanPath}`;
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

// Initial Markdown Parsing
const parseMarkdown = (markdown) => {
    if (!markdown) return '';
    let html = markdown;

    // Remove artifacts
    html = html.replace(/\$1/g, '');

    // YouTube Embed (Responsive Wrapper)
    html = html.replace(/@\[youtube\]\((.*?)\)/g, (match, url) => {
        let videoId = '';
        const matchId = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
        if (matchId) videoId = matchId[1];
        if (videoId) {
            return `<div class="video-container shadow-lg rounded-xl overflow-hidden border border-gray-800 w-full"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
        }
        return '';
    });

    // Images (Responsive Class)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
        return `<img src="${src}" alt="${alt}" class="w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700">`;
    });

    // Links (Button Style - Wrapped)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, `<div class="my-6 w-full flex justify-center px-2"><a href="$2" target="_blank" class="btn-wrapped-link w-full sm:w-auto"><i data-lucide="external-link" class="shrink-0 w-4 h-4"></i><span>$1</span></a></div>`);

    // Headers (With break-words)
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3 break-words w-full">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-blue-600 dark:text-blue-400 mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 break-words w-full">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-gray-900 dark:text-white mt-8 mb-6 break-words w-full">$1</h1>');

    // Formatting
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc marker:text-blue-500 break-words">$1</li>');
    html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-inside space-y-2 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm w-full">$&</ul>');

    // Paragraphs (With break-words)
    html = html.split('\n').map(line => {
        if (line.trim() === '') return '';
        if (line.match(/^<(h|ul|li|div|img|iframe|p|script)/)) return line;
        return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base break-words w-full">${line}</p>`;
    }).join('\n');

    return html;
};

// 2. Load All Posts
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

// --- Functions Definitions (Moved UP to fix ReferenceError) ---

const generateRSS = () => {
    const feedPath = path.join(ROOT_DIR, 'feed.xml');
    const now = new Date().toUTCString();
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>TechTouch</title>
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

const generateSitemap = () => {
    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    HTML_FILES.forEach(file => {
        if (file === '404.html') return;
        let priority = '0.5';
        if(file === 'index.html') priority = '1.0';
        xml += `<url><loc>${BASE_URL}/${file}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
    });

    allPosts.forEach(post => {
        const fullImg = toAbsoluteUrl(post.image);
        const pageUrl = `${BASE_URL}/article-${post.slug}.html`;
        xml += `<url><loc>${pageUrl}</loc><lastmod>${new Date(post.effectiveDate).toISOString().split('T')[0]}</lastmod><priority>0.8</priority><image:image><image:loc>${fullImg}</image:loc><image:title>${post.title}</image:title></image:image></url>`;
    });
    xml += `</urlset>`;
    fs.writeFileSync(sitemapPath, xml);
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
                <img src="${post.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${post.title}" loading="lazy" decoding="async" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div class="absolute top-2 right-2 ${badgeColor} text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <i data-lucide="${icon}" class="w-3 h-3"></i><span>${getCatLabel(post.category)}</span>
                </div>
            </div>
            <div class="p-4 flex-1 flex flex-col w-full">
                <div class="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                    <i data-lucide="clock" class="w-3 h-3"></i><span>${post.date}</span>
                </div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors break-words whitespace-normal w-full line-clamp-2" title="${post.title}">${post.title}</h3>
                <p class="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-0 flex-1 leading-relaxed break-words w-full">${post.description}</p>
            </div>
        </div>
    </a>`;
};

const getCatLabel = (cat) => {
    const map = { 'articles': 'اخبار', 'apps': 'تطبيقات', 'games': 'ألعاب', 'sports': 'رياضة' };
    return map[cat] || 'عام';
};

const updateGlobalElements = (htmlContent, fileName = '') => {
    const $ = cheerio.load(htmlContent);

    // 1. Scripts
    if (!$('script[src*="adsbygoogle.js"]').length) $('head').append(AD_SCRIPT);
    $('script').each((i, el) => {
        const content = $(el).html() || '';
        const src = $(el).attr('src') || '';
        if (src.includes('googletagmanager.com') || content.includes("gtag('config'")) $(el).remove();
    });
    $('head').prepend(GA_SCRIPT);

    // 2. Canonical
    if (fileName) {
        const canonicalUrl = `${BASE_URL}/${fileName}`;
        $('link[rel="canonical"]').remove();
        $('head').append(`<link rel="canonical" href="${canonicalUrl}">`);
    }

    // 3. Meta & Data
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

    // 4. UI Data Updates
    $('#header-profile-name').text(aboutData.profileName);
    $('#header-profile-img').attr('src', aboutData.profileImage);
    
    // 5. Social Footer
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
                const content = (net.key === 'tiktok' && iconData === 'video') ? 
                    `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>` : 
                    renderIconHTML(iconData, net.defaultIcon, 20);
                socialLinksContainer.append(`<a href="${aboutData.social[net.key]}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 ${net.colorClass} hover:text-white transition-all transform hover:scale-110 shadow-lg border border-gray-700 overflow-hidden">${content}</a>`);
            }
        });
    }

    if (aboutData.ticker && $('#ticker-content').length) {
        $('#ticker-label').text(aboutData.ticker.label);
        let contentHtml = `<span class="mx-4 text-sm font-medium text-gray-100">${aboutData.ticker.text}</span>`;
        if(aboutData.ticker.url && aboutData.ticker.url !== '#') contentHtml = `<a href="${aboutData.ticker.url}" class="hover:text-blue-300 transition-colors">${contentHtml}</a>`;
        $('#ticker-content').html(contentHtml);
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

    const botList = $('#about-bot-list');
    if(botList.length) {
        botList.empty();
        if (aboutData.botInfo) aboutData.botInfo.split('\n').filter(l => l.trim()).forEach(line => botList.append(`<li class="flex items-start gap-2"><span class="text-blue-500 text-lg font-bold">✪</span><span>${line}</span></li>`));
    }
    const searchList = $('#about-search-list');
    if(searchList.length) {
        searchList.empty();
        if (aboutData.searchInfo) aboutData.searchInfo.split('\n').filter(l => l.trim()).forEach(line => searchList.append(`<li class="flex items-start gap-2"><span class="text-green-500 text-lg font-bold">✪</span><span>${line}</span></li>`));
    }

    const coverDiv = $('div.bg-gradient-to-r, div.bg-cover').first();
    coverDiv.removeClass().addClass('h-40 relative');
    if (aboutData.coverType === 'image') { coverDiv.addClass('bg-cover bg-center').attr('style', `background-image: url('${aboutData.coverValue}');`); }
    else { coverDiv.removeAttr('style').addClass(aboutData.coverValue); }
    coverDiv.find('img').attr('src', aboutData.profileImage);

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
                    <div class="flex-1 min-w-0"><h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1 break-words">${ch.name}</h3><p class="text-xs text-gray-500 dark:text-gray-400 truncate">${ch.desc}</p></div>
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

        // Map Category ID to Arabic Label for Breadcrumb
        const catMap = { 'articles': 'اخبار', 'apps': 'تطبيقات', 'games': 'ألعاب', 'sports': 'رياضة' };
        const catLabel = catMap[post.category] || 'اخبار';

        $('title').text(`${post.title} | TechTouch`);
        $('meta[name="description"]').attr('content', post.description);
        $('h1').first().text(post.title).addClass('break-words whitespace-normal w-full');
        $('time').text(post.date);

        const nav = $('nav');
        if (nav.length) {
            nav.html(`
                <a href="index.html" class="hover:text-blue-500 transition-colors">الرئيسية</a>
                <span class="mx-2 text-gray-300">/</span>
                <a href="articles.html" class="hover:text-blue-500 transition-colors">${catLabel}</a>
                <span class="mx-2 text-gray-300">/</span>
                <span class="text-gray-800 dark:text-gray-300 truncate max-w-[150px] sm:max-w-xs inline-block align-bottom" title="${post.title}">${post.title}</span>
            `);
        }

        const $content = cheerio.load(post.content, null, false);
        $content('img').each((i, el) => {
            const $img = cheerio(el);
            if (i === 0) {
                $img.attr('fetchpriority', 'high').attr('loading', 'eager').attr('decoding', 'async');
                if ($img.attr('src')) $('head').append(`<link rel="preload" as="image" href="${$img.attr('src')}" fetchpriority="high">`);
            } else {
                $img.attr('loading', 'lazy').attr('decoding', 'async');
            }
            $img.addClass('w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700');
        });

        const coverImg = $('img.object-cover').first();
        if(coverImg.length) {
            coverImg.attr('src', post.image).attr('alt', post.title).attr('fetchpriority', 'high').attr('decoding', 'async').removeAttr('loading');
        }

        $('article').html($content.html()); 
        $('article').find('.adsbygoogle-container').remove();
        $('article').append(ADSENSE_BLOCK);

        const jsonLd = {
            "@context": "https://schema.org", "@type": "Article", "headline": post.title,
            "image": [fullImageUrl], "datePublished": new Date(post.date).toISOString(),
            "dateModified": new Date(post.effectiveDate).toISOString(),
            "author": { "@type": "Person", "name": aboutData.profileName },
            "publisher": { "@type": "Organization", "name": "TechTouch", "logo": { "@type": "ImageObject", "url": toAbsoluteUrl(aboutData.profileImage) } },
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

// Execution
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

console.log('Build Complete. Domain updated to: ' + BASE_URL);
