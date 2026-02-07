import { BASE_URL } from '../config/constants.js';

export const escapeHtml = (str = '') => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, s =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[s])
    );
};

export const escapeXml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};

export const cleanPath = (p) => {
    if (!p) return '';
    if (p.startsWith('http')) return p;
    return p.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
};

export const toAbsoluteUrl = (url) => {
    const clean = cleanPath(url || 'assets/images/me.jpg');
    if (clean.startsWith('http')) return clean;
    return `${BASE_URL}/${clean}`;
};

export const validateDate = (d, fallback = new Date()) => {
    if (!d) return fallback;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) {
        return fallback;
    }
    return parsed;
};

export const combineDateTime = (dateStr, timeStr = "00:00") => {
    const d = typeof dateStr === 'string' ? dateStr : new Date().toISOString().split('T')[0];
    const t = typeof timeStr === 'string' ? timeStr : "00:00";
    const isoString = `${d}T${t}:00+03:00`;
    const parsed = new Date(isoString);
    if (isNaN(parsed.getTime())) {
        return new Date(); 
    }
    return parsed;
};
