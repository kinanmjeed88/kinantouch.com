import fs from 'fs';
import path from 'path';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';
import { ROOT_DIR } from './utils/paths.js';

dotenv.config();

const propertyId = '521215223'; // User provided GA4 Property ID
const outputPath = path.join(ROOT_DIR, 'content/data/analytics.json');

async function main() {
  console.log('🔄 Fetching GA4 Analytics...');

  try {
    // Requires GOOGLE_APPLICATION_CREDENTIALS in .env pointing to the JSON key file
    // Or set the env var directly in CI/CD (GitHub Secrets)
    const analyticsDataClient = new BetaAnalyticsDataClient();

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '2024-01-01', // Or '30daysAgo'
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'pagePath',
        },
      ],
      metrics: [
        {
          name: 'screenPageViews',
        },
      ],
    });

    const analyticsData = {};

    response.rows.forEach(row => {
      const path = row.dimensionValues[0].value;
      const views = parseInt(row.metricValues[0].value, 10);
      
      // Filter out non-article paths if necessary, or just store all
      // Typically path is like "/article-xyz.html" or "/"
      if (path.startsWith('/article-') || path === '/') {
          analyticsData[path] = views;
      }
    });

    // Save to file for static generation
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(analyticsData, null, 2), 'utf-8');
    
    console.log('✅ Analytics data fetched and saved to content/data/analytics.json');
  } catch (error) {
    console.error('❌ Failed to fetch Analytics:', error.message);
    // If it fails (e.g., no credentials), we write an empty object so the build doesn't crash
    if (!fs.existsSync(outputPath)) {
        fs.writeFileSync(outputPath, JSON.stringify({}, null, 2), 'utf-8');
    }
  }
}

main();
