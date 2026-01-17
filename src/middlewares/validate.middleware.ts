import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import { HTTP_STATUS } from '../constants';

/**
 * Validation Middleware
 * Validates request using Zod schemas
 */

export const validate = (schema: ZodType<any, any, any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }

            return next(error);
        }
    };
};
