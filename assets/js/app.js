
// Initialize Lucide Icons & App Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Theme Management
    const themeBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            html.classList.toggle('dark');
            if (html.classList.contains('dark')) {
                localStorage.theme = 'dark';
            } else {
                localStorage.theme = 'light';
            }
        });
    }

    // 3. Highlight Active Nav Link (Robust Path Logic)
    try {
        const url = new URL(window.location.href);
        // Normalize: Remove trailing slash and get pathname
        const path = url.pathname.replace(/\/$/, ""); 
        // Get just the filename (e.g., 'index.html' or empty string for root)
        const filename = path.split('/').pop() || 'index.html';

        // Main Header Nav
        document.querySelectorAll(".nav-link").forEach(link => {
            const href = link.getAttribute('href');
            // Strict check
            if (href === filename || (filename === 'index.html' && href === 'index.html')) {
                link.classList.add("active");
            }
        });

        // Category Tabs Active State
        document.querySelectorAll(".tab-link").forEach(link => {
            const href = link.getAttribute('href');
            if (href === filename || (filename === 'index.html' && href === 'index.html')) {
                link.classList.remove('border-transparent', 'text-gray-600', 'dark:text-gray-300');
                link.classList.add('border-blue-600', 'text-blue-600', 'bg-transparent', 'shadow-sm');
            }
        });
    } catch(e) { console.error(e); }

    // 4. Pagination Logic with URL Params
    function setupPagination() {
        const itemsPerPage = 15;
        // Only target the main grid in the main tag
        const grid = document.querySelector('main > .grid');
        
        if(!grid) return;
        
        const items = Array.from(grid.children);
        if(items.length <= itemsPerPage) return;

        // Get Current Page from URL
        const urlParams = new URLSearchParams(window.location.search);
        let currentPage = parseInt(urlParams.get('page')) || 1;
        const totalPages = Math.ceil(items.length / itemsPerPage);

        // Controls container
        let controls = document.querySelector('.pagination-controls');
        let prevBtn, nextBtn;

        if (!controls) {
            controls = document.createElement('div');
            controls.className = 'pagination-controls flex justify-center gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 w-full col-span-full';
            
            prevBtn = document.createElement('button');
            prevBtn.innerHTML = `<span>السابق</span>`;
            prevBtn.className = 'px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors flex items-center gap-2';
            
            nextBtn = document.createElement('button');
            nextBtn.innerHTML = `<span>التالي</span>`;
            nextBtn.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors flex items-center gap-2';

            controls.appendChild(prevBtn);
            controls.appendChild(nextBtn);
            // Append after grid
            grid.parentNode.appendChild(controls);

            prevBtn.addEventListener('click', () => {
                if(currentPage > 1) {
                    updatePage(currentPage - 1);
                }
            });

            nextBtn.addEventListener('click', () => {
                if(currentPage < totalPages) {
                    updatePage(currentPage + 1);
                }
            });
        }

        function showPage(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            items.forEach((item, index) => {
                if(index >= start && index < end) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });

            if(prevBtn) prevBtn.disabled = page === 1;
            if(nextBtn) nextBtn.disabled = page === totalPages;
            
            // Scroll to top of grid
            if(window.scrollY > grid.offsetTop) {
                const headerOffset = 150;
                const elementPosition = grid.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }

        function updatePage(newPage) {
            currentPage = newPage;
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('page', newPage);
            window.history.pushState({}, '', newUrl);
            showPage(newPage);
        }

        // Init
        showPage(currentPage);
        
        // Handle Back Button
        window.addEventListener('popstate', () => {
            const params = new URLSearchParams(window.location.search);
            const p = parseInt(params.get('page')) || 1;
            currentPage = p;
            showPage(p);
        });
    }
    
    // Run pagination setup
    setupPagination();

    // 5. PWA Install Logic
    let deferredPrompt;
    const installBtn = document.getElementById('install-app-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.classList.add('flex');
        }
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        });
    }

    // 6. News Ticker Auto-Stop Logic (Fixed cleanup)
    const tickerContainer = document.getElementById('ticker-content');
    if (tickerContainer) {
        document.fonts.ready.then(() => {
            const innerContent = tickerContainer.querySelector('span') || tickerContainer.querySelector('a');
            if (innerContent && tickerContainer.parentElement) {
                const parentWidth = tickerContainer.parentElement.clientWidth;
                if (innerContent.offsetWidth < parentWidth) {
                    tickerContainer.classList.remove('animate-marquee');
                    tickerContainer.style.position = 'relative';
                    tickerContainer.style.left = 'auto'; // Reset left
                }
            }
        });
    }

    // 7. Back To Top Logic
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('translate-y-10', 'opacity-0', 'invisible');
            } else {
                backToTopBtn.classList.add('translate-y-10', 'opacity-0', 'invisible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 8. Share Buttons Dynamic Links
    const shareContainer = document.getElementById('dynamic-share-buttons');
    if (shareContainer) {
        const pageTitle = encodeURIComponent(document.title);
        const pageUrl = encodeURIComponent(window.location.href);
        const fullText = `${pageTitle}%0A${pageUrl}`;

        // WhatsApp
        const waBtn = shareContainer.querySelector('.whatsapp');
        if(waBtn) waBtn.href = `https://api.whatsapp.com/send?text=${fullText}`;

        // Telegram
        const tgBtn = shareContainer.querySelector('.telegram');
        if(tgBtn) tgBtn.href = `https://t.me/share/url?url=${pageUrl}&text=${pageTitle}`;

        // Facebook
        const fbBtn = shareContainer.querySelector('.facebook');
        if(fbBtn) fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;

        // Instagram (Fallback)
        const instaBtn = shareContainer.querySelector('.instagram');
        if(instaBtn) {
            instaBtn.href = "https://www.instagram.com/";
        }
    }

    // 9. AI Summary Logic (Scope Isolated + Safe)
    const summaryBtns = document.querySelectorAll('.ai-summary-btn');
    summaryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Find summary box specifically within the parent main/article container
            const container = e.target.closest('main');
            if (container) {
                const box = container.querySelector('.ai-summary-box');
                if(box) {
                    box.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        box.classList.remove('opacity-0', 'scale-95');
                    });
                    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });

    const closeSummaryBtns = document.querySelectorAll('.ai-summary-close');
    closeSummaryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const box = e.target.closest('.ai-summary-box');
            if(box) {
                box.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    box.classList.add('hidden');
                }, 300);
            }
        });
    });

    // 10. Real View Counter Logic (Client Side API Only with Fallback)
    const viewCounter = document.querySelector('.view-count-display');
    if (viewCounter && viewCounter.dataset.slug) {
        const slug = viewCounter.dataset.slug;
        
        fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug })
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('API Error');
        })
        .then(data => {
            // Strict undefined/null check to distinguish 0 views from error
            if (data.views === undefined || data.views === null) {
                viewCounter.textContent = "—";
            } else {
                viewCounter.textContent = Number(data.views).toLocaleString("en-US");
            }
        })
        .catch(e => {
            // Quietly fail UI
            viewCounter.textContent = '—'; 
        });
    }
});