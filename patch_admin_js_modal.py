with open("admin/admin.js", "r", encoding="utf-8") as f:
    content = f.read()

search_open = """window.openCategoryEditor = () => {"""
replace_open = """// Define globally explicitly to be sure
window.openCategoryEditor = () => {"""

if "window.openCategoryEditor" in content:
    content = content.replace(search_open, replace_open)
    print("Found openCategoryEditor in admin.js")
else:
    print("Could not find openCategoryEditor in admin.js")

# Let's also check for typos in the injected HTML in admin/index.html
