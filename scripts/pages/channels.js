import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { ROOT_DIR, TEMPLATES_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { updateGlobalElements } from '../core/global.js';
import { renderIconHTML } from '../core/renderer.js';
import { escapeHtml } from '../utils/helpers.js';

export function updateChannelsPage(channelsData, aboutData) {
    let templatePath = path.join(TEMPLATES_DIR, 'tools-sites.html');
    if (!fs.existsSync(templatePath)) templatePath = path.join(ROOT_DIR, 'tools-sites.html');
    if (!fs.existsSync(templatePath)) return;

    let html = fs.readFileSync(templatePath, 'utf8'); 
    const $ = cheerio.load(html); 
    const grid = $('main .grid'); 
    grid.empty();
    channelsData.forEach(ch => {
        const renderedIcon = renderIconHTML(ch.iconData || ch.icon, 'star', 24);
        grid.append(`<a href="${ch.url}" target="_blank" class="block bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group w-full"><div class="flex items-center gap-4 h-full"><div class="w-12 h-12 bg-${ch.color}-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white overflow-hidden">${renderedIcon}</div><div class="flex-1 min-w-0"><h3 class="font-bold text-gray-900 dark:text-white text-sm mb-1 break-words whitespace-normal">${escapeHtml(ch.name)}</h3><p class="text-xs text-gray-500 dark:text-gray-400 truncate">${escapeHtml(ch.desc)}</p></div><div class="text-gray-300 group-hover:text-${ch.color}-600 shrink-0 transition-colors"><i data-lucide="chevron-left" class="w-5 h-5"></i></div></div></a>`);
    });
    safeWrite(path.join(ROOT_DIR, 'tools-sites.html'), updateGlobalElements($.html(), 'tools-sites.html', '', aboutData));
}
