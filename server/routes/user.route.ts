import express from "express";
import AuthController from "../controllers/user.controller"
import { isAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();

userRouter.post("/registration",AuthController.registerUserController);
userRouter.post("/activate-user",AuthController.activateUserController);
userRouter.post("/login",AuthController.loginUserController);
userRouter.post("/logout",isAuthenticated,AuthController.logoutUserController);

export default userRouter;