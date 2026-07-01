import jwt, { Secret } from "jsonwebtoken";
import { IActivationPayload, IActivationToken } from "../interfaces/jwt.interface";

export const createActivationToken = (
    user: IActivationPayload
): IActivationToken => {

    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET_KEY as Secret, {
        expiresIn: "10m",
    });
    return { token, activationCode };
};