
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

            // If hash is invalid or missing, check if we need to set default
            // But if we are already on the page and no hash, default is typically handled by HTML structure (first tab visible)
            // However, to be safe and responsive to hash changes:
            
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
});