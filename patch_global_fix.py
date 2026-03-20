import re

with open("scripts/core/global.js", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the ReferenceError: activePage is not defined
# The function signature is: export function updateGlobalElements(html, activePageName = '', pageTitleOverride = '', aboutData) {
# So the variable name is activePageName, not activePage

content = content.replace("!activePage.startsWith('article-')", "!activePageName.startsWith('article-')")

with open("scripts/core/global.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed variable name in global.js.")
