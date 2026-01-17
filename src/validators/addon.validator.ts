import { z } from 'zod';

/**
 * Addon Validators
 */

export const createAddonSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').trim(),
        description: z.string().optional(),
        price: z.number().min(0, 'Price must be non-negative'),
        item_id: z.string().min(1, 'Item ID is required'),
        is_mandatory: z.boolean().optional(),
        group_id: z.string().optional(),
        group_name: z.string().optional(),
    }),
});

export const updateAddonSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Addon ID is required'),
    }),
    body: z.object({
        name: z.string().min(1).trim().optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        is_mandatory: z.boolean().optional(),
        group_id: z.string().optional(),
        group_name: z.string().optional(),
        is_active: z.boolean().optional(),
    }),
});

export const getAddonSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Addon ID is required'),
    }),
});

export const listAddonsSchema = z.object({
    query: z.object({
        item_id: z.string().optional(),
        group_id: z.string().optional(),
        is_mandatory: z.enum(['true', 'false']).optional(),
        is_active: z.enum(['true', 'false']).optional(),
    }),
});

export type CreateAddonInput = z.infer<typeof createAddonSchema>;
export type UpdateAddonInput = z.infer<typeof updateAddonSchema>;
export type GetAddonInput = z.infer<typeof getAddonSchema>;
export type ListAddonsInput = z.infer<typeof listAddonsSchema>;
