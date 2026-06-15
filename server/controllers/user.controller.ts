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
    activation_token: string;
    activation_code: string;
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

interface ILoginUser {
    email: string;
    password: string;
}


// create activation token and code
export const createActivationToken = (user: IActivationPayload): IActivationToken => {
    const activation_code = Math.floor(100000 + Math.random() * 900000).toString();
    const activation_token = jwt.sign({ user, activation_code }, process.env.ACTIVATION_SECRET_KEY as Secret, {
        expiresIn: "10m",
    });
    return { activation_token, activation_code };
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

            const activationCode = activationToken.activation_code;

            const data = { user: { name: user.name }, activationCode };

            const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);

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
            } catch (error: any) {
                return next(
                    new ErrorHandler(
                        "Failed to send activation email. Please try again.",
                        500
                    )
                );
            }
        } catch (error: any) {
            return next(
                new ErrorHandler(
                    "Registration failed. Please try again.",
                    500
                )
            );
        }
    }
);

// activate user

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { activation_token, activation_code } = req.body as IActivationToken;

        if (!activation_token || !activation_code) {
            return next(
                new ErrorHandler(
                    "Activation token and code are required",
                    400
                )
            );
        }

        let decoded: { user: IActivationPayload, activationCode: string };

        try {
            decoded = jwt.verify(activation_token, process.env.ACTIVATION_SECRET_KEY as Secret) as { user: IActivationPayload, activationCode: string };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return next(
                    new ErrorHandler(
                        "Activation token has expired",
                        401
                    )
                );
            }

            return next(
                new ErrorHandler(
                    "Invalid activation token",
                    401
                )
            );
        }



        if (decoded.activationCode !== activation_code) {
            return next(
                new ErrorHandler(
                    "Invalid activation code",
                    400
                )
            );
        }

        const { name, email, password } = decoded.user;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return next(
                new ErrorHandler(
                    "Email already exists",
                    409
                )
            );
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        res.status(201).json({
            success: true,
            message: "Account activated and registered successfully",
        });

    } catch (error: any) {
        return next(
            new ErrorHandler(
                "Failed to activate user. Please try again.",
                500
            )
        );
    }
});

// login user

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body as ILoginUser;

        if (!email || !password) {
            return next(
                new ErrorHandler(
                    "Please provide email and password",
                    400
                )
            );
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(
                new ErrorHandler(
                    "Invalid email or password",
                    401
                )
            );
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return next(
                new ErrorHandler(
                    "Invalid email or password",
                    401
                )
            );
        }
        

    } catch (error:any) {
        return next(
            new ErrorHandler(
                "Login failed. Please try again.",
                500
            )
        );
    }
})