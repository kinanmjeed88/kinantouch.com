with open("scripts/core/global.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("!activePageName.startsWith('article-')", "!isArticle")

with open("scripts/core/global.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed variable name in global.js to isArticle.")
