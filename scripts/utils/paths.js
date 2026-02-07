import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root is 2 levels up from scripts/utils
export const ROOT_DIR = path.resolve(__dirname, '../../');
export const SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts');
export const POSTS_DIR = path.join(ROOT_DIR, 'content/posts');
export const DATA_DIR = path.join(ROOT_DIR, 'content/data');
export const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');

export function resolveRoot(...segments) {
    return path.join(ROOT_DIR, ...segments);
}
