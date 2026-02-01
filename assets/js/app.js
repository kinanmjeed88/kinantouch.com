
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

    // 3. Highlight Active Nav Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-100');
            link.classList.add('bg-blue-600', 'text-white', 'shadow-md');
        }
    });

    // 4. Tab Switching Logic (Homepage & Articles)
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');

                // Reset all buttons to default outline state
                tabButtons.forEach(b => {
                    // Remove ALL active colors
                    b.classList.remove(
                        'border-blue-600', 'text-blue-600', 
                        'border-green-600', 'text-green-600',
                        'border-purple-600', 'text-purple-600',
                        'border-orange-600', 'text-orange-600',
                        'border-2', 'bg-transparent', 'shadow-sm'
                    );
                    
                    // Add default inactive state
                    b.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300', 'border', 'border-gray-200', 'dark:border-gray-700');
                });

                // Activate clicked button (Apply colored outline)
                btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300', 'border', 'border-gray-200', 'dark:border-gray-700');
                
                // Common active base classes
                btn.classList.add('border-2', 'bg-transparent', 'shadow-sm');

                if(targetTab === 'articles') btn.classList.add('border-blue-600', 'text-blue-600');
                else if(targetTab === 'apps') btn.classList.add('border-green-600', 'text-green-600');
                else if(targetTab === 'games') btn.classList.add('border-purple-600', 'text-purple-600');
                else if(targetTab === 'sports') btn.classList.add('border-orange-600', 'text-orange-600');

                // Hide all contents
                tabContents.forEach(content => content.classList.add('hidden'));

                // Show target content
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    targetContent.classList.remove('animate-fade-in');
                    void targetContent.offsetWidth; // Trigger reflow
                    targetContent.classList.add('animate-fade-in');
                    
                    // Mobile Optimization: Scroll slightly to content so menu doesn't block view
                    if(window.innerWidth < 768) {
                        const headerOffset = 140; // Approx height of header + sticky nav
                        const elementPosition = targetContent.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
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
        // Wait for fonts to load
        document.fonts.ready.then(() => {
            const innerContent = tickerContainer.querySelector('span') || tickerContainer.querySelector('a');
            const parentWidth = tickerContainer.parentElement.clientWidth;
            
            if (innerContent) {
                // If content is smaller than container, center it and stop animation
                if (innerContent.offsetWidth < parentWidth) {
                    tickerContainer.classList.remove('animate-marquee', 'absolute', 'right-0');
                    tickerContainer.classList.add('w-full', 'justify-center');
                }
            }
        });
    }
});
