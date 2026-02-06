
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

    // 3. Highlight Active Nav Link (Improved Logic)
    const currentPath = window.location.pathname.replace(/\/$/, "");
    document.querySelectorAll(".nav-link").forEach(link => {
        try {
            const linkPath = new URL(link.href).pathname.replace(/\/$/, "");
            link.classList.remove("active");
            // Check for exact match or index match
            if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
                link.classList.add("active");
            }
            // Fallback for root
            if ((currentPath === '' || currentPath === '/') && linkPath.endsWith('index.html')) {
                link.classList.add("active");
            }
        } catch(e) {
            // Fallback for relative links if URL parsing fails
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href)) {
                link.classList.add("active");
            }
        }
    });

    // 4. Tab Switching Logic (Hash Based Persistence)
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        
        function activateTabFromHash() {
            const hash = window.location.hash.replace('#tab-', '');
            let targetBtn, targetContent;

            if (hash) {
                targetBtn = document.querySelector(`.tab-btn[data-tab="${hash}"]`);
                targetContent = document.getElementById(`tab-${hash}`);
            }
            
            if (targetBtn && targetContent) {
                // Deactivate all
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.add('hidden'));

                // Activate Target
                targetBtn.classList.add('active');
                targetContent.classList.remove('hidden');
                
                // Animate
                targetContent.classList.remove('animate-fade-in');
                void targetContent.offsetWidth; // Force reflow
                targetContent.classList.add('animate-fade-in');
            }
        }

        // Initial Load
        activateTabFromHash();

        // Listen for hash changes (Browser Back Button)
        window.addEventListener('hashchange', activateTabFromHash);

        // Click Handlers
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = btn.getAttribute('data-tab');
                // Update URL Hash without scrolling
                history.pushState(null, null, `#tab-${targetTab}`);
                activateTabFromHash();
            });
        });
    }

    // 5. Pagination Logic (New Addition)
    function setupPagination() {
        const itemsPerPage = 15;
        const tabContents = document.querySelectorAll('.tab-content');

        tabContents.forEach(tab => {
            const grid = tab.querySelector('.grid');
            if(!grid) return;
            
            const items = Array.from(grid.children);
            if(items.length <= itemsPerPage) return;

            // Check if controls already exist
            if(tab.querySelector('.pagination-controls')) return;

            // Create pagination controls
            const controls = document.createElement('div');
            controls.className = 'pagination-controls flex justify-center gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800';
            
            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = `<span>السابق</span>`;
            prevBtn.className = 'px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors flex items-center gap-2';
            
            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = `<span>التالي</span>`;
            nextBtn.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-colors flex items-center gap-2';

            controls.appendChild(prevBtn);
            controls.appendChild(nextBtn);
            tab.appendChild(controls);

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
        });
    }
    
    // Run pagination setup
    setupPagination();

    // 6. PWA Install Logic
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

    // 7. News Ticker Auto-Stop Logic (Fixed cleanup)
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

    // 8. Back To Top Logic
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

    // 9. Share Buttons Dynamic Links
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

        // Instagram (Fallback as it doesn't support direct URL sharing)
        // We will link to the app, but user has to paste manually essentially.
        // However, standard "share" often implies copying or generic intent.
        // Since user asked to "open app", we try generic link or web intent if mobile.
        const instaBtn = shareContainer.querySelector('.instagram');
        if(instaBtn) {
            // Instagram doesn't have a simple web sharer URL for posts.
            // Best we can do is open Instagram.
            instaBtn.href = "https://www.instagram.com/";
            instaBtn.addEventListener('click', (e) => {
                // On mobile this might trigger app if installed
            });
        }
    }

    // 10. Toggle Pre-rendered AI Summary (No API Calls here)
    const showSummaryBtn = document.getElementById('btn-show-summary');
    const summaryContainer = document.getElementById('ai-summary-container');
    const hideSummaryBtn = document.getElementById('btn-hide-summary');

    if (showSummaryBtn && summaryContainer) {
        showSummaryBtn.addEventListener('click', () => {
            // Show container
            summaryContainer.classList.remove('hidden');
            // Allow browser reflow, then animate opacity and translate
            requestAnimationFrame(() => {
                summaryContainer.classList.remove('opacity-0', 'translate-y-4');
            });
            
            // Scroll to it
            summaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Optionally hide the show button itself if desired, or keep it as toggle
            // showSummaryBtn.style.display = 'none'; 
        });

        if (hideSummaryBtn) {
            hideSummaryBtn.addEventListener('click', () => {
                // Animate out
                summaryContainer.classList.add('opacity-0', 'translate-y-4');
                // Wait for transition end then hide
                setTimeout(() => {
                    summaryContainer.classList.add('hidden');
                    // Scroll back up slightly to context
                    showSummaryBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            });
        }
    }

    // 11. Real View Counter Logic (Client Side API Only)
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
            // Fallback is handled by static HTML (empty or ...)
        });
    }
});
