import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { getQueryParam, getQueryInt } from '../utils/helpers';
import { logAudit } from '../services/auditService';
import { sanitizeObject } from '../utils/sanitizer';
// Validation
const validateReview = (data) => {
    const errors = [];
    if (!data.product_id || data.product_id.trim().length < 5) {
        errors.push('Invalid product ID');
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
export const getProductReviews = async (req, res) => {
    try {
        const productId = getQueryParam(req.query.product_id);
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        const page = getQueryInt(req.query.page, 1, 1);
        const limit = getQueryInt(req.query.limit, 10, 1, 50);
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            prisma.product_reviews.findMany({
                where: {
                    product_id: productId,
                    status: 'approved'
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.product_reviews.count({
                where: {
                    product_id: productId,
                    status: 'approved'
                }
            })
        ]);
        // Calculate average rating
        const avgRating = await prisma.product_reviews.aggregate({
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
    }
    catch (err) {
        logger.error('Failed to fetch reviews', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};
export const createReview = async (req, res) => {
    try {
        const input = req.body;
        // Validate
        const errors = validateReview(input);
        if (errors.length > 0) {
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        // Use customer name from auth token
        const customerName = req.customer?.name || req.customer?.email?.split('@')[0] || 'User';
        // Check if product exists
        const product = await prisma.products.findUnique({
            where: { id: input.product_id }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Check if customer already reviewed this product
        if (req.customer?.id) {
            const existing = await prisma.product_reviews.findFirst({
                where: { product_id: input.product_id, customer_id: req.customer.id }
            });
            if (existing) {
                return res.status(409).json({ error: 'You have already reviewed this product' });
            }
        }
        // Create review (pending approval)
        const review = await prisma.product_reviews.create({
            data: sanitizeObject({
                product_id: input.product_id,
                customer_id: req.customer?.id || null,
                user_name: customerName.trim().slice(0, 100),
                rating: input.rating,
                comment_ar: input.comment_ar?.trim() || null,
                comment_en: input.comment_en?.trim() || null,
                status: 'pending'
            })
        });
        logger.info(`New review created for product ${input.product_id}`);
        res.json({
            success: true,
            message: 'Review submitted and pending approval',
            review
        });
    }
    catch (err) {
        logger.error('Failed to create review', err);
        res.status(500).json({ error: 'Failed to submit review' });
    }
};
export const getAllReviews = async (req, res) => {
    try {
        const status = getQueryParam(req.query.status);
        const page = getQueryInt(req.query.page, 1, 1);
        const limit = getQueryInt(req.query.limit, 20, 1, 100);
        const skip = (page - 1) * limit;
        const where = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            where.status = status;
        }
        const [reviews, total] = await Promise.all([
            prisma.product_reviews.findMany({
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
            prisma.product_reviews.count({ where })
        ]);
        res.json({
            reviews,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    }
    catch (err) {
        logger.error('Failed to fetch all reviews', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};
export const updateReviewStatus = async (req, res) => {
    try {
        const id = getQueryParam(req.params.id) || '';
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const review = await prisma.product_reviews.findUnique({
            where: { id: parseInt(id) }
        });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        await prisma.product_reviews.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        await logAudit('update_review_status', req.user?.username || 'system', `Updated review ${id} status to ${status}`);
        logger.info(`Review ${id} status updated to ${status}`);
        res.json({ success: true });
    }
    catch (err) {
        logger.error('Failed to update review status', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
};
export const deleteReview = async (req, res) => {
    try {
        const id = getQueryParam(req.params.id) || '';
        await prisma.product_reviews.delete({
            where: { id: parseInt(id) }
        });
        await logAudit('delete_review', req.user?.username || 'system', `Deleted review: ${id}`);
        logger.info(`Review ${id} deleted`);
        res.json({ success: true });
    }
    catch (err) {
        logger.error('Failed to delete review', err);
        res.status(500).json({ error: 'Failed to delete review' });
    }
};
