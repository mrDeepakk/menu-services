import { FilterQuery } from 'mongoose';

/**
 * Pagination Utility
 * Reusable helper for consistent pagination across all list endpoints
 */

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export function buildPaginationQuery(options: PaginationOptions) {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = options;

    // Ensure valid values
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    const skip = (validPage - 1) * validLimit;

    // Build sort object
    const sort: { [key: string]: 1 | -1 } = {
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    return {
        skip,
        limit: validLimit,
        sort,
        page: validPage,
    };
}

export async function executePaginatedQuery<T>(
    model: any,
    filter: FilterQuery<T>,
    options: PaginationOptions,
    populateFields?: string | string[]
): Promise<PaginationResult<T>> {
    const { skip, limit, sort, page } = buildPaginationQuery(options);

    // Execute query
    let query = model.find(filter).skip(skip).limit(limit).sort(sort);

    // Add population if needed
    if (populateFields) {
        if (Array.isArray(populateFields)) {
            populateFields.forEach((field) => {
                query = query.populate(field);
            });
        } else {
            query = query.populate(populateFields);
        }
    }

    const [data, total] = await Promise.all([query.exec(), model.countDocuments(filter)]);

    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}
