import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// TODO: mount module routers here as each is built, e.g.
// app.use('/api/auth', authRoutes);
// app.use('/api/listings', listingsRoutes);

app.use(errorHandler);

export default app;