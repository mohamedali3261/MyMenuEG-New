import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

// --- Wishlist ---

export const getWishlist = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'غير مصرح' });

    const items = await prisma.customer_wishlists.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: 'desc' },
    });

    res.json({ items });
  } catch (err) {
    logger.error('Get wishlist error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

export const addWishlistItem = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'غير مصرح' });

    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });

    const item = await prisma.customer_wishlists.upsert({
      where: { customer_id_product_id: { customer_id: customerId, product_id } },
      update: {},
      create: { customer_id: customerId, product_id },
    });

    res.json({ success: true, item });
  } catch (err) {
    logger.error('Add wishlist error:', err);
    res.status(500).json({ error: 'Failed to add wishlist item' });
  }
};

export const removeWishlistItem = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'غير مصرح' });

    const { product_id } = req.params;
    await prisma.customer_wishlists.deleteMany({
      where: { customer_id: customerId, product_id },
    });

    res.json({ success: true });
  } catch (err) {
    logger.error('Remove wishlist error:', err);
    res.status(500).json({ error: 'Failed to remove wishlist item' });
  }
};

// --- Cart ---

export const getCart = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'غير مصرح' });

    const items = await prisma.customer_carts.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: 'desc' },
    });

    res.json({ items });
  } catch (err) {
    logger.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

export const syncCart = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'غير مصرح' });

    const { items } = req.body as { items: Array<{ product_id: string; variant?: string; quantity: number; is_bundle?: boolean; bundle_data?: string }> };

    // Delete existing cart items
    await prisma.customer_carts.deleteMany({ where: { customer_id: customerId } });

    // Insert new cart items (skip invalid items)
    if (items && items.length > 0) {
      const validItems = items.filter(item => item.product_id && item.quantity > 0);
      if (validItems.length > 0) {
        await prisma.customer_carts.createMany({
          data: validItems.map(item => ({
            customer_id: customerId,
            product_id: item.product_id,
            variant: item.variant || '',
            quantity: item.quantity,
            is_bundle: item.is_bundle || false,
            bundle_data: item.bundle_data || null,
          })),
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    logger.error('Sync cart error:', err);
    res.status(500).json({ error: 'Failed to sync cart' });
  }
};

export const clearCart = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'غير مصرح' });

    await prisma.customer_carts.deleteMany({ where: { customer_id: customerId } });
    res.json({ success: true });
  } catch (err) {
    logger.error('Clear cart error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
