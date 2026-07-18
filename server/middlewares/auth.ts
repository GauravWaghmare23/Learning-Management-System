import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IDecodedToken } from "../interfaces/jwt.interface";
import jwt, { Secret } from "jsonwebtoken";
import { redis } from "../utils/redis";
import User from "../models/user.model";
import logger from "../config/logger";


export const isAuthenticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    logger.info("Checking authentication...");

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        logger.warn("Please login to access this resource");
        return next(
            new ErrorHandler(
                "Please login to access this resource",
                401
            )
        )
    };

    let decoded: IDecodedToken;

    try {
        logger.info("Verifying access token...");
        decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as Secret) as IDecodedToken;
    } catch (error) {
        return next(
            new ErrorHandler(
                "Invalid or expired access token",
                401
            )
        )
    }

    logger.info("accessToken verified successfully")

    const session = await redis.get(decoded._id.toString());

    if (!session) {
        return next(
            new ErrorHandler(
                "Session expired. Please login again.",
                401
            )
        )
    };


    const user = await User.findById(decoded._id);

    if (!user) {
        return next(
            new ErrorHandler(
                "Unauthorized",
                401
            )
        );
    }

    req.user = user

    next();
})