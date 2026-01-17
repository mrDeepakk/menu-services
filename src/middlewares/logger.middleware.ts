import morgan from 'morgan';

/**
 * Request Logger Middleware
 */

// Custom morgan format
const format =
    process.env.NODE_ENV === 'development'
        ? ':method :url :status :res[content-length] - :response-time ms'
        : 'combined';

export const logger = morgan(format);
