import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestError = err as Error & { status?: number; type?: string };

  if (requestError.status === 413 || requestError.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'The images are too large to publish. Please use smaller images.',
    });
  }

  // Log the full error with stack trace
  console.log('❌ ERROR CAUGHT:');
  console.log('Message:', err.message);
  console.log('Stack:', err.stack);
  console.log('Name:', err.name);
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Body:', req.body);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    console.log('🔍 Prisma Error:', err);
    return res.status(400).json({
      success: false,
      error: 'Database operation failed',
      details: err.message,
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: (err as any).errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }

  // Default error
  console.log('💥 Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
};