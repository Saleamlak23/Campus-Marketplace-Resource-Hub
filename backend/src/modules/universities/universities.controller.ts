import { Request, Response, NextFunction } from 'express';
import { UniversitiesService } from './universities.service';

const service = new UniversitiesService();

export class UniversitiesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const universities = await service.getAll();
      res.json({ success: true, data: universities });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      // Fix: Handle string | string[] properly
      const id = req.params.id;
      if (Array.isArray(id)) {
        return res.status(400).json({ success: false, error: 'Invalid university ID' });
      }
      const university = await service.getOne(id);
      res.json({ success: true, data: university });
    } catch (error) {
      next(error);
    }
  }
}