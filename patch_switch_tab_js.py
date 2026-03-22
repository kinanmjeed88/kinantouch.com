with open("admin/admin.js", "r", encoding="utf-8") as f:
    content = f.read()

# Fix switchTab logic: I had replaced view-posts with sec-posts earlier but my previous patch was flawed because it didn't match the new codebase structure where there's no view-posts anymore, it's sec-posts.
search_switch = """window.switchTab = (tabName) => {
    document.querySelectorAll('aside button').forEach(btn => btn.classList.remove('tab-active'));
    document.getElementById(`nav-${tabName}`).classList.add('tab-active');
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden-section'));
    document.getElementById(`sec-${tabName}`).classList.remove('hidden-section');
    if (tabName === 'posts') loadPosts();
    if (tabName === 'channels') loadChannels();
    if (tabName === 'settings') loadSettings();
};"""

replace_switch = """window.switchTab = (tabName) => {
    document.querySelectorAll('aside button').forEach(btn => btn.classList.remove('tab-active'));
    document.getElementById(`nav-${tabName}`).classList.add('tab-active');
    
    // Hide all main content sections (divs or sections with id starting with sec-)
    const sections = ['posts', 'channels', 'categories', 'settings'];
    sections.forEach(secName => {
        const el = document.getElementById(`sec-${secName}`);
        if(el) {
            el.classList.add('hidden-section');
            // Also add hidden for divs that might not use hidden-section class correctly
            el.classList.add('hidden');
        }
    });
    
    // Show active section
    const activeEl = document.getElementById(`sec-${tabName}`);
    if(activeEl) {
        activeEl.classList.remove('hidden-section');
        activeEl.classList.remove('hidden');
    }

    if (tabName === 'posts') loadPosts();
    if (tabName === 'channels') loadChannels();
    if (tabName === 'categories') loadCategories();
    if (tabName === 'settings') loadSettings();
};"""

content = content.replace(search_switch, replace_switch)

# I need to verify what tag `sec-categories` is, since `document.querySelectorAll('section')` might not catch it if it's a div. Let's make sure it's a <section> in index.html.

with open("admin/admin.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed switchTab in admin.js")
