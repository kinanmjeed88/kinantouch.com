with open("admin/admin.js", "r") as f:
    content = f.read()

# Fix switchTab to include phones
old_sections = "const sections = ['posts', 'channels', 'categories', 'settings', 'stats'];"
new_sections = "const sections = ['posts', 'channels', 'categories', 'settings', 'stats', 'phones'];"
content = content.replace(old_sections, new_sections)

old_loads = "    if (tabName === 'stats') loadStats();"
new_loads = "    if (tabName === 'stats') loadStats();\n    if (tabName === 'phones') loadPhones();"
content = content.replace(old_loads, new_loads)

with open("admin/admin.js", "w") as f:
    f.write(content)
