import mongoose, { Schema, Document, Types } from 'mongoose';
import { PRICING_TYPES, DISCOUNT_TYPES, DAYS_OF_WEEK } from '../constants';

/**
 * Item Model
 * Supports multiple pricing types and booking functionality
 * Tax is NEVER stored here - always inherited from subcategory/category
 */

// Pricing type interfaces
export interface ITier {
    min_quantity: number;
    max_quantity: number;
    price_per_unit: number;
}

export interface IDiscountPricing {
    base_price: number;
    discount_type: 'flat' | 'percentage';
    discount_value: number;
}

export interface ITimeWindow {
    day_of_week: string;
    start_time: string; // HH:MM format
    end_time: string; // HH:MM format
    price: number;
}

export interface IPricingDetails {
    // Static pricing
    static_price?: number;

    // Tiered pricing
    tiers?: ITier[];

    // Discounted pricing
    discount?: IDiscountPricing;

    // Dynamic time-based pricing
    time_windows?: ITimeWindow[];
    unavailable_outside_windows?: boolean;
}

export interface IAvailability {
    days: string[]; // Array of days from DAYS_OF_WEEK
    time_slots: {
        start_time: string; // HH:MM
        end_time: string; // HH:MM
    }[];
}

export interface IItem extends Document {
    name: string;
    description?: string;
    subcategory_id: Types.ObjectId;
    pricing_type: string;
    pricing_details: IPricingDetails;
    is_bookable: boolean;
    availability?: IAvailability;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        subcategory_id: {
            type: Schema.Types.ObjectId,
            ref: 'Subcategory',
            required: true,
            index: true,
        },
        pricing_type: {
            type: String,
            required: true,
            enum: Object.values(PRICING_TYPES),
        },
        pricing_details: {
            type: Schema.Types.Mixed,
            required: true,
        },
        is_bookable: {
            type: Boolean,
            default: false,
            index: true,
        },
        availability: {
            days: {
                type: [String],
                enum: Object.values(DAYS_OF_WEEK),
            },
            time_slots: [
                {
                    start_time: String,
                    end_time: String,
                },
            ],
        },
        is_active: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes for search and filtering
ItemSchema.index({ name: 'text', description: 'text' });
ItemSchema.index({ subcategory_id: 1, is_active: 1 });
ItemSchema.index({ pricing_type: 1 });
ItemSchema.index({ is_bookable: 1, is_active: 1 });
ItemSchema.index({ createdAt: -1 });

export const Item = mongoose.model<IItem>('Item', ItemSchema);
