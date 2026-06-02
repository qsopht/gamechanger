import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './db';
import { errorHandler } from './middleware/auth';
import authRoutes from './routes/auth';
import planRoutes from './routes/plans';
import subscriptionRoutes from './routes/subscriptions';
import observerRoutes from './routes/observer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../../frontend/dist');
app.use(express.static(frontendPath));

// Routes
app.use('/auth', authRoutes);
app.use('/plans', planRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/observer', observerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
