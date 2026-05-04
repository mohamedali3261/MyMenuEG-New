import { Router } from 'express';
import { authenticateCustomer } from '../middleware/auth';
import { getWishlist, addWishlistItem, removeWishlistItem, getCart, syncCart, clearCart } from '../controllers/customerDataController';

const router = Router();

// Wishlist
router.get('/wishlist', authenticateCustomer, getWishlist);
router.post('/wishlist', authenticateCustomer, addWishlistItem);
router.delete('/wishlist/:product_id', authenticateCustomer, removeWishlistItem);

// Cart
router.get('/cart', authenticateCustomer, getCart);
router.post('/cart/sync', authenticateCustomer, syncCart);
router.delete('/cart', authenticateCustomer, clearCart);

export default router;
