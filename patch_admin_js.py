with open("admin/admin.js", "r") as f:
    content = f.read()

# Replace Object.entries
import re

old_loop = """        Object.entries(analytics).forEach(([path, views]) => {
            totalViews += views;
            // Try to match path to a post
            const slugMatch = path.match(/^\/article-([^/?#\.]+)/);
            if (slugMatch) {
                const slug = slugMatch[1];
                const post = validPosts.find(p => p.slug === slug);
                if (post) {
                    topPosts.push({ title: post.title, views: views, url: path });
                }
            }
        });"""

new_loop = """        Object.entries(analytics).forEach(([key, views]) => {
            totalViews += views;
            // 'key' is now exactly the slug (e.g. "my-post-slug") or "/"
            if (key !== '/') {
                const post = validPosts.find(p => p.slug.trim().toLowerCase() === key);
                if (post) {
                    topPosts.push({ title: post.title, views: views, url: `/article-${key}.html` });
                }
            }
        });"""

content = content.replace(old_loop, new_loop)

# Check if replaced, if not fallback to generic replace
if new_loop not in content:
    # Try older regex from before our first commit
    old_loop2 = """        Object.entries(analytics).forEach(([path, views]) => {
            totalViews += views;
            // Try to match path to a post
            const slugMatch = path.match(/^\/article-(.*?)\.html/);
            if (slugMatch) {
                const slug = slugMatch[1];
                const post = validPosts.find(p => p.slug === slug);
                if (post) {
                    topPosts.push({ title: post.title, views: views, url: path });
                }
            }
        });"""
    content = content.replace(old_loop2, new_loop)

with open("admin/admin.js", "w") as f:
    f.write(content)
