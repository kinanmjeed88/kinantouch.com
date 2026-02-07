import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { ROOT_DIR, TEMPLATES_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { updateGlobalElements } from '../core/global.js';
import { CATEGORY_NAV_TEMPLATE, createCardHTML } from '../core/renderer.js';
import { BASE_URL } from '../config/constants.js';

export async function generateCategoryPages({ postsByCategory, aboutData, channelsData }) {
    // Read template from templates dir, fallback to root
    let templatePath = path.join(TEMPLATES_DIR, 'articles.html');
    if (!fs.existsSync(templatePath)) templatePath = path.join(ROOT_DIR, 'articles.html');
    
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
        const shouldPaginate = posts.length > 60;
        const totalPages = shouldPaginate ? Math.ceil(posts.length / ITEMS_PER_PAGE) : 1;

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
                currentPosts.forEach(post => grid.append(createCardHTML(post, aboutData)));
            } else {
                $('head').append('<meta name="robots" content="noindex, follow">');
                grid.html('<div class="col-span-full text-center py-20 text-gray-400 text-sm">لا توجد منشورات في هذا القسم حالياً.</div>');
            }
            main.append(grid);

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
            safeWrite(filePath, updateGlobalElements($.html(), fileName, pageTitle, aboutData));
        }
    });
}
