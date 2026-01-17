import { z } from 'zod';
import { VALIDATION } from '../constants';

/**
 * Category Validators
 * Zod schemas for validating category-related requests
 */

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').trim(),
        description: z.string().optional(),
        tax_applicable: z.boolean(),
        tax_percentage: z
            .number()
            .min(VALIDATION.MIN_TAX_PERCENTAGE)
            .max(VALIDATION.MAX_TAX_PERCENTAGE),
    }),
});

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Category ID is required'),
    }),
    body: z.object({
        name: z.string().min(1).trim().optional(),
        description: z.string().optional(),
        tax_applicable: z.boolean().optional(),
        tax_percentage: z
            .number()
            .min(VALIDATION.MIN_TAX_PERCENTAGE)
            .max(VALIDATION.MAX_TAX_PERCENTAGE)
            .optional(),
        is_active: z.boolean().optional(),
    }),
});

export const getCategorySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Category ID is required'),
    }),
});

export const listCategoriesSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(VALIDATION.MAX_LIMIT).optional(),
        sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        is_active: z.enum(['true', 'false']).optional(),
        search: z.string().optional(),
    }),
});

export const deleteCategorySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Category ID is required'),
    }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryInput = z.infer<typeof getCategorySchema>;
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
