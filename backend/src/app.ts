import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import universitiesRoutes from './modules/universities/universities.routes';
import listingsRoutes from './modules/listings/listings.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import reportsRoutes from './modules/reports/reports.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import adminRoutes from './modules/admin/admin.routes';
import chatRoutes from './modules/chat/chat.routes';
import tutoringRoutes from './modules/tutoring/tutoring.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Listing images may be sent as base64 data URLs when Cloudinary is unavailable.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
if (config.nodeEnv !== 'test') {
  app.use((req, _res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
  });
}

// ============================================
// HEALTH & DEBUG ENDPOINTS
// ============================================

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test', (_req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/universities', universitiesRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', chatRoutes);
app.use('/api', tutoringRoutes);
app.use('/api/uploads', uploadsRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

export default app;
