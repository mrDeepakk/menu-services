import { z } from 'zod';
import { VALIDATION } from '../constants';

/**
 * Subcategory Validators
 */

export const createSubcategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').trim(),
        description: z.string().optional(),
        category_id: z.string().min(1, 'Category ID is required'),
        tax_applicable: z.boolean().optional(),
        tax_percentage: z
            .number()
            .min(VALIDATION.MIN_TAX_PERCENTAGE)
            .max(VALIDATION.MAX_TAX_PERCENTAGE)
            .optional(),
    }),
});

export const updateSubcategorySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Subcategory ID is required'),
    }),
    body: z.object({
        name: z.string().min(1).trim().optional(),
        description: z.string().optional(),
        category_id: z.string().optional(),
        tax_applicable: z.boolean().optional(),
        tax_percentage: z
            .number()
            .min(VALIDATION.MIN_TAX_PERCENTAGE)
            .max(VALIDATION.MAX_TAX_PERCENTAGE)
            .optional(),
        is_active: z.boolean().optional(),
    }),
});

export const getSubcategorySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Subcategory ID is required'),
    }),
});

export const listSubcategoriesSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(VALIDATION.MAX_LIMIT).optional(),
        sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        category_id: z.string().optional(),
        is_active: z.enum(['true', 'false']).optional(),
        search: z.string().optional(),
    }),
});

export const deleteSubcategorySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Subcategory ID is required'),
    }),
});

export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
export type GetSubcategoryInput = z.infer<typeof getSubcategorySchema>;
export type ListSubcategoriesInput = z.infer<typeof listSubcategoriesSchema>;
export type DeleteSubcategoryInput = z.infer<typeof deleteSubcategorySchema>;
