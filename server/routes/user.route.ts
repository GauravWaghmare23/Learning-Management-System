import express from "express";
import AuthController from "../controllers/user.controller"
import { isAuthenticated } from "../middlewares/auth";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter";
import { upload } from "../config/multer";

const userRouter = express.Router();

userRouter.post("/registration", registerLimiter, AuthController.registerUserController);
userRouter.post("/activate-user", AuthController.activateUserController);
userRouter.post("/login", loginLimiter, AuthController.loginUserController);
userRouter.post("/logout", isAuthenticated, AuthController.logoutUserController);
userRouter.get("/access-token",AuthController.updateAccessTokenController);
userRouter.get("/me", isAuthenticated, AuthController.getUserByIdController);
userRouter.post("/social-auth", AuthController.socialAuthController);
userRouter.patch("/update-user-info", isAuthenticated, AuthController.UpdateNameOrEmailController);
userRouter.patch("/update-password", isAuthenticated, AuthController.UpdatePasswordController);
userRouter.patch("/update-avatar", isAuthenticated, upload.single("avatar"), AuthController.updateAvatarController);

export default userRouter;