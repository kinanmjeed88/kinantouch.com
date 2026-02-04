const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT_DIR, 'content/posts');
const DATA_DIR = path.join(ROOT_DIR, 'content/data');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'index.html');

// Helper to read JSON
function readJSON(filePath) {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return {};
}

// Load Data
const aboutData = readJSON(path.join(DATA_DIR, 'about.json'));

// Helper: Clean path
const cleanPath = (p) => p ? p.replace(/^(\.\.\/)+/, '') : '';

// Helper: Social Links HTML
function getSocialLinksHTML(social) {
    if (!social) return '';
    const links = [];
    if (social.telegram) links.push(`<a href="${social.telegram}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg hover:scale-110 transition-transform"><i data-lucide="send" class="w-5 h-5 ml-0.5"></i></a>`);
    if (social.youtube) links.push(`<a href="${social.youtube}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF0000] text-white shadow-lg hover:scale-110 transition-transform"><i data-lucide="youtube" class="w-5 h-5"></i></a>`);
    if (social.facebook) links.push(`<a href="${social.facebook}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg hover:scale-110 transition-transform"><i data-lucide="facebook" class="w-5 h-5"></i></a>`);
    if (social.instagram) links.push(`<a href="${social.instagram}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-lg hover:scale-110 transition-transform"><i data-lucide="instagram" class="w-5 h-5"></i></a>`);
    
    return `
    <div class="mt-8 mb-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4 text-sm">تابعنا على منصات التواصل</h3>
        <div class="flex items-center justify-center gap-4 flex-wrap">
            ${links.join('')}
        </div>
    </div>`;
}

function generateSite() {
    console.log('Starting build...');
    
    // Load Posts
    const posts = [];
    if (fs.existsSync(POSTS_DIR)) {
        fs.readdirSync(POSTS_DIR).forEach(file => {
            if (file.endsWith('.json')) {
                const post = readJSON(path.join(POSTS_DIR, file));
                if (!post.slug) post.slug = file.replace('.json', '');
                posts.push(post);
            }
        });
    }
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Process Articles
    const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    posts.forEach(post => {
        const $ = cheerio.load(templateHtml);
        const pageSlug = `article-${post.slug}.html`;
        
        // Meta
        $('title').text(`${post.title} | ${aboutData.siteName}`);
        $('meta[name="description"]').attr('content', post.description);
        $('link[rel="canonical"]').attr('href', `https://kinantouch.com/${pageSlug}`);
        
        // Content
        const contentHtml = `
            <div class="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
                <nav class="flex items-center text-xs text-gray-500 mb-4 w-full overflow-hidden whitespace-nowrap">
                    <a href="index.html" class="hover:text-blue-500 shrink-0">الرئيسية</a><span class="mx-1 shrink-0">/</span>
                    <a href="articles.html" class="hover:text-blue-500 shrink-0">مقالات</a><span class="mx-1 shrink-0">/</span>
                    <span class="text-gray-800 dark:text-gray-300 truncate flex-1 min-w-0 block">${post.title}</span>
                </nav>
                <header class="mb-8">
                    <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 break-words w-full">${post.title}</h1>
                    <div class="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                        <div class="flex items-center gap-1"><i data-lucide="calendar" class="w-4 h-4"></i><time>${post.date}</time></div>
                        <div class="flex items-center gap-1"><i data-lucide="user" class="w-4 h-4"></i><span>${aboutData.profileName}</span></div>
                    </div>
                </header>
                <div class="mb-8 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                    <img src="${cleanPath(post.image)}" alt="${post.title}" class="w-full object-cover max-h-[500px] hover:scale-105 transition-transform duration-700" />
                </div>
                <article class="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
                    ${post.content}
                </article>
            </div>
        `;
        $('main').html(contentHtml);
        $('main').removeClass('max-w-7xl').addClass('max-w-4xl');

        // Clean images
        $('article img').addClass('w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700');

        // Inject Social Links
        $('article').append(getSocialLinksHTML(aboutData.social));
        
        // Related Posts
        const related = posts.filter(p => p.slug !== post.slug).slice(0, 4);
        if (related.length > 0) {
            let relatedHTML = `
            <section class="related-posts mt-10 border-t border-gray-100 dark:border-gray-800 pt-8">
                <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><i data-lucide="layers" class="w-5 h-5 text-blue-600"></i> قد يعجبك أيضاً</h3>
                <div class="grid grid-cols-2 gap-3 related-grid">`;
            related.forEach(r => {
                relatedHTML += `
                <a href="article-${r.slug}.html" class="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                    <img src="${cleanPath(r.image)}" class="w-full h-24 object-cover" loading="lazy" />
                    <div class="p-2"><h4 class="text-xs font-bold line-clamp-2 text-gray-900 dark:text-white leading-snug">${r.title}</h4></div>
                </a>`;
            });
            relatedHTML += `</div></section>`;
            $('article').append(relatedHTML);
        }

        // Add JSON-LD
        const fullUrl = `https://kinantouch.com/${pageSlug}`;
        const fullImageUrl = post.image.startsWith('http') ? post.image : `https://kinantouch.com/${cleanPath(post.image)}`;
        const jsonLd = { 
            "@context": "https://schema.org", 
            "@type": "Article", 
            "headline": post.title, 
            "image": [fullImageUrl], 
            "datePublished": new Date(post.date).toISOString(), 
            "author": { "@type": "Person", "name": aboutData.profileName },
            "description": post.description 
        };
        $('head').append(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);

        fs.writeFileSync(path.join(ROOT_DIR, pageSlug), $.html());
    });

    // Generate Home Index
    const $home = cheerio.load(templateHtml);
    ['articles', 'apps', 'games', 'sports'].forEach(cat => {
        const catPosts = posts.filter(p => p.category === cat || (cat === 'articles' && !p.category));
        const listHTML = catPosts.map(p => `
            <a href="article-${p.slug}.html" class="block group h-full">
                <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all h-full flex flex-col">
                    <div class="h-48 overflow-hidden relative">
                        <img src="${cleanPath(p.image)}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    </div>
                    <div class="p-4 flex-1 flex flex-col">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">${p.title}</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">${p.description}</p>
                    </div>
                </div>
            </a>
        `).join('');
        $home(`#tab-${cat} .grid`).html(listHTML);
    });
    fs.writeFileSync(path.join(ROOT_DIR, 'index.html'), $home.html());

    console.log(`Build completed. Generated ${posts.length} articles.`);
}

generateSite();