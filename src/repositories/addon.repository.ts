import { Addon, IAddon } from '../models/addon.model';
import { FilterQuery } from 'mongoose';

/**
 * Addon Repository
 */

export class AddonRepository {
    /**
     * Create a new addon
     */
    async create(data: Partial<IAddon>): Promise<IAddon> {
        const addon = new Addon(data);
        return await addon.save();
    }

    /**
     * Find addon by ID
     */
    async findById(id: string): Promise<IAddon | null> {
        return await Addon.findOne({ _id: id, is_active: true });
    }

    /**
     * Find multiple addons by IDs
     */
    async findByIds(ids: string[]): Promise<IAddon[]> {
        return await Addon.find({ _id: { $in: ids }, is_active: true });
    }

    /**
     * Find all addons with filters
     */
    async findAll(filters: FilterQuery<IAddon>): Promise<IAddon[]> {
        return await Addon.find(filters);
    }

    /**
     * Find addons by item ID
     */
    async findByItem(itemId: string): Promise<IAddon[]> {
        return await Addon.find({ item_id: itemId, is_active: true });
    }

    /**
     * Find addons by item ID and group
     */
    async findByItemAndGroup(itemId: string, groupId: string): Promise<IAddon[]> {
        return await Addon.find({ item_id: itemId, group_id: groupId, is_active: true });
    }

    /**
     * Find mandatory addons for an item
     */
    async findMandatoryByItem(itemId: string): Promise<IAddon[]> {
        return await Addon.find({ item_id: itemId, is_mandatory: true, is_active: true });
    }

    /**
     * Update addon
     */
    async update(id: string, data: Partial<IAddon>): Promise<IAddon | null> {
        return await Addon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    /**
     * Soft delete addon
     */
    async softDelete(id: string): Promise<IAddon | null> {
        return await Addon.findByIdAndUpdate(id, { is_active: false }, { new: true });
    }

    /**
     * Check if addon exists
     */
    async exists(id: string): Promise<boolean> {
        const count = await Addon.countDocuments({ _id: id, is_active: true });
        return count > 0;
    }
}
