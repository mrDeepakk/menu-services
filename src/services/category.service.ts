import { CategoryRepository } from '../repositories/category.repository';
import { SubcategoryRepository } from '../repositories/subcategory.repository';
import { ItemRepository } from '../repositories/item.repository';
import { ICategory } from '../models/category.model';
import { FilterQuery } from 'mongoose';
import { PaginationOptions } from '../utils/pagination.util';
import { ERROR_MESSAGES } from '../constants';

/**
 * Category Service
 * Business logic for category management
 */

export class CategoryService {
    private categoryRepo: CategoryRepository;
    private subcategoryRepo: SubcategoryRepository;
    private itemRepo: ItemRepository;

    constructor() {
        this.categoryRepo = new CategoryRepository();
        this.subcategoryRepo = new SubcategoryRepository();
        this.itemRepo = new ItemRepository();
    }

    /**
     * Create a new category
     */
    async createCategory(data: Partial<ICategory>) {
        // Check for duplicate name
        const existing = await this.categoryRepo.findByName(data.name as string);
        if (existing) {
            throw new Error('Category with this name already exists');
        }

        return await this.categoryRepo.create(data);
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: string) {
        const category = await this.categoryRepo.findById(id);

        if (!category) {
            throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }

        return category;
    }

    /**
     * List categories with pagination and filters
     */
    async listCategories(filters: FilterQuery<ICategory>, options: PaginationOptions) {
        return await this.categoryRepo.findAll(filters, options);
    }

    /**
     * Update category
     */
    async updateCategory(id: string, data: Partial<ICategory>) {
        const category = await this.categoryRepo.findByIdIncludingInactive(id);

        if (!category) {
            throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }

        // If updating name, check for duplicates
        if (data.name && data.name !== category.name) {
            const existing = await this.categoryRepo.findByName(data.name);
            if (existing) {
                throw new Error('Category with this name already exists');
            }
        }

        return await this.categoryRepo.update(id, data);
    }

    /**
     * Soft delete category
     * This will cascade to subcategories and items
     */
    async deleteCategory(id: string) {
        const category = await this.categoryRepo.findByIdIncludingInactive(id);

        if (!category) {
            throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }

        // Soft delete category
        await this.categoryRepo.softDelete(id);

        // Cascade soft delete to subcategories
        const subcategories = await this.subcategoryRepo.findByCategory(id);

        for (const subcategory of subcategories) {
            await this.subcategoryRepo.softDelete(subcategory._id.toString());

            // Cascade soft delete to items
            await this.itemRepo.softDeleteBySubcategory(subcategory._id.toString());
        }

        return { message: 'Category and all dependent entities deleted successfully' };
    }

    /**
     * Validate tax configuration changes
     * (Could add notification logic here for dependent items)
     */
    async validateTaxChange(categoryId: string, newTaxPercentage: number) {
        const category = await this.categoryRepo.findById(categoryId);

        if (!category) {
            throw new Error(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }

        // Get affected subcategories (those without tax override)
        const subcategories = await this.subcategoryRepo.findByCategory(categoryId);

        const affectedSubcategories = subcategories.filter(
            (sub) => sub.tax_applicable === undefined || sub.tax_percentage === undefined
        );

        // Count affected items
        let affectedItemsCount = 0;
        for (const sub of affectedSubcategories) {
            const items = await this.itemRepo.findBySubcategory(sub._id.toString());
            affectedItemsCount += items.length;
        }

        return {
            current_tax: category.tax_percentage,
            new_tax: newTaxPercentage,
            affected_subcategories: affectedSubcategories.length,
            affected_items: affectedItemsCount,
        };
    }
}
