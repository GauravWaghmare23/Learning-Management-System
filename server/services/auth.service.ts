import { IActivateUser, IRegisterUser } from "../interfaces/auth.interface";
import { IActivationJwtPayload, IActivationPayload } from "../interfaces/jwt.interface";
import User from "../models/user.model";
import { createActivationToken } from "../utils/activationToken";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";
import jwt, { Secret } from "jsonwebtoken";

class AuthService {

    public async registerUserService(userData: IRegisterUser) {

        const { name, email, password } = userData;

        if (!name || !email || !password) {
            throw new ErrorHandler(
                "Please provide all required fields",
                400
            );
        }

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            throw new ErrorHandler(
                "Email already exists",
                409
            );
        }

        const payload: IActivationPayload = {
            name,
            email,
            password,
        };

        const activationToken =
            createActivationToken(payload);

        const data = {
            user: {
                name,
            },
            activationCode:
                activationToken.activationCode,
        };

        await sendMail({
            email,
            subject: "Activate your account",
            template: "activation-mail.ejs",
            data,
        });

        return {
            success: true,
            message:
                `Registration successful. Please check ${email} to activate your account.`,
            activationToken,
        };
    }

    public async activateUserService(activationData: IActivateUser) {

        const { activationCode, activationToken } = activationData;

        if (!activationCode || !activationToken) {
            throw new ErrorHandler(
                "Activation code and token are required",
                400
            );
        }

        let decoded: IActivationJwtPayload;

        try {
            decoded = jwt.verify(activationToken, process.env.ACTIVATION_SECRET_KEY as Secret) as { user: IActivationPayload, activationCode: string };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new ErrorHandler(
                    "Activation token has expired",
                    401
                );
            }

            throw new ErrorHandler(
                "Invalid activation token",
                401
            );
        }

        if (decoded.activationCode !== activationCode) {
            throw new ErrorHandler(
                "Invalid activation code",
                401
            );
        }

        const { name, email, password } = decoded.user;

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            throw new ErrorHandler(
                "Email already exists",
                409
            );
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        return {
            success: true,
            message: "Account activated and registered successfully",
            data : {
                name: user.name,
                email: user.email
            }
        };
    }
}

export default new AuthService();