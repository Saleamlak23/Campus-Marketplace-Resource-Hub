import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData.email, validatedData.password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(validatedData.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }
      const result = await authService.verifyEmail(token);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body as { token?: unknown };
      if (typeof token !== 'string' || !token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      const result = await authService.verifyEmail(token);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
