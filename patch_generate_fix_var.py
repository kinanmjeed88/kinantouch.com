with open("scripts/generate.js", "r", encoding="utf-8") as f:
    content = f.read()

search = """        // Group posts for category pages
        const postsByCategory = posts.reduce((acc, post) => {
            const cat = post.category || 'general';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(post);
            return acc;
        }, {});"""
replace = """        // Grouping is handled by loader.js"""
content = content.replace(search, replace)

with open("scripts/generate.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed duplicate postsByCategory declaration")
