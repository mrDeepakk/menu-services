import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database configuration and connection management
 */
class Database {
    private static instance: Database;
    private isReplicaSet: boolean = false;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    /**
     * Establish connection to MongoDB
     */
    public async connect(): Promise<void> {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/menu-services';

            await mongoose.connect(mongoUri);

            // Detect if we're running in replica set mode (required for transactions)
            const admin = mongoose.connection.db?.admin();
            if (!admin) {
                this.isReplicaSet = false;
                console.log('⚠️  Connected to MongoDB standalone (transactions not available)');
                return;
            }

            try {
                const status = await admin.replSetGetStatus();
                this.isReplicaSet = true;
                console.log('✅ Connected to MongoDB Replica Set:', status.set);
            } catch (error) {
                this.isReplicaSet = false;
                console.log('⚠️  Connected to MongoDB standalone (transactions not available)');
            }

            this.setupEventHandlers();
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            process.exit(1);
        }
    }

    /**
     * Close database connection
     */
    public async disconnect(): Promise<void> {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }

    /**
     * Check if replica set is available (for transactions)
     */
    public supportsTransactions(): boolean {
        return this.isReplicaSet;
    }

    /**
     * Setup connection event handlers
     */
    private setupEventHandlers(): void {
        mongoose.connection.on('connected', () => {
            console.log('🚀 Mongoose connected to database');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🔌 Mongoose disconnected from database');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }
}

export default Database.getInstance();
