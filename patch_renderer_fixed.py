with open("scripts/core/renderer.js", "r", encoding="utf-8") as f:
    content = f.read()

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
