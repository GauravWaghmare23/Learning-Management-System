require("dotenv").config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import ErrorHandler from "./utils/ErrorHandler";
import ErrorMiddleware from "./middlewares/ErrorMiddleware";
import { morganMiddleware } from "./middlewares/morgan";
import userRouter from "./routes/user.route";
import logger from "./config/logger";
import { apiLimiter } from "./middlewares/rateLimiter";

export const app = express();

// Parse JSON body
app.use(express.json({ limit: "50mb" }));

// Parse Cookies
app.use(cookieParser());

// HTTP Request Logger
app.use(morganMiddleware);

// Rate Limiter
app.use(apiLimiter);

// CORS
app.use(
    cors({
        origin: process.env.ORIGIN,
        credentials: true,
    })
);

app.use("/api/v1", userRouter);

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Server is up and running",
        timestamp: new Date().toISOString(),
    });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {

    logger.warn(`404 Route Not Found: ${req.method} ${req.originalUrl}`);

    next(
        new ErrorHandler(
            `Can't find ${req.originalUrl} on this server!`,
            404
        )
    );
});

app.use(ErrorMiddleware);