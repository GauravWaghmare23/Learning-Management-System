import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IDecodedToken } from "../interfaces/jwt.interface";
import jwt, { Secret } from "jsonwebtoken";
import { redis } from "../utils/redis";
import User from "../models/user.model";


export const isAuthenticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return next(
            new ErrorHandler(
                "Please login to access this resource",
                401
            )
        )
    };

    let decoded: IDecodedToken;

    try {
        decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as Secret) as IDecodedToken;
    } catch (error) {
        return next(
            new ErrorHandler(
                "Invalid or expired access token",
                401
            )
        )
    }

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