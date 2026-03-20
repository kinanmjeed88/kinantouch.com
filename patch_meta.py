import re

with open("scripts/pages/articles.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the block where og:tags are appended to add og:image and twitter:tags
search = """        $('head').append(`<meta property="og:title" content="${escapeXml(cleanTitle)}">`);
        $('head').append(`<meta property="og:description" content="${escapeXml(cleanDesc)}">`);
        $('head').append(`<meta property="og:url" content="${canonicalUrl}">`);"""

replace = """        $('head').append(`<meta property="og:title" content="${escapeXml(cleanTitle)}">`);
        $('head').append(`<meta property="og:description" content="${escapeXml(cleanDesc)}">`);
        $('head').append(`<meta property="og:url" content="${canonicalUrl}">`);
        $('head').append(`<meta property="og:image" content="${fullImageUrl}">`);
        $('head').append(`<meta name="twitter:card" content="summary_large_image">`);
        $('head').append(`<meta name="twitter:image" content="${fullImageUrl}">`);"""

if search in content:
    content = content.replace(search, replace)
    with open("scripts/pages/articles.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched successfully.")
else:
    print("Could not find the target string to patch.")
