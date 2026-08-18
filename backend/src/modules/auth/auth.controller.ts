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
      next(error);
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
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(validatedData.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[Refresh] Error:', error);
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
      console.error('[VerifyEmail] Error:', error);
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }
      const result = await authService.resendVerificationEmail(email);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[ResendVerification] Error:', error);
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }
      const result = await authService.requestPasswordReset(email);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[RequestPasswordReset] Error:', error);
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, error: 'Token and new password are required' });
      }
      const result = await authService.resetPassword(token, newPassword);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[ResetPassword] Error:', error);
      next(error);
    }
  }
}