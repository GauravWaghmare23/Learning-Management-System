import { Request, Response, NextFunction } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const CatchAsyncError =
  (controller: AsyncController) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };