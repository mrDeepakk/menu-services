import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { HTTP_STATUS } from '../constants';
import { FilterQuery } from 'mongoose';
import { IBooking } from '../models/booking.model';

/**
 * Booking Controller
 */

const bookingService = new BookingService();

export class BookingController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const booking = await bookingService.createBooking(req.body);
            res.status(HTTP_STATUS.CREATED).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const booking = await bookingService.getBookingById(req.params.id);
            res.status(HTTP_STATUS.OK).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { item_id, user_email, status, date_from, date_to, ...paginationOptions } =
                req.query;

            const filters: FilterQuery<IBooking> = {};

            if (item_id) filters.item_id = item_id;
            if (user_email) filters.user_email = user_email;
            if (status) filters.status = status;

            if (date_from || date_to) {
                filters.date = {};
                if (date_from) filters.date.$gte = new Date(date_from as string);
                if (date_to) filters.date.$lte = new Date(date_to as string);
            }

            const result = await bookingService.listBookings(filters, paginationOptions as any);
            res.status(HTTP_STATUS.OK).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const booking = await bookingService.updateBooking(req.params.id, req.body);
            res.status(HTTP_STATUS.OK).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const booking = await bookingService.cancelBooking(req.params.id);
            res.status(HTTP_STATUS.OK).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const { item_id } = req.params;
            const { date } = req.query;

            const slots = await bookingService.getAvailableSlots(item_id, new Date(date as string));

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    item_id,
                    date,
                    slots,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
