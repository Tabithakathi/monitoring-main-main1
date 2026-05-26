const axios = require('axios');
const dns = require('dns').promises;
const tls = require('tls');
const cron = require('node-cron');
const { MonitorHistory, Alert } = require('../models/Schemas');

/**
 * Audit website availability, latency, DNS resolution speed, and SSL certificates.
 * 
 * @param {string} url - Target URL to inspect.
 * @returns {Promise<object>} Audit report payload.
 */
const checkWebsiteStatus = async (url) => {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  
  const auditReport = {
    url,
    isUp: false,
    statusCode: null,
    loadTimeMs: 0,
    ttfbMs: 0,
    dnsResolutionTimeMs: 0,
    ssl: {
      valid: false,
      daysRemaining: 0,
      issuer: 'unknown',
      expiryDate: null
    },
    errors: []
  };

  // 1. DNS Resolution Speed Audit
  const dnsStart = Date.now();
  try {
    const addresses = await dns.resolve4(hostname);
    auditReport.dnsResolutionTimeMs = Date.now() - dnsStart;
    if (!addresses || addresses.length === 0) {
      throw new Error('DNS lookup succeeded but returned no IP records.');
    }
  } catch (err) {
    auditReport.dnsResolutionTimeMs = Date.now() - dnsStart;
    auditReport.errors.push(`DNS Resolution failed: ${err.message}`);
  }

  // 2. HTTP status, TTFB, and latency tracking using axios
  const axiosInstance = axios.create({
    timeout: 10000,
    validateStatus: () => true // Resolve promise for all status codes
  });

  const httpStart = Date.now();
  let ttfbStart = 0;
  
  axiosInstance.interceptors.request.use((config) => {
    ttfbStart = Date.now();
    return config;
  });

  try {
    const response = await axiosInstance.get(url);
    auditReport.ttfbMs = Date.now() - ttfbStart;
    auditReport.loadTimeMs = Date.now() - httpStart;
    auditReport.statusCode = response.status;
    auditReport.isUp = response.status === 200;

    // Detect downtime and major server errors
    if (!auditReport.isUp) {
      auditReport.errors.push(`HTTP status returned: ${response.status}`);
      // Auto-trigger alerts in SRE logs
      await Alert.create({
        url,
        category: 'uptime',
        level: 'critical',
        message: `Downtime detected! Website returned HTTP ${response.status} status code.`
      });
    }

    // Verify HTTPS redirect enforce
    const finalUrl = response.request.res.responseUrl || '';
    if (url.startsWith('http://') && finalUrl.startsWith('https://')) {
      // HTTP -> HTTPS redirect verified
    } else if (url.startsWith('http://')) {
      auditReport.errors.push('HTTPS Enforcement check failed: No secure protocol redirect.');
    }

  } catch (err) {
    auditReport.isUp = false;
    auditReport.errors.push(`HTTP Request timed out or failed: ${err.message}`);
    
    // Auto-trigger alerts
    await Alert.create({
      url,
      category: 'uptime',
      level: 'critical',
      message: `Downtime detected! SRE gateway connection failed: ${err.message}`
    });
  }

  // 3. SSL certificate validity & expiry monitoring
  if (parsed.protocol === 'https:') {
    const sslStart = Date.now();
    try {
      const sslInfo = await checkSslCertificate(hostname);
      auditReport.ssl = sslInfo;
      
      if (!sslInfo.valid) {
        auditReport.errors.push(`SSL Handshake failed: ${sslInfo.message}`);
        await Alert.create({
          url,
          category: 'ssl',
          level: 'critical',
          message: `SSL Validation failed: ${sslInfo.message}`
        });
      } else if (sslInfo.daysRemaining < 30) {
        await Alert.create({
          url,
          category: 'ssl',
          level: 'warning',
          message: `SSL Certificate expires in ${sslInfo.daysRemaining} days! Renew immediately.`
        });
      }
    } catch (err) {
      auditReport.errors.push(`SSL Audit failed: ${err.message}`);
    }
  }

  // Save full audit report log in history collection
  const log = await MonitorHistory.create(auditReport);
  return log;
};

/**
 * Socket handshaker to resolve SSL/TLS certificates and parse expiry.
 * 
 * @param {string} hostname - Host address
 * @returns {Promise<object>} Certificate payload
 */
const checkSslCertificate = (hostname) => {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      servername: hostname,
      timeout: 5000,
      rejectUnauthorized: false // Connect anyway to read invalid certs too
    }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();

      if (!cert || Object.keys(cert).length === 0) {
        return resolve({
          valid: false,
          daysRemaining: 0,
          issuer: 'unknown',
          expiryDate: null,
          message: 'No certificate returned from host socket.'
        });
      }

      const expiryDate = new Date(cert.valid_to);
      const daysRemaining = Math.max(0, Math.round((expiryDate - new Date()) / (1000 * 60 * 60 * 24)));
      const isAuthorized = socket.authorized;

      resolve({
        valid: isAuthorized,
        daysRemaining,
        issuer: cert.issuer.O || cert.issuer.CN || 'unknown',
        expiryDate,
        message: isAuthorized ? 'SSL certificate is valid and secure.' : `SSL Verification Error: ${socket.authorizationError}`
      });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({
        valid: false,
        daysRemaining: 0,
        issuer: 'unknown',
        expiryDate: null,
        message: `Socket error during SSL handshake: ${err.message}`
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        valid: false,
        daysRemaining: 0,
        issuer: 'unknown',
        expiryDate: null,
        message: 'SSL Handshake connection timed out.'
      });
    });
  });
};

/**
 * Helper to compile complete stats report for a website
 */
const compileStats = async (url) => {
  const { WordPressMonitor, Alert } = require('../models/Schemas');
  
  const filter = { url };
  const history = await MonitorHistory.find(filter).sort({ checkedAt: -1 }).limit(30);
  
  const allChecks = await MonitorHistory.find(filter);
  const totalChecks = allChecks.length;
  const successfulChecks = allChecks.filter(h => h.isUp).length;
  const uptimePercentage = totalChecks > 0 ? parseFloat(((successfulChecks / totalChecks) * 100).toFixed(2)) : 100;
  
  const wordpress = await WordPressMonitor.findOne(filter);
  const activeAlerts = await Alert.find({ url, resolved: false }).sort({ createdAt: -1 });

  return {
    url,
    uptimePercentage,
    totalChecks,
    latestStatus: history[0] || null,
    historyLog: history,
    wordpress,
    activeAlerts
  };
};

/**
 * Initialize 24/7 cron-driven audit loops with websocket broadcast channel.
 */
const startUptimeScheduler = (io) => {
  const cronExpression = process.env.MONITOR_CRON || '*/5 * * * *';
  const monitorUrl = process.env.DEFAULT_MONITOR_URL || 'https://wordpress.org';

  console.log(`⏱️ Uptime cron scheduler initialized [Cron: "${cronExpression}"] targeting url: ${monitorUrl}`);
  
  cron.schedule(cronExpression, async () => {
    console.log(`🔄 Cron Auditer: Auditing URL state at [${new Date().toLocaleTimeString()}]...`);
    try {
      await checkWebsiteStatus(monitorUrl);
      
      // If WebSockets is active, compile complete status and emit immediately
      if (io) {
        console.log(`📡 WebSocket Emitter: Broadcasting updated stats for ${monitorUrl}`);
        const freshStats = await compileStats(monitorUrl);
        io.emit('auditCompleted', freshStats);
      }
    } catch (err) {
      console.error(`❌ Cron Auditer error: ${err.message}`);
    }
  });
};

module.exports = {
  checkWebsiteStatus,
  startUptimeScheduler,
  compileStats
};
