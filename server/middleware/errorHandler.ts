import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "./logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    logger.warn({ 
      type: "validation_error",
      path: req.path,
      method: req.method,
      errors: validationError.details 
    }, "Validation failed");
    
    return res.status(400).json({
      error: "Validation Error",
      message: validationError.message,
      details: validationError.details,
    });
  }

  if (err instanceof AppError) {
    logger.warn({ 
      type: "app_error",
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
      message: err.message 
    }, "Application error");
    
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  logger.error({ 
    type: "unhandled_error",
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack 
  }, "Unhandled error");

  return res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
};
