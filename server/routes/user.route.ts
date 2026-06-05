import express from "express";
import { registerUser } from "../controllers/user.controller";

const userRouter = express.Router();

// register user route
userRouter.post("/registration", registerUser);

export default userRouter;