import path from 'path';
import { ROOT_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { toAbsoluteUrl, escapeXml } from '../utils/helpers.js';
import { BASE_URL } from '../config/constants.js';

export function generateSitemap(allPosts, aboutData) {
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
}
