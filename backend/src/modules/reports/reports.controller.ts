import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { createReportSchema } from './reports.validation';
import * as reportsService from './reports.service';

export async function createReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const parsed = createReportSchema.parse(req.body);

    const report = await reportsService.createReport({
      reporterId: req.user.userId,
      universityId: req.user.universityId,
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      reason: parsed.reason,
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function getMyReportsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const reports = await reportsService.getMyReports(req.user.userId);
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
}
