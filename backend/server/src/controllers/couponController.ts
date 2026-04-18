import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { couponValidationSchema, couponUpsertSchema } from '../utils/schemas';
import { getQueryParam } from '../utils/helpers';

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupons.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(coupons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, total } = couponValidationSchema.parse(req.body);
    const coupon = await prisma.coupons.findFirst({
      where: { code, status: 'active' }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid code' });
    }
    if (coupon.used_count !== null && coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    if (coupon.min_order !== null && total < coupon.min_order) {
      return res.status(400).json({ message: `Min order EGP ${coupon.min_order} required` });
    }

    res.json(coupon);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map((e: any) => e.message)
      });
    }
    console.error(err);
    res.status(500).json({ error: 'Validation failed' });
  }
};

export const upsertCoupon = async (req: Request, res: Response) => {
  try {
    const input = couponUpsertSchema.parse(req.body);
    const cpnId = input.id || `CPN-${Date.now()}`;

    await prisma.coupons.upsert({
      where: { id: cpnId },
      create: {
        id: cpnId,
        code: input.code,
        type: input.type,
        value: input.value,
        min_order: input.min_order,
        usage_limit: input.usage_limit,
        status: input.status || 'active'
      },
      update: {
        code: input.code,
        type: input.type,
        value: input.value,
        min_order: input.min_order,
        usage_limit: input.usage_limit,
        status: input.status || 'active'
      }
    });

    res.json({ success: true });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map((e: any) => e.message)
      });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to save coupon' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coupons.delete({ where: { id: String(id) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};
