import { BookingRepository } from '../repositories/booking.repository';
import { ItemRepository } from '../repositories/item.repository';
import { AddonRepository } from '../repositories/addon.repository';
import { IBooking } from '../models/booking.model';
import { FilterQuery } from 'mongoose';
import { PaginationOptions } from '../utils/pagination.util';
import { ERROR_MESSAGES, BOOKING_STATUS } from '../constants';
import { getAvailableSlots, isSlotAvailable } from '../utils/availability.util';
import Database from '../config/database';

/**
 * Booking Service
 * Handles booking conflict prevention with transaction support
 */

export class BookingService {
    private bookingRepo: BookingRepository;
    private itemRepo: ItemRepository;
    private addonRepo: AddonRepository;

    constructor() {
        this.bookingRepo = new BookingRepository();
        this.itemRepo = new ItemRepository();
        this.addonRepo = new AddonRepository();
    }

    /**
     * Create a new booking with conflict checking
     */
    async createBooking(data: Partial<IBooking>) {
        // Validate item exists and is bookable
        const item = await this.itemRepo.findById(data.item_id!.toString());

        if (!item) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
        }

        if (!item.is_bookable) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_BOOKABLE);
        }

        // Check if slot is available
        const slotAvailable = await isSlotAvailable(
            data.item_id!.toString(),
            new Date(data.date!),
            data.start_time!,
            data.end_time!
        );

        if (!slotAvailable) {
            throw new Error(ERROR_MESSAGES.BOOKING_CONFLICT);
        }

        // Validate addons if provided
        if (data.addon_ids && data.addon_ids.length > 0) {
            const addons = await this.addonRepo.findByIds(
                data.addon_ids.map((id) => id.toString())
            );

            if (addons.length !== data.addon_ids.length) {
                throw new Error('One or more addons not found');
            }

            // All addons should belong to the item
            const invalidAddons = addons.filter(
                (addon) => addon.item_id.toString() !== data.item_id!.toString()
            );

            if (invalidAddons.length > 0) {
                throw new Error('Addons do not belong to the selected item');
            }

            // Calculate total price with addons
            const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);

            // You could integrate pricing engine here for total_price
            // For now, just store addon total
            data.total_price = addonTotal;
        }

        // Create booking
        // If replica set is available, use transaction
        if (Database.supportsTransactions()) {
            return await this.createBookingWithTransaction(data);
        } else {
            return await this.createBookingWithOptimisticLock(data);
        }
    }

    /**
     * Create booking with transaction (preferred)
     */
    private async createBookingWithTransaction(data: Partial<IBooking>) {
        const session = await this.bookingRepo.getModel().startSession();
        session.startTransaction();

        try {
            // Double-check no conflicts
            const conflicts = await this.bookingRepo.findConflictingBookings(
                data.item_id!.toString(),
                new Date(data.date!),
                data.start_time!,
                data.end_time!
            );

            if (conflicts.length > 0) {
                throw new Error(ERROR_MESSAGES.BOOKING_CONFLICT);
            }

            const booking = await this.bookingRepo.create(data);

            await session.commitTransaction();
            session.endSession();

            return booking;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    /**
     * Create booking with optimistic locking (fallback)
     */
    private async createBookingWithOptimisticLock(data: Partial<IBooking>) {
        // Double-check for conflicts just before creating
        const conflicts = await this.bookingRepo.findConflictingBookings(
            data.item_id!.toString(),
            new Date(data.date!),
            data.start_time!,
            data.end_time!
        );

        if (conflicts.length > 0) {
            throw new Error(ERROR_MESSAGES.BOOKING_CONFLICT);
        }

        return await this.bookingRepo.create(data);
    }

    /**
     * Get booking by ID
     */
    async getBookingById(id: string) {
        const booking = await this.bookingRepo.findById(id);

        if (!booking) {
            throw new Error(ERROR_MESSAGES.BOOKING_NOT_FOUND);
        }

        return booking;
    }

    /**
     * List bookings with pagination
     */
    async listBookings(filters: FilterQuery<IBooking>, options: PaginationOptions) {
        return await this.bookingRepo.findAll(filters, options);
    }

    /**
     * Update booking (mainly for status changes)
     */
    async updateBooking(id: string, data: Partial<IBooking>) {
        const booking = await this.bookingRepo.findById(id);

        if (!booking) {
            throw new Error(ERROR_MESSAGES.BOOKING_NOT_FOUND);
        }

        return await this.bookingRepo.update(id, data);
    }

    /**
     * Cancel booking
     */
    async cancelBooking(id: string) {
        return await this.updateBooking(id, { status: BOOKING_STATUS.CANCELLED });
    }

    /**
     * Get available slots for an item on a date
     */
    async getAvailableSlots(itemId: string, date: Date) {
        const item = await this.itemRepo.findById(itemId);

        if (!item) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
        }

        if (!item.is_bookable) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_BOOKABLE);
        }

        return await getAvailableSlots(item, date);
    }

    /**
     * Get bookings for a user
     */
    async getUserBookings(userEmail: string) {
        return await this.bookingRepo.findByUser(userEmail);
    }
}
