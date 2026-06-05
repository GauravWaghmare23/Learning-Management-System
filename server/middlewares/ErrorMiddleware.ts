import { Request, Response, NextFunction } from "express";

interface error extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

const ErrorMiddleware = (
  err: error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      success: false,
      message: err.message,
      error: {
        statusCode,
        status,
      },
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });

    return;
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal Server Error"
        : err.message,
    error: {
      statusCode,
      status,
    },
    timestamp: new Date().toISOString(),
  });
};

export default ErrorMiddleware;