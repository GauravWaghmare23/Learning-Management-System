require("dotenv").config();
import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import User, { IUser } from "../models/user.model";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

// interfaces

interface IActivationToken {
    token: string;
    activationCode: string;
}

interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

interface IActivationPayload {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const createActivationToken = (user: IActivationPayload): IActivationToken => {
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET_KEY as Secret, {
        expiresIn: "10m",
    });
    return { token, activationCode };
}

// register User controller
export const registerUser = CatchAsyncError(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { name, email, password } = req.body;
    
            if (!name || !email || !password) {
                return next(
                    new ErrorHandler(
                        "Please provide all required fields",
                        400
                    )
                );
            }
    
            const existingUser = await User.findOne({ email });
    
            if (existingUser) {
                return next(
                    new ErrorHandler(
                        "Email already exists",
                        409
                    )
                );
            }
    
            const user: IRegisterUser = {
                name,
                email,
                password,
            };
    
            const activationToken = createActivationToken(user);
    
            const activationCode = activationToken.activationCode;
    
            const data = {user:{name:user.name}, activationCode};
    
            const html = await ejs.renderFile(path.join(__dirname,"../mails/activation-mail.ejs"), data);

            try {
                await sendMail({
                    email: user.email,
                    subject: "Activate your account",
                    template: "activation-mail.ejs",
                    data
                });

                res.status(201).json({
                    success: true,
                    message: `Registration successful. Please check your ${user.email} to activate your account.`,
                    activationToken
                });
            } catch (error:any) {
                return next(
                    new ErrorHandler(
                        "Failed to send activation email. Please try again.",
                        500
                    )
                );
            }
        } catch (error:any) {
            return next(
                new ErrorHandler(
                    "Registration failed. Please try again.",
                    500
                )
            );
        }
    }
);