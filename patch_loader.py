with open("scripts/core/loader.js", "r", encoding="utf-8") as f:
    content = f.read()

# Add categories to loadSiteData
search = """    let channelsData = readJsonSafe(path.join(DATA_DIR, 'channels.json'), []);"""
replace = """    let channelsData = readJsonSafe(path.join(DATA_DIR, 'channels.json'), []);
    let categoriesData = readJsonSafe(path.join(DATA_DIR, 'categories.json'), [
        { "id": "articles", "name": "اخبار" },
        { "id": "apps", "name": "تطبيقات" },
        { "id": "games", "name": "ألعاب" },
        { "id": "sports", "name": "رياضة" }
    ]);"""
content = content.replace(search, replace)

search_return = """    return { allPosts, postsByCategory, aboutData, channelsData, postsBySlug };"""
replace_return = """    return { allPosts, postsByCategory, aboutData, channelsData, postsBySlug, categoriesData };"""
content = content.replace(search_return, replace_return)

with open("scripts/core/loader.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated scripts/core/loader.js")
