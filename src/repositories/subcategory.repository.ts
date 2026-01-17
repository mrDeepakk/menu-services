import { Subcategory, ISubcategory } from '../models/subcategory.model';
import { FilterQuery } from 'mongoose';
import { PaginationOptions, executePaginatedQuery } from '../utils/pagination.util';

/**
 * Subcategory Repository
 */

export class SubcategoryRepository {
    /**
     * Create a new subcategory
     */
    async create(data: Partial<ISubcategory>): Promise<ISubcategory> {
        const subcategory = new Subcategory(data);
        return await subcategory.save();
    }

    /**
     * Find subcategory by ID
     */
    async findById(id: string, populate = false): Promise<ISubcategory | null> {
        const query = Subcategory.findOne({ _id: id, is_active: true });
        if (populate) {
            query.populate('category_id');
        }
        return await query;
    }

    /**
     * Find subcategory by ID (including inactive)
     */
    async findByIdIncludingInactive(id: string, populate = false): Promise<ISubcategory | null> {
        const query = Subcategory.findById(id);
        if (populate) {
            query.populate('category_id');
        }
        return await query;
    }

    /**
     * Find all subcategories with pagination
     */
    async findAll(filters: FilterQuery<ISubcategory>, options: PaginationOptions) {
        return await executePaginatedQuery(Subcategory, filters, options, 'category_id');
    }

    /**
     * Update subcategory
     */
    async update(id: string, data: Partial<ISubcategory>): Promise<ISubcategory | null> {
        return await Subcategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    /**
     * Soft delete subcategory
     */
    async softDelete(id: string): Promise<ISubcategory | null> {
        return await Subcategory.findByIdAndUpdate(id, { is_active: false }, { new: true });
    }

    /**
     * Soft delete all subcategories of a category
     */
    async softDeleteByCategory(categoryId: string): Promise<void> {
        await Subcategory.updateMany({ category_id: categoryId }, { is_active: false });
    }

    /**
     * Check if subcategory exists
     */
    async exists(id: string): Promise<boolean> {
        const count = await Subcategory.countDocuments({ _id: id, is_active: true });
        return count > 0;
    }

    /**
     * Find subcategories by category ID
     */
    async findByCategory(categoryId: string): Promise<ISubcategory[]> {
        return await Subcategory.find({ category_id: categoryId, is_active: true });
    }
}
