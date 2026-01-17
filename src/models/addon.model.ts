import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Addon Model
 * Can be optional or mandatory, supports grouping
 */

export interface IAddon extends Document {
    name: string;
    description?: string;
    price: number;
    item_id: Types.ObjectId;
    is_mandatory: boolean;
    group_id?: string; // For "choose one of many" scenarios
    group_name?: string;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AddonSchema = new Schema<IAddon>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        item_id: {
            type: Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
            index: true,
        },
        is_mandatory: {
            type: Boolean,
            default: false,
        },
        group_id: {
            type: String,
            trim: true,
            index: true,
        },
        group_name: {
            type: String,
            trim: true,
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

// Compound indexes
AddonSchema.index({ item_id: 1, is_active: 1 });
AddonSchema.index({ item_id: 1, group_id: 1 });

export const Addon = mongoose.model<IAddon>('Addon', AddonSchema);
