import re

with open("scripts/core/global.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the block where og:image is modified to only apply if it doesn't exist, or just leave it.
# Actually, global.js modifies $('meta[property="og:image"]'), which overwrites the one we just added in articles.js if it exists.
# We should only update it if it's the index page, or if it doesn't already have one, or just add a check.
# Wait, let's look at global.js. updateGlobalElements receives (html, activePage, pageTitleOverride, aboutData).
# For articles, we already injected og:image.
# In global.js: `$('meta[property="og:image"]').attr('content', toAbsoluteUrl(profileImgSrc));`
# It overwrites all `og:image`. We should change it.

search = """    $('meta[property="og:image"]').attr('content', toAbsoluteUrl(profileImgSrc));"""

replace = """    // Only set global og:image if not already set (e.g., by articles.js)
    if ($('meta[property="og:image"]').length === 0 || activePage === 'index.html' || activePage === 'index') {
        $('meta[property="og:image"]').attr('content', toAbsoluteUrl(profileImgSrc));
    } else if ($('meta[property="og:image"]').attr('content') === '') {
        $('meta[property="og:image"]').attr('content', toAbsoluteUrl(profileImgSrc));
    }
    // Alternatively, a simpler fix is: if it's the article page, articles.js will inject its own tag and we don't want global.js to overwrite it if it's already there.
    // Wait, global.js is called by updateGlobalElements on the HTML output from cheerio.
    // Let's modify it safely.
    if ($('meta[property="og:image"]').length === 0 || $('meta[property="og:image"]').attr('content') === toAbsoluteUrl(profileImgSrc)) {
         $('meta[property="og:image"]').attr('content', toAbsoluteUrl(profileImgSrc));
    } else {
         // If it's already set to something else (like article image), don't overwrite
    }"""

# simpler approach
replace2 = """    // Only update og:image if it's not an article page or if it's currently empty
    if (!activePage.startsWith('article-') || $('meta[property="og:image"]').length === 0) {
        $('meta[property="og:image"]').attr('content', toAbsoluteUrl(profileImgSrc));
    }"""

if search in content:
    content = content.replace(search, replace2)
    with open("scripts/core/global.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched global.js successfully.")
else:
    print("Could not find the target string to patch in global.js.")
