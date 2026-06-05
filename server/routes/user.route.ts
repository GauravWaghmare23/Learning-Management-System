import express from "express";
import { activateUser, registerUser } from "../controllers/user.controller";

const userRouter = express.Router();

// register user route
userRouter.post("/registration", registerUser);
userRouter.post("/activate-user", activateUser);

export default userRouter;