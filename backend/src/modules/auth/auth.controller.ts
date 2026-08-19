import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('[Register] Request received');
      console.log('[Register] Body:', JSON.stringify(req.body, null, 2));
      
      const validatedData = registerSchema.parse(req.body);
      console.log('[Register] Validation passed');
      
      const result = await authService.register(validatedData);
      console.log('[Register] Success for:', validatedData.email);
      
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error('[Register] Error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          success: false, 
          error: error.message,
          stack: error.stack 
        });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('[Login] Request received for:', req.body.email);
      
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData.email, validatedData.password);
      
      console.log('[Login] Success for:', validatedData.email);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[Login] Error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          success: false, 
          error: error.message,
          stack: error.stack 
        });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(validatedData.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[Refresh] Error:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          success: false, 
          error: error.message,
          stack: error.stack 
        });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
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
