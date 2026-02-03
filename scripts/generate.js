
    // G. Category Labels
    if (aboutData.categories && aboutData.categories.labels) {
        $('[data-tab="articles"] span').text(aboutData.categories.labels.articles || 'اخبار');
        $('[data-tab="apps"] span').text(aboutData.categories.labels.apps || 'تطبيقات');
        $('[data-tab="games"] span').text(aboutData.categories.labels.games || 'ألعاب');
        $('[data-tab="sports"] span').text(aboutData.categories.labels.sports || 'رياضة');
    }
    
    // H. About Page Specifics
    if (fileName === 'about.html') {
        const coverContainer = $('#about-cover-section');
        if (coverContainer.length) {
            coverContainer.attr('style', ''); 
            if (aboutData.coverType === 'image' && aboutData.coverValue) {
                const coverUrl = cleanPath(aboutData.coverValue);
                coverContainer.css('background', `url('${coverUrl}') center/cover no-repeat`);
                coverContainer.removeClass((i, c) => (c.match(/bg-gradient-\S+/g) || []).join(' '));
                coverContainer.removeClass((i, c) => (c.match(/from-\S+/g) || []).join(' '));
                coverContainer.removeClass((i, c) => (c.match(/to-\S+/g) || []).join(' '));
            } else {
                coverContainer.css('background', ''); 
                coverContainer.removeClass((i, c) => (c.match(/bg-gradient-\S+/g) || []).join(' '));
                coverContainer.removeClass((i, c) => (c.match(/from-\S+/g) || []).join(' '));
                coverContainer.removeClass((i, c) => (c.match(/to-\S+/g) || []).join(' '));
                coverContainer.addClass(aboutData.coverValue || 'bg-gradient-to-r from-blue-700 to-blue-500');
            }
        }
        
        $('#about-bot-list').parent().find('h2').contents().last().replaceWith(' ' + (aboutData.botTitle || 'مركز خدمة الطلبات (Bot)'));
        if(aboutData.botInfo) {
            const botItems = aboutData.botInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-blue-500 text-xl">✪</span><span>${i}</span></li>`).join('');
            $('#about-bot-list').html(botItems);
        }
        
        $('#about-search-list').parent().find('h2').contents().last().replaceWith(' ' + (aboutData.searchTitle || 'دليل الوصول الذكي للمحتوى'));
        if(aboutData.searchInfo) {
            const searchItems = aboutData.searchInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-green-500 text-xl">✪</span><span>${i}</span></li>`).join('');
            $('#about-search-list').html(searchItems);
        }
        
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
