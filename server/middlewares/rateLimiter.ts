import rateLimit from "express-rate-limit";
import logger from "../config/logger";
import { NextFunction, Request, Response } from "express";


export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    },
    handler: (req:Request, res:Response, next:NextFunction) => {
        logger.warn(`Global rate limit exceeded | IP: ${req.ip} | Route: ${req.originalUrl}`);
        res.status(429).json({
            success: false,
            message: "Too many requests from this IP, please try again after 15 minutes"
        });
    }
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        logger.warn(`Login rate limit exceeded | IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many login attempts. Please try again after 15 minutes.",
        });
    },
});

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    handler: (req: Request, res: Response) => {
        logger.warn(`Registration rate limit exceeded | IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many registration attempts.",
        });
    },
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    handler: (req: Request, res: Response) => {
        logger.warn(`Forgot password rate limit exceeded | IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many password reset requests.",
        });
    },
});