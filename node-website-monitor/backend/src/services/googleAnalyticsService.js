const { google } = require('googleapis');

/**
 * Fetch GA4 report view counts using service account.
 * 
 * @param {string} propertyId - The GA4 Property ID.
 * @param {string} clientEmail - Google Cloud Service Account client email.
 * @param {string} privateKey - Google Cloud Service Account private key.
 * @returns {Promise<object>} Result containing success status and viewsCount or error message.
 */
const fetchGoogleAnalyticsStats = async (propertyId, clientEmail, privateKey) => {
  try {
    if (!propertyId || !clientEmail || !privateKey) {
      return { success: false, error: 'Missing configuration credentials.' };
    }

    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/analytics.readonly']
    );

    const analyticsdata = google.analyticsdata({
      version: 'v1beta',
      auth
    });

    const response = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today'
          }
        ],
        metrics: [
          {
            name: 'screenPageViews'
          }
        ]
      }
    });

    let viewsCount = 0;
    if (response.data && response.data.rows) {
      for (const row of response.data.rows) {
        if (row.metricValues && row.metricValues[0]) {
          viewsCount += parseInt(row.metricValues[0].value || '0', 10);
        }
      }
    }
    return {
      success: true,
      viewsCount
    };
  } catch (err) {
    console.error('Error fetching GA4 stats:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Scans HTML content to detect Google Analytics / Google Tag Manager script signatures.
 * 
 * @param {string} html - Raw page HTML content.
 * @returns {object|null} Returns an object with measurementId and tagType, or null if not detected.
 */
const detectGoogleAnalyticsTag = (html) => {
  if (!html || typeof html !== 'string') return null;

  const gtagMatch = html.match(/googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+|UA-[0-9]+-[0-9]+)/i);
  if (gtagMatch && gtagMatch[1]) {
    return { measurementId: gtagMatch[1], tagType: 'gtag' };
  }

  const gtmMatch = html.match(/googletagmanager\.com\/gtm\.js\?id=(GTM-[A-Z0-9]+)/i);
  if (gtmMatch && gtmMatch[1]) {
    return { measurementId: gtmMatch[1], tagType: 'gtm' };
  }

  const gaMatch = html.match(/ga\('create',\s*['"](UA-[0-9]+-[0-9]+)['"]/i);
  if (gaMatch && gaMatch[1]) {
    return { measurementId: gaMatch[1], tagType: 'ga' };
  }

  return null;
};

module.exports = {
  fetchGoogleAnalyticsStats,
  detectGoogleAnalyticsTag
};
