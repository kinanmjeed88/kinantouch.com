with open("scripts/pages/articles.js", "r") as f:
    content = f.read()

import re
old_match = """        // Match Analytics Path: e.g. "/article-xyz.html" or "/article-xyz"
        const htmlPath = `/${pageSlug}`;
        const cleanPathSlug = `/article-${post.slug}`;
        const pageViews = (analyticsData && (analyticsData[htmlPath] || analyticsData[cleanPathSlug])) 
                            ? (analyticsData[htmlPath] || analyticsData[cleanPathSlug]) : 0;"""

new_match = """        // Match Analytics Path: key in analyticsData is now normalized to the post slug
        const slugKey = post.slug.trim().toLowerCase();
        const pageViews = (analyticsData && analyticsData[slugKey]) ? analyticsData[slugKey] : 0;"""

if old_match in content:
    content = content.replace(old_match, new_match)
else:
    # Try even older
    old_match2 = """        // Match Analytics Path: e.g. "/article-xyz.html" or "/article-xyz"
        const pageViews = (analyticsData && analyticsData[`/${pageSlug}`]) ? analyticsData[`/${pageSlug}`] : 0;"""
    content = content.replace(old_match2, new_match)

with open("scripts/pages/articles.js", "w") as f:
    f.write(content)

