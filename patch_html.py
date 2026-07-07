import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Remove FOUC workaround
    content = re.sub(r'<style>\s*body\s*\{\s*visibility:\s*hidden;\s*opacity:\s*0;\s*transition:\s*opacity\s*0\.2s\s*ease-in-out;\s*\}\s*</style>', '', content)
    content = re.sub(r'<script>\s*window\.addEventListener\("load",\s*function\(\)\{\s*document\.body\.style\.visibility\s*=\s*\'visible\';\s*document\.body\.style\.opacity\s*=\s*\'1\';\s*\}\);\s*</script>', '', content)

    # 2. Add hydration script
    hydration_script = "<script>if(localStorage.theme==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');</script>\n</head>"
    if "classList.add('dark')" not in content:
        content = content.replace("</head>", hydration_script)

    # 3. Add defer to lucide
    content = re.sub(r'<script\s+src="https://unpkg\.com/lucide@latest"\s*></script>', r'<script src="https://unpkg.com/lucide@latest" defer></script>', content)

    # 4. Add defer to app.js
    content = re.sub(r'<script\s+src="assets/js/app\.js"\s*></script>', r'<script src="assets/js/app.js" defer></script>', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

# Update all html files in repo root and templates folder
html_files = glob.glob('*.html') + glob.glob('templates/*.html')
for file in html_files:
    process_file(file)

print("Done.")