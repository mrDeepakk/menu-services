import { Item, IItem } from '../models/item.model';
import { FilterQuery } from 'mongoose';
import { PaginationOptions, executePaginatedQuery } from '../utils/pagination.util';

/**
 * Item Repository
 */

export class ItemRepository {
    /**
     * Create a new item
     */
    async create(data: Partial<IItem>): Promise<IItem> {
        const item = new Item(data);
        return await item.save();
    }

    /**
     * Find item by ID
     */
    async findById(id: string, populate = false): Promise<IItem | null> {
        const query = Item.findOne({ _id: id, is_active: true });
        if (populate) {
            query.populate({
                path: 'subcategory_id',
                populate: {
                    path: 'category_id',
                },
            });
        }
        return await query;
    }

    /**
     * Find item by ID (including inactive)
     */
    async findByIdIncludingInactive(id: string, populate = false): Promise<IItem | null> {
        const query = Item.findById(id);
        if (populate) {
            query.populate({
                path: 'subcategory_id',
                populate: {
                    path: 'category_id',
                },
            });
        }
        return await query;
    }

    /**
     * Find all items with pagination, search, and filters
     */
    async findAll(filters: FilterQuery<IItem>, options: PaginationOptions) {
        return await executePaginatedQuery(Item, filters, options, {
            path: 'subcategory_id',
            populate: { path: 'category_id' },
        } as any);
    }

    /**
     * Search items by text
     */
    async search(searchText: string, options: PaginationOptions) {
        const filter: FilterQuery<IItem> = {
            $text: { $search: searchText },
            is_active: true,
        };
        return await executePaginatedQuery(Item, filter, options);
    }

    /**
     * Update item
     */
    async update(id: string, data: Partial<IItem>): Promise<IItem | null> {
        return await Item.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    /**
     * Soft delete item
     */
    async softDelete(id: string): Promise<IItem | null> {
        return await Item.findByIdAndUpdate(id, { is_active: false }, { new: true });
    }

    /**
     * Soft delete all items of a subcategory
     */
    async softDeleteBySubcategory(subcategoryId: string): Promise<void> {
        await Item.updateMany({ subcategory_id: subcategoryId }, { is_active: false });
    }

    /**
     * Check if item exists
     */
    async exists(id: string): Promise<boolean> {
        const count = await Item.countDocuments({ _id: id, is_active: true });
        return count > 0;
    }

    /**
     * Find items by subcategory
     */
    async findBySubcategory(subcategoryId: string): Promise<IItem[]> {
        return await Item.find({ subcategory_id: subcategoryId, is_active: true });
    }

    /**
     * Find bookable items
     */
    async findBookable(): Promise<IItem[]> {
        return await Item.find({ is_bookable: true, is_active: true });
    }
}
