import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants';

/**
 * Global Error Handler Middleware
 */

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Validation Error',
            message: err.message,
        });
    }

    if (err.name === 'CastError') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Invalid ID format',
            message: 'The provided ID is not valid',
        });
    }

    if (err.message.includes('duplicate key')) {
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            error: 'Duplicate Entry',
            message: 'A record with this value already exists',
        });
    }

    // Default error
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
    });
};
