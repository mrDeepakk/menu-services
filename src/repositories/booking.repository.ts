import { Booking, IBooking } from '../models/booking.model';
import { FilterQuery } from 'mongoose';
import { PaginationOptions, executePaginatedQuery } from '../utils/pagination.util';

/**
 * Booking Repository
 * Database operations for bookings
 */

export class BookingRepository {
    /**
     * Get the underlying Mongoose model (for transactions)
     */
    getModel() {
        return Booking;
    }
    /**
     * Create a new booking
     */
    async create(data: Partial<IBooking>): Promise<IBooking> {
        const booking = new Booking(data);
        return await booking.save();
    }

    /**
     * Find booking by ID
     */
    async findById(id: string): Promise<IBooking | null> {
        return await Booking.findById(id).populate('item_id').populate('addon_ids');
    }

    /**
     * Find all bookings with pagination
     */
    async findAll(filters: FilterQuery<IBooking>, options: PaginationOptions) {
        return await executePaginatedQuery(Booking, filters, options, ['item_id', 'addon_ids']);
    }

    /**
     * Find bookings by item ID
     */
    async findByItem(itemId: string): Promise<IBooking[]> {
        return await Booking.find({ item_id: itemId });
    }

    /**
     * Find bookings by user email
     */
    async findByUser(userEmail: string): Promise<IBooking[]> {
        return await Booking.find({ user_email: userEmail }).populate('item_id');
    }

    /**
     * Find conflicting bookings
     */
    async findConflictingBookings(
        itemId: string,
        date: Date,
        startTime: string,
        endTime: string,
        excludeBookingId?: string
    ): Promise<IBooking[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const filter: FilterQuery<IBooking> = {
            item_id: itemId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                {
                    $and: [{ start_time: { $lte: endTime } }, { end_time: { $gte: startTime } }],
                },
            ],
        };

        if (excludeBookingId) {
            filter._id = { $ne: excludeBookingId };
        }

        return await Booking.find(filter);
    }

    /**
     * Update booking
     */
    async update(id: string, data: Partial<IBooking>): Promise<IBooking | null> {
        return await Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    /**
     * Delete booking
     */
    async delete(id: string): Promise<void> {
        await Booking.findByIdAndDelete(id);
    }

    /**
     * Check if booking exists
     */
    async exists(id: string): Promise<boolean> {
        const count = await Booking.countDocuments({ _id: id });
        return count > 0;
    }
}
