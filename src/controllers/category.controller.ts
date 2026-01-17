import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { HTTP_STATUS } from '../constants';
import { FilterQuery } from 'mongoose';
import { ICategory } from '../models/category.model';

/**
 * Category Controller
 * Thin HTTP layer - delegates to service
 */

const categoryService = new CategoryService();

export class CategoryController {
    /**
     * Create category
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await categoryService.createCategory(req.body);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get category by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * List categories
     */
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { search, is_active, ...paginationOptions } = req.query;

            // Build filters
            const filters: FilterQuery<ICategory> = {};

            if (is_active !== undefined) {
                filters.is_active = is_active === 'true';
            }

            if (search) {
                filters.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }

            const result = await categoryService.listCategories(filters, paginationOptions as any);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update category
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await categoryService.updateCategory(req.params.id, req.body);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete category
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await categoryService.deleteCategory(req.params.id);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }
}
