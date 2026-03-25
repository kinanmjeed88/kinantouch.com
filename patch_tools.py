import re

def patch_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Remove the import line
    import_line = 'import { phonesDatabase } from "./assets/js/phones-data.js";'
    content = content.replace(import_line, "let phonesDatabase = [];\n        // Fetch dynamic JSON instead of static import")
    
    # Wrap the initialization logic in a fetch block
    # In both files, the logic is at the top level of the <script type="module">
    # We will replace the script tag opening to include top-level await fetch
    
    script_open = '<script type="module">\n        let phonesDatabase = [];\n        // Fetch dynamic JSON instead of static import'
    script_fetch = """<script type="module">
        let phonesDatabase = [];
        try {
            const res = await fetch('content/data/phones.json');
            phonesDatabase = await res.json();
        } catch(e) {
            console.error('Failed to load phones database:', e);
        }
"""
    
    content = content.replace(script_open, script_fetch)
    
    # Since tools-compare might have a different setup, let's try a regex for the import
    import_re = re.compile(r'import \{ phonesDatabase \} from ["\']./assets/js/phones-data.js["\'];')
    if import_re.search(content):
        content = import_re.sub(
            "let phonesDatabase = [];\n"
            "try { const res = await fetch('content/data/phones.json'); phonesDatabase = await res.json(); } catch(e) { console.error('Failed to load phones DB'); }",
            content
        )
    
    with open(filepath, "w") as f:
        f.write(content)

patch_file("tools-phones.html")
patch_file("tools-compare.html")
