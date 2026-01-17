import { validateTieredPricing, validateTimeWindows } from '../../utils/pricing-engine.util';
import { ITier, ITimeWindow } from '../../models/item.model';

/**
 * Sample Tests for Pricing Engine
 * Demonstrates testing approach for business logic
 */

describe('Pricing Engine - Tiered Pricing Validation', () => {
    test('should accept non-overlapping tiers', () => {
        const tiers: ITier[] = [
            { min_quantity: 1, max_quantity: 10, price_per_unit: 50 },
            { min_quantity: 11, max_quantity: 50, price_per_unit: 45 },
            { min_quantity: 51, max_quantity: 100, price_per_unit: 40 },
        ];

        expect(validateTieredPricing(tiers)).toBe(true);
    });

    test('should reject overlapping tiers', () => {
        const tiers: ITier[] = [
            { min_quantity: 1, max_quantity: 15, price_per_unit: 50 },
            { min_quantity: 10, max_quantity: 50, price_per_unit: 45 }, // Overlaps with first
        ];

        expect(validateTieredPricing(tiers)).toBe(false);
    });

    test('should handle edge case: adjacent tiers', () => {
        const tiers: ITier[] = [
            { min_quantity: 1, max_quantity: 10, price_per_unit: 50 },
            { min_quantity: 11, max_quantity: 20, price_per_unit: 45 }, // Starts right after first
        ];

        expect(validateTieredPricing(tiers)).toBe(true);
    });
});

describe('Pricing Engine - Time Windows Validation', () => {
    test('should accept non-overlapping windows on same day', () => {
        const windows: ITimeWindow[] = [
            { day_of_week: 'monday', start_time: '09:00', end_time: '12:00', price: 100 },
            { day_of_week: 'monday', start_time: '14:00', end_time: '18:00', price: 120 },
        ];

        expect(validateTimeWindows(windows)).toBe(true);
    });

    test('should accept overlapping windows on different days', () => {
        const windows: ITimeWindow[] = [
            { day_of_week: 'monday', start_time: '09:00', end_time: '17:00', price: 100 },
            { day_of_week: 'tuesday', start_time: '09:00', end_time: '17:00', price: 100 },
        ];

        expect(validateTimeWindows(windows)).toBe(true);
    });

    test('should reject overlapping windows on same day', () => {
        const windows: ITimeWindow[] = [
            { day_of_week: 'monday', start_time: '09:00', end_time: '14:00', price: 100 },
            { day_of_week: 'monday', start_time: '12:00', end_time: '18:00', price: 120 }, // Overlaps
        ];

        expect(validateTimeWindows(windows)).toBe(false);
    });
});

describe('Pricing Engine - Edge Cases', () => {
    test('empty tiers array should return true', () => {
        expect(validateTieredPricing([])).toBe(true);
    });

    test('single tier should always be valid', () => {
        const tiers: ITier[] = [{ min_quantity: 1, max_quantity: 100, price_per_unit: 50 }];

        expect(validateTieredPricing(tiers)).toBe(true);
    });

    test('single time window should always be valid', () => {
        const windows: ITimeWindow[] = [
            { day_of_week: 'monday', start_time: '09:00', end_time: '18:00', price: 100 },
        ];

        expect(validateTimeWindows(windows)).toBe(true);
    });
});
