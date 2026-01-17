import { Category, ICategory } from '../models/category.model';
import { FilterQuery } from 'mongoose';
import { PaginationOptions, executePaginatedQuery } from '../utils/pagination.util';

/**
 * Category Repository
 * Direct database operations for Category model
 */

export class CategoryRepository {
    /**
     * Create a new category
     */
    async create(data: Partial<ICategory>): Promise<ICategory> {
        const category = new Category(data);
        return await category.save();
    }

    /**
     * Find category by ID
     */
    async findById(id: string): Promise<ICategory | null> {
        return await Category.findOne({ _id: id, is_active: true });
    }

    /**
     * Find category by ID (including inactive)
     */
    async findByIdIncludingInactive(id: string): Promise<ICategory | null> {
        return await Category.findById(id);
    }

    /**
     * Find all categories with pagination and filters
     */
    async findAll(filters: FilterQuery<ICategory>, options: PaginationOptions) {
        return await executePaginatedQuery(Category, filters, options);
    }

    /**
     * Update category
     */
    async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    /**
     * Soft delete category
     */
    async softDelete(id: string): Promise<ICategory | null> {
        return await Category.findByIdAndUpdate(id, { is_active: false }, { new: true });
    }

    /**
     * Hard delete category (use with caution)
     */
    async hardDelete(id: string): Promise<void> {
        await Category.findByIdAndDelete(id);
    }

    /**
     * Check if category exists
     */
    async exists(id: string): Promise<boolean> {
        const count = await Category.countDocuments({ _id: id, is_active: true });
        return count > 0;
    }

    /**
     * Find category by name
     */
    async findByName(name: string): Promise<ICategory | null> {
        return await Category.findOne({ name, is_active: true });
    }
}
