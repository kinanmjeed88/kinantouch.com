
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

    // 3. Highlight Active Nav Link (Improved for MPA)
    const currentPath = window.location.pathname.replace(/\/$/, "");
    const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    // Main Header Nav
    document.querySelectorAll(".nav-link").forEach(link => {
        const href = link.getAttribute('href');
        if (href === filename || (filename === '' && href === 'index.html')) {
            link.classList.add("active");
        }
    });

    // Category Tabs Active State
    document.querySelectorAll(".tab-link").forEach(link => {
        const href = link.getAttribute('href');
        if (href === filename || (filename === '' && href === 'index.html')) {
            link.classList.remove('border-transparent', 'text-gray-600', 'dark:text-gray-300');
            link.classList.add('border-blue-600', 'text-blue-600', 'bg-transparent', 'shadow-sm');
        }
    });

    // 4. Pagination Logic (Target Main Grid directly)
    function setupPagination() {
        const itemsPerPage = 15;
        // Only target the main grid in the main tag
        const grid = document.querySelector('main > .grid');
        
        if(!grid) return;
        
        const items = Array.from(grid.children);
        if(items.length <= itemsPerPage) return;

        // Check if controls already exist
        if(document.querySelector('.pagination-controls')) return;

        // Create pagination controls
        const controls = document.createElement('div');
        controls.className = 'pagination-controls flex justify-center gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 w-full col-span-full';
        
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = `<span>السابق</span>`;
        prevBtn.className = 'px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors flex items-center gap-2';
        
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = `<span>التالي</span>`;
        nextBtn.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors flex items-center gap-2';

        controls.appendChild(prevBtn);
        controls.appendChild(nextBtn);
        // Append after grid
        grid.parentNode.appendChild(controls);

        let currentPage = 1;
        const totalPages = Math.ceil(items.length / itemsPerPage);

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

            prevBtn.disabled = page === 1;
            nextBtn.disabled = page === totalPages;
            
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

        prevBtn.addEventListener('click', () => {
            if(currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });

        nextBtn.addEventListener('click', () => {
            if(currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });

        // Init
        showPage(1);
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

    // 9. AI Summary Logic (Updated Class Based)
    const summaryBtns = document.querySelectorAll('.ai-summary-btn');
    summaryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find specific summary box in this page context
            const box = document.querySelector('.ai-summary-box');
            if(box) {
                box.classList.remove('hidden');
                requestAnimationFrame(() => {
                    box.classList.remove('opacity-0', 'scale-95');
                });
                box.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    const closeSummaryBtns = document.querySelectorAll('.ai-summary-close');
    closeSummaryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const box = btn.closest('.ai-summary-box');
            if(box) {
                box.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    box.classList.add('hidden');
                }, 300);
            }
        });
    });

    // 10. Real View Counter Logic (Client Side API Only)
    const viewCounter = document.querySelector('.view-count-display');
    if (viewCounter && viewCounter.dataset.slug) {
        const slug = viewCounter.dataset.slug;
        
        // Call the view API
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
            if (typeof data.views === 'number') {
                viewCounter.textContent = data.views.toLocaleString('en-US');
            }
        })
        .catch(e => {
            // console.debug('View counter API not active or failed:', e);
        });
    }
});