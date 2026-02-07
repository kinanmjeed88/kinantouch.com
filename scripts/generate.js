import path from 'path';
import { ROOT_DIR } from './utils/paths.js';
import { safeWrite } from './utils/fs.js';
import { cleanPath } from './utils/helpers.js';
import { loadSiteData } from './core/loader.js';
import { generateCategoryPages } from './pages/categories.js';
import { generateIndividualArticles } from './pages/articles.js';
import { updateToolsPage } from './pages/tools.js';
import { updateChannelsPage } from './pages/channels.js';
import { updateAboutPageDetails } from './pages/about.js';
import { generateSitemap } from './seo/sitemap.js';
import { generateRSS } from './seo/rss.js';

async function updateSearchData(allPosts, channelsData) {
    const searchPath = path.join(ROOT_DIR, 'assets/js/search-data.js');
    const searchItems = [ 
        ...allPosts.map(p => ({ title: p.title, desc: p.description, url: `article-${p.slug}.html`, category: p.category.charAt(0).toUpperCase() + p.category.slice(1), image: cleanPath(p.image) })), 
        ...channelsData.map(c => ({ title: c.name, desc: c.desc, url: c.url, category: 'Channels', image: 'assets/images/me.jpg' })) 
    ];
    safeWrite(searchPath, `export const searchIndex = ${JSON.stringify(searchItems, null, 2)};`);
}

(async function main() {
    try {
        console.log('🚀 Starting Modular Build Process...');
        
        const { aboutData, channelsData, posts } = await loadSiteData();
        
        // Group posts for category pages
        const postsByCategory = posts.reduce((acc, post) => {
            const cat = post.category || 'general';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(post);
            return acc;
        }, {});

        // Run Page Generators
        updateAboutPageDetails(aboutData);
        updateChannelsPage(channelsData, aboutData);
        updateToolsPage(aboutData);
        await generateCategoryPages({ postsByCategory, aboutData, channelsData });
        await generateIndividualArticles({ allPosts: posts, aboutData });
        
        // Update Utilities
        await updateSearchData(posts, channelsData);
        
        // SEO
        generateRSS(posts, aboutData);
        generateSitemap(posts, aboutData);
        
        console.log('✅ Build Complete. Multi-Page Architecture Hardened.');
    } catch (err) {
        console.error('❌ Build error:', err);
        process.exit(1);
    }
})();
