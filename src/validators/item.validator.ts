import { z } from 'zod';
import { PRICING_TYPES, DISCOUNT_TYPES, DAYS_OF_WEEK, VALIDATION } from '../constants';
import { validateTieredPricing, validateTimeWindows } from '../utils/pricing-engine.util';
import { ITier, ITimeWindow } from '../models/item.model';

/**
 * Item Validators with complex pricing validation
 */

// Pricing details schemas
const tierSchema = z.object({
    min_quantity: z.number().int().min(1),
    max_quantity: z.number().int().min(1),
    price_per_unit: z.number().min(0),
});

const discountPricingSchema = z.object({
    base_price: z.number().min(0),
    discount_type: z.enum([DISCOUNT_TYPES.FLAT, DISCOUNT_TYPES.PERCENTAGE]),
    discount_value: z.number().min(0),
});

const timeWindowSchema = z.object({
    day_of_week: z.enum([
        DAYS_OF_WEEK.MONDAY,
        DAYS_OF_WEEK.TUESDAY,
        DAYS_OF_WEEK.WEDNESDAY,
        DAYS_OF_WEEK.THURSDAY,
        DAYS_OF_WEEK.FRIDAY,
        DAYS_OF_WEEK.SATURDAY,
        DAYS_OF_WEEK.SUNDAY,
    ]),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    price: z.number().min(0),
});

const availabilitySchema = z.object({
    days: z
        .array(
            z.enum([
                DAYS_OF_WEEK.MONDAY,
                DAYS_OF_WEEK.TUESDAY,
                DAYS_OF_WEEK.WEDNESDAY,
                DAYS_OF_WEEK.THURSDAY,
                DAYS_OF_WEEK.FRIDAY,
                DAYS_OF_WEEK.SATURDAY,
                DAYS_OF_WEEK.SUNDAY,
            ])
        )
        .min(1),
    time_slots: z
        .array(
            z.object({
                start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
                end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            })
        )
        .min(1),
});

// Create item schema with conditional pricing validation
export const createItemSchema = z
    .object({
        body: z.object({
            name: z.string().min(1, 'Name is required').trim(),
            description: z.string().optional(),
            subcategory_id: z.string().min(1, 'Subcategory ID is required'),
            pricing_type: z.enum([
                PRICING_TYPES.STATIC,
                PRICING_TYPES.TIERED,
                PRICING_TYPES.COMPLIMENTARY,
                PRICING_TYPES.DISCOUNTED,
                PRICING_TYPES.DYNAMIC_TIME_BASED,
            ]),
            pricing_details: z.object({
                static_price: z.number().min(0).optional(),
                tiers: z.array(tierSchema).optional(),
                discount: discountPricingSchema.optional(),
                time_windows: z.array(timeWindowSchema).optional(),
                unavailable_outside_windows: z.boolean().optional(),
            }),
            is_bookable: z.boolean().optional(),
            availability: availabilitySchema.optional(),
        }),
    })
    .refine(
        (data) => {
            const { pricing_type, pricing_details } = data.body;

            // Validate pricing details based on type
            switch (pricing_type) {
                case PRICING_TYPES.STATIC:
                    return (
                        pricing_details.static_price !== undefined && pricing_details.static_price >= 0
                    );

                case PRICING_TYPES.TIERED:
                    if (!pricing_details.tiers || pricing_details.tiers.length === 0) {
                        return false;
                    }
                    // Check for overlapping tiers
                    return validateTieredPricing(pricing_details.tiers as ITier[]);

                case PRICING_TYPES.COMPLIMENTARY:
                    return true; // No additional validation needed

                case PRICING_TYPES.DISCOUNTED:
                    if (!pricing_details.discount) {
                        return false;
                    }
                    const { base_price, discount_type, discount_value } = pricing_details.discount;
                    // Ensure discount doesn't make price negative
                    if (discount_type === DISCOUNT_TYPES.FLAT) {
                        return discount_value <= base_price;
                    }
                    return discount_value <= 100;

                case PRICING_TYPES.DYNAMIC_TIME_BASED:
                    if (!pricing_details.time_windows || pricing_details.time_windows.length === 0) {
                        return false;
                    }
                    // Check for overlapping time windows
                    return validateTimeWindows(pricing_details.time_windows as ITimeWindow[]);

                default:
                    return false;
            }
        },
        {
            message: 'Invalid pricing configuration for selected pricing type',
        }
    );

export const updateItemSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Item ID is required'),
    }),
    body: z.object({
        name: z.string().min(1).trim().optional(),
        description: z.string().optional(),
        subcategory_id: z.string().optional(),
        pricing_type: z
            .enum([
                PRICING_TYPES.STATIC,
                PRICING_TYPES.TIERED,
                PRICING_TYPES.COMPLIMENTARY,
                PRICING_TYPES.DISCOUNTED,
                PRICING_TYPES.DYNAMIC_TIME_BASED,
            ])
            .optional(),
        pricing_details: z
            .object({
                static_price: z.number().min(0).optional(),
                tiers: z.array(tierSchema).optional(),
                discount: discountPricingSchema.optional(),
                time_windows: z.array(timeWindowSchema).optional(),
                unavailable_outside_windows: z.boolean().optional(),
            })
            .optional(),
        is_bookable: z.boolean().optional(),
        availability: availabilitySchema.optional(),
        is_active: z.boolean().optional(),
    }),
});

export const getItemSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Item ID is required'),
    }),
});

export const listItemsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(VALIDATION.MAX_LIMIT).optional(),
        sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        subcategory_id: z.string().optional(),
        category_id: z.string().optional(),
        pricing_type: z.string().optional(),
        is_bookable: z.enum(['true', 'false']).optional(),
        is_active: z.enum(['true', 'false']).optional(),
        search: z.string().optional(),
        min_price: z.coerce.number().min(0).optional(),
        max_price: z.coerce.number().min(0).optional(),
    }),
});

export const getItemPriceSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Item ID is required'),
    }),
    query: z.object({
        quantity: z.coerce.number().int().min(1).optional(),
        addon_ids: z.string().optional(), // Comma-separated addon IDs
    }),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type GetItemInput = z.infer<typeof getItemSchema>;
export type ListItemsInput = z.infer<typeof listItemsSchema>;
export type GetItemPriceInput = z.infer<typeof getItemPriceSchema>;
