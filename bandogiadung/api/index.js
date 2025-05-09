import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from '../../server/routes/authRoutes.js';
// Import các routes khác tương tự

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// Routes
app.use('/api/auth', authRoutes);
// Thêm các routes khác

// Export dưới dạng Vercel serverless function
export default async (req, res) => {
  try {
    // Kết nối DB cho mỗi request (hoặc tối ưu hơn bằng connection pooling)
    await connectDB();
    
    // Xử lý request bằng Express app
    app(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};