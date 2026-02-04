
// ... existing code ...
        $content('img').addClass('w-full h-auto max-w-full rounded-xl shadow-md my-4 block mx-auto border border-gray-100 dark:border-gray-700');
        $('article').html($content.html()); 
        
        // ================================
        // Related Posts (4 items - Mobile layout)
        // ================================

        const relatedPosts = allPosts
            .filter(p => p.slug !== post.slug)
            .slice(0, 4);

        if (relatedPosts.length) {

            let relatedHTML = `
            <section class="related-posts mt-10 border-t border-gray-100 dark:border-gray-800 pt-8">
                <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    <i data-lucide="layers" class="w-5 h-5 text-blue-600"></i>
                    قد يعجبك أيضاً
                </h3>
                <div class="grid grid-cols-2 gap-3 related-grid">
            `;

            relatedPosts.forEach(r => {
                relatedHTML += `
                <a href="article-${r.slug}.html" class="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                    <img src="${cleanPath(r.image)}" class="w-full h-24 object-cover" loading="lazy" />
                    <div class="p-2">
                        <h4 class="text-xs font-bold line-clamp-2 text-gray-900 dark:text-white leading-snug">
                            ${r.title}
                        </h4>
                    </div>
                </a>
                `;
            });

            relatedHTML += `</div></section>`;

            $('article').append(relatedHTML);
        }

        // ================================
        // 1. Social Follow Section (New Addition)
        // ================================
        const soc = aboutData.social || {};
        const socialSectionHTML = `
        <div class="mt-8 mb-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 text-sm">تابعنا على منصات التواصل</h3>
            <div class="flex items-center justify-center gap-4 flex-wrap">
                ${soc.telegram ? `<a href="${soc.telegram}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg hover:scale-110 transition-transform"><i data-lucide="send" class="w-5 h-5 ml-0.5"></i></a>` : ''}
                ${soc.youtube ? `<a href="${soc.youtube}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF0000] text-white shadow-lg hover:scale-110 transition-transform"><i data-lucide="youtube" class="w-5 h-5"></i></a>` : ''}
                ${soc.facebook ? `<a href="${soc.facebook}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg hover:scale-110 transition-transform"><i data-lucide="facebook" class="w-5 h-5"></i></a>` : ''}
                ${soc.instagram ? `<a href="${soc.instagram}" target="_blank" class="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-lg hover:scale-110 transition-transform"><i data-lucide="instagram" class="w-5 h-5"></i></a>` : ''}
            </div>
        </div>
        `;
        $('article').append(socialSectionHTML);

        const jsonLd = { "@context": "https://schema.org", "@type": "Article", "headline": post.title, "image": [fullImageUrl], "datePublished": new Date(post.date).toISOString(), "dateModified": new Date(post.effectiveDate).toISOString(), "author": { "@type": "Person", "name": aboutData.profileName }, "publisher": { "@type": "Organization", "name": aboutData.siteName || "TechTouch", "logo": { "@type": "ImageObject", "url": toAbsoluteUrl(aboutData.profileImage) } }, "description": post.description, "mainEntityOfPage": { "@type": "WebPage", "@id": fullUrl } };
        $('script[type="application/ld+json"]').remove();
        $('head').append(`<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`);
        
        fs.writeFileSync(path.join(ROOT_DIR, pageSlug), updateGlobalElements($.html(), pageSlug));
    });
};
// ... existing code ...
