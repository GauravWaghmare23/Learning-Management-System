require("dotenv").config();
import { RequestHandler } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import authService from "../services/auth.service";


class AuthController{

    public registerUserController:RequestHandler = CatchAsyncError(
        async(req,res,next) => {
            const response = await authService.registerUserService(req.body);
            res.status(201).json(response);
        }
    )

    public activateUserController:RequestHandler = CatchAsyncError(
        async(req,res,next) => {
            const response = await authService.activateUserService(req.body);
            res.status(201).json(response);
        }
    )
}

export default new AuthController();
