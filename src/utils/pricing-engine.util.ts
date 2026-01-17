import { IItem, ITimeWindow, ITier } from '../models/item.model';
import { PRICING_TYPES } from '../constants';
import { TaxInfo, calculateTaxAmount } from './tax-resolver.util';

/**
 * Pricing Engine Utility
 * Dynamically calculates prices based on pricing type at request time
 * 
 * CRITICAL BUSINESS RULE:
 * Prices are NEVER stored in the database. Always calculated dynamically.
 * This ensures real-time accuracy and flexible business rules.
 */

export interface PriceCalculationContext {
    quantity?: number;
    current_time?: Date;
    selected_addon_prices?: number[];
}

export interface PriceBreakdown {
    pricing_type: string;
    base_price: number;
    applied_rule?: string;
    discount_amount?: number;
    addons_total: number;
    subtotal: number;
    tax_info: TaxInfo;
    tax_amount: number;
    final_price: number;
}

/**
 * Main pricing engine - calculates final price for an item
 */
export async function calculatePrice(
    item: IItem,
    taxInfo: TaxInfo,
    context: PriceCalculationContext = {}
): Promise<PriceBreakdown> {
    const { quantity = 1, current_time = new Date(), selected_addon_prices = [] } = context;

    let basePrice = 0;
    let appliedRule = '';
    let discountAmount = 0;

    // Calculate base price based on pricing type
    switch (item.pricing_type) {
        case PRICING_TYPES.STATIC:
            ({ basePrice, appliedRule } = calculateStaticPrice(item));
            break;

        case PRICING_TYPES.TIERED:
            ({ basePrice, appliedRule } = calculateTieredPrice(item, quantity));
            break;

        case PRICING_TYPES.COMPLIMENTARY:
            ({ basePrice, appliedRule } = calculateComplimentaryPrice());
            break;

        case PRICING_TYPES.DISCOUNTED:
            ({ basePrice, appliedRule, discountAmount } = calculateDiscountedPrice(item));
            break;

        case PRICING_TYPES.DYNAMIC_TIME_BASED:
            ({ basePrice, appliedRule } = calculateDynamicTimeBasedPrice(item, current_time));
            break;

        default:
            throw new Error(`Unknown pricing type: ${item.pricing_type}`);
    }

    // Calculate addons total
    const addonsTotal = selected_addon_prices.reduce((sum, price) => sum + price, 0);

    // Calculate subtotal (base price * quantity + addons)
    const subtotal = basePrice * quantity + addonsTotal;

    // Calculate tax
    const taxAmount = calculateTaxAmount(subtotal, taxInfo);

    // Final price
    const finalPrice = subtotal + taxAmount;

    return {
        pricing_type: item.pricing_type,
        base_price: basePrice,
        applied_rule: appliedRule,
        discount_amount: discountAmount,
        addons_total: addonsTotal,
        subtotal,
        tax_info: taxInfo,
        tax_amount: taxAmount,
        final_price: finalPrice,
    };
}

/**
 * STATIC PRICING
 */
function calculateStaticPrice(item: IItem): {
    basePrice: number;
    appliedRule: string;
} {
    const staticPrice = item.pricing_details.static_price || 0;

    return {
        basePrice: staticPrice,
        appliedRule: `Static price: ${staticPrice}`,
    };
}

/**
 * TIERED PRICING
 * Price changes based on quantity ranges
 */
function calculateTieredPrice(
    item: IItem,
    quantity: number
): { basePrice: number; appliedRule: string } {
    const tiers = item.pricing_details.tiers || [];

    if (tiers.length === 0) {
        throw new Error('No tiers defined for tiered pricing');
    }

    // Find matching tier
    const matchingTier = tiers.find(
        (tier) => quantity >= tier.min_quantity && quantity <= tier.max_quantity
    );

    if (!matchingTier) {
        throw new Error(`No tier found for quantity ${quantity}`);
    }

    return {
        basePrice: matchingTier.price_per_unit,
        appliedRule: `Tier: ${matchingTier.min_quantity}-${matchingTier.max_quantity} units @ ${matchingTier.price_per_unit} per unit`,
    };
}

/**
 * COMPLIMENTARY PRICING
 * Always free
 */
function calculateComplimentaryPrice(): { basePrice: number; appliedRule: string } {
    return {
        basePrice: 0,
        appliedRule: 'Complimentary (Free)',
    };
}

/**
 * DISCOUNTED PRICING
 * Flat or percentage discount on base price
 */
function calculateDiscountedPrice(item: IItem): {
    basePrice: number;
    appliedRule: string;
    discountAmount: number;
} {
    const discount = item.pricing_details.discount;

    if (!discount) {
        throw new Error('No discount configuration found');
    }

    const { base_price, discount_type, discount_value } = discount;

    let discountAmount = 0;
    let finalPrice = base_price;

    if (discount_type === 'flat') {
        discountAmount = discount_value;
        finalPrice = Math.max(0, base_price - discount_value);
    } else if (discount_type === 'percentage') {
        discountAmount = (base_price * discount_value) / 100;
        finalPrice = Math.max(0, base_price - discountAmount);
    }

    return {
        basePrice: finalPrice,
        appliedRule: `Base: ${base_price}, Discount: ${discount_value}${discount_type === 'percentage' ? '%' : ''} = ${finalPrice}`,
        discountAmount,
    };
}

/**
 * DYNAMIC TIME-BASED PRICING
 * Price varies based on time windows
 */
function calculateDynamicTimeBasedPrice(
    item: IItem,
    currentTime: Date
): { basePrice: number; appliedRule: string } {
    const timeWindows = item.pricing_details.time_windows || [];
    const unavailableOutside = item.pricing_details.unavailable_outside_windows || false;

    if (timeWindows.length === 0) {
        throw new Error('No time windows defined for dynamic pricing');
    }

    // Get current day of week and time
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = daysOfWeek[currentTime.getDay()];
    const currentTimeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    // Find matching window
    const matchingWindow = timeWindows.find((window) => {
        const dayMatches = window.day_of_week.toLowerCase() === currentDay;
        const timeMatches =
            currentTimeString >= window.start_time && currentTimeString <= window.end_time;
        return dayMatches && timeMatches;
    });

    if (!matchingWindow) {
        if (unavailableOutside) {
            throw new Error('Item is unavailable outside defined time windows');
        }
        // Return first window price as default
        return {
            basePrice: timeWindows[0].price,
            appliedRule: 'Default price (outside time windows)',
        };
    }

    return {
        basePrice: matchingWindow.price,
        appliedRule: `${matchingWindow.day_of_week} ${matchingWindow.start_time}-${matchingWindow.end_time}: ${matchingWindow.price}`,
    };
}

/**
 * VALIDATION HELPERS
 */

/**
 * Validate tiered pricing has no overlapping ranges
 */
export function validateTieredPricing(tiers: ITier[]): boolean {
    for (let i = 0; i < tiers.length; i++) {
        for (let j = i + 1; j < tiers.length; j++) {
            const tier1 = tiers[i];
            const tier2 = tiers[j];

            // Check for overlap
            const overlaps =
                (tier1.min_quantity <= tier2.max_quantity && tier1.max_quantity >= tier2.min_quantity) ||
                (tier2.min_quantity <= tier1.max_quantity && tier2.max_quantity >= tier1.min_quantity);

            if (overlaps) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Validate time windows have no overlaps
 */
export function validateTimeWindows(windows: ITimeWindow[]): boolean {
    // Group by day
    const windowsByDay: { [key: string]: ITimeWindow[] } = {};

    windows.forEach((window) => {
        const day = window.day_of_week.toLowerCase();
        if (!windowsByDay[day]) {
            windowsByDay[day] = [];
        }
        windowsByDay[day].push(window);
    });

    // Check for overlaps within each day
    for (const day in windowsByDay) {
        const dayWindows = windowsByDay[day];

        for (let i = 0; i < dayWindows.length; i++) {
            for (let j = i + 1; j < dayWindows.length; j++) {
                const w1 = dayWindows[i];
                const w2 = dayWindows[j];

                // Check if time ranges overlap
                const overlaps =
                    (w1.start_time <= w2.end_time && w1.end_time >= w2.start_time) ||
                    (w2.start_time <= w1.end_time && w2.end_time >= w1.start_time);

                if (overlaps) {
                    return false;
                }
            }
        }
    }

    return true;
}
