import { Request, Response, NextFunction } from 'express';
import { ItemService } from '../services/item.service';
import { HTTP_STATUS } from '../constants';
import { FilterQuery } from 'mongoose';
import { IItem } from '../models/item.model';

/**
 * Item Controller
 */

const itemService = new ItemService();

export class ItemController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await itemService.createItem(req.body);
            return res.status(HTTP_STATUS.CREATED).json({ success: true, data: item });
        } catch (error) {
            return next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await itemService.getItemById(req.params.id);
            return res.status(HTTP_STATUS.OK).json({ success: true, data: item });
        } catch (error) {
            return next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                search,
                subcategory_id,
                category_id,
                pricing_type,
                is_bookable,
                is_active,
                min_price,
                max_price,
                ...paginationOptions
            } = req.query;

            const filters: FilterQuery<IItem> = {};

            if (subcategory_id) filters.subcategory_id = subcategory_id;
            if (pricing_type) filters.pricing_type = pricing_type;
            if (is_bookable !== undefined) filters.is_bookable = is_bookable === 'true';
            if (is_active !== undefined) filters.is_active = is_active === 'true';

            if (search) {
                const result = await itemService.searchItems(search as string, paginationOptions as any);
                return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
            }

            const result = await itemService.listItems(filters, paginationOptions as any);
            return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
        } catch (error) {
            return next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await itemService.updateItem(req.params.id, req.body);
            res.status(HTTP_STATUS.OK).json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await itemService.deleteItem(req.params.id);
            res.status(HTTP_STATUS.OK).json({ success: true, message: result.message });
        } catch (error) {
            next(error);
        }
    }

    /**
     * CRITICAL ENDPOINT: Get item price with dynamic calculation
     */
    async getPrice(req: Request, res: Response, next: NextFunction) {
        try {
            const { quantity, addon_ids } = req.query;

            const context: any = {};

            if (quantity) {
                context.quantity = parseInt(quantity as string);
            }

            if (addon_ids) {
                const ids = (addon_ids as string).split(',');
                // In real implementation, fetch addon prices here
                // For now, pass addon IDs
            }

            const priceBreakdown = await itemService.getItemPrice(req.params.id, context);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: priceBreakdown,
            });
        } catch (error) {
            next(error);
        }
    }

    async getWithAddons(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await itemService.getItemWithAddons(req.params.id);
            res.status(HTTP_STATUS.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
