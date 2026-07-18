import { Response } from "express";
import { IUser } from "../models/user.model";
import { ITokenOptions } from "../interfaces/jwt.interface";
import { redis } from "./redis";
import logger from "../config/logger";

export const sendToken = async (user: IUser, statusCode: number, res: Response) => {

    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();

    // upload session to redis database
    await redis.set(
        user._id.toString(),
        JSON.stringify(user),
        "EX",
        7 * 24 * 60 * 60
    );

    const accessTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + 15 * 60 * 1000),
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
    }

    const refreshTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
    }

    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
        accessTokenOptions.secure = true;
        refreshTokenOptions.secure = true;
    }

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);

    logger.info("accessToken and refreshToken for login are successfully send.")

    logger.info("User logged in successfully.");


    res.status(statusCode).json({
        success: true,
        message: "User logged in successfully",
        data: {
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        },
        timestamp: new Date().toISOString(),
    });
}