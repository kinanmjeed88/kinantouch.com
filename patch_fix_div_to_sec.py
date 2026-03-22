with open("admin/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Change div sec-categories to section sec-categories so querySelectorAll('section') works
search = """<div id="sec-categories" class="hidden-section" class="hidden h-full flex flex-col">"""
replace = """<section id="sec-categories" class="hidden-section space-y-6">"""
if search in content:
    content = content.replace(search, replace)
    content = content.replace("</div>\n\n        <!-- ================= CHANNELS VIEW ================= -->", "</section>\n\n        <!-- ================= CHANNELS VIEW ================= -->")

with open("admin/index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Changed div to section")
