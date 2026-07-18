require("dotenv").config();
import { RequestHandler } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import authService from "../services/auth.service";
import { sendToken } from "../utils/jwt";
import ErrorHandler from "../utils/ErrorHandler";
import logger from "../config/logger";


class AuthController {

    public registerUserController: RequestHandler = CatchAsyncError(
        async (req, res, next) => {
            logger.info(`Registration request received for ${req.body.email}`);

            const response = await authService.registerUserService(req.body);

            logger.info(`Registration email sent to ${req.body.email}`);

            res.status(201).json(response);
        }
    );

    public activateUserController: RequestHandler = CatchAsyncError(
        async (req, res, next) => {
            logger.info(`Account activation requested`);

            const response = await authService.activateUserService(req.body);

            logger.info(`Account activated successfully`);

            res.status(201).json(response);
        }
    );

    public loginUserController: RequestHandler = CatchAsyncError(
        async (req, res, next) => {
            logger.info(`Login request received for ${req.body.email}`);

            const response = await authService.loginUserService(req.body);

            logger.info(`Login successful for ${response.user.email}`);

            await sendToken(response.user, 200, res);
        }
    );

    public logoutUserController: RequestHandler = CatchAsyncError(
        async (req, res, next) => {

            if (!req.user) {
                logger.warn("Unauthorized logout attempt");

                return next(
                    new ErrorHandler(
                        "Unauthorized",
                        401
                    )
                );
            }

            const userId = req.user._id.toString();

            logger.info(`Logout request received for user ${userId}`);

            const response = await authService.logoutUserService(userId);

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            logger.info(`User logged out successfully: ${userId}`);

            res.status(200).json(response);
        }
    );
}

export default new AuthController();
