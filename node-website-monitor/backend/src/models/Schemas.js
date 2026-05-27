const mongoose = require('mongoose');

// ── Real Mongoose Schema Definitions ─────────────────────────────────────────
const monitorHistorySchema = new mongoose.Schema({
  url: { type: String, required: true },
  isUp: { type: Boolean, required: true },
  statusCode: { type: Number },
  loadTimeMs: { type: Number },
  ttfbMs: { type: Number },
  dnsResolutionTimeMs: { type: Number },
  ssl: {
    valid: { type: Boolean },
    daysRemaining: { type: Number },
    issuer: { type: String },
    expiryDate: { type: Date }
  },
  errors: [{ type: String }],
  seoData: { type: String },
  performanceData: { type: String },
  uiUxData: { type: String },
  securityData: { type: String },
  checkedAt: { type: Date, default: Date.now }
});

const wordpressMonitorSchema = new mongoose.Schema({
  url: { type: String, required: true },
  healthScore: { type: Number, default: 100 },
  coreVersion: { type: String },
  hasUpdate: { type: Boolean, default: false },
  plugins: [{
    name: { type: String },
    slug: { type: String },
    version: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'conflict'] },
    hasUpdate: { type: Boolean, default: false },
    hasVulnerability: { type: Boolean, default: false },
    vulnerabilityDetails: { type: String }
  }],
  themes: [{
    name: { type: String },
    slug: { type: String },
    version: { type: String },
    hasUpdate: { type: Boolean, default: false }
  }],
  adminAccessible: { type: Boolean, default: true },
  databaseConnected: { type: Boolean, default: true },
  wpDebugActive: { type: Boolean, default: false },
  debugLogsCount: { type: Number, default: 0 },
  pagesCrawled: [{
    url: { type: String },
    title: { type: String },
    statusCode: { type: Number },
    loadTimeMs: { type: Number },
    isUp: { type: Boolean }
  }],
  databaseHealth: {
    connected: { type: Boolean, default: true },
    latencyMs: { type: Number, default: 0 },
    engine: { type: String, default: 'MySQL' },
    status: { type: String, default: 'Healthy' },
    sizeMb: { type: Number, default: 0 },
    tableCount: { type: Number, default: 0 }
  },
  brokenLinks: [{
    url: { type: String },
    sourcePage: { type: String },
    statusCode: { type: Number },
    reason: { type: String },
    isInternal: { type: Boolean }
  }],
  formsAudited: [{
    formId: { type: String },
    actionUrl: { type: String },
    method: { type: String },
    inputsCount: { type: Number },
    hasCsrf: { type: Boolean },
    isInsecureSubmit: { type: Boolean },
    status: { type: String }
  }],
  googleAnalytics: {
    active: { type: Boolean, default: false },
    measurementId: { type: String, default: '' },
    tagType: { type: String, default: 'none' },
    status: { type: String, default: 'Not Found' }
  },
  lastChecked: { type: Date, default: Date.now }
});

const alertSchema = new mongoose.Schema({
  url: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['info', 'warning', 'critical'], required: true },
  message: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

const RealMonitorHistory = mongoose.model('RealMonitorHistory', monitorHistorySchema);
const RealWordPressMonitor = mongoose.model('RealWordPressMonitor', wordpressMonitorSchema);
const RealAlert = mongoose.model('RealAlert', alertSchema);

// ── In-Memory Datastore Fallback Layer ───────────────────────────────────────
let inMemoryHistory = [];
let inMemoryWordPress = [];
let inMemoryAlerts = [];

const isConnected = () => mongoose.connection.readyState === 1;

// ── 1. MonitorHistory Mock Wrapper ───────────────────────────────────────────
const MonitorHistory = {
  create: async (data) => {
    if (isConnected()) return await RealMonitorHistory.create(data);
    const log = { 
      ...data, 
      _id: 'history_' + Math.random().toString(36).substr(2, 9), 
      checkedAt: data.checkedAt || new Date() 
    };
    inMemoryHistory.unshift(log);
    return log;
  },
  insertMany: async (arr) => {
    if (isConnected()) return await RealMonitorHistory.insertMany(arr);
    const logs = arr.map(data => ({
      ...data,
      _id: 'history_' + Math.random().toString(36).substr(2, 9),
      checkedAt: data.checkedAt || new Date()
    }));
    inMemoryHistory = [...logs, ...inMemoryHistory];
    return logs;
  },
  find: (query = {}) => {
    const isConn = isConnected();
    const filterData = () => {
      let res = inMemoryHistory;
      if (query.url) {
        res = res.filter(item => item.url === query.url);
      }
      return res;
    };
    return {
      sort: (sortQuery) => ({
        limit: async (lim) => {
          if (isConn) return await RealMonitorHistory.find(query).sort(sortQuery).limit(lim);
          return filterData().slice(0, lim);
        }
      }),
      then: async (resolve) => {
        if (isConn) return resolve(await RealMonitorHistory.find(query));
        return resolve(filterData());
      }
    };
  },
  countDocuments: async (query = {}) => {
    if (isConnected()) return await RealMonitorHistory.countDocuments(query);
    let res = inMemoryHistory;
    if (query.url) {
      res = res.filter(item => item.url === query.url);
    }
    return res.length;
  }
};

// ── 2. WordPressMonitor Mock Wrapper ─────────────────────────────────────────
const WordPressMonitor = {
  findOne: async (query = {}) => {
    if (isConnected()) return await RealWordPressMonitor.findOne(query);
    return inMemoryWordPress.find(wp => wp.url === query.url) || null;
  },
  create: async (data) => {
    if (isConnected()) return await RealWordPressMonitor.create(data);
    const doc = { ...data, _id: 'wp_' + Math.random().toString(36).substr(2, 9), lastChecked: new Date() };
    inMemoryWordPress.push(doc);
    return doc;
  },
  findOneAndUpdate: async (query, updateData, options = {}) => {
    if (isConnected()) return await RealWordPressMonitor.findOneAndUpdate(query, updateData, options);
    
    let index = inMemoryWordPress.findIndex(wp => wp.url === query.url);
    if (index !== -1) {
      inMemoryWordPress[index] = { ...inMemoryWordPress[index], ...updateData, lastChecked: new Date() };
      return inMemoryWordPress[index];
    } else if (options.upsert) {
      const doc = { ...updateData, url: query.url, _id: 'wp_' + Math.random().toString(36).substr(2, 9), lastChecked: new Date() };
      inMemoryWordPress.push(doc);
      return doc;
    }
    return null;
  }
};

// ── 3. Alert Mock Wrapper ────────────────────────────────────────────────────
const Alert = {
  create: async (data) => {
    if (isConnected()) return await RealAlert.create(data);
    const alert = {
      ...data,
      _id: 'alert_' + Math.random().toString(36).substr(2, 9),
      resolved: false,
      createdAt: new Date()
    };
    // De-duplicate mock alerts to prevent spamming the dashboard in memory
    const exists = inMemoryAlerts.some(a => a.url === data.url && a.message === data.message && !a.resolved);
    if (!exists) {
      inMemoryAlerts.unshift(alert);
    }
    return alert;
  },
  find: (query = {}) => {
    const isConn = isConnected();
    const filterData = () => {
      let res = inMemoryAlerts;
      if (query.url) {
        res = res.filter(item => item.url === query.url);
      }
      if (query.resolved !== undefined) {
        res = res.filter(item => item.resolved === query.resolved);
      }
      return res;
    };
    return {
      sort: (sortQuery) => ({
        then: async (resolve) => {
          if (isConn) return resolve(await RealAlert.find(query).sort(sortQuery));
          return resolve(filterData());
        }
      }),
      then: async (resolve) => {
        if (isConn) return resolve(await RealAlert.find(query));
        return resolve(filterData());
      }
    };
  },
  findByIdAndUpdate: async (id, updateData, options = {}) => {
    if (isConnected()) return await RealAlert.findByIdAndUpdate(id, updateData, options);
    
    let index = inMemoryAlerts.findIndex(a => a._id === id);
    if (index !== -1) {
      inMemoryAlerts[index] = { ...inMemoryAlerts[index], ...updateData };
      return inMemoryAlerts[index];
    }
    return null;
  }
};

module.exports = {
  MonitorHistory,
  WordPressMonitor,
  Alert
};
