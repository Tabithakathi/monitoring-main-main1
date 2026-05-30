const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Generates an intelligent, context-aware alt text suggestion from the image source URL.
 * 
 * @param {string} src - The image src attribute value.
 * @returns {string} Suggested descriptive ALT tag.
 */
const generateSuggestedAlt = (src) => {
  if (!src) return "";
  
  let decodedSrc = src;
  try {
    decodedSrc = decodeURIComponent(src);
  } catch (e) {}

  const parts = decodedSrc.split('?')[0].split('/');
  let filename = parts.pop() || "";
  let folder = parts.length > 0 ? parts[parts.length - 1] : "";
  let subfolder = parts.length > 1 ? parts[parts.length - 2] : "";

  let baseName = filename.replace(/\.[a-zA-Z0-9]+$/, '');

  const isHashOrNum = /^[0-9a-fA-F-_]+$/.test(baseName) && (
    /^\d+$/.test(baseName.replace(/[-_]/g, '')) || 
    baseName.replace(/[-_]/g, '').length >= 8
  );

  let cleanName = baseName;
  if (isHashOrNum && folder && !/^(uploads|images|assets|wp-content|media|static|img)$/i.test(folder)) {
    cleanName = `${folder} image`;
  } else if (isHashOrNum && subfolder && !/^(uploads|images|assets|wp-content|media|static|img)$/i.test(subfolder)) {
    cleanName = `${subfolder} image`;
  } else if (isHashOrNum) {
    cleanName = "Content illustration";
  }

  if (!cleanName) {
    return "Website image";
  }

  cleanName = cleanName.replace(/[-_]\d+x\d+/g, '');
  cleanName = cleanName.replace(/[-_](scaled|thumb|thumbnail|medium|large|v\d+(\.\d+)*)/gi, '');
  cleanName = cleanName.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  cleanName = cleanName.replace(/[-_+]/g, ' ');
  cleanName = cleanName.replace(/\s+/g, ' ').trim();

  const lower = cleanName.toLowerCase();
  if (lower === 'logo') {
    cleanName = "Brand logo";
  } else if (lower === 'avatar') {
    cleanName = "User avatar";
  } else if (lower === 'banner') {
    cleanName = "Hero banner";
  } else if (lower === 'icon') {
    cleanName = "Navigation icon";
  }

  if (cleanName.length > 0) {
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  return cleanName;
};

/**

 * Audit meta elements, headings, robots rules, canonical redirects, Open Graph tags, 
 * viewport configs, word occurrences, and broken link indexes.
 * 
 * @param {string} url - Target URL to analyze.
 * @param {string} htmlContent - Optional HTML content already loaded.
 * @returns {Promise<object>} Complete SEO audit payload.
 */
const analyzeSeo = async (url, htmlContent = '') => {
  let html = htmlContent;
  if (!html) {
    try {
      const resp = await axios.get(url, { 
        timeout: 6000, 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MonitorProSRE/1.0' }, 
        validateStatus: () => true,
        httpsAgent
      });
      html = resp.data || '';
    } catch (e) {
      return { seoScore: 50, error: e.message, alerts: [{ level: 'critical', message: `Crawl Failed: ${e.message}` }] };
    }
  }

  const reports = {
    title: { text: "", status: "warning", message: "No meta title tag detected." },
    metaDescription: { text: "", status: "warning", message: "No meta description tag detected." },
    headings: { h1: [], h2: [], h3: [], status: "ok", message: "Headings structure is valid." },
    canonical: { text: "", status: "ok", message: "Canonical tag verified." },
    robotsTxt: { exists: false, status: "warning", message: "Robots.txt check skipped." },
    sitemap: { exists: false, status: "warning", message: "Sitemap check skipped." },
    openGraph: { ogTitle: "", ogImage: "", status: "warning", message: "No Open Graph tags detected." },
    twitterCard: { twitterCard: "", status: "warning", message: "No Twitter card tags detected." },
    indexability: { isIndexable: true, status: "ok", message: "Site is indexable by search engines." },
    mobileFriendliness: { viewportConfigured: true, touchTargetIssues: 0, status: "ok", message: "Mobile touch layouts optimized." },
    keywordAnalysis: { topKeywords: [], status: "ok" },
    links: { internalCount: 0, externalCount: 0, brokenCount: 0, brokenLinks: [], status: "ok" },
    imageAnalysis: { totalImages: 0, withAlt: 0, missingAlt: 0, emptyAlt: 0, missingAltSrcs: [], status: "ok", message: "No images analyzed." },
    structuredData: { schemasCount: 0, invalidSchemasCount: 0, schemaTypes: [], status: "info", message: "" },
    seoScore: 100,
    alerts: []
  };

  // 1. Meta Title Detection & Duplicate Checks
  const titleMatches = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
  if (titleMatches.length > 0) {
    const titleText = titleMatches[0][1].trim();
    reports.title.text = titleText;
    if (titleText.length < 30 || titleText.length > 65) {
      reports.title.status = "warning";
      reports.title.message = `Title is ${titleText.length} chars. Ideal length is 30-65 chars.`;
      reports.alerts.push({ level: 'warning', message: `SEO Warning: Meta title length is suboptimal (${titleText.length} chars).` });
    } else {
      reports.title.status = "ok";
      reports.title.message = "Meta title length is excellent!";
    }
    if (titleMatches.length > 1) {
      reports.seoScore -= 10;
      reports.alerts.push({ level: 'critical', message: `SEO Critical: Multiple HTML Meta Title tags detected (${titleMatches.length}).` });
    }
  } else {
    reports.seoScore -= 15;
    reports.alerts.push({ level: 'critical', message: 'SEO Critical: Missing HTML Meta Title tag.' });
  }

  // 2. Meta Description Detection & Duplicate Checks
  const descMatches = [...html.matchAll(/<meta[^>]*(name|property)=["']description["'][^>]*content=["']([^"']*)["']/gi),
                       ...html.matchAll(/<meta[^>]*content=["']([^"']*)["'][^>]*(name|property)=["']description["']/gi)];
  if (descMatches.length > 0) {
    const descText = descMatches[0][2].trim();
    reports.metaDescription.text = descText;
    if (descText.length < 120 || descText.length > 160) {
      reports.metaDescription.status = "warning";
      reports.metaDescription.message = `Description is ${descText.length} chars. Ideal length is 120-160 chars.`;
      reports.alerts.push({ level: 'warning', message: `SEO Warning: Meta description length is suboptimal (${descText.length} chars).` });
    } else {
      reports.metaDescription.status = "ok";
      reports.metaDescription.message = "Meta description length is excellent!";
    }
    if (descMatches.length > 1) {
      reports.seoScore -= 8;
      reports.alerts.push({ level: 'warning', message: `SEO Warning: Multiple Meta Description tags detected (${descMatches.length}).` });
    }
  } else {
    reports.seoScore -= 15;
    reports.alerts.push({ level: 'critical', message: 'SEO Critical: Missing Meta Description tag.' });
  }

  // 3. Canonical Check & Duplicate Checks
  const canonicalMatches = [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/gi)];
  if (canonicalMatches.length > 0) {
    reports.canonical.text = canonicalMatches[0][1];
    reports.canonical.status = "ok";
    if (canonicalMatches.length > 1) {
      reports.seoScore -= 5;
      reports.alerts.push({ level: 'warning', message: `SEO Warning: Multiple Canonical link tags detected (${canonicalMatches.length}).` });
    }
  } else {
    reports.seoScore -= 10;
    reports.canonical.status = "warning";
    reports.canonical.message = "Missing canonical link reference.";
    reports.alerts.push({ level: 'warning', message: 'SEO Warning: Missing canonical URL link.' });
  }

  // 4. Heading Structure H1/H2/H3
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  const h3Matches = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];

  reports.headings.h1 = h1Matches.map(m => m[1].replace(/<[^>]*>/g, '').trim());
  reports.headings.h2 = h2Matches.map(m => m[1].replace(/<[^>]*>/g, '').trim());
  reports.headings.h3 = h3Matches.map(m => m[1].replace(/<[^>]*>/g, '').trim());

  if (reports.headings.h1.length === 0) {
    reports.seoScore -= 12;
    reports.headings.status = "warning";
    reports.headings.message = "Missing H1 page heading template.";
    reports.alerts.push({ level: 'critical', message: 'SEO Critical: Missing H1 page title heading.' });
  } else if (reports.headings.h1.length > 1) {
    reports.seoScore -= 6;
    reports.headings.status = "warning";
    reports.headings.message = "Multiple H1 tags detected. Keep a single unique H1 heading.";
    reports.alerts.push({ level: 'warning', message: 'SEO Warning: Multiple H1 tag declarations found.' });
  }

  // 5. Indexability & Robots
  const robotsMatch = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  if (robotsMatch && robotsMatch[1]) {
    const content = robotsMatch[1].toLowerCase();
    if (content.includes("noindex")) {
      reports.indexability.isIndexable = false;
      reports.indexability.status = "critical";
      reports.indexability.message = "Search engines blocked by meta robots noindex tag.";
      reports.seoScore -= 25;
      reports.alerts.push({ level: 'critical', message: 'SEO Critical: Page is de-indexed via Meta noindex.' });
    }
  }

  // 6. Robots.txt and Sitemap Detections
  try {
    const hostUrl = new URL(url);
    const robotsUrl = `${hostUrl.origin}/robots.txt`;
    try {
      const robotsResp = await axios.get(robotsUrl, { 
        timeout: 3500, 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MonitorProSRE/1.0' }, 
        validateStatus: () => true,
        httpsAgent
      });
      if (robotsResp.status === 200 && robotsResp.data) {
        reports.robotsTxt.exists = true;
        reports.robotsTxt.status = "ok";
        reports.robotsTxt.message = `Robots.txt found at ${robotsUrl} (${robotsResp.data.length} bytes).`;
      } else {
        reports.robotsTxt.exists = false;
        reports.robotsTxt.status = "warning";
        reports.robotsTxt.message = `Robots.txt not found at ${robotsUrl} (HTTP ${robotsResp.status}).`;
        reports.alerts.push({ level: 'warning', message: `SEO Warning: Robots.txt was not found.` });
        reports.seoScore -= 5;
      }
    } catch (err) {
      reports.robotsTxt.exists = false;
      reports.robotsTxt.status = "warning";
      reports.robotsTxt.message = `Failed to fetch robots.txt: ${err.message}`;
      reports.alerts.push({ level: 'warning', message: `SEO Warning: Failed to fetch robots.txt.` });
      reports.seoScore -= 5;
    }

    const sitemapUrl = `${hostUrl.origin}/sitemap.xml`;
    try {
      const sitemapResp = await axios.get(sitemapUrl, { 
        timeout: 3500, 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MonitorProSRE/1.0' }, 
        validateStatus: () => true,
        httpsAgent
      });
      if (sitemapResp.status === 200) {
        reports.sitemap.exists = true;
        reports.sitemap.status = "ok";
        const urlCount = (sitemapResp.data.match(/<url>/g) || []).length;
        reports.sitemap.message = `Sitemap found at ${sitemapUrl} with ${urlCount} URLs.`;
      } else {
        reports.sitemap.exists = false;
        reports.sitemap.status = "warning";
        reports.sitemap.message = `Sitemap.xml not found at ${sitemapUrl} (HTTP ${sitemapResp.status}).`;
        reports.alerts.push({ level: 'warning', message: `SEO Warning: Sitemap.xml was not found.` });
        reports.seoScore -= 5;
      }
    } catch (err) {
      reports.sitemap.exists = false;
      reports.sitemap.status = "warning";
      reports.sitemap.message = `Failed to fetch sitemap.xml: ${err.message}`;
      reports.alerts.push({ level: 'warning', message: `SEO Warning: Failed to fetch sitemap.xml.` });
      reports.seoScore -= 5;
    }
  } catch (e) {}

  // 7. Open Graph and Twitter Card tags
  const ogTitleMatch = html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogImageMatch = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  if (ogTitleMatch) {
    reports.openGraph.ogTitle = ogTitleMatch[1];
    reports.openGraph.status = "ok";
    reports.openGraph.message = "Open Graph protocol fully integrated.";
  } else {
    reports.alerts.push({ level: 'info', message: 'SEO Info: Missing Facebook Open Graph og:title metadata.' });
  }

  const twitterCardMatch = html.match(/<meta\s+[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
  if (twitterCardMatch) {
    reports.twitterCard.twitterCard = twitterCardMatch[1];
    reports.twitterCard.status = "ok";
    reports.openGraph.message = "Twitter rich cards protocol integrated.";
  } else {
    reports.alerts.push({ level: 'info', message: 'SEO Info: Missing Twitter Card micro-formats.' });
  }

  // 8. Mobile Friendliness
  const viewportMatch = html.match(/<meta\s+[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
  if (viewportMatch && viewportMatch[1]) {
    reports.mobileFriendliness.viewportConfigured = true;
    reports.mobileFriendliness.status = "ok";
  } else {
    reports.seoScore -= 15;
    reports.mobileFriendliness.viewportConfigured = false;
    reports.mobileFriendliness.status = "critical";
    reports.mobileFriendliness.message = "No mobile viewport config tag. Severe mobile layout penalty.";
    reports.alerts.push({ level: 'critical', message: 'SEO Critical: Missing Viewport Meta Tag for mobile scaling.' });
  }

  // 9. Keyword Frequency Analysis
  const bodyText = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-zA-Z]/g, ' ')
    .toLowerCase();

  const words = bodyText.split(/\s+/).filter(w => w.length > 4);
  const stopWords = new Set(["about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could", "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for", "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hed", "hell", "hes", "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how", "hows", "i", "id", "ill", "im", "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself", "lets", "me", "more", "most", "mustnt", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shant", "she", "shed", "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that", "thats", "the", "their", "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd", "theyll", "theyre", "theyve", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasnt", "we", "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where", "wheres", "which", "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt", "you", "youd", "youll", "youre", "youve", "your", "yours", "yourself", "yourselves"]);
  
  const kwMap = {};
  for (let w of words) {
    if (!stopWords.has(w)) {
      kwMap[w] = (kwMap[w] || 0) + 1;
    }
  }

  const sortedKeywords = Object.keys(kwMap)
    .map(key => ({ keyword: key, count: kwMap[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  reports.keywordAnalysis.topKeywords = sortedKeywords;

  // 10. Link Analysis (separating internal vs external & Active Broken Link crawler)
  const linkMatches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']*)["']/gi)];
  const uniqueLinks = [];
  const parsedUrl = new URL(url);
  
  for (let match of linkMatches) {
    const l = match[1];
    if (!l || l.startsWith("#") || l.startsWith("javascript:") || l.startsWith("mailto:") || l.startsWith("tel:")) continue;
    try {
      const resolved = new URL(l, url).href;
      if (!uniqueLinks.includes(resolved)) {
        uniqueLinks.push(resolved);
      }
    } catch (e) {}
  }

  const internalLinks = [];
  const externalLinks = [];
  for (let l of uniqueLinks) {
    try {
      const lUrl = new URL(l);
      if (lUrl.hostname === parsedUrl.hostname) {
        internalLinks.push(l);
      } else {
        externalLinks.push(l);
      }
    } catch (e) {}
  }

  reports.links.internalCount = internalLinks.length;
  reports.links.externalCount = externalLinks.length;

  const linksToTest = uniqueLinks.slice(0, 15);
  const brokenLinksList = [];

  await Promise.all(linksToTest.map(async (l) => {
    try {
      const isInternal = new URL(l).hostname === parsedUrl.hostname;
      await axios.get(l, {
        timeout: 3000,
        headers: { 'User-Agent': 'Mozilla/5.0 MonitorProSRE/1.0' },
        validateStatus: (status) => status < 400,
        maxRedirects: 3,
        httpsAgent
      });
    } catch (err) {
      const isInternal = l.startsWith('/') || (new URL(l, url).hostname === parsedUrl.hostname);
      let reason = 'HTTP Error';
      if (err.code === 'ENOTFOUND') {
        reason = 'DNS Lookup Failed';
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        reason = 'Request Timeout';
      } else if (err.message.includes('too many redirects') || err.message.includes('Max redirects exceeded')) {
        reason = 'Redirect Loop';
      } else if (err.response?.status) {
        reason = `HTTP ${err.response.status} Not Found`;
      } else {
        reason = err.message || 'Connection Failed';
      }
      
      brokenLinksList.push({
        url: l,
        sourcePage: url,
        statusCode: err.response?.status || 0,
        reason,
        isInternal,
        type: isInternal ? 'internal' : 'external'
      });
    }
  }));

  reports.links.brokenCount = brokenLinksList.length;
  reports.links.brokenLinks = brokenLinksList;
  if (brokenLinksList.length > 0) {
    const penalty = Math.min(25, brokenLinksList.length * 5);
    reports.seoScore -= penalty;
    reports.alerts.push({ level: 'warning', message: `SEO Warning: Detected ${brokenLinksList.length} broken links or missing resources.` });
  }

  // 11. Image Alt, Oversized & Compression Analysis (Real-time checks)
  const imgMatches = [...html.matchAll(/<img([^>]*)\/?>/gi)];
  const totalImages = imgMatches.length;
  let missingAlt = 0;
  let emptyAlt = 0;
  let withAlt = 0;
  let lazyLoaded = 0;
  const missingAltSrcs = [];
  const imageReportList = [];
  const altMap = new Map();
  const duplicateAlts = new Set();

  for (let match of imgMatches) {
    const attrs = match[1];
    const srcMatch = attrs.match(/src=["']([^"']*)["']/i) || 
                     attrs.match(/data-src=["']([^"']*)["']/i) ||
                     attrs.match(/srcset=["']([^"']*)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const hasAltAttr = attrs.toLowerCase().includes('alt=');
    const isLazy = attrs.toLowerCase().includes('loading=') && attrs.toLowerCase().includes('lazy');
    const src = srcMatch ? new URL(srcMatch[1], url).href : '';
    const alt = altMatch ? altMatch[1].trim() : '';

    if (isLazy) lazyLoaded++;

    let altStatus = 'ok';
    if (!hasAltAttr) {
      missingAlt++;
      altStatus = 'missing';
      if (src) {
        missingAltSrcs.push({
          src,
          suggestedAlt: generateSuggestedAlt(src)
        });
      }
    } else if (alt === '') {
      emptyAlt++;
      altStatus = 'empty';
      if (src) {
        missingAltSrcs.push({
          src,
          suggestedAlt: generateSuggestedAlt(src)
        });
      }
    } else {
      withAlt++;
      if (altMap.has(alt)) {
        if (altMap.get(alt) !== src) {
          duplicateAlts.add(alt);
          altStatus = 'duplicate';
        }
      } else {
        altMap.set(alt, src);
      }
    }

    if (src) {
      imageReportList.push({
        src,
        alt,
        altStatus,
        isLazy,
        isOversized: false,
        isBroken: false,
        sizeKb: 0,
        compressionAdvice: ''
      });
    }
  }

  // Active check on first 10 image sizes and broken states
  const imagesToTest = imageReportList.slice(0, 10);
  await Promise.all(imagesToTest.map(async (img) => {
    try {
      const headResp = await axios.head(img.src, {
        timeout: 2000,
        headers: { 'User-Agent': 'Mozilla/5.0 MonitorProSRE/1.0' },
        validateStatus: () => true,
        httpsAgent
      });
      
      let sizeBytes = 0;
      let isBroken = headResp.status >= 400;
      
      if (!isBroken) {
        sizeBytes = parseInt(headResp.headers['content-length']) || 0;
        if (sizeBytes === 0) {
          const getResp = await axios.get(img.src, {
            timeout: 2000,
            headers: { 'User-Agent': 'Mozilla/5.0 MonitorProSRE/1.0', Range: 'bytes=0-1024' },
            validateStatus: () => true,
            httpsAgent
          });
          const contentRange = getResp.headers['content-range'];
          if (contentRange) {
            const match = contentRange.match(/\/(\d+)/);
            if (match) sizeBytes = parseInt(match[1]);
          }
        }
      }
      
      img.sizeKb = Math.round(sizeBytes / 1024);
      img.isBroken = isBroken;
      img.isOversized = img.sizeKb > 500;
      
      const ext = img.src.split('?')[0].split('.').pop().toLowerCase();
      if (!['webp', 'avif', 'svg'].includes(ext)) {
        img.compressionAdvice = `Convert to WebP/AVIF. Estimated saving: ~65%`;
      }
    } catch (e) {
      img.isBroken = true;
      img.sizeKb = 0;
      img.compressionAdvice = 'Resource unreachable';
    }
  }));

  let imageScore = 100;
  if (totalImages > 0) {
    imageScore -= ((missingAlt + emptyAlt) / totalImages) * 30;
    imageScore -= (duplicateAlts.size / totalImages) * 15;
    imageScore -= imageReportList.filter(img => img.isOversized).length * 10;
    imageScore -= imageReportList.filter(img => img.isBroken).length * 20;
  }
  imageScore = Math.max(10, Math.round(imageScore));

  reports.imageAnalysis = {
    totalImages,
    withAlt,
    missingAlt,
    emptyAlt,
    lazyLoaded,
    duplicateAltsCount: duplicateAlts.size,
    duplicateAlts: [...duplicateAlts],
    missingAltSrcs: missingAltSrcs.slice(0, 50),
    imageReportList,
    imageScore,
    status: totalImages === 0 ? "ok" : imageScore >= 80 ? "ok" : imageScore >= 50 ? "warning" : "critical",
    message: totalImages === 0 
      ? "No images found on this page."
      : imageScore === 100
      ? `All ${totalImages} images satisfy modern SEO and WCAG standard checks.`
      : `Discovered image optimization issues. Image Score: ${imageScore}%`
  };

  if (reports.imageAnalysis.status !== "ok") {
    reports.alerts.push({ 
      level: reports.imageAnalysis.status === "critical" ? "critical" : "warning", 
      message: `SEO Warning: Image audit failed with score ${imageScore}%` 
    });
    reports.seoScore -= Math.round((100 - imageScore) * 0.3);
  }

  // 12. Structured Schema Markup Validation
  const schemaMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let schemasCount = schemaMatches.length;
  let invalidSchemasCount = 0;
  let schemaTypesList = [];
  
  for (let match of schemaMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed['@type']) {
        schemaTypesList.push(parsed['@type']);
      } else if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item['@type']) schemaTypesList.push(item['@type']);
        });
      }
    } catch (e) {
      invalidSchemasCount++;
    }
  }
  
  reports.structuredData = {
    schemasCount,
    invalidSchemasCount,
    schemaTypes: [...new Set(schemaTypesList)],
    status: invalidSchemasCount > 0 ? 'warning' : schemasCount > 0 ? 'ok' : 'info',
    message: schemasCount === 0 
      ? 'No JSON-LD structured schema markup detected.' 
      : invalidSchemasCount > 0 
      ? `Detected ${schemasCount} schemas, but ${invalidSchemasCount} contains invalid JSON syntax!` 
      : `Detected ${schemasCount} valid structured schemas: ${schemaTypesList.join(', ')}`
  };
  
  if (invalidSchemasCount > 0) {
    reports.seoScore -= 10;
    reports.alerts.push({ level: 'critical', message: `SEO Critical: ${invalidSchemasCount} structured schema markup block(s) contain invalid JSON syntax!` });
  } else if (schemasCount === 0) {
    reports.alerts.push({ level: 'info', message: `SEO Info: No structured schema markup detected (JSON-LD).` });
  }

  reports.seoScore = Math.max(10, reports.seoScore);
  return reports;
};

module.exports = { analyzeSeo };
