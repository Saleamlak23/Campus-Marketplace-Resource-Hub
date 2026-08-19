import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';

const service = new UsersService();

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const user = await service.getUserById(userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const updatedUser = await service.updateUser(userId, req.body);
      res.json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}