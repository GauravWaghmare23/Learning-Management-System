require("dotenv").config();
import { RequestHandler } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import authService from "../services/auth.service";
import { sendToken } from "../utils/jwt";
import ErrorHandler from "../utils/ErrorHandler";


class AuthController {

    public registerUserController: RequestHandler = CatchAsyncError(
        async (req, res, next) => {
            const response = await authService.registerUserService(req.body);
            res.status(201).json(response);
        }
    )

    public activateUserController: RequestHandler = CatchAsyncError(
        async (req, res, next) => {
            const response = await authService.activateUserService(req.body);
            res.status(201).json(response);
        }
    )

    public loginUserController: RequestHandler = CatchAsyncError(
        async (req, res, next) => {
            const response = await authService.loginUserService(req.body);
            await sendToken(response.user, 200, res);
        }
    )

    public logoutUserController: RequestHandler = CatchAsyncError(
        async (req, res, next) => {
            if (!req.user) {
                return next(
                    new ErrorHandler(
                        "Unauthorized",
                        401
                    )
                )
            }
            const userId = req.user!._id.toString();;
            const response = await authService.logoutUserService(userId);
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            res.status(200).json(response);
        }
    )
}

export default new AuthController();
