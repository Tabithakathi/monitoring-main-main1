const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../../../sre_settings.json');
const emailLogPath = path.join(__dirname, '../../../email_delivery.log');

/**
 * Get SRE Settings & Email Delivery logs
 */
const getSettings = async (req, res) => {
  let settings = {
    slack_webhook: '',
    telegram_chat_id: '',
    critical_email: '',
    email_host_user: '',
    email_host_password: '',
    alert_email_recipients: '',
    alerts_enabled: true
  };

  // Read sre_settings.json
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = { ...settings, ...JSON.parse(data) };
      // Default alerts_enabled to true if not specified
      if (settings.alerts_enabled === undefined) {
        settings.alerts_enabled = true;
      }
    }
  } catch (err) {
    console.error('⚠️ Failed to read SRE settings file:', err.message);
  }

  // Parse email logs to serve as a history stream and chart data
  let logs = [];
  try {
    if (fs.existsSync(emailLogPath)) {
      const logContent = fs.readFileSync(emailLogPath, 'utf8');
      const blocks = logContent.split('--------------------------------------------------');
      
      blocks.forEach(block => {
        if (!block.trim()) return;
        
        const timeMatch = block.match(/\[(.*?)\]/);
        const recipientMatch = block.match(/EMAIL DISPATCHED TO: (.*?)\n/);
        const subjectMatch = block.match(/SUBJECT: (.*?)\n/);
        
        if (timeMatch && recipientMatch && subjectMatch) {
          const subject = subjectMatch[1];
          let level = 'info';
          if (subject.toLowerCase().includes('critical')) level = 'critical';
          else if (subject.toLowerCase().includes('warning')) level = 'warning';
          
          let category = 'uptime';
          if (subject.toLowerCase().includes('ssl')) category = 'ssl';
          else if (subject.toLowerCase().includes('seo')) category = 'seo';
          else if (subject.toLowerCase().includes('wordpress')) category = 'wordpress';

          logs.push({
            checkedAt: new Date(timeMatch[1]),
            recipient: recipientMatch[1],
            subject: subject,
            level,
            category
          });
        }
      });
    }
  } catch (err) {
    console.error('⚠️ Failed to parse email delivery logs:', err.message);
  }

  // Sort logs by newest first and limit to 15
  logs.sort((a, b) => b.checkedAt - a.checkedAt);

  res.status(200).json({
    settings,
    emailLogs: logs.slice(0, 15),
    totalLogsCount: logs.length
  });
};

/**
 * Save SRE Settings
 */
const saveSettings = async (req, res) => {
  const newSettings = req.body;
  if (!newSettings) {
    return res.status(400).json({ error: 'Missing settings payload.' });
  }

  try {
    let settings = {};
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
    }

    // Merge settings
    settings = { ...settings, ...newSettings };
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
    
    res.status(200).json({
      success: true,
      message: 'SRE credentials and alerts settings saved successfully.',
      settings
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to save SRE settings: ${error.message}` });
  }
};

module.exports = {
  getSettings,
  saveSettings
};
