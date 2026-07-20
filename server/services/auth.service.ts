import logger from "../config/logger";
import { IActivateUser, ILoginUser, IRegisterUser, ISocialAuth } from "../interfaces/auth.interface";
import { IActivationJwtPayload, IActivationPayload, IDecodedToken } from "../interfaces/jwt.interface";
import User from "../models/user.model";
import { createActivationToken } from "../utils/activationToken";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import sendMail from "../utils/sendMail";
import jwt, { Secret } from "jsonwebtoken";

class AuthService {

    public async registerUserService(userData: IRegisterUser) {

        logger.info("Registering user...");

        const { name, email, password } = userData;

        if (!name || !email || !password) {
            logger.error("Please provide all required fields");
            throw new ErrorHandler(
                "Please provide all required fields",
                400
            );
        }

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            logger.error("Email already exists");
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

        logger.info(
            `Registration successful. Please check ${email} to activate your account.`
        );

        return {
            success: true,
            message:
                `Registration successful. Please check ${email} to activate your account.`,
            activationToken,
        };
    }

    public async activateUserService(activationData: IActivateUser) {

        logger.info("Activating user...");

        const { activationCode, activationToken } = activationData;

        if (!activationCode || !activationToken) {
            logger.error("Activation code and token are required");
            throw new ErrorHandler(
                "Activation code and token are required",
                400
            );
        }

        let decoded: IActivationJwtPayload;

        try {
            logger.info("Verifying activation token...");
            decoded = jwt.verify(activationToken, process.env.ACTIVATION_SECRET_KEY as Secret) as IActivationJwtPayload;
            logger.info("Activation token verified successfully");
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                logger.error("Activation token has expired");
                throw new ErrorHandler(
                    "Activation token has expired",
                    401
                );
            }

            logger.error("Invalid activation token");

            throw new ErrorHandler(
                "Invalid activation token",
                401
            );
        }

        if (decoded.activationCode !== activationCode) {
            logger.error("Invalid activation code");
            throw new ErrorHandler(
                "Invalid activation code",
                401
            );
        }

        const { name, email, password } = decoded.user;

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            logger.error("Email already exists");
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

        logger.info("Account activated and registered successfully");

        return {
            success: true,
            message: "Account activated and registered successfully",
            data: {
                name: user.name,
                email: user.email
            }
        };
    }

    public async loginUserService(loginData: ILoginUser) {

        logger.info("Logging in user...");

        const { email, password } = loginData;

        if (!email || !password) {
            logger.error("Please provide all required fields");
            throw new ErrorHandler(
                "Please provide all required fields",
                400
            );
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            logger.error("Invalid email or password");
            throw new ErrorHandler(
                "Invalid email or password",
                401
            );
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            logger.error("Invalid email or password");
            throw new ErrorHandler(
                "Invalid email or password",
                401
            );
        }

        logger.info("User data received successfully");

        return {
            user
        };
    }

    public async logoutUserService(userId: String) {
        logger.info("Logging out user...");
        await redis.del(userId.toString());
        logger.info("Logged out successfully");
        return {
            success: true,
            message: "Logged out successfully"
        };
    }

    public async updateAccessTokenService(refreshToken: string) {
        logger.info("Refreshing access token...");

        if (!refreshToken) {
            logger.warn("Refresh token is required");

            throw new ErrorHandler(
                "Refresh token is required",
                400
            );
        }

        let decoded: IDecodedToken;

        try {
            logger.info("Verifying refresh token...");

            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET as Secret
            ) as IDecodedToken;

            logger.info("Refresh token verified successfully");
        } catch (error) {
            logger.warn("Invalid or expired refresh token");

            throw new ErrorHandler(
                "Invalid or expired refresh token",
                401
            );
        }

        const session = await redis.get(decoded._id.toString());

        if (!session) {
            logger.warn(
                `Session not found for user ${decoded._id}`
            );

            throw new ErrorHandler(
                "Session expired. Please login again.",
                401
            );
        }

        const user = await User.findById(decoded._id);

        if (!user) {
            logger.warn(`User not found: ${decoded._id}`);

            throw new ErrorHandler(
                "Unauthorized",
                401
            );
        }

        const accessToken = user.signAccessToken();

        logger.info(
            `New access token generated for user ${decoded._id}`
        );

        return {
            accessToken,
        };
    }

    public async getUserByIdService(userId: string){

        logger.info("Getting user by id...");

        if (!userId) {
            logger.warn("User id is required");
            throw new ErrorHandler(
                "User id is required",
                400
            );
        }

        const user = await User.findById(userId);

        if(!user){
            logger.warn("User not found");
            throw new ErrorHandler(
                "User not found",
                404
            );
        }

        logger.info("User data received successfully");

        return {
            user
        }
    }

    public async socialAuthService(data:ISocialAuth){

         logger.info("Logging or signing in user using social auth...");

         const {name,email,avatar} = data as ISocialAuth;

         if(!name || !email || !avatar){
            logger.error("Please provide all required fields");
            throw new ErrorHandler(
                "Please provide all required fields",
                400
            );
         }

         const user = await User.findOne({email});

        if(!user){
            logger.info(`No user registered creating new user with email ${email}`);

            const newUser = await User.create({
                name:name,
                email:email,
                avatar:{
                    public_id:"social_auth_avatar",
                    url:avatar
                }
            });

            return {
                user:newUser
            };
        }
        logger.info(`User found with email ${email} logging in...`);

        return {
            user
        };



    }
}

export default new AuthService();