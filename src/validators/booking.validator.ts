import { z } from 'zod';
import { BOOKING_STATUS } from '../constants';

/**
 * Booking Validators
 */

export const createBookingSchema = z.object({
    body: z.object({
        item_id: z.string().min(1, 'Item ID is required'),
        user_email: z.string().email('Valid email is required'),
        user_name: z.string().min(1).optional(),
        user_phone: z.string().optional(),
        date: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format',
        }),
        start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        notes: z.string().optional(),
        addon_ids: z.array(z.string()).optional(),
    }),
});

export const updateBookingSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Booking ID is required'),
    }),
    body: z.object({
        status: z
            .enum([
                BOOKING_STATUS.PENDING,
                BOOKING_STATUS.CONFIRMED,
                BOOKING_STATUS.CANCELLED,
                BOOKING_STATUS.COMPLETED,
            ])
            .optional(),
        notes: z.string().optional(),
    }),
});

export const getBookingSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Booking ID is required'),
    }),
});

export const listBookingsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        sortBy: z.enum(['date', 'createdAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        item_id: z.string().optional(),
        user_email: z.string().optional(),
        status: z.string().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
    }),
});

export const getAvailableSlotsSchema = z.object({
    params: z.object({
        item_id: z.string().min(1, 'Item ID is required'),
    }),
    query: z.object({
        date: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format',
        }),
    }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type GetBookingInput = z.infer<typeof getBookingSchema>;
export type ListBookingsInput = z.infer<typeof listBookingsSchema>;
export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>;
