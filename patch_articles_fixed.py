with open("scripts/pages/articles.js", "r", encoding="utf-8") as f:
    content = f.read()

search_func = """export async function generateIndividualArticles({ allPosts, aboutData }) {"""
replace_func = """export async function generateIndividualArticles({ allPosts, postsByCategory, aboutData, channelsData, categoriesData }) {"""
content = content.replace(search_func, replace_func)

with open("scripts/pages/articles.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed articles.js signature")
