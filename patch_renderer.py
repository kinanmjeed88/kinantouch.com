with open("scripts/core/renderer.js", "r", encoding="utf-8") as f:
    content = f.read()

# Update getCatLabel to use categoriesData
search_getcat = """export const getCatLabel = (cat, aboutData) => {
    const defaults = { 'articles': 'اخبار', 'apps': 'تطبيقات', 'games': 'ألعاب', 'sports': 'رياضة' };
    const configured = aboutData.categories?.labels || {};
    return configured[cat] || defaults[cat] || 'عام';
};"""
replace_getcat = """export const getCatLabel = (cat, categoriesData = []) => {
    const found = categoriesData.find(c => c.id === cat);
    return found ? found.name : 'عام';
};"""
content = content.replace(search_getcat, replace_getcat)

# We need to make sure createCardHTML uses the new getCatLabel correctly by passing categoriesData
# But wait, createCardHTML signature is (post, aboutData, isFirst = false). 
# We should change it to (post, aboutData, categoriesData, isFirst = false) or just pass categoriesData where it is used.
search_createcard = """export const createCardHTML = (post, aboutData, isFirst = false) => {"""
replace_createcard = """export const createCardHTML = (post, aboutData, categoriesData = [], isFirst = false) => {"""
content = content.replace(search_createcard, replace_createcard)

search_cardcat = """<span>${getCatLabel(post.category, aboutData)}</span>"""
replace_cardcat = """<span>${getCatLabel(post.category, categoriesData)}</span>"""
content = content.replace(search_cardcat, replace_cardcat)

# Fix badge colors dynamically (using a list of colors)
search_badge = """    let badgeColor = 'bg-blue-600';
    let icon = 'file-text';
    if(post.category === 'apps') { badgeColor = 'bg-green-600'; icon = 'smartphone'; }
    if(post.category === 'games') { badgeColor = 'bg-purple-600'; icon = 'gamepad-2'; }
    if(post.category === 'sports') { badgeColor = 'bg-orange-600'; icon = 'trophy'; }"""
replace_badge = """    // Dynamic badge colors and icons based on category index or id
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-red-600', 'bg-teal-600', 'bg-indigo-600', 'bg-pink-600'];
    const icons = ['file-text', 'smartphone', 'gamepad-2', 'trophy', 'cpu', 'globe', 'hash', 'star'];
    let badgeColor = 'bg-blue-600';
    let icon = 'file-text';
    
    const catIndex = categoriesData.findIndex(c => c.id === post.category);
    if (catIndex !== -1) {
        badgeColor = colors[catIndex % colors.length];
        icon = icons[catIndex % icons.length];
    }
    """
content = content.replace(search_badge, replace_badge)

# Update CATEGORY_NAV_TEMPLATE to be dynamic
search_catnav = """export const CATEGORY_NAV_TEMPLATE = `
<div class="w-full py-2 bg-gray-950 border-b border-gray-800">
    <div class="w-full px-3 overflow-x-auto no-scrollbar">
      <div class="flex items-center gap-2 min-w-max">
        <a href="index.html" class="cat-tab">
            <span>__LABEL_ARTICLES__</span>
        </a>
        <a href="apps.html" class="cat-tab">
            <span>__LABEL_APPS__</span>
        </a>
        <a href="games.html" class="cat-tab">
            <span>__LABEL_GAMES__</span>
        </a>
        <a href="sports.html" class="cat-tab">
            <span>__LABEL_SPORTS__</span>
        </a>
      </div>
    </div>
</div>
`;"""

# We'll create a function instead of a template string
replace_catnav = """// Function to generate dynamic category nav
export const generateCategoryNavHTML = (categoriesData) => {
    let tabs = '';
    categoriesData.forEach((cat, index) => {
        // First category maps to index.html as homepage
        const url = index === 0 ? 'index.html' : `${cat.id}.html`;
        tabs += `
        <a href="${url}" class="cat-tab">
            <span>${cat.name}</span>
        </a>`;
    });
    
    return `
<div class="w-full py-2 bg-gray-950 border-b border-gray-800">
    <div class="w-full px-3 overflow-x-auto no-scrollbar">
      <div class="flex items-center gap-2 min-w-max">
        ${tabs}
      </div>
    </div>
</div>`;
};
"""
content = content.replace(search_catnav, replace_catnav)

with open("scripts/core/renderer.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated scripts/core/renderer.js")
