import mongoose, { Schema, Document, Types } from 'mongoose';
import { BOOKING_STATUS } from '../constants';

/**
 * Booking Model
 * Tracks reservations with conflict prevention
 */

export interface IBooking extends Document {
    item_id: Types.ObjectId;
    user_email: string;
    user_name?: string;
    user_phone?: string;
    date: Date;
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    status: string;
    notes?: string;
    total_price?: number;
    addon_ids?: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        item_id: {
            type: Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
            index: true,
        },
        user_email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        user_name: {
            type: String,
            trim: true,
        },
        user_phone: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        start_time: {
            type: String,
            required: true,
        },
        end_time: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(BOOKING_STATUS),
            default: BOOKING_STATUS.PENDING,
            index: true,
        },
        notes: {
            type: String,
        },
        total_price: {
            type: Number,
            min: 0,
        },
        addon_ids: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Addon',
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Critical compound index for conflict detection
BookingSchema.index(
    {
        item_id: 1,
        date: 1,
        start_time: 1,
        end_time: 1,
    },
    { name: 'booking_conflict_check' }
);

// Additional indexes
BookingSchema.index({ item_id: 1, date: 1, status: 1 });
BookingSchema.index({ user_email: 1, status: 1 });
BookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
