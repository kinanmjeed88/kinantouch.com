with open("scripts/core/loader.js", "r", encoding="utf-8") as f:
    content = f.read()

search = """    return { aboutData, channelsData, posts: rawPosts };"""
replace = """    
    // Create necessary maps
    const postsByCategory = {};
    const postsBySlug = {};
    rawPosts.forEach(post => {
        if (!postsByCategory[post.category]) {
            postsByCategory[post.category] = [];
        }
        postsByCategory[post.category].push(post);
        postsBySlug[post.slug] = post;
    });

    return { aboutData, channelsData, allPosts: rawPosts, postsByCategory, postsBySlug, categoriesData };"""
content = content.replace(search, replace)

with open("scripts/core/loader.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated scripts/core/loader.js")
