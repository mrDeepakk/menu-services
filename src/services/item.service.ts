import { ItemRepository } from '../repositories/item.repository';
import { SubcategoryRepository } from '../repositories/subcategory.repository';
import { AddonRepository } from '../repositories/addon.repository';
import { IItem } from '../models/item.model';
import { FilterQuery } from 'mongoose';
import { PaginationOptions } from '../utils/pagination.util';
import { ERROR_MESSAGES } from '../constants';
import { resolveTax } from '../utils/tax-resolver.util';
import { calculatePrice, PriceCalculationContext } from '../utils/pricing-engine.util';

/**
 * Item Service
 * Integrates pricing engine and tax resolution
 */

export class ItemService {
    private itemRepo: ItemRepository;
    private subcategoryRepo: SubcategoryRepository;
    private addonRepo: AddonRepository;

    constructor() {
        this.itemRepo = new ItemRepository();
        this.subcategoryRepo = new SubcategoryRepository();
        this.addonRepo = new AddonRepository();
    }

    /**
     * Create a new item
     */
    async createItem(data: Partial<IItem>) {
        // Validate subcategory exists
        const subcategoryExists = await this.subcategoryRepo.exists(data.subcategory_id!.toString());

        if (!subcategoryExists) {
            throw new Error(ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND);
        }

        return await this.itemRepo.create(data);
    }

    /**
     * Get item by ID
     */
    async getItemById(id: string, populate = true) {
        const item = await this.itemRepo.findById(id, populate);

        if (!item) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
        }

        return item;
    }

    /**
     * List items with filters, search, and pagination
     */
    async listItems(filters: FilterQuery<IItem>, options: PaginationOptions) {
        return await this.itemRepo.findAll(filters, options);
    }

    /**
     * Search items by text
     */
    async searchItems(searchText: string, options: PaginationOptions) {
        return await this.itemRepo.search(searchText, options);
    }

    /**
     * Update item
     */
    async updateItem(id: string, data: Partial<IItem>) {
        const item = await this.itemRepo.findByIdIncludingInactive(id);

        if (!item) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
        }

        // If updating subcategory, validate it exists
        if (data.subcategory_id) {
            const subcategoryExists = await this.subcategoryRepo.exists(data.subcategory_id.toString());
            if (!subcategoryExists) {
                throw new Error(ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND);
            }
        }

        return await this.itemRepo.update(id, data);
    }

    /**
     * Soft delete item
     */
    async deleteItem(id: string) {
        const item = await this.itemRepo.findByIdIncludingInactive(id);

        if (!item) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
        }

        await this.itemRepo.softDelete(id);

        return { message: 'Item deleted successfully' };
    }

    /**
     * Get item price with tax calculation
     * This is the CRITICAL endpoint that demonstrates dynamic pricing and tax inheritance
     */
    async getItemPrice(id: string, context: PriceCalculationContext = {}) {
        // Get item with populated relationships
        const item = await this.itemRepo.findById(id, true);

        if (!item) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
        }

        // Resolve tax inheritance
        const taxInfo = await resolveTax(item);

        // Get addon prices if provided
        let addonPrices: number[] = [];
        if (context.selected_addon_prices) {
            addonPrices = context.selected_addon_prices;
        }

        // Calculate price using pricing engine
        const priceBreakdown = await calculatePrice(item, taxInfo, {
            ...context,
            selected_addon_prices: addonPrices,
        });

        return {
            item_id: item._id,
            item_name: item.name,
            ...priceBreakdown,
        };
    }

    /**
     * Get item with addons
     */
    async getItemWithAddons(id: string) {
        const item = await this.getItemById(id, true);
        const addons = await this.addonRepo.findByItem(id);

        // Group addons
        const addonGroups: { [key: string]: any[] } = {
            mandatory: [],
            optional: [],
        };

        addons.forEach((addon) => {
            if (addon.is_mandatory) {
                addonGroups.mandatory.push(addon);
            } else if (addon.group_id) {
                if (!addonGroups[addon.group_id]) {
                    addonGroups[addon.group_id] = [];
                }
                addonGroups[addon.group_id].push(addon);
            } else {
                addonGroups.optional.push(addon);
            }
        });

        return {
            item,
            addons: addonGroups,
        };
    }
}
