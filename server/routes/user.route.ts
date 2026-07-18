import express from "express";
import AuthController from "../controllers/user.controller"
import { isAuthenticated } from "../middlewares/auth";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter";

const userRouter = express.Router();

userRouter.post("/registration", registerLimiter, AuthController.registerUserController);
userRouter.post("/activate-user", AuthController.activateUserController);
userRouter.post("/login", loginLimiter, AuthController.loginUserController);
userRouter.post("/logout", isAuthenticated, AuthController.logoutUserController);
userRouter.get("/access-token",AuthController.updateAccessTokenController);

export default userRouter;