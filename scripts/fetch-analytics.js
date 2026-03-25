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
    let credentials;
    if (process.env.GA4_SECRET_JSON) {
        try {
            credentials = JSON.parse(process.env.GA4_SECRET_JSON);
            console.log('✅ Found GA4 credentials from environment variable.');
        } catch(e) {
            console.error('❌ Failed to parse GA4_SECRET_JSON:', e.message);
        }
    }

    const analyticsDataClient = credentials ? new BetaAnalyticsDataClient({ credentials }) : new BetaAnalyticsDataClient();

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
      const rawPath = row.dimensionValues[0].value;
      const views = parseInt(row.metricValues[0].value, 10);
      
      let decodedPath = rawPath;
      try { decodedPath = decodeURIComponent(rawPath); } catch(e) {}

      // Normalize path to get the exact slug
      // E.g. "/article-my-slug.html?fbclid=123" -> "my-slug"
      const slugMatch = decodedPath.match(/^\/article-([^/?#\.]+)/);
      if (slugMatch) {
          const slug = slugMatch[1].trim().toLowerCase();
          analyticsData[slug] = (analyticsData[slug] || 0) + views;
      } else if (decodedPath === '/' || decodedPath.startsWith('/index.html')) {
          analyticsData['/'] = (analyticsData['/'] || 0) + views;
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
