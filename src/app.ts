import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pool from './config/db';
import articleRoutes from './routes/article_route';
import authRoutes from './routes/authentication_route';
import commentRoutes from './routes/comment_route';
import analyticsRoutes from './routes/analytic_route';
import subscriptionRoutes from './routes/subscription_route';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/api/test', async (req, res) => {
    try {
        const data = req.query.data;
        console.log('Received data:', data);
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Server is running',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;