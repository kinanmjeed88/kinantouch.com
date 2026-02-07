import fs from 'fs';
import path from 'path';

export const safeWrite = (filePath, content) => {
    try { 
        fs.writeFileSync(filePath, content); 
    } catch (err) { 
        console.error(`❌ Write failed for: ${filePath}`); 
        throw err; 
    }
};

export const readJsonSafe = (filePath, defaultValue = null) => {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Error parsing JSON file: ${filePath}`, e);
        }
    }
    return defaultValue;
};

export const ensureDirs = (...paths) => {
    paths.forEach(p => {
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });
};
