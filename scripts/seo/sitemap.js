import path from 'path';
import { ROOT_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { toAbsoluteUrl, escapeXml } from '../utils/helpers.js';
import { BASE_URL } from '../config/constants.js';

export function generateSitemap(allPosts, aboutData) {
    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    const today = new Date().toISOString().split('T')[0];

    // ✅ Clean URLs بدون .html
    const staticPages = [
        { url: '/', priority: '1.0' },
        { url: '/apps', priority: '0.9' },
        { url: '/games', priority: '0.9' },
        { url: '/sports', priority: '0.9' },
        { url: '/tools', priority: '0.9' },
        { url: '/about', priority: '0.7' },
        { url: '/tools-sites', priority: '0.8' },
        { url: '/tools-phones', priority: '0.8' },
        { url: '/tools-compare', priority: '0.7' },
        { url: '/tool-analysis', priority: '0.7' },
        { url: '/privacy', priority: '0.3' },
        { url: '/site-map', priority: '0.5' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // =============================
    // Static Pages
    // =============================
    staticPages.forEach(page => {
        const loc =
            page.url === '/'
                ? BASE_URL
                : `${BASE_URL}${page.url}`;

        xml += `
    <url>
        <loc>${loc}</loc>
        <lastmod>${today}</lastmod>
        <priority>${page.priority}</priority>
    </url>`;
    });

    // =============================
    // Articles (Clean URL)
    // =============================
    allPosts.forEach(post => {
        const fullImg = toAbsoluteUrl(post.image);
        const pageUrl = `${BASE_URL}/article-${post.slug}`;

        xml += `
    <url>
        <loc>${pageUrl}</loc>
        <lastmod>${post.effectiveDate.toISOString()}</lastmod>
        <priority>0.8</priority>
        <image:image>
            <image:loc>${escapeXml(fullImg)}</image:loc>
            <image:title>${escapeXml(post.title)}</image:title>
        </image:image>
    </url>`;
    });

    xml += `\n</urlset>`;

    safeWrite(sitemapPath, xml);

    console.log('✅ sitemap.xml regenerated with clean URLs.');
}
