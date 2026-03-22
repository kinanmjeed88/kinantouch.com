with open("admin/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# I see in the previous step I used id="view-categories" but in switchTab it uses sec-tabName, so id="sec-categories".
search = """id="view-categories\""""
replace = """id="sec-categories" class="hidden-section\""""
content = content.replace(search, replace)

with open("admin/index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed ID in index.html")
