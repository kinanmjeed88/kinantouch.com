
        
        $('.prose p:first').text(aboutData.bio);
    }

    // I. Inject Back to Top Button if missing
    if ($('#back-to-top').length === 0) {
        $('body').append(`
        <button id="back-to-top" class="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-3.5 rounded-full shadow-xl shadow-blue-500/30 transition-all duration-300 transform translate-y-10 opacity-0 invisible hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300/50 group" aria-label="العودة للأعلى">
            <i data-lucide="arrow-up" class="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300"></i>
        </button>
        `);
    }

    return $.html();
};

const updateListingPages = () => {
