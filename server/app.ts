require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ErrorHandler from "./utils/ErrorHandler";
import ErrorMiddleware from "./middlewares/ErrorMiddleware";

export const app = express();

// body parser middleware
app.use(express.json({ limit: "50mb" }));

// cookie parser middleware
app.use(cookieParser());

// cors middleware
app.use(cors({
    origin: process.env.ORIGIN,
}));


// health check route
app.get(
    "/health",
    (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "Server is up and running",
            data: {
                server: "UP",
            },
            timestamp: new Date().toISOString(),
        });
    }
);

// unknown route handler
app.all(
    "*",
    (req: Request, res: Response, next: NextFunction) => {
        next(
            new ErrorHandler(
                `Can't find ${req.originalUrl} on this server!`,
                404
            )
        );
    }
);

app.use(ErrorMiddleware);