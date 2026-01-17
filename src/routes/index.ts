import { Router } from 'express';
import categoryRoutes from './category.routes';
import subcategoryRoutes from './subcategory.routes';
import itemRoutes from './item.routes';
import bookingRoutes from './booking.routes';

const router = Router();

/**
 * Mount all routes under /api/v1
 */
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/items', itemRoutes);
router.use('/bookings', bookingRoutes);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Menu Services API is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;
