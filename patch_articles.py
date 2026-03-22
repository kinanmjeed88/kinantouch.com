import re

with open("scripts/pages/articles.js", "r", encoding="utf-8") as f:
    content = f.read()

search_func = """export async function generateIndividualArticles({ allPosts, postsByCategory, aboutData, channelsData }) {"""
replace_func = """export async function generateIndividualArticles({ allPosts, postsByCategory, aboutData, channelsData, categoriesData }) {"""
content = content.replace(search_func, replace_func)

search_import = """import { getCatLabel, FIXED_AD_UNIT, generateAdBannerHTML } from '../core/renderer.js';"""
replace_import = """import { generateCategoryNavHTML, getCatLabel, FIXED_AD_UNIT, generateAdBannerHTML, createCardHTML } from '../core/renderer.js';"""
content = content.replace(search_import, replace_import)

search_nav = """        // Inject Dynamic Tabs (Always injected by global.js but let's ensure we have tabs in content if needed)
        // Articles page doesn't need to rebuild category tabs if global handles top nav, 
        // BUT global handles Main Nav. Category Nav is inside body.
        // We will keep category nav static in template, or inject it dynamically here if needed."""
replace_nav = """        // Inject Dynamic Tabs
        const oldTabContainer = $('.w-full.py-2');
        if (oldTabContainer.length) {
            let navHtml = generateCategoryNavHTML(categoriesData);
            oldTabContainer.replaceWith(navHtml);
        }"""
content = content.replace(search_nav, replace_nav)

search_tag = """const tags = [getCatLabel(post.category, aboutData)];"""
replace_tag = """const tags = [getCatLabel(post.category, categoriesData)];"""
content = content.replace(search_tag, replace_tag)

search_span = """                             <span class="truncate text-blue-500/80">${getCatLabel(r.category, aboutData)}</span>"""
replace_span = """                             <span class="truncate text-blue-500/80">${getCatLabel(r.category, categoriesData)}</span>"""
content = content.replace(search_span, replace_span)

with open("scripts/pages/articles.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated scripts/pages/articles.js")
