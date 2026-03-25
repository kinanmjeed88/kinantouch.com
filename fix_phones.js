import fs from 'fs';
import { phonesDatabase } from './assets/js/phones-data.js';

fs.writeFileSync('content/data/phones.json', JSON.stringify(phonesDatabase, null, 2));
