/**
 * Application-wide constants
 * Centralized source of truth for enums and configuration values
 */

export const PRICING_TYPES = {
    STATIC: 'static',
    TIERED: 'tiered',
    COMPLIMENTARY: 'complimentary',
    DISCOUNTED: 'discounted',
    DYNAMIC_TIME_BASED: 'dynamic_time_based',
} as const;

export const DISCOUNT_TYPES = {
    FLAT: 'flat',
    PERCENTAGE: 'percentage',
} as const;

export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
} as const;

export const DAYS_OF_WEEK = {
    MONDAY: 'monday',
    TUESDAY: 'tuesday',
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday',
    SATURDAY: 'saturday',
    SUNDAY: 'sunday',
} as const;

// Validation constants
export const VALIDATION = {
    MIN_TAX_PERCENTAGE: 0,
    MAX_TAX_PERCENTAGE: 100,
    MIN_PRICE: 0,
    MAX_PRICE: 1000000,
    MIN_DISCOUNT_PERCENTAGE: 0,
    MAX_DISCOUNT_PERCENTAGE: 100,
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_BOOKING_DURATION_MINUTES: 15,
    MAX_BOOKING_DURATION_MINUTES: 480, // 8 hours
} as const;

// Sort options
export const SORT_OPTIONS = {
    NAME: 'name',
    PRICE: 'price',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
} as const;

export const SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc',
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
    CATEGORY_NOT_FOUND: 'Category not found',
    SUBCATEGORY_NOT_FOUND: 'Subcategory not found',
    ITEM_NOT_FOUND: 'Item not found',
    ADDON_NOT_FOUND: 'Add-on not found',
    BOOKING_NOT_FOUND: 'Booking not found',
    INVALID_PRICING_TYPE: 'Invalid pricing type',
    TIER_OVERLAP_DETECTED: 'Tiered pricing has overlapping quantity ranges',
    TIME_WINDOW_OVERLAP: 'Time windows have overlapping ranges',
    SLOT_NOT_AVAILABLE: 'Selected time slot is not available',
    BOOKING_CONFLICT: 'Booking conflicts with existing reservation',
    INVALID_TAX_PERCENTAGE: 'Tax percentage must be between 0 and 100',
    ITEM_NOT_BOOKABLE: 'This item is not available for booking',
    DATABASE_ERROR: 'Database operation failed',
    VALIDATION_ERROR: 'Validation failed',
} as const;

// Type exports
export type PricingType = (typeof PRICING_TYPES)[keyof typeof PRICING_TYPES];
export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[keyof typeof DAYS_OF_WEEK];
export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];
export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];
