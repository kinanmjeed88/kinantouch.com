import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { ROOT_DIR, TEMPLATES_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { updateGlobalElements } from '../core/global.js';
import { cleanPath, escapeHtml } from '../utils/helpers.js';

export function updateAboutPageDetails(aboutData) { 
    let templatePath = path.join(TEMPLATES_DIR, 'about.html');
    if (!fs.existsSync(templatePath)) templatePath = path.join(ROOT_DIR, 'about.html');
    if (!fs.existsSync(templatePath)) return;

    let html = fs.readFileSync(templatePath, 'utf8'); 
    const $ = cheerio.load(html); 
    
    // Page specific manipulations
    const coverContainer = $('#about-cover-section');
    if (coverContainer.length) {
        coverContainer.attr('style', ''); 
        if (aboutData.coverType === 'image' && aboutData.coverValue) {
            const coverUrl = cleanPath(aboutData.coverValue);
            coverContainer.css('background', `url('${coverUrl}') center/cover no-repeat`);
            coverContainer.removeClass((i, c) => (c.match(/bg-gradient-\S+/g) || []).join(' '));
        } else {
            coverContainer.css('background', ''); 
            coverContainer.removeClass((i, c) => (c.match(/bg-gradient-\S+/g) || []).join(' '));
            coverContainer.addClass(aboutData.coverValue || 'bg-gradient-to-r from-blue-700 to-blue-500');
        }
    }
    $('#about-bot-list').parent().find('h2').contents().last().replaceWith(' ' + (aboutData.botTitle || 'مركز خدمة الطلبات (Bot)'));
    if(aboutData.botInfo) {
        const botItems = aboutData.botInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-blue-500 text-xl">✪</span><span>${escapeHtml(i)}</span></li>`).join('');
        $('#about-bot-list').html(botItems);
    }
    $('#about-search-list').parent().find('h2').contents().last().replaceWith(' ' + (aboutData.searchTitle || 'دليل الوصول الذكي للمحتوى'));
    if(aboutData.searchInfo) {
        const searchItems = aboutData.searchInfo.split('\n').filter(i => i.trim()).map(i => `<li class="flex items-start gap-2"><span class="text-green-500 text-xl">✪</span><span>${escapeHtml(i)}</span></li>`).join('');
        $('#about-search-list').html(searchItems);
    }
    $('.prose p:first').text(aboutData.bio);

    safeWrite(path.join(ROOT_DIR, 'about.html'), updateGlobalElements($.html(), 'about.html', '', aboutData)); 
}
