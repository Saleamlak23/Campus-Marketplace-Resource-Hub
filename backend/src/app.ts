import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/authenticate';
import { isSuperAdmin } from './middleware/authorize';
import { scopeByUniversity } from './middleware/universityScoping';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import universitiesRoutes from './modules/universities/universities.routes';
import adminRoutes from './modules/admin/admin.routes';
import prisma from './lib/prisma';

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log('Request:', req.method, req.url);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// TEST/DEBUG ENDPOINTS
// ============================================

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.post('/api/debug', (req, res) => {
  console.log('🔍 Debug endpoint hit!');
  res.json({
    received: req.body,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================

// Auth routes - register, login, refresh, verify-email
app.use('/api/auth', authRoutes);

// User routes - /api/users/me (GET/PATCH)
app.use('/api/users', usersRoutes);

// University routes - /api/universities (GET all/one)
app.use('/api/universities', universitiesRoutes);

// ============================================
// PROTECTED PROFILE ROUTE
// ============================================

  res.json({ status: 'ok', environment: config.nodeEnv, timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/universities', universitiesRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/profile', authenticate, scopeByUniversity, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        universityId: true,
        isVerified: true,
        department: true,
        universityIdNumber: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

export default app;