import re

file_path = "/app/kinantouch_repo/scripts/core/global.js"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("canonicalUrl = `${BASE_URL}/${fileName}`;", "canonicalUrl = `${BASE_URL}/${fileName.replace('.html', '')}`;")

with open(file_path, "w") as f:
    f.write(content)
