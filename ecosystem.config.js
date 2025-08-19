// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'your-bot',
    script: './index.js',
    // Force JSON logging format
    log_type: 'json',
    // Enable all logs to be sent to PM2.io
    send_interval: 1000,
    send_timeout: 5000,
    // Log files
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};