const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../../email_delivery.log');

/**
 * Log email alert deliveries to an audit file for SRE compliance verification.
 */
const logEmailDelivery = (recipient, subject, html) => {
  const time = new Date().toISOString();
  const logMsg = `[${time}] EMAIL DISPATCHED TO: ${recipient}\nSUBJECT: ${subject}\n\n${html.replace(/<[^>]*>/g, '').trim().substring(0, 300)}...\n--------------------------------------------------\n\n`;
  try {
    fs.appendFileSync(logFilePath, logMsg, 'utf-8');
    console.log(`📝 SRE Email alert delivery successfully logged to ${logFilePath}`);
  } catch (err) {
    console.error('⚠️ Failed to write to SRE email delivery log:', err.message);
  }
};

const emailQueue = [];
let isProcessing = false;

/**
 * Throttled background queue processor
 */
const processQueue = async () => {
  if (isProcessing || emailQueue.length === 0) return;
  isProcessing = true;

  const job = emailQueue.shift();
  try {
    await sendAlertEmailActual(job.url, job.category, job.level, job.message);
  } catch (err) {
    console.error('⚠️ Failed to process SRE alert email from queue:', err.message);
  } finally {
    isProcessing = false;
    // Throttle next dispatch by 1.5 seconds to prevent rate limits
    setTimeout(processQueue, 1500);
  }
};

/**
 * Actual email dispatcher
 */
const sendAlertEmailActual = async (url, category, level, message) => {
  const time = new Date().toLocaleString();
  
  let settings = {
    critical_email: process.env.CRITICAL_EMAIL || 'alex.rivera@monitorpro.sre',
    email_host_user: process.env.EMAIL_HOST_USER || '',
    email_host_password: process.env.EMAIL_HOST_PASSWORD || '',
    alerts_enabled: true
  };

  const settingsPath = path.join(__dirname, '../../../../sre_settings.json');
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = { ...settings, ...JSON.parse(data) };
      if (settings.alerts_enabled === undefined) {
        settings.alerts_enabled = true;
      }
    }
  } catch (err) {
    console.error('⚠️ Failed to load SRE settings dynamically in emailService:', err.message);
  }

  if (settings.alerts_enabled === false) {
    console.log('🔇 SMTP Alerts are globally disabled in settings. Skipping email dispatch.');
    return;
  }

  const recipient = settings.critical_email;
  const hostUser = settings.email_host_user;
  const hostPass = settings.email_host_password;
  
  const subject = `[${level.toUpperCase()}] SRE Alert Triggered - ${url}`;
  
  // Polished responsive HTML template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 20px; }
        .card { max-width: 580px; margin: 0 auto; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
        .header { background: #4f46e5; color: white; padding: 24px; font-weight: 800; font-size: 18px; text-transform: uppercase; letter-spacing: 0.02em; }
        .header.critical { background: #ef4444; }
        .header.warning { background: #f59e0b; }
        .content { padding: 24px; font-size: 14px; line-height: 1.6; }
        .badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 800; border-radius: 9999px; text-transform: uppercase; color: white; margin-bottom: 12px; }
        .badge.critical { background: #ef4444; }
        .badge.warning { background: #f59e0b; }
        .badge.info { background: #3b82f6; }
        .details { background: #f1f5f9; padding: 14px; border-radius: 8px; margin-top: 16px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 12px; }
        .footer { text-align: center; font-size: 10px; color: #94a3b8; padding: 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header ${level}">
          MonitorPro SRE Gateway Alert
        </div>
        <div class="content">
          <span class="badge ${level}">${level}</span>
          <div style="font-weight: 800; font-size: 15px; margin-bottom: 8px;">Anomalous Site Event Discovered!</div>
          <p>During the automated real-time SRE check, our monitoring system flagged a state exception on the target host.</p>
          
          <div class="details">
            <strong>URL:</strong> ${url}<br>
            <strong>Category:</strong> ${category.toUpperCase()}<br>
            <strong>Alert Message:</strong> ${message}<br>
            <strong>Detected At:</strong> ${time} UTC
          </div>
          
          <p style="margin-top: 16px;">Please log in to your SRE portal to verify details and run live traceroutes.</p>
        </div>
        <div class="footer">
          MonitorPro Node SRE Module • Authorized email dispatch
        </div>
      </div>
    </body>
    </html>
  `;

  logEmailDelivery(recipient, subject, html);

  if (hostUser && hostPass) {
    try {
      const isGmail = hostUser.toLowerCase().includes("@gmail.com");
      const transporter = nodemailer.createTransport({
        host: isGmail ? 'smtp.gmail.com' : (process.env.EMAIL_HOST || 'localhost'),
        port: isGmail ? 587 : (parseInt(process.env.EMAIL_PORT) || 25),
        secure: !isGmail && process.env.EMAIL_USE_SSL === 'true',
        auth: { user: hostUser, pass: hostPass }
      });

      await transporter.sendMail({
        from: hostUser,
        to: recipient,
        subject,
        html
      });
      console.log(`✉️ SRE SMTP alert email sent to ${recipient} successfully.`);
    } catch (err) {
      console.error('❌ Nodemailer SMTP Dispatch failure:', err.message);
    }
  }
};

/**
 * Send an SRE alert email asynchronously by queueing it
 */
const sendAlertEmail = async (url, category, level, message) => {
  emailQueue.push({ url, category, level, message });
  processQueue();
};

module.exports = { sendAlertEmail };
