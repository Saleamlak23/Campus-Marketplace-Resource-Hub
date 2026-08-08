import { NextFunction, Request, Response } from 'express';

// TODO: verify JWT from Authorization header, attach req.user.
// See docs/plan.md Section 7.1, Trunk Task A.
export function authenticate(req: Request, res: Response, next: NextFunction) {
  next();
}
