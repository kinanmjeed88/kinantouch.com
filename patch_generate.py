import re

with open("scripts/generate.js", "r", encoding="utf-8") as f:
    content = f.read()

search_load = """    const { allPosts, postsByCategory, aboutData, channelsData, postsBySlug } = loadSiteData();"""
replace_load = """    const { allPosts, postsByCategory, aboutData, channelsData, postsBySlug, categoriesData } = loadSiteData();"""
content = content.replace(search_load, replace_load)

search_gen1 = """        await generateCategoryPages({ postsByCategory, aboutData, channelsData });"""
replace_gen1 = """        await generateCategoryPages({ postsByCategory, aboutData, channelsData, categoriesData });"""
content = content.replace(search_gen1, replace_gen1)

search_gen2 = """        await generateIndividualArticles({ allPosts, postsByCategory, aboutData, channelsData });"""
replace_gen2 = """        await generateIndividualArticles({ allPosts, postsByCategory, aboutData, channelsData, categoriesData });"""
content = content.replace(search_gen2, replace_gen2)

with open("scripts/generate.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated scripts/generate.js")
