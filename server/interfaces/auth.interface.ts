export interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export interface IActivateUser {
    activationCode: string;
    activationToken: string;
}