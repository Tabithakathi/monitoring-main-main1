const express = require('express');
const router = express.Router();
const {
  triggerAudit,
  getDashboardStats,
  getWordPressDetails,
  getAlerts,
  resolveAlert
} = require('../controllers/monitorController');

// Immediate Site Audit Trigger
router.post('/audit', triggerAudit);

// Dashboard stats & historical graphs payload
router.get('/stats', getDashboardStats);

// Wordpress details
router.get('/wordpress', getWordPressDetails);

// SRE alerts logs
router.get('/alerts', getAlerts);

// Resolve active alerts
router.post('/alerts/resolve', resolveAlert);

module.exports = router;
