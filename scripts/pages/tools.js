import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { ROOT_DIR, TEMPLATES_DIR } from '../utils/paths.js';
import { safeWrite } from '../utils/fs.js';
import { updateGlobalElements } from '../core/global.js';

export function updateToolsPage(aboutData) { 
    let templatePath = path.join(TEMPLATES_DIR, 'tools.html');
    if (!fs.existsSync(templatePath)) templatePath = path.join(ROOT_DIR, 'tools.html');
    if (!fs.existsSync(templatePath)) return; 

    let html = fs.readFileSync(templatePath, 'utf8'); 
    const $ = cheerio.load(html); 
    const main = $('main'); 
    if (main.length) { 
        main.find('.adsbygoogle-container').remove(); 
        main.find('a[href="tool-analysis.html"]').remove(); 
    } 
    safeWrite(path.join(ROOT_DIR, 'tools.html'), updateGlobalElements($.html(), 'tools.html', '', aboutData)); 
}
