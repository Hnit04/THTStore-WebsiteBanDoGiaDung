import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes từ thư mục server của bạn
import authRoutes from '../server/routes/authRoutes.js';
import productRoutes from '../server/routes/productRoutes.js';
import categoryRoutes from '../server/routes/categoryRoutes.js';
import cartRoutes from '../server/routes/cartRoutes.js';
import orderRoutes from '../server/routes/orderRoutes.js';
import userRoutes from '../server/routes/userRoutes.js';

// Load env vars
dotenv.config();

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Kết nối database trước khi khởi động server
connectDB();

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Server Error',
    });
});

// Vercel serverless function handler
export default app;