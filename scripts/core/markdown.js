export function parseMarkdown(markdown, options = {}) {
    if (!markdown) return '';

    const renderMode = options.renderMode || 'markdown';

    // ✅ إذا كان الوضع HTML خام → أعد المحتوى كما هو بدون أي معالجة
    if (renderMode === 'html') {
        return markdown;
    }

    let html = markdown;

    html = html.replace(/\$1/g, '');

    // YouTube shortcode
    html = html.replace(/@\[youtube\]\((.*?)\)/g, (match, url) => {
        let videoId = '';
        const matchId = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
        if (matchId) videoId = matchId[1];

        if (videoId) {
            return `<div class="video-container shadow-lg rounded-xl overflow-hidden border border-gray-800 w-full max-w-full">
                        <iframe src="https://www.youtube.com/embed/${videoId}"
                            title="YouTube video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            loading="lazy"></iframe>
                    </div>`;
        }

        return '';
    });

    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
        return `<div class="article-image-container">
                    <img src="${src}" alt="${alt}"
                        onerror="this.onerror=null;this.src='assets/images/me.jpg';">
                </div>`;
    });

    // Buttons / Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g,
        `<div class="my-6 w-full flex justify-center px-2">
            <a href="$2" target="_blank" class="btn-wrapped-link w-full sm:w-auto">
                <i data-lucide="external-link" class="shrink-0 w-4 h-4"></i>
                <span class="break-words whitespace-normal text-center">$1</span>
            </a>
        </div>`
    );

    // Headings
    html = html.replace(/^### (.*$)/gim,
        '<h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3 break-words whitespace-normal w-full">$1</h3>'
    );

    html = html.replace(/^## (.*$)/gim,
        '<h2 class="text-xl font-bold text-blue-600 dark:text-blue-400 mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 break-words whitespace-normal w-full">$1</h2>'
    );

    html = html.replace(/^# (.*$)/gim,
        '<h1 class="text-2xl font-extrabold text-gray-900 dark:text-white mt-8 mb-6 break-words whitespace-normal w-full">$1</h1>'
    );

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Lists
    html = html.replace(/^- (.*$)/gim,
        '<li class="ml-4 list-disc marker:text-blue-500 break-words whitespace-normal">$1</li>'
    );

    html = html.replace(/(<li.*<\/li>\n?)+/g,
        '<ul class="list-inside space-y-2 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm w-full">$&</ul>'
    );

    // Paragraph auto-wrapping
    html = html.split('\n').map(line => {
        const trimmed = line.trim();

        if (trimmed === '') return '';

        // إذا السطر يبدأ بعنصر HTML معروف → لا تلمسه
        if (trimmed.match(/^<(h|ul|li|div|img|iframe|p|script|section|article|table|thead|tbody|tr|td|th|figure|blockquote)/)) {
            return line;
        }

        return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base break-words whitespace-normal w-full">${line}</p>`;
    }).join('\n');

    return html;
}
