import re

with open("scripts/pages/articles.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace tags generation
search = """        const tags = [getCatLabel(post.category, aboutData)];
        if(post.title) {
            const words = post.title.split(' ').filter(w => w.length > 3 && !['كيف', 'ماذا', 'لماذا', 'هذا', 'التي', 'الذي'].includes(w));
            tags.push(...words.slice(0, 4));
        }"""

replace = """        const tags = [getCatLabel(post.category, aboutData)];
        if(cleanTitle) {
            // Use cleanTitle which has HTML stripped, instead of post.title which might contain HTML tags
            const words = cleanTitle.split(' ').filter(w => w.length > 3 && !['كيف', 'ماذا', 'لماذا', 'هذا', 'التي', 'الذي'].includes(w));
            tags.push(...words.slice(0, 4));
        }"""

if search in content:
    content = content.replace(search, replace)
    with open("scripts/pages/articles.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed tags generation.")
else:
    print("Could not find the target string to patch in articles.js.")
