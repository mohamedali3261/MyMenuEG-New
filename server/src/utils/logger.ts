import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../../../logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Custom Logger Utility
 * Distinguishes between INFO, WARN, and ERROR.
 * In a real production environment, this could be replaced by 'pino' or 'winston'.
 */
class Logger {
  private logFile = path.join(LOG_DIR, 'app.log');

  private formatMessage(level: string, message: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  }

  private write(level: string, message: string) {
    const formatted = this.formatMessage(level, message);
    console.log(formatted.trim()); // Print to console
    fs.promises.appendFile(this.logFile, formatted).catch((err) => {
      console.error('Failed to write log file:', err);
    });
  }

  info(message: string) {
    this.write('INFO', message);
  }

  warn(message: string) {
    this.write('WARN', message);
  }

  error(message: string, error?: any) {
    const errorMsg = error?.stack ? `${message} - ${error.stack}` : `${message} - ${error?.message || error || ''}`;
    this.write('ERROR', errorMsg);
  }
}

export const logger = new Logger();
