const fs = require('fs').promises;
const path = require('path');

class Logger {
    constructor(logFileName = 'logs.log') {
        this.logFile = path.join(__dirname, '../logs', logFileName);
        this.ensureLogDirectory();
    }

    async ensureLogDirectory() {
        try {
            await fs.mkdir(path.dirname(this.logFile), { recursive: true });
        } catch (error) {
            console.error('Could not create logs directory:', error);
        }
    }

    getTimestamp() {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    async log(command, user, parameters = {}) {
        try {
            const timestamp = this.getTimestamp();
            const paramString = Object.entries(parameters)
                .map(([key, value]) => `${key}: ${value || 'none'}`)
                .join(', ');

            const logEntry = 
                `${timestamp} UTC-1 - ${user.username} (${user.id})\n` +
                `${command} command used; parameters:\n` +
                `${paramString} \n` +
                `-------------------------------------------------------------\n`;

            await fs.appendFile(this.logFile, logEntry, 'utf-8');
            
        } catch (error) {
            console.error('Logging error:', error);
        }
    }

    // Optional: Different log levels
    async error(message, error) {
        const timestamp = this.getTimestamp();
        const logEntry = `[ERROR] ${timestamp} - ${message}: ${error?.message || error}\n`;
        await fs.appendFile(this.logFile, logEntry, 'utf-8');
    }

    async info(message) {
        const timestamp = this.getTimestamp();
        const logEntry = `[INFO] ${timestamp} - ${message}\n`;
        await fs.appendFile(this.logFile, logEntry, 'utf-8');
    }
}

// Create and export
module.exports = new Logger();