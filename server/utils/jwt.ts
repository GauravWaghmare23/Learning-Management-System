require('dotenv').config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "strict" | "lax" | "none" | undefined;
    secure?: boolean;
}

export const sendToken = (user:IUser, statusCode: number, res: Response) => {
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();

    const accessTokenExpire = parseInt(process.env.JWT_ACCESS_EXPIRE || '300', 10);
    const refreshTokenExpire = parseInt(process.env.JWT_REFRESH_EXPIRE || '30', 10);

    const accessTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire * 24 * 60 * 60 * 1000),
        maxAge: accessTokenExpire * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
    };

    const refreshTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
        maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
    };

    if(process.env.NODE_ENV === 'production'){
        accessTokenOptions.secure = true;
        refreshTokenOptions.secure = true;
    }

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
}
