import { NextFunction, Request, Response } from 'express';

// TODO: RBAC + university-scoping checks (student / university_admin /
// super_admin). See docs/plan.md Section 3.1.
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}
