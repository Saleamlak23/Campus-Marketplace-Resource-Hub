import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/authenticate';
import { isAdmin, isSuperAdmin } from './middleware/authorize';
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
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ============================================
// HEALTH CHECK
// ============================================

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
  console.log('Body:', req.body);
  res.json({
    received: req.body,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES (NEW MODULES)
// ============================================

// Auth routes - register, login, refresh, verify-email
app.use('/api/auth', authRoutes);

// User routes - /api/users/me (GET/PATCH)
app.use('/api/users', usersRoutes);

// University routes - /api/universities (GET all/one)
app.use('/api/universities', universitiesRoutes);

// Admin routes - user/listing/university management
app.use('/api/admin', adminRoutes);

// ============================================
// EXISTING PROTECTED ROUTES (KEEP THESE!)
// ============================================

// 1. Profile route
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

// 2. Admin users route (KEEP THIS - already built)
app.get('/api/admin/users', authenticate, isAdmin, async (req, res) => {
  try {
    const universityId = req.user?.universityId;
    if (!universityId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const users = await prisma.user.findMany({
      where: { universityId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        isVerified: true,
        createdAt: true,
      },
    });
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// 3. Super Admin universities route (KEEP THIS - already built)
app.get('/api/admin/universities', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        listings: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    res.json({ success: true, data: universities });
  } catch (error) {
    console.error('Universities error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch universities' });
  }
});

// 4. Ban user route (KEEP THIS - already built)
app.patch('/api/admin/users/:userId/ban', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (Array.isArray(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const { banReason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (req.user?.role !== 'SUPER_ADMIN' && user.universityId !== req.user?.universityId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Cannot ban users from other universities' 
      });
    }

    if (user.role === 'UNIVERSITY_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        error: 'Cannot ban an admin' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: banReason || 'No reason provided',
      },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ success: false, error: 'Failed to ban user' });
  }
});

// 5. Unban user route (KEEP THIS - already built)
app.patch('/api/admin/users/:userId/unban', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (Array.isArray(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (req.user?.role !== 'SUPER_ADMIN' && user.universityId !== req.user?.universityId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Cannot unban users from other universities' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
      },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ success: false, error: 'Failed to unban user' });
  }
});

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