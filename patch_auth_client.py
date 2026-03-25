with open("scripts/fetch-analytics.js", "r") as f:
    content = f.read()

new_init = """
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
"""

content = content.replace("    const analyticsDataClient = new BetaAnalyticsDataClient();", new_init)

with open("scripts/fetch-analytics.js", "w") as f:
    f.write(content)
