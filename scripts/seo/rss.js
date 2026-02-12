import path from 'path';
import { ROOT_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { toAbsoluteUrl, escapeXml } from '../utils/helpers.js';
import { BASE_URL } from '../config/constants.js';

function stripHtml(input = '') {
    return input.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

function sanitizeContent(html = '') {
    return html
        .replace(/\sclass="[^"]*"/g, '')
        .replace(/\sstyle="[^"]*"/g, '')
        .replace(/\sdata-[^=]+="[^"]*"/g, '');
}

function getMimeType(url = '') {
    if (url.endsWith('.png')) return 'image/png';
    if (url.endsWith('.webp')) return 'image/webp';
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
    return 'image/jpeg';
}

export function generateRSS(allPosts, aboutData) {
    const feedPath = path.join(ROOT_DIR, 'feed.xml');
    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0"
        xmlns:atom="http://www.w3.org/2005/Atom"
        xmlns:content="http://purl.org/rss/1.0/modules/content/"
        xmlns:media="http://search.yahoo.com/mrss/"
        xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;

    xml += `<channel>\n`;
    xml += `  <title>${escapeXml(aboutData.siteName || "TechTouch")}</title>\n`;
    xml += `  <link>${BASE_URL}</link>\n`;
    xml += `  <description>المصدر العربي الأول للمقالات التقنية، مراجعات الهواتف، والتطبيقات.</description>\n`;
    xml += `  <language>ar</language>\n`;
    xml += `  <lastBuildDate>${now}</lastBuildDate>\n`;
    xml += `  <ttl>60</ttl>\n`;
    xml += `  <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n`;

    allPosts.slice(0, 20).forEach(post => {
        const cleanUrl = `${BASE_URL}/article-${post.slug}`;
        const fullImg = toAbsoluteUrl(post.image);
        const mimeType = getMimeType(fullImg);

        const cleanTitle = stripHtml(post.title);
        const cleanDescription = stripHtml(post.description);
        const cleanContent = sanitizeContent(post.content || '');

        xml += `
  <item>
    <title><![CDATA[${cleanTitle}]]></title>
    <link>${cleanUrl}</link>
    <guid isPermaLink="true">${cleanUrl}</guid>
    <pubDate>${post.effectiveDate.toUTCString()}</pubDate>
    <dc:creator><![CDATA[${aboutData.profileName || "TechTouch"}]]></dc:creator>
    <category>${escapeXml(post.category || 'tech')}</category>
    <description><![CDATA[${cleanDescription}]]></description>
    <content:encoded><![CDATA[${cleanContent}]]></content:encoded>
    <media:content url="${escapeXml(fullImg)}" type="${mimeType}" medium="image" />
    <enclosure url="${escapeXml(fullImg)}" type="${mimeType}" />
  </item>`;
    });

    xml += `\n</channel>\n</rss>`;

    safeWrite(feedPath, xml);

    console.log('✅ Professional RSS (SEO + Media + Clean HTML) generated successfully.');
}
