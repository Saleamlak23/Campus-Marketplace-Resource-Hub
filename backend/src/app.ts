import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// TODO: mount module routers here as each is built, e.g.
// app.use('/api/auth', authRoutes);
// app.use('/api/listings', listingsRoutes);

app.use(errorHandler);

export default app;
