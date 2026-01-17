import { IItem } from '../models/item.model';
import { Booking } from '../models/booking.model';
import { BOOKING_STATUS } from '../constants';

/**
 * Availability Utility
 * Handles slot calculation and availability checking for bookable items
 */

export interface TimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

/**
 * Get available slots for a bookable item on a specific date
 */
export async function getAvailableSlots(item: IItem, date: Date): Promise<TimeSlot[]> {
    if (!item.is_bookable || !item.availability) {
        throw new Error('Item is not bookable');
    }

    const { availability } = item;

    // Check if item is available on this day
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const requestedDay = daysOfWeek[date.getDay()];

    if (!availability.days.includes(requestedDay)) {
        return []; // Not available on this day
    }

    // Get all time slots for the day
    const timeSlots = availability.time_slots || [];

    // Get existing bookings for this item on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
        item_id: item._id,
        date: {
            $gte: startOfDay,
            $lte: endOfDay,
        },
        status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
    });

    // Check each slot for availability
    const availableSlots: TimeSlot[] = timeSlots.map((slot) => {
        const isBooked = existingBookings.some((booking) => {
            // Check for time overlap
            return (
                (slot.start_time <= booking.end_time && slot.end_time >= booking.start_time) ||
                (booking.start_time <= slot.end_time && booking.end_time >= slot.start_time)
            );
        });

        return {
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: !isBooked,
        };
    });

    return availableSlots;
}

/**
 * Check if a specific time slot is available for booking
 */
export async function isSlotAvailable(
    itemId: string,
    date: Date,
    startTime: string,
    endTime: string
): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
        item_id: itemId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay,
        },
        status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
        $or: [
            // Requested slot overlaps with existing booking
            {
                $and: [{ start_time: { $lte: endTime } }, { end_time: { $gte: startTime } }],
            },
        ],
    });

    return !conflictingBooking;
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

/**
 * Check if end time is after start time
 */
export function isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes > startMinutes;
}
