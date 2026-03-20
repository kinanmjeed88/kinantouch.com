import re

with open("scripts/pages/articles.js", "r", encoding="utf-8") as f:
    content = f.read()

# Fix gridPosts section
search1 = """<h4 class="text-xs font-bold text-gray-900 dark:text-white leading-relaxed group-hover:text-blue-600 transition-colors mb-2">${r.title}</h4>"""
replace1 = """<h4 class="font-bold text-gray-900 dark:text-white leading-relaxed group-hover:text-blue-600 transition-colors mb-2" style="font-size: 14px; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${stripHtml(r.title || '')}</h4>"""

# Fix listPosts section
search2 = """<h4 class="text-xs font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors">${r.title}</h4>"""
replace2 = """<h4 class="font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors" style="font-size: 14px; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${stripHtml(r.title || '')}</h4>"""

if search1 in content:
    content = content.replace(search1, replace1)
    print("Patched gridPosts in articles.js")
else:
    print("Could not find search1")

if search2 in content:
    content = content.replace(search2, replace2)
    print("Patched listPosts in articles.js")
else:
    print("Could not find search2")

with open("scripts/pages/articles.js", "w", encoding="utf-8") as f:
    f.write(content)

