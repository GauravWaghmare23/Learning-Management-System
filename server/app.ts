require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

// body parser middleware
app.use(express.json({limit: "50mb"}));

// cookie parser middleware
app.use(cookieParser());

// cors middleware
app.use(cors({
  origin: process.env.ORIGIN,
}));


// health check route
app.get("/health", (req:Request, res: Response, next: NextFunction)=>{
    res.status(200).json({
        status: "success",
        success: true,
        message: "Server is up and running",
        server: "UP",
        timestamp: new Date().toISOString(),
    });
});

// unknown route handler
app.all("*", (req: Request, res: Response, next: NextFunction)=>{
    const err = new Error(`Can't find ${req.originalUrl} on this server!`) as any;
    err.statusCode = 404;
    err.status = "fail";
    next(err);
});