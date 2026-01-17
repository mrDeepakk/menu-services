import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.middleware';
import routes from './routes';

/**
 * Express Application Configuration
 */

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(logger);

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Menu & Services Management API',
        version: '1.0.0',
    });
});

// Not found handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
