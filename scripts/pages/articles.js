import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { ROOT_DIR, TEMPLATES_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { updateGlobalElements } from '../core/global.js';
import { cleanPath, escapeHtml, escapeXml, toAbsoluteUrl } from '../utils/helpers.js';
import { parseMarkdown } from '../core/markdown.js';
import { getCatLabel, generateAdBannerHTML } from '../core/renderer.js';
import { BASE_URL } from '../config/constants.js';

export async function generateIndividualArticles({ allPosts, aboutData }) {
    let templatePath = path.join(TEMPLATES_DIR, 'article-asus-gx10.html');
    if (!fs.existsSync(templatePath)) templatePath = path.join(ROOT_DIR, 'article-asus-gx10.html');

    if (!fs.existsSync(templatePath)) {
        console.error("Article template missing. Skipping article generation.");
        return;
    }
    let template = fs.readFileSync(templatePath, 'utf8');

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

        // --- AI SUMMARY BUTTON ---
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

        const tags = [getCatLabel(post.category, aboutData)];
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
                <a href="#" class="share-btn whatsapp w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 shadow-sm transition-transform hover:scale-110" aria-label="Share on WhatsApp">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                </a>
                <a href="#" class="share-btn telegram w-9 h-9 flex items-center justify-center rounded-full bg-[#229ED9] text-white hover:opacity-90 shadow-sm transition-transform hover:scale-110" aria-label="Share on Telegram">
                    <i data-lucide="send" class="w-4 h-4 ml-0.5"></i>
                </a>
                <a href="#" class="share-btn facebook w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 shadow-sm transition-transform hover:scale-110" aria-label="Share on Facebook">
                    <i data-lucide="facebook" class="w-4 h-4"></i>
                </a>
                <a href="#" class="share-btn instagram w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-90 shadow-sm transition-transform hover:scale-110" aria-label="Share on Instagram">
                    <i data-lucide="instagram" class="w-4 h-4"></i>
                </a>
            </div>
        </div>
        `;
        $('article').append(shareSectionHTML);
        
        // --- STRICT RELATED POSTS LOGIC ---
        const otherPosts = allPosts.filter(p => p.slug !== post.slug);
        
        let sameCatPosts = otherPosts.filter(p => p.category === post.category)
            .sort((a,b) => b.effectiveDate - a.effectiveDate);
        
        let diffCatPosts = otherPosts.filter(p => p.category !== post.category)
            .sort((a,b) => b.effectiveDate - a.effectiveDate);
        
        let relatedPosts = sameCatPosts.concat(diffCatPosts);
        relatedPosts = relatedPosts.slice(0, 12);

        if (relatedPosts.length > 0) {
            const gridPosts = relatedPosts.slice(0, 6);
            const listPosts = relatedPosts.slice(6, 12);

            let relatedHTML = `
            <section class="related-posts mt-12 border-t border-gray-100 dark:border-gray-700 pt-8">
                <h3 class="text-lg font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2"><i data-lucide="layers" class="w-5 h-5 text-blue-600"></i> قد يعجبك أيضاً</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">`;
            
            gridPosts.forEach(r => {
                const rDate = r.effectiveDate.toISOString().split('T')[0];
                relatedHTML += `
                <a href="article-${r.slug}.html" class="flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group h-full">
                    <div class="h-28 overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                        <img src="${cleanPath(r.image)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onerror="this.onerror=null;this.src='assets/images/me.jpg';" />
                    </div>
                    <div class="p-2 flex-1 flex flex-col">
                        <h4 class="text-xs font-bold text-gray-900 dark:text-white leading-relaxed group-hover:text-blue-600 transition-colors mb-2">${r.title}</h4>
                        <div class="mt-auto pt-2 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-[10px] text-gray-400">
                             <span class="truncate text-blue-500/80">${getCatLabel(r.category, aboutData)}</span>
                             <span dir="ltr" class="font-mono">${rDate}</span>
                        </div>
                    </div>
                </a>`;
            });
            relatedHTML += `</div>`;

            // Inject Ad Banner between Grid & List
            const adHTML = generateAdBannerHTML(aboutData);
            if (adHTML) {
                relatedHTML += adHTML;
            }

            if (listPosts.length > 0) {
                relatedHTML += `<div class="flex flex-col gap-2">`;
                listPosts.forEach(r => {
                    const rDate = r.effectiveDate.toISOString().split('T')[0];
                    relatedHTML += `
                    <a href="article-${r.slug}.html" class="flex items-start gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                        <img src="${cleanPath(r.image)}" class="w-16 h-12 object-cover rounded-lg shrink-0 bg-gray-200 dark:bg-gray-700" loading="lazy" onerror="this.onerror=null;this.src='assets/images/me.jpg';" />
                        <div class="flex-1 min-w-0 self-center">
                            <h4 class="text-xs font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors">${r.title}</h4>
                            <div class="flex gap-2 mt-1">
                                <span class="text-[10px] text-gray-400 font-mono" dir="ltr">${rDate}</span>
                            </div>
                        </div>
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
        
        safeWrite(path.join(ROOT_DIR, pageSlug), updateGlobalElements($.html(), pageSlug, '', aboutData));
    });
}