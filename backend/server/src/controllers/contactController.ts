import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

interface ContactInput {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Validation function
const validateContactInput = (data: ContactInput): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.phone || !/^[\d\s\-+()]{10,}$/.test(data.phone)) {
    errors.push('Valid phone number is required');
  }

  if (!data.subject || data.subject.trim().length < 3) {
    errors.push('Subject must be at least 3 characters');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  return errors;
};

export const submitContact = async (req: Request, res: Response) => {
  try {
    const input: ContactInput = req.body;

    // Validate input
    const errors = validateContactInput(input);
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }

    // Sanitize input
    const sanitized = {
      name: input.name.trim().slice(0, 100),
      email: input.email.trim().toLowerCase().slice(0, 255),
      phone: input.phone.trim().slice(0, 20),
      subject: input.subject.trim().slice(0, 200),
      message: input.message.trim().slice(0, 2000)
    };

    // Store in settings table (as a JSON entry)
    // In production, you'd want a dedicated contact_submissions table
    const contactEntry = {
      id: `contact-${Date.now()}`,
      ...sanitized,
      created_at: new Date().toISOString(),
      status: 'new'
    };

    // Get existing contacts or create new array
    const existingContacts = await prisma.settings.findUnique({
      where: { key_name: 'contact_submissions' }
    });

    let contacts: any[] = [];
    if (existingContacts?.value) {
      try {
        contacts = JSON.parse(existingContacts.value);
        if (!Array.isArray(contacts)) contacts = [];
      } catch {
        contacts = [];
      }
    }

    // Add new contact (keep last 100 only)
    contacts.unshift(contactEntry);
    if (contacts.length > 100) contacts = contacts.slice(0, 100);

    // Save
    await prisma.settings.upsert({
      where: { key_name: 'contact_submissions' },
      create: {
        key_name: 'contact_submissions',
        value: JSON.stringify(contacts)
      },
      update: {
        value: JSON.stringify(contacts)
      }
    });

    // Create notification for admins
    await prisma.notifications.create({
      data: {
        title_ar: 'رسالة تواصل جديدة',
        title_en: 'New Contact Message',
        message_ar: `${sanitized.name} أرسل رسالة: ${sanitized.subject}`,
        message_en: `${sanitized.name} sent a message: ${sanitized.subject}`
      }
    });

    logger.info(`Contact form submitted by ${sanitized.email}`);

    res.json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (err) {
    logger.error('Contact form submission failed', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const existingContacts = await prisma.settings.findUnique({
      where: { key_name: 'contact_submissions' }
    });

    let contacts: any[] = [];
    if (existingContacts?.value) {
      try {
        contacts = JSON.parse(existingContacts.value);
        if (!Array.isArray(contacts)) contacts = [];
      } catch {
        contacts = [];
      }
    }

    res.json(contacts);
  } catch (err) {
    logger.error('Failed to fetch contacts', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

export const updateContactStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existingContacts = await prisma.settings.findUnique({
      where: { key_name: 'contact_submissions' }
    });

    if (!existingContacts?.value) {
      return res.status(404).json({ error: 'No contacts found' });
    }

    let contacts: any[] = JSON.parse(existingContacts.value);
    const index = contacts.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    contacts[index].status = status;
    contacts[index].updated_at = new Date().toISOString();

    await prisma.settings.update({
      where: { key_name: 'contact_submissions' },
      data: { value: JSON.stringify(contacts) }
    });

    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to update contact status', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};
