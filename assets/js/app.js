
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

    // 3. Highlight Active Nav Link (Robust Logic - Section 4)
    const currentPath = window.location.pathname.replace(/\/$/, ""); // Normalize path
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkUrl = new URL(link.href, window.location.origin);
        const linkPath = linkUrl.pathname.replace(/\/$/, "");
        
        // Reset
        link.classList.remove('active');
        
        // Exact match or Home Root match
        // Also handles the case where index.html might be implicit
        const isHome = (currentPath === '' || currentPath.endsWith('index.html')) && (linkPath === '' || linkPath.endsWith('index.html'));
        const isMatch = currentPath === linkPath || (linkPath !== '' && !linkPath.endsWith('index.html') && currentPath.startsWith(linkPath));

        if (isHome || isMatch) {
            link.classList.add('active');
        }
    });

    // 4. Tab Switching Logic (Homepage & Articles) - Hash Aware (Section 5)
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        
        const activateTab = (targetTab) => {
            // Validate tab existence
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (!targetContent) return;

            // 1. Reset Buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            
            // 2. Activate specific button
            const activeBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
            if (activeBtn) activeBtn.classList.add('active');

            // 3. Toggle Content
            tabContents.forEach(content => content.classList.add('hidden'));
            targetContent.classList.remove('hidden');
            targetContent.classList.remove('animate-fade-in');
            void targetContent.offsetWidth; // Force reflow
            targetContent.classList.add('animate-fade-in');
        };

        // Initialize based on Hash or Default
        const initialHash = window.location.hash.replace('#tab-', '');
        const validTabs = Array.from(tabButtons).map(b => b.getAttribute('data-tab'));
        
        if (initialHash && validTabs.includes(initialHash)) {
            activateTab(initialHash);
        } else {
            // Determine active from HTML structure if no hash, or default to first
            const currentlyVisible = document.querySelector('.tab-content:not(.hidden)');
            if (currentlyVisible) {
                const id = currentlyVisible.id.replace('tab-', '');
                activateTab(id);
            } else {
                activateTab(validTabs[0]); // Default to first (usually articles)
            }
        }

        // Click Handler
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Update URL Hash without scrolling (optional, keeps state on refresh)
                history.replaceState(null, null, `#tab-${targetTab}`);
                
                activateTab(targetTab);

                // Mobile Scroll Fix - only if needed
                if(window.innerWidth < 768) {
                    const headerOffset = 140; 
                    const targetContent = document.getElementById(`tab-${targetTab}`);
                    if (targetContent) {
                        const elementPosition = targetContent.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    }
                }
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

    // 6. News Ticker Auto-Stop Logic
    const tickerContainer = document.getElementById('ticker-content');
    if (tickerContainer) {
        document.fonts.ready.then(() => {
            const innerContent = tickerContainer.querySelector('span') || tickerContainer.querySelector('a');
            if (innerContent && tickerContainer.parentElement) {
                const parentWidth = tickerContainer.parentElement.clientWidth;
                // If content is smaller than screen, stop animation
                if (innerContent.offsetWidth < parentWidth) {
                    tickerContainer.classList.remove('animate-marquee');
                    // Ensure positioning is reset via CSS rules for :not(.animate-marquee)
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
