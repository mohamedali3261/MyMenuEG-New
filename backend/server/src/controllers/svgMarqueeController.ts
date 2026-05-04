import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';
import { logAudit } from '../services/auditService';

export const getSvgMarquee = async (req: Request, res: Response) => {
  try {
    const payload = await cacheResolveSWR(
      'svgMarquee',
      'settings',
      async () => {
        let settings = await prisma.svg_marquee.findUnique({
          where: { id: 'main' },
          include: { items: { orderBy: { order_index: 'asc' } } }
        });
        if (!settings) {
          settings = await prisma.svg_marquee.create({
            data: { id: 'main' },
            include: { items: true }
          });
        }
        return JSON.stringify(settings);
      },
      120,
      600
    );

    res.json(JSON.parse(payload));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch SVG marquee settings' });
  }
};

export const saveSvgMarquee = async (req: Request, res: Response) => {
  try {
    const {
      left_text_1, left_text_2, right_text_1, right_text_2,
      text_color,
      animation_duration, show_can, show_bg_svg,
      can_image_url, can_size, font_family, enabled
    } = req.body;

    const settings = await prisma.svg_marquee.upsert({
      where: { id: 'main' },
      create: {
        id: 'main',
        left_text_1, left_text_2, right_text_1, right_text_2,
        text_color,
        animation_duration, show_can, show_bg_svg,
        can_image_url, can_size, font_family, enabled,
      },
      update: {
        left_text_1, left_text_2, right_text_1, right_text_2,
        text_color,
        animation_duration, show_can, show_bg_svg,
        can_image_url, can_size, font_family, enabled,
      }
    });

    await cacheInvalidateScope('svgMarquee');
    await logAudit(
      'update_svg_marquee_settings',
      (req as any).user?.username || 'system',
      `Updated SVG marquee settings`
    );
    res.json({ success: true, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save SVG marquee settings' });
  }
};

// --- SVG Marquee Items CRUD ---

export const createSvgMarqueeItem = async (req: Request, res: Response) => {
  try {
    const { type, image_url, text_ar, text_en, strip, order_index } = req.body;
    const item = await prisma.svg_marquee_items.create({
      data: {
        svg_marquee_id: 'main',
        type: type || 'image',
        image_url,
        text_ar,
        text_en,
        strip: strip || '1',
        order_index: order_index ?? 0,
      }
    });
    await cacheInvalidateScope('svgMarquee');
    await logAudit(
      'create_svg_marquee_item',
      (req as any).user?.username || 'system',
      `Created SVG marquee item: ${item.id}`
    );
    res.json({ success: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create SVG marquee item' });
  }
};

export const updateSvgMarqueeItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { type, image_url, text_ar, text_en, strip, order_index } = req.body;
    const item = await prisma.svg_marquee_items.update({
      where: { id },
      data: { type, image_url, text_ar, text_en, strip, order_index }
    });
    await cacheInvalidateScope('svgMarquee');
    await logAudit(
      'update_svg_marquee_item',
      (req as any).user?.username || 'system',
      `Updated SVG marquee item: ${id}`
    );
    res.json({ success: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update SVG marquee item' });
  }
};

export const deleteSvgMarqueeItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.svg_marquee_items.delete({ where: { id } });
    await cacheInvalidateScope('svgMarquee');
    await logAudit('delete_svg_marquee_item', (req as any).user?.username || 'system', `Deleted SVG marquee item: ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete SVG marquee item' });
  }
};
