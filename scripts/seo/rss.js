import path from 'path';
import { ROOT_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { toAbsoluteUrl, escapeXml } from '../utils/helpers.js';
import { BASE_URL } from '../config/constants.js';

export function generateRSS(allPosts, aboutData) {
    const feedPath = path.join(ROOT_DIR, 'feed.xml');
    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    xml += `<channel>\n`;
    xml += `    <title>${escapeXml(aboutData.siteName || "TechTouch")}</title>\n`;
    xml += `    <link>${BASE_URL}</link>\n`;
    xml += `    <description>المصدر العربي الأول للمقالات التقنية، مراجعات الهواتف، والتطبيقات.</description>\n`;
    xml += `    <language>ar</language>\n`;
    xml += `    <lastBuildDate>${now}</lastBuildDate>\n`;
    xml += `    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n`;

    // =============================
    // Latest 20 Posts (Clean URL)
    // =============================
    allPosts.slice(0, 20).forEach(post => {
        const cleanUrl = `${BASE_URL}/article-${post.slug}`;
        const fullImg = toAbsoluteUrl(post.image);

        xml += `
    <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${cleanUrl}</link>
        <guid isPermaLink="true">${cleanUrl}</guid>
        <pubDate>${post.effectiveDate.toUTCString()}</pubDate>
        <description><![CDATA[${post.description}]]></description>
        <enclosure url="${escapeXml(fullImg)}" type="image/jpeg" />
    </item>`;
    });

    xml += `\n</channel>\n</rss>`;

    safeWrite(feedPath, xml);

    console.log('✅ RSS feed regenerated with clean URLs.');
}
