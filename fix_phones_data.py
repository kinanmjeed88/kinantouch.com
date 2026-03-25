import re
import json

with open("assets/js/phones-data.js", "r") as f:
    js_content = f.read()

# Extract just the array part
json_str = js_content.replace("export const phonesDatabase =", "").strip()
if json_str.endswith(";"):
    json_str = json_str[:-1]

# It might not be perfect JSON if it has unquoted keys or trailing commas, but let's try
try:
    # Safest way is to evaluate it via node
    with open("temp.js", "w") as temp:
        temp.write("const fs = require('fs');\n" + js_content + "\nfs.writeFileSync('content/data/phones.json', JSON.stringify(phonesDatabase, null, 2));")
except Exception as e:
    print(e)
