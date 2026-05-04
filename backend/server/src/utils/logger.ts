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
  private maxLogSize = 10 * 1024 * 1024; // 10MB

  private async rotateLogs() {
    try {
      const stats = await fs.promises.stat(this.logFile);
      if (stats.size > this.maxLogSize) {
        const backupFile = path.join(LOG_DIR, `app.log.${Date.now()}.bak`);
        await fs.promises.rename(this.logFile, backupFile);
        
        // Keep only last 5 backups
        const files = await fs.promises.readdir(LOG_DIR);
        const backups = files
          .filter(f => f.startsWith('app.log.') && f.endsWith('.bak'))
          .sort()
          .reverse();
        
        if (backups.length > 5) {
          for (const file of backups.slice(5)) {
            await fs.promises.unlink(path.join(LOG_DIR, file));
          }
        }
      }
    } catch (err) {
      // File might not exist yet, ignore
    }
  }

  private formatMessage(level: string, message: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  }

  private async write(level: string, message: string) {
    const formatted = this.formatMessage(level, message);
    console.log(formatted.trim()); // Print to console
    
    await this.rotateLogs();
    
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
