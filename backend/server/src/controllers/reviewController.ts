import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { getQueryParam, getQueryInt } from '../utils/helpers';

interface ReviewInput {
  product_id: string;
  user_name: string;
  rating: number;
  comment_ar?: string;
  comment_en?: string;
}

// Validation
const validateReview = (data: ReviewInput): string[] => {
  const errors: string[] = [];

  if (!data.product_id || data.product_id.trim().length < 5) {
    errors.push('Invalid product ID');
  }

  if (!data.user_name || data.user_name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (data.comment_ar && data.comment_ar.length > 1000) {
    errors.push('Arabic comment is too long');
  }

  if (data.comment_en && data.comment_en.length > 1000) {
    errors.push('English comment is too long');
  }

  return errors;
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = getQueryParam(req.query.product_id);
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const page = getQueryInt(req.query.page, 1, 1);
    const limit = getQueryInt(req.query.limit, 10, 1, 50);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      (prisma as any).product_reviews.findMany({
        where: {
          product_id: productId,
          status: 'approved'
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      (prisma as any).product_reviews.count({
        where: {
          product_id: productId,
          status: 'approved'
        }
      })
    ]);

    // Calculate average rating
    const avgRating = await (prisma as any).product_reviews.aggregate({
      where: {
        product_id: productId,
        status: 'approved'
      },
      _avg: {
        rating: true
      }
    });

    res.json({
      reviews,
      total,
      averageRating: avgRating._avg.rating || 0,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    logger.error('Failed to fetch reviews', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const input: ReviewInput = req.body;

    // Validate
    const errors = validateReview(input);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: input.product_id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create review (pending approval)
    const review = await (prisma as any).product_reviews.create({
      data: {
        product_id: input.product_id,
        user_name: input.user_name.trim().slice(0, 100),
        rating: input.rating,
        comment_ar: input.comment_ar?.trim() || null,
        comment_en: input.comment_en?.trim() || null,
        status: 'pending'
      }
    });

    logger.info(`New review created for product ${input.product_id}`);

    res.json({
      success: true,
      message: 'Review submitted and pending approval',
      review
    });
  } catch (err) {
    logger.error('Failed to create review', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const status = getQueryParam(req.query.status);
    const page = getQueryInt(req.query.page, 1, 1);
    const limit = getQueryInt(req.query.limit, 20, 1, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status;
    }

    const [reviews, total] = await Promise.all([
      (prisma as any).product_reviews.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          products: {
            select: {
              name_ar: true,
              name_en: true
            }
          }
        }
      }),
      (prisma as any).product_reviews.count({ where })
    ]);

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    logger.error('Failed to fetch all reviews', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const id = getQueryParam(req.params.id) || '';
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const review = await (prisma as any).product_reviews.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await (prisma as any).product_reviews.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    logger.info(`Review ${id} status updated to ${status}`);

    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to update review status', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = getQueryParam(req.params.id) || '';
    
    await (prisma as any).product_reviews.delete({
      where: { id: parseInt(id) }
    });

    logger.info(`Review ${id} deleted`);

    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to delete review', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
