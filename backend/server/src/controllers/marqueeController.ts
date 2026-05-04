import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';
import { logAudit } from '../services/auditService';

export const getMarqueeLogos = async (req: Request, res: Response) => {
  try {
    const payload = await cacheResolveSWR(
      'marqueeLogos',
      'all',
      async () => {
        const logos = await prisma.marquee_logos.findMany({
          orderBy: [{ strip: 'asc' }, { order_index: 'asc' }]
        });
        return JSON.stringify(logos);
      },
      120,
      600
    );

    res.json(JSON.parse(payload));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch marquee logos' });
  }
};

export const saveMarqueeLogo = async (req: Request, res: Response) => {
  try {
    const { id, image_url, name_ar, name_en, strip, order_index, type, text_ar, text_en, color, background_color, speed } = req.body;
    const logoId = id || `MQ-${Date.now()}`;
    const existedBefore = Boolean(id && await prisma.marquee_logos.findUnique({
      where: { id: String(id) },
      select: { id: true }
    }));

    const logo = await prisma.marquee_logos.upsert({
      where: { id: logoId },
      create: {
        id: logoId,
        image_url: image_url || '',
        name_ar: name_ar || '',
        name_en: name_en || '',
        strip: strip || '1',
        order_index: order_index || 0,
        type: type || 'image',
        text_ar: text_ar || '',
        text_en: text_en || '',
        color: color || '#ffffff',
        background_color: background_color || '#1a1a1a',
        speed: speed || 30,
      },
      update: {
        image_url: image_url || '',
        name_ar: name_ar || '',
        name_en: name_en || '',
        strip: strip || '1',
        order_index: order_index || 0,
        type: type || 'image',
        text_ar: text_ar || '',
        text_en: text_en || '',
        color: color || '#ffffff',
        background_color: background_color || '#1a1a1a',
        speed: speed || 30,
      }
    });

    await cacheInvalidateScope('marqueeLogos');
    await logAudit(
      existedBefore ? 'update_marquee_logo' : 'create_marquee_logo',
      (req as any).user?.username || 'system',
      `${existedBefore ? 'Updated' : 'Created'} marquee logo: ${logoId}`
    );
    res.json({ success: true, id: logoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save marquee logo' });
  }
};

export const deleteMarqueeLogo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.marquee_logos.delete({ where: { id: String(id) } });
    await cacheInvalidateScope('marqueeLogos');
    await logAudit('delete_marquee_logo', (req as any).user?.username || 'system', `Deleted marquee logo: ${String(id)}`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete marquee logo' });
  }
};

export const getMarqueeSettings = async (req: Request, res: Response) => {
  try {
    const payload = await cacheResolveSWR(
      'marqueeSettings',
      'main',
      async () => {
        let settings = await prisma.marquee_settings.findUnique({
          where: { id: 'main' }
        });

        if (!settings) {
          settings = await prisma.marquee_settings.create({
            data: { id: 'main', enabled: true }
          });
        }

        return JSON.stringify(settings);
      },
      60,
      300
    );

    res.json(JSON.parse(payload));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch marquee settings' });
  }
};

export const saveMarqueeSettings = async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;

    const settings = await prisma.marquee_settings.upsert({
      where: { id: 'main' },
      create: { id: 'main', enabled: enabled ?? true },
      update: { enabled: enabled ?? true }
    });

    await cacheInvalidateScope('marqueeSettings');
    await logAudit(
      'update_marquee_settings',
      (req as any).user?.username || 'system',
      `Updated marquee settings (enabled=${String(enabled ?? true)})`
    );
    res.json({ success: true, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save marquee settings' });
  }
};
