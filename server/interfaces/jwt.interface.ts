import { JwtPayload } from "jsonwebtoken";

export interface IActivationPayload {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export interface IActivationToken {
    activationToken: string;
    activationCode: string;
}

export interface IActivationJwtPayload {
    user: IActivationPayload;
    activationCode: string;
}

export interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

export interface IDecodedToken extends JwtPayload{
    _id: string;
}