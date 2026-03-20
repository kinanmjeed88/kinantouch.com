import re

with open("scripts/core/renderer.js", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the main post card generation to strip HTML from title and enforce style
search = """<h3 class="font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors break-words whitespace-normal w-full line-clamp-2 custom-title-size" title="${escapeHtml(post.title)}">${post.title}</h3>"""
replace = """<h3 class="font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors break-words whitespace-normal w-full" title="${escapeHtml(stripHtml(post.title))}" style="font-size: 14px; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${stripHtml(post.title)}</h3>"""

if search in content:
    content = content.replace(search, replace)
    print("Patched renderer.js successfully.")
else:
    print("Could not find search string in renderer.js.")

with open("scripts/core/renderer.js", "w", encoding="utf-8") as f:
    f.write(content)

