import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Subcategory Model
 * Can optionally override parent category's tax configuration
 */

export interface ISubcategory extends Document {
    name: string;
    description?: string;
    category_id: Types.ObjectId;
    tax_applicable?: boolean;
    tax_percentage?: number;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategory>(
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
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            index: true,
        },
        // Optional tax override - if not provided, inherits from category
        tax_applicable: {
            type: Boolean,
            required: false,
        },
        tax_percentage: {
            type: Number,
            required: false,
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

// Compound indexes
SubcategorySchema.index({ category_id: 1, name: 1 }, { unique: true });
SubcategorySchema.index({ name: 'text' });
SubcategorySchema.index({ is_active: 1, createdAt: -1 });

export const Subcategory = mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);
