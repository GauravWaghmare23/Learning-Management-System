export interface IActivationPayload {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export interface IActivationToken {
    activationtoken: string;
    activationCode: string;
}

export interface IActivationJwtPayload {
    user: IActivationPayload;
    activationCode: string;
}