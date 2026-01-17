import dotenv from 'dotenv';
import app from './app';
import Database from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

/**
 * Start Server
 */
async function startServer() {
    try {
        // Connect to MongoDB
        await Database.connect();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
