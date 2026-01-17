import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { validate } from '../middlewares/validate.middleware';
import {
    createBookingSchema,
    updateBookingSchema,
    getBookingSchema,
    listBookingsSchema,
    getAvailableSlotsSchema,
} from '../validators/booking.validator';

const router = Router();
const controller = new BookingController();

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking
 * @access  Public
 */
router.post('/', validate(createBookingSchema), controller.create);

/**
 * @route   GET /api/v1/bookings
 * @desc    List all bookings
 * @access  Public
 */
router.get('/', validate(listBookingsSchema), controller.list);

/**
 * @route   GET /api/v1/bookings/available-slots/:item_id
 * @desc    Get available slots for an item
 * @access  Public
 */
router.get(
    '/available-slots/:item_id',
    validate(getAvailableSlotsSchema),
    controller.getAvailableSlots
);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking by ID
 * @access  Public
 */
router.get('/:id', validate(getBookingSchema), controller.getById);

/**
 * @route   PUT /api/v1/bookings/:id
 * @desc    Update booking
 * @access  Public
 */
router.put('/:id', validate(updateBookingSchema), controller.update);

/**
 * @route   POST /api/v1/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Public
 */
router.post('/:id/cancel', validate(getBookingSchema), controller.cancel);

export default router;
