import { AddonRepository } from '../repositories/addon.repository';
import { ItemRepository } from '../repositories/item.repository';
import { IAddon } from '../models/addon.model';
import { FilterQuery } from 'mongoose';
import { ERROR_MESSAGES } from '../constants';

/**
 * Addon Service
 */

export class AddonService {
    private addonRepo: AddonRepository;
    private itemRepo: ItemRepository;

    constructor() {
        this.addonRepo = new AddonRepository();
        this.itemRepo = new ItemRepository();
    }

    /**
     * Create a new addon
     */
    async createAddon(data: Partial<IAddon>) {
        // Validate item exists
        const itemExists = await this.itemRepo.exists(data.item_id!.toString());

        if (!itemExists) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
        }

        return await this.addonRepo.create(data);
    }

    /**
     * Get addon by ID
     */
    async getAddonById(id: string) {
        const addon = await this.addonRepo.findById(id);

        if (!addon) {
            throw new Error(ERROR_MESSAGES.ADDON_NOT_FOUND);
        }

        return addon;
    }

    /**
     * List addons with filters
     */
    async listAddons(filters: FilterQuery<IAddon>) {
        return await this.addonRepo.findAll(filters);
    }

    /**
     * Get addons for an item
     */
    async getAddonsByItem(itemId: string) {
        const itemExists = await this.itemRepo.exists(itemId);

        if (!itemExists) {
            throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
        }

        return await this.addonRepo.findByItem(itemId);
    }

    /**
     * Update addon
     */
    async updateAddon(id: string, data: Partial<IAddon>) {
        const addon = await this.addonRepo.findById(id);

        if (!addon) {
            throw new Error(ERROR_MESSAGES.ADDON_NOT_FOUND);
        }

        return await this.addonRepo.update(id, data);
    }

    /**
     * Soft delete addon
     */
    async deleteAddon(id: string) {
        const addon = await this.addonRepo.findById(id);

        if (!addon) {
            throw new Error(ERROR_MESSAGES.ADDON_NOT_FOUND);
        }

        await this.addonRepo.softDelete(id);

        return { message: 'Addon deleted successfully' };
    }

    /**
     * Calculate total addon price for selected addons
     */
    async calculateAddonTotal(addonIds: string[]) {
        const addons = await this.addonRepo.findByIds(addonIds);

        if (addons.length !== addonIds.length) {
            throw new Error('One or more addons not found');
        }

        const total = addons.reduce((sum, addon) => sum + addon.price, 0);

        return {
            addons,
            total,
        };
    }
}
