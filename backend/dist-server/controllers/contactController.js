import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { logAudit } from '../services/auditService';
import { sanitizeObject } from '../utils/sanitizer';
// Validation function
const validateContactInput = (data) => {
    const errors = [];
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Valid email is required');
    }
    if (data.phone && !/^[\d\s\-+()]{7,}$/.test(data.phone)) {
        errors.push('Invalid phone number format');
    }
    if (data.subject && data.subject.trim().length < 2) {
        errors.push('Subject must be at least 2 characters');
    }
    if (!data.message || data.message.trim().length < 3) {
        errors.push('Message must be at least 3 characters');
    }
    return errors;
};
export const submitContact = async (req, res) => {
    try {
        const input = req.body;
        // Validate input
        const errors = validateContactInput(input);
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        // Sanitize input
        const sanitized = sanitizeObject({
            name: input.name.trim().slice(0, 100),
            email: input.email.trim().toLowerCase().slice(0, 255),
            phone: input.phone.trim().slice(0, 20),
            subject: input.subject.trim().slice(0, 200),
            message: input.message.trim().slice(0, 500),
            custom_file_url: input.custom_file_url?.trim().slice(0, 500) || undefined,
            custom_notes: input.custom_notes?.trim().slice(0, 2000) || undefined,
        });
        // Store in dedicated contact_submissions table
        const contact = await prisma.contact_submissions.create({
            data: sanitized
        });
        // Create notification for admins
        if (prisma.notifications) {
            await prisma.notifications.create({
                data: {
                    title_ar: 'رسالة تواصل جديدة',
                    title_en: 'New Contact Message',
                    message_ar: `${sanitized.name} أرسل رسالة: ${sanitized.subject}`,
                    message_en: `${sanitized.name} sent a message: ${sanitized.subject}`
                }
            });
        }
        logger.info(`Contact form submitted by ${sanitized.email}`);
        res.json({
            success: true,
            message: 'Message sent successfully'
        });
    }
    catch (err) {
        logger.error('Contact form submission failed', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
export const getContacts = async (req, res) => {
    try {
        const contacts = await prisma.contact_submissions.findMany({
            orderBy: { created_at: 'desc' },
            take: 200
        });
        res.json(contacts);
    }
    catch (err) {
        logger.error('Failed to fetch contacts', err);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
};
export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['new', 'read', 'replied', 'archived'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const contact = await prisma.contact_submissions.findUnique({
            where: { id: parseInt(String(id)) }
        });
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        await prisma.contact_submissions.update({
            where: { id: parseInt(String(id)) },
            data: { status, updated_at: new Date() }
        });
        await logAudit('update_contact_status', req.user?.username || 'system', `Contact ${id} status updated to ${status}`);
        res.json({ success: true });
    }
    catch (err) {
        logger.error('Failed to update contact status', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
};
