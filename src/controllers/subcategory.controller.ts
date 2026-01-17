import { Request, Response, NextFunction } from 'express';
import { SubcategoryService } from '../services/subcategory.service';
import { HTTP_STATUS } from '../constants';
import { FilterQuery } from 'mongoose';
import { ISubcategory } from '../models/subcategory.model';

/**
 * Subcategory Controller
 */

const subcategoryService = new SubcategoryService();

export class SubcategoryController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const subcategory = await subcategoryService.createSubcategory(req.body);
            return res.status(HTTP_STATUS.CREATED).json({ success: true, data: subcategory });
        } catch (error) {
            return next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const subcategory = await subcategoryService.getSubcategoryById(req.params.id);
            return res.status(HTTP_STATUS.OK).json({ success: true, data: subcategory });
        } catch (error) {
            return next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { search, category_id, is_active, ...paginationOptions } = req.query;

            const filters: FilterQuery<ISubcategory> = {};

            if (category_id) filters.category_id = category_id;
            if (is_active !== undefined) filters.is_active = is_active === 'true';

            if (search) {
                filters.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }

            const result = await subcategoryService.listSubcategories(filters, paginationOptions as any);
            return res.status(HTTP_STATUS.OK).json({ success: true, ...result });
        } catch (error) {
            return next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const subcategory = await subcategoryService.updateSubcategory(req.params.id, req.body);
            return res.status(HTTP_STATUS.OK).json({ success: true, data: subcategory });
        } catch (error) {
            return next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await subcategoryService.deleteSubcategory(req.params.id);
            return res.status(HTTP_STATUS.OK).json({ success: true, message: result.message });
        } catch (error) {
            return next(error);
        }
    }
}
