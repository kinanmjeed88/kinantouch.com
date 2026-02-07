import path from 'path';
import { ROOT_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { toAbsoluteUrl, escapeXml } from '../utils/helpers.js';
import { BASE_URL } from '../config/constants.js';

export function generateRSS(allPosts, aboutData) {
    const feedPath = path.join(ROOT_DIR, 'feed.xml');
    const now = new Date().toUTCString();
    let xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(aboutData.siteName || "TechTouch")}</title><link>${BASE_URL}</link><description>المصدر العربي الأول للمقالات التقنية، مراجعات الهواتف، والتطبيقات.</description><language>ar</language><lastBuildDate>${now}</lastBuildDate><atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />`;
    allPosts.slice(0, 20).forEach(post => {
        const fullUrl = `${BASE_URL}/article-${post.slug}.html`;
        const fullImg = toAbsoluteUrl(post.image);
        xml += `<item><title><![CDATA[${post.title}]]></title><link>${fullUrl}</link><guid>${fullUrl}</guid><pubDate>${post.effectiveDate.toUTCString()}</pubDate><description><![CDATA[${post.description}]]></description><enclosure url="${fullImg}" type="image/jpeg" /></item>`;
    });
    xml += `</channel></rss>`;
    safeWrite(feedPath, xml);
}
