
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

    // 3. Highlight Active Nav Link (Main Navigation - Glassmorphism)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Reset base classes to ensure clean slate
        link.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'active', 'text-blue-600');
        
        // Simple exact match or root match
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active'); // CSS handles the Glassmorphism
        }
    });

    // 4. Tab Switching Logic (Homepage & Articles) - Minimalist Underline
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to strip all conflicting Tailwind classes
    const cleanTabClasses = (btn) => {
        btn.classList.remove(
            // Backgrounds
            'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 
            'bg-white', 'dark:bg-gray-800', 'bg-transparent',
            // Borders
            'border-2', 'border', 'border-blue-600', 'border-green-600', 'border-purple-600', 'border-orange-600',
            'border-transparent', 'dark:border-gray-700', 'border-gray-200',
            // Text Colors
            'text-white', 'text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 
            'text-gray-600', 'dark:text-gray-300',
            // Shapes & Shadows
            'rounded-full', 'shadow-sm', 'shadow-md', 'shadow-lg'
        );
        // Add inactive base text color (CSS handles hover)
        btn.classList.add('text-gray-500', 'dark:text-gray-400');
    };

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            // Determine if this tab should be active initially
            // Check for 'active' class OR specific styling classes that indicate activity in the HTML
            const isInitiallyActive = btn.classList.contains('active') || 
                                      btn.classList.contains('bg-blue-600') || 
                                      btn.getAttribute('data-tab') === 'articles'; // Default to articles if unsure

            // Strip everything
            cleanTabClasses(btn);

            if (isInitiallyActive) {
                // If multiple are marked active, only the first one stays active (handled by loop order or logic below)
                // ideally we clear all first, but here we run per button.
                // Better approach: Let's assume the HTML sets one active.
            }
        });

        // Re-run to force correct state based on logic, prioritizing 'active' class or first element
        let hasActive = false;
        tabButtons.forEach(btn => {
            // Check if this button was intended to be active (e.g. it corresponds to visible content)
            const targetTab = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            const isContentVisible = targetContent && !targetContent.classList.contains('hidden');
            
            if (isContentVisible && !hasActive) {
                btn.classList.remove('text-gray-500', 'dark:text-gray-400');
                btn.classList.add('active');
                hasActive = true;
            } else {
                btn.classList.remove('active');
            }

            // Click Handler
            btn.addEventListener('click', (e) => {
                const targetTab = btn.getAttribute('data-tab');

                // 1. Reset ALL buttons
                tabButtons.forEach(b => {
                    b.classList.remove('active');
                    b.classList.add('text-gray-500', 'dark:text-gray-400');
                });

                // 2. Activate Clicked Button
                const activeBtn = e.currentTarget;
                activeBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
                activeBtn.classList.add('active');

                // 3. Handle Content Visibility
                tabContents.forEach(content => content.classList.add('hidden'));
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
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

    // 6. News Ticker Auto-Stop Logic
    const tickerContainer = document.getElementById('ticker-content');
    if (tickerContainer) {
        document.fonts.ready.then(() => {
            const innerContent = tickerContainer.querySelector('span') || tickerContainer.querySelector('a');
            if (innerContent && tickerContainer.parentElement) {
                const parentWidth = tickerContainer.parentElement.clientWidth;
                if (innerContent.offsetWidth < parentWidth) {
                    tickerContainer.classList.remove('animate-marquee', 'absolute', 'right-0');
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
