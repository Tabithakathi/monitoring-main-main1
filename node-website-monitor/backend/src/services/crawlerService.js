const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const cleanUrl = (url) => {
  if (!url) return '';
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
};

/**
 * Crawl internal links recursively up to maxPages.
 * 
 * @param {string} baseUrl - Base URL to start crawling.
 * @param {number} maxPages - Maximum page limits to crawl.
 * @returns {Promise<Array<object>>} Crawled pages data including url, title, html, statusCode, and loadTimeMs.
 */
const crawlSite = async (baseUrl, maxPages = 10) => {
  const normalizedBase = cleanUrl(baseUrl);
  let baseHostname = '';
  try {
    baseHostname = new URL(normalizedBase).hostname;
  } catch (e) {
    return [];
  }

  const visited = new Set();
  const queue = [normalizedBase];
  const results = [];

  const client = axios.create({
    timeout: 3000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MonitorProSRE/1.0' },
    validateStatus: () => true,
    httpsAgent
  });

  while (queue.length > 0 && results.length < maxPages) {
    const currentUrl = queue.shift();
    const normalizedCurrent = cleanUrl(currentUrl);

    if (visited.has(normalizedCurrent)) continue;
    visited.add(normalizedCurrent);

    const pageResult = {
      url: normalizedCurrent,
      title: 'Audited Page',
      statusCode: 0,
      loadTimeMs: 0,
      html: '',
      isUp: false
    };

    const start = Date.now();
    try {
      const resp = await client.get(normalizedCurrent);
      pageResult.loadTimeMs = Date.now() - start;
      pageResult.statusCode = resp.status;
      pageResult.isUp = resp.status === 200;
      pageResult.html = resp.data || '';

      const $ = cheerio.load(pageResult.html);
      
      // Get title
      const titleText = $('title').text().trim();
      if (titleText) {
        pageResult.title = titleText;
      } else {
        const path = new URL(normalizedCurrent).pathname;
        if (path && path !== '/') {
          pageResult.title = path.split('/').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      }

      results.push(pageResult);

      // Collect links from the current page to expand queue
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        try {
          const absolute = new URL(href, normalizedCurrent);
          // Only crawl same hostname
          if (absolute.hostname === baseHostname) {
            const cleanedLink = cleanUrl(absolute.href);
            if (!visited.has(cleanedLink) && !queue.includes(cleanedLink)) {
              queue.push(cleanedLink);
            }
          }
        } catch (e) {}
      });

    } catch (err) {
      pageResult.loadTimeMs = Date.now() - start;
      pageResult.statusCode = err.response?.status || 500;
      pageResult.isUp = false;
      pageResult.html = '';
      results.push(pageResult);
    }
  }

  return results;
};

module.exports = { crawlSite };
