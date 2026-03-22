with open("scripts/generate.js", "r", encoding="utf-8") as f:
    content = f.read()

search = """        const { aboutData, channelsData, posts } = await loadSiteData();"""
replace = """        const { aboutData, channelsData, allPosts: posts, postsByCategory, categoriesData } = await loadSiteData();"""
content = content.replace(search, replace)

search_call = """        await generateIndividualArticles({ allPosts: posts, aboutData });"""
replace_call = """        await generateIndividualArticles({ allPosts: posts, postsByCategory, aboutData, channelsData, categoriesData });"""
content = content.replace(search_call, replace_call)

with open("scripts/generate.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated scripts/generate.js")
