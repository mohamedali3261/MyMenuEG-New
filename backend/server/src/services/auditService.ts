import prisma from '../lib/prisma';

/**
 * Audit Logging Service
 * Records sensitive admin actions to the database.
 */
export const logAudit = async (action: string, username: string, details: string = '') => {
  try {
    await prisma.backup_logs.create({
      data: {
        action,
        admin_username: username,
        details
      }
    });
  } catch (err) {
    console.error('Failed to save audit log:', err);
  }
};
