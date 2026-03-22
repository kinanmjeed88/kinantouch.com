with open("admin/admin.js", "r") as f:
    js_content = f.read()

print(f"Has loadCategories: {'loadCategories' in js_content}")
