import re

with open("scripts/pages/categories.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace CATEGORY_NAV_TEMPLATE with generateCategoryNavHTML
search_import = """import { CATEGORY_NAV_TEMPLATE, createCardHTML } from '../core/renderer.js';"""
replace_import = """import { generateCategoryNavHTML, createCardHTML } from '../core/renderer.js';"""
content = content.replace(search_import, replace_import)

search_func = """export async function generateCategoryPages({ postsByCategory, aboutData, channelsData }) {"""
replace_func = """export async function generateCategoryPages({ postsByCategory, aboutData, channelsData, categoriesData }) {"""
content = content.replace(search_func, replace_func)

search_pages = """    const labels = aboutData.categories?.labels || {};

    const pages = [
        { file: 'index.html', cat: 'articles', title: labels.articles || 'الأخبار', desc: 'آخر الأخبار التقنية والمقالات الحصرية من TechTouch.' },
        { file: 'apps.html', cat: 'apps', title: labels.apps || 'تطبيقات', desc: 'أفضل تطبيقات أندرويد وآيفون المعدلة والمفيدة.' },
        { file: 'games.html', cat: 'games', title: labels.games || 'ألعاب', desc: 'أحدث الألعاب ومراجعاتها.' },
        { file: 'sports.html', cat: 'sports', title: labels.sports || 'رياضة', desc: 'تغطية الأحداث الرياضية والتقنيات المتعلقة بها.' }
    ];"""
replace_pages = """    const pages = categoriesData.map((cat, index) => {
        return {
            file: index === 0 ? 'index.html' : `${cat.id}.html`,
            cat: cat.id,
            title: cat.name,
            desc: `قسم ${cat.name} في موقع ${aboutData.siteName || "TechTouch"}`
        };
    });"""
content = content.replace(search_pages, replace_pages)

search_nav_inj = """            const oldTabContainer = $('.w-full.py-2');
            if (oldTabContainer.length) {
                let navHtml = CATEGORY_NAV_TEMPLATE
                    .replace('__LABEL_ARTICLES__', labels.articles || 'اخبار')
                    .replace('__LABEL_APPS__', labels.apps || 'تطبيقات')
                    .replace('__LABEL_GAMES__', labels.games || 'ألعاب')
                    .replace('__LABEL_SPORTS__', labels.sports || 'رياضة');
                oldTabContainer.replaceWith(navHtml);
            }"""
replace_nav_inj = """            const oldTabContainer = $('.w-full.py-2');
            if (oldTabContainer.length) {
                let navHtml = generateCategoryNavHTML(categoriesData);
                oldTabContainer.replaceWith(navHtml);
            }"""
content = content.replace(search_nav_inj, replace_nav_inj)

search_card = """                    grid.append(createCardHTML(post, aboutData, isFirst));"""
replace_card = """                    grid.append(createCardHTML(post, aboutData, categoriesData, isFirst));"""
content = content.replace(search_card, replace_card)


with open("scripts/pages/categories.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated scripts/pages/categories.js")
