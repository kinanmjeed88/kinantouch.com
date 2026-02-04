
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

    // 3. Highlight Active Nav Link (Main Navigation)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Simple exact match or root match
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            // Remove generic inactive classes
            link.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-100');
            // Add unified active class
            link.classList.add('active'); 
        }
    });

    // 4. Tab Switching Logic (Homepage & Articles) - REFACTORED
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Helper to clean tab button classes
    const cleanTabClasses = (btn) => {
        // Remove ALL conflicting styling classes that might be hardcoded in HTML
        btn.classList.remove(
            'active', 
            'border-2', 'border-blue-600', 'border-green-600', 'border-purple-600', 'border-orange-600',
            'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600',
            'text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600',
            'text-white', 'shadow-sm', 'shadow-md'
        );
        // Ensure default inactive state classes exist
        btn.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300', 'border', 'border-gray-200', 'dark:border-gray-700');
    };

    if (tabButtons.length > 0) {
        // A) Initialization Phase: normalize state on load
        tabButtons.forEach(btn => {
            // Check if this button was intended to be active via HTML classes
            const isInitiallyActive = btn.classList.contains('bg-blue-600') || 
                                      btn.classList.contains('border-blue-600') ||
                                      btn.classList.contains('border-2');
            
            cleanTabClasses(btn); // Strip everything

            if (isInitiallyActive) {
                btn.classList.add('active'); // Apply unified class
                btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300', 'border', 'border-gray-200', 'dark:border-gray-700');
            }

            // B) Click Event Listener
            btn.addEventListener('click', (e) => {
                const targetTab = btn.getAttribute('data-tab');

                // 1. Reset ALL buttons
                tabButtons.forEach(b => {
                    cleanTabClasses(b);
                });

                // 2. Activate Clicked Button
                const activeBtn = e.currentTarget;
                activeBtn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300', 'border', 'border-gray-200', 'dark:border-gray-700');
                activeBtn.classList.add('active');

                // 3. Handle Content Visibility (Standard Logic)
                tabContents.forEach(content => content.classList.add('hidden'));
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    // Reset animation
                    targetContent.classList.remove('animate-fade-in');
                    void targetContent.offsetWidth; // Force reflow
                    targetContent.classList.add('animate-fade-in');
                    
                    // Mobile Scroll Fix
                    if(window.innerWidth < 768) {
                        const headerOffset = 140; 
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

    // 6. News Ticker Auto-Stop Logic (Refined)
    const tickerContainer = document.getElementById('ticker-content');
    if (tickerContainer) {
        document.fonts.ready.then(() => {
            const innerContent = tickerContainer.querySelector('span') || tickerContainer.querySelector('a');
            if (innerContent && tickerContainer.parentElement) {
                const parentWidth = tickerContainer.parentElement.clientWidth;
                // Add buffer to prevent flicker
                if (innerContent.offsetWidth < parentWidth) {
                    // Stop animation and apply static styling classes
                    tickerContainer.classList.remove('animate-marquee', 'absolute', 'right-0');
                    // We let CSS handle the rest via #ticker-content:not(.animate-marquee)
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
