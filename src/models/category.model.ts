import mongoose, { Schema, Document } from 'mongoose';

/**
 * Category Model
 * Defines tax configuration that can be inherited by subcategories and items
 */

export interface ICategory extends Document {
    name: string;
    description?: string;
    tax_applicable: boolean;
    tax_percentage: number;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        tax_applicable: {
            type: Boolean,
            required: true,
            default: false,
        },
        tax_percentage: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 100,
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

// Indexes for efficient queries
CategorySchema.index({ name: 'text' });
CategorySchema.index({ is_active: 1, createdAt: -1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
