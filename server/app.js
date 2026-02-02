import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes.js';

// Load environment variables
dotenv.config();

/**
 * Express Application Setup
 * Main entry point for the Invoice Processing System backend
 */

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/invoice', invoiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Invoice Processing System API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

/**
 * Database Connection
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-processing';

        await mongoose.connect(mongoURI);

        console.log('✓ MongoDB connected successfully');
        console.log(`  Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('✗ MongoDB connection error:', error.message);
        console.error('  Please ensure MongoDB is running and the connection string is correct');
        process.exit(1);
    }
};

/**
 * Start Server
 */
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════════════════');
            console.log('  Invoice Processing System - Backend Server');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`  Server running on: http://localhost:${PORT}`);
            console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  API Base URL: http://localhost:${PORT}/api`);
            console.log('');
            console.log('  Available Endpoints:');
            console.log(`    POST   /api/invoice/upload`);
            console.log(`    GET    /api/invoice`);
            console.log(`    GET    /api/invoice/:id`);
            console.log(`    GET    /api/invoice/export`);
            console.log('═══════════════════════════════════════════════════════');
            console.log('');
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\nShutting down gracefully...');
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
});

// Start the server
startServer();

export default app;
