import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import listingsRouter from './modules/listings/listings.routes.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Module Routers
app.use('/api/listings', listingsRouter);

// Global Error Handler (MUST be after all routes)
app.use(errorHandler);

export default app;