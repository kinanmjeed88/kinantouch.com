import fs from 'fs';
import path from 'path';
import { DATA_DIR, POSTS_DIR } from '../utils/paths.js';
import { readJsonSafe } from '../utils/fs.js';
import { combineDateTime } from '../utils/helpers.js';
import { parseMarkdown } from './markdown.js';

export async function loadSiteData() {
    // 1. Load Configuration
    let aboutData = readJsonSafe(path.join(DATA_DIR, 'about.json'), { 
        profileName: "TechTouch", 
        bio: "", 
        profileImage: "assets/images/me.jpg", 
        siteName: "TechTouch",
        logoType: "text",
        logoUrl: "",
        categories: { labels: { articles: "اخبار", apps: "تطبيقات", games: "ألعاب", sports: "رياضة" } },
        globalFonts: { nav: 12, content: 13, titles: 14, mainTitles: 15 },
        social: {},
        socialIcons: {},
        ticker: { enabled: true, text: "Welcome", label: "New", url: "#" },
        adBanner: { enabled: false, type: "text", text: "أعلن هنا", url: "#", textColor: "#2563eb", bgColor: "rgba(37, 99, 235, 0.1)" }
    });

    let channelsData = readJsonSafe(path.join(DATA_DIR, 'channels.json'), []);

    // 2. Load Posts
    const rawPosts = [];
    const titleRegistry = new Set(); 

    if (fs.existsSync(POSTS_DIR)) {
        fs.readdirSync(POSTS_DIR).forEach(file => {
            if (path.extname(file) === '.json') {
                try {
                    const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
                    if (!post.slug) post.slug = file.replace('.json', '');
                    
                    // SEO Safe Normalization
                    post.slug = post.slug.trim().toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-\u0600-\u06FF]/g, '')
                        .replace(/\-\-+/g, '-')
                        .replace(/^-+|-+$/g, '')
                        .substring(0, 80);

                    if (post.title) {
                        const normalizedTitle = post.title.trim().toLowerCase();
                        if (titleRegistry.has(normalizedTitle)) {
                            if (process.env.NODE_ENV !== 'production') {
                                console.warn(`⚠ Duplicate title detected in "${file}": "${post.title}"`);
                            }
                        } else {
                            titleRegistry.add(normalizedTitle);
                        }
                    }

                    post.publishTime = post.time || "00:00";
                    if (!post.date) post.date = new Date().toISOString().split('T')[0];
                    if (!post.updated) post.updated = post.date;

                    post.publishedAt = combineDateTime(post.date, post.publishTime);
                    post.updatedAt = combineDateTime(post.updated, post.publishTime); 
                    post.effectiveDate = post.publishedAt; 

                    // --- PASS RENDER MODE ---
                    // Default to 'markdown' if not specified
                    const renderMode = post.renderMode || 'markdown';
                    post.content = parseMarkdown(post.content, renderMode);
                    
                    post._originalFile = file;
                    rawPosts.push(post);
                } catch (e) { console.error(`Error reading post ${file}:`, e); }
            }
        });
    }

    // Sort by Date Descending
    rawPosts.sort((a, b) => b.effectiveDate - a.effectiveDate);

    return { aboutData, channelsData, posts: rawPosts };
}