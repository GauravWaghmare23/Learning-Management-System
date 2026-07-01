import express from "express";
import AuthController from "../controllers/user.controller"

const userRouter = express.Router();

userRouter.post("/registration",AuthController.registerUserController);
userRouter.post("/activate-user",AuthController.activateUserController);

export default userRouter;