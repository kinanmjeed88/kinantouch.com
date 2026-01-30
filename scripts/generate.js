
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Directories
const ROOT_DIR = path.join(__dirname, '../');
const POSTS_DIR = path.join(__dirname, '../content/posts');
const DATA_DIR = path.join(__dirname, '../content/data');

// Domain Configuration (Critical for SEO - Ensure NO trailing slash)
const BASE_URL = 'https://kinantouch.com';

// Create directories if they don't exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Files to update (Static Pages)
const HTML_FILES = [
    'index.html', 'articles.html', 'tools.html', 'about.html', 
    'tools-sites.html', 'tools-phones.html', 'tools-compare.html', 
    'tool-analysis.html', 'privacy.html', 'site-map.html', '404.html'
];

// 1. Load Data with error handling
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

// Helper: Ensure URL is Absolute and Clean
const toAbsoluteUrl = (url) => {
    if (!url) return `${BASE_URL}/assets/images/me.jpg`;
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/${cleanPath}`;
};

// Helper for Rendering Icons
const renderIconHTML = (iconData, defaultIconName, defaultSize = 24) => {
    if (typeof iconData === 'string') {
        return `<i data-lucide="${iconData || defaultIconName}" class="w-6 h-6"></i>`;
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
    return `<i data-lucide="${defaultIconName}" class="w-6 h-6"></i>`;
};

// Initial Markdown Parsing (Structure only - Images handled by Cheerio later)
const parseMarkdown = (markdown) => {
    if (!markdown) return '';
    let html = markdown;

    // YouTube Embed (Responsive)
    html = html.replace(/@\[youtube\]\((.*?)\)/g, (match, url) => {
        let videoId = '';
        const matchId = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
        if (matchId) videoId = matchId[1];
        if (videoId) {
            return `<div class="video-container my-10 shadow-2xl rounded-2xl overflow-hidden border border-gray-800 w-full"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
        }
        return '';
    });

    // Basic Image Syntax -> HTML (Will be optimized by Cheerio next)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
        return `<img src="${src}" alt="${alt}">`; // Raw img tag
    });

    // Links (Button Style)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, `<div class="my-8 w-full flex justify-center px-1 sm:px-0"><a href="$2" target="_blank" class="btn-wrapped-link w-full sm:w-auto sm:min-w-[280px] max-w-md mx-auto"><i data-lucide="external-link" class="shrink-0"></i><span class="break-words">$1</span></a></div>`);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3 break-words">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 break-words">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mt-8 mb-6 break-words">$1</h1>');

    // Formatting
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc marker:text-blue-500">$1</li>');
    html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-inside space-y-2 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm sm:text-base">$&</ul>');

    // Paragraphs
    html = html.split('\n').map(line => {
        if (line.trim() === '') return '';
        if (line.match(/^<(h|ul|li|div|img|iframe)/)) return line;
        return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base sm:text-lg break-words">${line}</p>`;
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
                // Pre-parse markdown structure
                post.content = parseMarkdown(post.content);
                // Smart Date
                post.effectiveDate = post.updated || post.date;
                allPosts.push(post);
            } catch (e) { console.error(`Error reading post ${file}:`, e); }
        }
    });
}
// Sort by Smart Date (Newest First)
allPosts.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));

console.log(`Found ${allPosts.length} posts. Starting build...`);

// --- RSS Feed Generator (World Class Feature) ---
const generateRSS = () => {
    console.log('Generating RSS Feed...');
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
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
`;

    allPosts.slice(0, 20).forEach(post => { // Limit to top 20 for feed
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

    xml += `
</channel>
</rss>`;
    fs.writeFileSync(feedPath, xml);
    console.log('RSS Feed generated.');
};

// --- Sitemap Generator ---
const generateSitemap = () => {
    console.log('Generating Sitemap...');
    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    // Static Pages
    HTML_FILES.forEach(file => {
        if (file === '404.html') return;
        
        // Smart Priority
        let priority = '0.5';
        if(file === 'index.html') priority = '1.0';
        if(file === 'articles.html') priority = '0.9';

        xml += `
  <url>
    <loc>${BASE_URL}/${file}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`;
    });

    // Dynamic Articles
    allPosts.forEach(post => {
        const fullImg = toAbsoluteUrl(post.image);
        const pageUrl = `${BASE_URL}/article-${post.slug}.html`;
        
        xml += `
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${post.effectiveDate}</lastmod>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${fullImg}</image:loc>
      <image:title>${post.title}</image:title>
    </image:image>
  </url>`;
    });

    xml += `\n</urlset>`;
    fs.writeFileSync(sitemapPath, xml);
    console.log('Sitemap.xml updated.');
};

// --- HTML Generators ---

const createCardHTML = (post) => {
    let badgeColor = 'bg-blue-600';
    let icon = 'file-text';
    if(post.category === 'apps') { badgeColor = 'bg-green-600'; icon = 'smartphone'; }
    if(post.category === 'games') { badgeColor = 'bg-purple-600'; icon = 'gamepad-2'; }
    if(post.category === 'sports') { badgeColor = 'bg-orange-600'; icon = 'trophy'; }

    return `
    <a href="article-${post.slug}.html" class="group block w-full h-full animate-fade-in">
        <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
            <div class="h-48 sm:h-52 w-full overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                <img src="${post.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${post.title}" loading="lazy" decoding="async" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div class="absolute top-3 right-3 ${badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                    <i data-lucide="${icon}" class="w-3 h-3"></i><span>${getCatLabel(post.category)}</span>
                </div>
            </div>
            <div class="p-4 sm:p-5 flex-1 flex flex-col">
                <div class="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                    <i data-lucide="clock" class="w-3 h-3"></i><span>${post.date}</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">${post.title}</h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">${post.description}</p>
            </div>
        </div>
    </a>`;
};

const getCatLabel = (cat) => {
    const map = { 'articles': 'اخبار', 'apps': 'تطبيقات', 'games': 'ألعاب', 'sports': 'رياضة' };
    return map[cat] || 'عام';
};

// --- Update Functions ---

const updateGlobalElements = (htmlContent, fileName = '') => {
    const $ = cheerio.load(htmlContent);

    // 1. Strict Canonical Link
    if (fileName) {
        const canonicalUrl = `${BASE_URL}/${fileName}`;
        $('link[rel="canonical"]').remove();
        $('head').append(`<link rel="canonical" href="${canonicalUrl}">`);
    }

    // 2. Open Graph & Twitter Card
    const pageTitle = $('title').text() || aboutData.profileName;
    const pageDesc = $('meta[name="description"]').attr('content') || aboutData.bio;
    let pageImage = $('main img').first().attr('src');
    if (!pageImage || pageImage.includes('data:')) pageImage = aboutData.profileImage;
    
    const fullImageUrl = toAbsoluteUrl(pageImage);
    const fullPageUrl = fileName ? `${BASE_URL}/${fileName}` : BASE_URL;

    const setMeta = (property, content) => {
        $('meta[property="' + property + '"]').remove();
        $('head').append(`<meta property="${property}" content="${content}">`);
    };
    const setName = (name, content) => {
        $('meta[name="' + name + '"]').remove();
        $('head').append(`<meta name="${name}" content="${content}">`);
    };

    setMeta('og:type', 'website');
    setMeta('og:url', fullPageUrl);
    setMeta('og:title', pageTitle);
    setMeta('og:description', pageDesc);
    setMeta('og:image', fullImageUrl);

    setName('twitter:card', 'summary_large_image');
    setName('twitter:url', fullPageUrl);
    setName('twitter:title', pageTitle);
    setName('twitter:description', pageDesc);
    setName('twitter:image', fullImageUrl);

    // 3. RSS Link
    $('head').append(`<link rel="alternate" type="application/rss+xml" title="TechTouch Feed" href="${BASE_URL}/feed.xml" />`);

    // 4. UI Updates
    $('#header-profile-name').text(aboutData.profileName);
    $('#header-profile-img').attr('src', aboutData.profileImage);
    $('header .font-bold.text-lg').text(aboutData.profileName);
    $('header img[alt="Profile photo"]').attr('src', aboutData.profileImage);

    // 5. Update Footer Socials
    const social = aboutData.social || {};
    const socialIcons = aboutData.socialIcons || {};
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
            if (social[net.key]) {
                const iconData = socialIcons[net.key] || net.defaultIcon;
                if (net.key === 'tiktok' && (iconData === 'video' || (typeof iconData === 'object' && iconData.value === 'video'))) {
                     const tiktokSvg = `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`;
                     socialLinksContainer.append(`<a href="${social[net.key]}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 ${net.colorClass} hover:text-white transition-all transform hover:scale-110 shadow-lg border border-gray-700">${tiktokSvg}</a>`);
                } else {
                    const content = renderIconHTML(iconData, net.defaultIcon, 20); 
                    socialLinksContainer.append(`<a href="${social[net.key]}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 ${net.colorClass} hover:text-white transition-all transform hover:scale-110 shadow-lg border border-gray-700 overflow-hidden">${content}</a>`);
                }
            }
        });
    }

    // 6. Update Ticker
    if (aboutData.ticker) {
        $('#ticker-label').text(aboutData.ticker.label);
        const tickerContainer = $('#ticker-content');
        if(tickerContainer.length) {
            let contentHtml = `<span class="mx-4 text-sm font-medium text-gray-100">${aboutData.ticker.text}</span>`;
            if(aboutData.ticker.url && aboutData.ticker.url !== '#') {
                contentHtml = `<a href="${aboutData.ticker.url}" class="hover:text-blue-300 transition-colors">${contentHtml}</a>`;
            }
            tickerContainer.html(contentHtml);
        }
    }

    return $.html();
};

const updateListingPages = () => {
    const pagesToUpdate = [
        { file: 'index.html', limit: 6 },
        { file: 'articles.html', limit: 1000 }
    ];

    pagesToUpdate.forEach(pageInfo => {
        const filePath = path.join(ROOT_DIR, pageInfo.file);
        if (!fs.existsSync(filePath)) return;

        let html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);

        const fillContainer = (catId, posts) => {
            const container = $(`#tab-${catId} .grid`);
            if (container.length) {
                container.empty();
                posts.slice(0, pageInfo.limit).forEach(post => {
                    container.append(createCardHTML(post));
                });
                if (posts.length === 0) {
                    container.html('<div class="col-span-full text-center py-10 text-gray-400">لا توجد منشورات في هذا القسم حالياً.</div>');
                }
            }
        };

        fillContainer('articles', allPosts.filter(p => p.category === 'articles'));
        fillContainer('apps', allPosts.filter(p => p.category === 'apps'));
        fillContainer('games', allPosts.filter(p => p.category === 'games'));
        fillContainer('sports', allPosts.filter(p => p.category === 'sports'));

        const finalHtml = updateGlobalElements($.html(), pageInfo.file);
        fs.writeFileSync(filePath, finalHtml);
    });
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
        const botHeader = botList.parent().find('h2');
        const iconTag = botHeader.find('i').length ? `<i data-lucide="${botHeader.find('i').attr('data-lucide')}" class="${botHeader.find('i').attr('class')}"></i>` : '<i data-lucide="message-square" class="w-5 h-5"></i>';
        botHeader.html(`${iconTag} ${aboutData.botTitle || 'مركز خدمة الطلبات (Bot)'}`);
        if (aboutData.botInfo) {
            const items = aboutData.botInfo.split('\n').filter(l => l.trim());
            botList.empty();
            items.forEach(line => botList.append(`<li class="flex items-start gap-2"><span class="text-blue-500 text-xl font-bold">✪</span><span>${line}</span></li>`));
        }
    }

    const searchList = $('#about-search-list');
    if(searchList.length) {
        const searchHeader = searchList.parent().find('h2');
        const iconTag = searchHeader.find('i').length ? `<i data-lucide="${searchHeader.find('i').attr('data-lucide')}" class="${searchHeader.find('i').attr('class')}"></i>` : '<i data-lucide="search" class="w-5 h-5"></i>';
        searchHeader.html(`${iconTag} ${aboutData.searchTitle || 'دليل الوصول الذكي للمحتوى'}`);
        if (aboutData.searchInfo) {
            const items = aboutData.searchInfo.split('\n').filter(l => l.trim());
            searchList.empty();
            items.forEach(line => searchList.append(`<li class="flex items-start gap-2"><span class="text-green-500 text-xl font-bold">✪</span><span>${line}</span></li>`));
        }
    }

    const coverDiv = $('div.bg-gradient-to-r, div.bg-cover').first();
    coverDiv.removeClass(); 
    coverDiv.addClass('h-40 relative'); 
    if (aboutData.coverType === 'image') {
        coverDiv.addClass('bg-cover bg-center');
        coverDiv.attr('style', `background-image: url('${aboutData.coverValue}');`);
    } else {
        coverDiv.removeAttr('style');
        coverDiv.addClass(aboutData.coverValue);
    }
    coverDiv.find('img').attr('src', aboutData.profileImage);
    
    const finalHtml = updateGlobalElements($.html(), 'about.html');
    fs.writeFileSync(aboutPath, finalHtml);
};

const updateChannelsPage = () => {
    const toolsPath = path.join(ROOT_DIR, 'tools-sites.html');
    if (!fs.existsSync(toolsPath)) return;

    let html = fs.readFileSync(toolsPath, 'utf8');
    const $ = cheerio.load(html);
    const grid = $('main .grid');
    grid.empty();

    channelsData.forEach(ch => {
        const iconInfo = ch.iconData ? ch.iconData : ch.icon;
        const renderedIcon = renderIconHTML(iconInfo, 'star', 24);

        grid.append(`
            <a href="${ch.url}" target="_blank" class="block bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group">
                <div class="flex items-center gap-4 h-full">
                    <div class="w-12 h-12 bg-${ch.color}-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white overflow-hidden">
                        ${renderedIcon}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1">${ch.name}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${ch.desc}</p>
                    </div>
                    <div class="text-gray-300 group-hover:text-${ch.color}-600 shrink-0 transition-colors">
                        <i data-lucide="chevron-left" class="w-5 h-5"></i>
                    </div>
                </div>
            </a>
        `);
    });
    
    const finalHtml = updateGlobalElements($.html(), 'tools-sites.html');
    fs.writeFileSync(toolsPath, finalHtml);
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

        $('title').text(`${post.title} | TechTouch`);
        $('meta[name="description"]').attr('content', post.description);
        
        $('h1').first().text(post.title);
        $('time').text(post.date);
        
        // --- PRO LCP STRATEGY ---
        // 1. Process Content to find Hero Image (First Image)
        // Use cheerio to parse content safely and apply optimizations
        const $content = cheerio.load(post.content, null, false); // false = parse fragment
        
        // Optimize all images inside content
        $content('img').each((i, el) => {
            const $img = cheerio(el);
            // First image in content gets LCP treatment
            if (i === 0) {
                $img.attr('fetchpriority', 'high');
                $img.attr('loading', 'eager');
                $img.attr('decoding', 'async');
                
                // Inject Preload Link into Head
                const src = $img.attr('src');
                if (src) {
                    $('head').append(`<link rel="preload" as="image" href="${src}" fetchpriority="high">`);
                }
            } else {
                // Subsequent images get standard optimization
                $img.attr('loading', 'lazy');
                $img.attr('decoding', 'async');
            }
            // Ensure styling
            $img.addClass('w-full h-auto max-w-full rounded-xl shadow-md my-6 block mx-auto border border-gray-100 dark:border-gray-700');
        });

        // 2. Set Hero/Cover Image in Layout (The one outside content)
        const coverImg = $('img.object-cover').first();
        if(coverImg.length) {
            coverImg.attr('src', post.image);
            coverImg.attr('alt', post.title);
            coverImg.attr('fetchpriority', 'high');
            coverImg.attr('decoding', 'async');
            coverImg.removeAttr('loading'); // Ensure eager
        }

        // 3. Inject Processed Content
        $('article').html($content.html()); 
        
        $('nav span.truncate').text(post.title);
        
        // --- PRO JSON-LD (E-E-A-T) ---
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "image": [fullImageUrl],
            "datePublished": new Date(post.date).toISOString(),
            "dateModified": new Date(post.effectiveDate).toISOString(), // Smart Date
            "author": {
                "@type": "Person",
                "name": aboutData.profileName
            },
            "publisher": {
                "@type": "Organization",
                "name": "TechTouch",
                "logo": {
                    "@type": "ImageObject",
                    "url": toAbsoluteUrl(aboutData.profileImage)
                }
            },
            "description": post.description,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": fullUrl
            }
        };

        $('script[type="application/ld+json"]').remove();
        $('head').append(`<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`);
        $('meta[property="og:type"]').attr('content', 'article');

        const gaId = 'G-NZVS1EN9RG';
        if (!$(`script[src*="${gaId}"]`).length) {
            const gaScript = `<!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}');</script>`;
            $('head').prepend(gaScript);
        }

        const finalHtml = updateGlobalElements($.html(), pageSlug);
        fs.writeFileSync(path.join(ROOT_DIR, pageSlug), finalHtml);
    });
};

const updateSearchData = () => {
    const searchPath = path.join(ROOT_DIR, 'assets/js/search-data.js');
    const searchItems = [
        ...allPosts.map(p => ({
            title: p.title,
            desc: p.description,
            url: `article-${p.slug}.html`,
            category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
            image: p.image
        })),
        ...channelsData.map(c => ({
            title: c.name,
            desc: c.desc,
            url: c.url,
            category: 'Channels',
            image: 'assets/images/me.jpg'
        }))
    ];
    const fileContent = `export const searchIndex = ${JSON.stringify(searchItems, null, 2)};`;
    fs.writeFileSync(searchPath, fileContent);
};

// --- Execution ---
updateAboutPageDetails();
updateChannelsPage();

// Update base static files
HTML_FILES.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = updateGlobalElements(content, file);
        fs.writeFileSync(filePath, content);
    }
});

updateListingPages();
generateIndividualArticles();
updateSearchData();
generateRSS(); // New: Generate RSS Feed
generateSitemap(); // Run last

console.log('Build Complete. Domain updated to: ' + BASE_URL);
