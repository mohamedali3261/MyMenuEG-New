import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';
import { logAudit } from '../services/auditService';

export const getGsapSlides = async (req: Request, res: Response) => {
  try {
    const payload = await cacheResolveSWR(
      'gsapSlides',
      'all',
      async () => {
        const slides = await prisma.gsap_slides.findMany({
          orderBy: { order_index: 'asc' }
        });
        return JSON.stringify(slides);
      },
      120,
      600
    );

    res.json(JSON.parse(payload));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
};

export const saveGsapSlides = async (req: Request, res: Response) => {
  try {
    const { slides } = req.body;

    if (!Array.isArray(slides)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Use transaction to update all slides
    await prisma.$transaction(async (tx) => {
      // Delete existing slides not in the new list
      const newIds = slides.map(s => s.id).filter(Boolean);
      if (newIds.length > 0) {
        await tx.gsap_slides.deleteMany({
          where: { id: { notIn: newIds } }
        });
      }

      // Upsert each slide
      for (const slide of slides) {
        await tx.gsap_slides.upsert({
          where: { id: slide.id || `GSAP-${Date.now()}-${Math.random()}` },
          create: {
            id: slide.id || `GSAP-${Date.now()}-${Math.random()}`,
            place: slide.place || '',
            title: slide.title || '',
            title2: slide.title2 || '',
            description: slide.description || '',
            image: slide.image || '',
            btn_link: slide.btn_link || null,
            order_index: slide.order_index || 0,
          },
          update: {
            place: slide.place || '',
            title: slide.title || '',
            title2: slide.title2 || '',
            description: slide.description || '',
            image: slide.image || '',
            btn_link: slide.btn_link || null,
            order_index: slide.order_index || 0,
          }
        });
      }
    });

    await cacheInvalidateScope('gsapSlides');
    await logAudit(
      'save_gsap_slides',
      (req as any).user?.username || 'system',
      `Saved ${slides.length} GSAP slides`
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save slides' });
  }
};

export const deleteGsapSlide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.gsap_slides.delete({ where: { id: id as string } });
    await cacheInvalidateScope('gsapSlides');
    await logAudit('delete_gsap_slide', (req as any).user?.username || 'system', `Deleted GSAP slide: ${String(id)}`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
};
