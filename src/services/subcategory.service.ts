import { SubcategoryRepository } from '../repositories/subcategory.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { ItemRepository } from '../repositories/item.repository';
import { ISubcategory } from '../models/subcategory.model';
import { FilterQuery } from 'mongoose';
import { PaginationOptions } from '../utils/pagination.util';
import { ERROR_MESSAGES } from '../constants';

/**
 * Subcategory Service
 */

export class SubcategoryService {
    private subcategoryRepo: SubcategoryRepository;
    private categoryRepo: CategoryRepository;
    private itemRepo: ItemRepository;

    constructor() {
        this.subcategoryRepo = new SubcategoryRepository();
        this.categoryRepo = new CategoryRepository();
        this.itemRepo = new ItemRepository();
    }

    /**
     * Create a new subcategory
     */
    async createSubcategory(data: Partial<ISubcategory>) {
        // Validate category exists
        const categoryExists = await this.categoryRepo.exists(data.category_id!.toString());

        if (!categoryExists) {
            throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }

        return await this.subcategoryRepo.create(data);
    }

    /**
     * Get subcategory by ID
     */
    async getSubcategoryById(id: string, populate = true) {
        const subcategory = await this.subcategoryRepo.findById(id, populate);

        if (!subcategory) {
            throw new Error(ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND);
        }

        return subcategory;
    }

    /**
     * List subcategories with pagination
     */
    async listSubcategories(filters: FilterQuery<ISubcategory>, options: PaginationOptions) {
        return await this.subcategoryRepo.findAll(filters, options);
    }

    /**
     * Update subcategory
     */
    async updateSubcategory(id: string, data: Partial<ISubcategory>) {
        const subcategory = await this.subcategoryRepo.findByIdIncludingInactive(id);

        if (!subcategory) {
            throw new Error(ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND);
        }

        // If updating category, validate it exists
        if (data.category_id) {
            const categoryExists = await this.categoryRepo.exists(data.category_id.toString());
            if (!categoryExists) {
                throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
            }
        }

        return await this.subcategoryRepo.update(id, data);
    }

    /**
     * Soft delete subcategory and cascade to items
     */
    async deleteSubcategory(id: string) {
        const subcategory = await this.subcategoryRepo.findByIdIncludingInactive(id);

        if (!subcategory) {
            throw new Error(ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND);
        }

        // Soft delete subcategory
        await this.subcategoryRepo.softDelete(id);

        // Cascade soft delete to items
        await this.itemRepo.softDeleteBySubcategory(id);

        return { message: 'Subcategory and all dependent items deleted successfully' };
    }
}
