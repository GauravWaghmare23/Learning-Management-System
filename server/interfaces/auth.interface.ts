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

export interface ILoginUser{
    email: string;
    password: string;
}

export interface ISocialAuth {
    name: string;
    email: string;
    avatar: string;
}

export interface IEmailOrName{
    name:string;
    email:string;
}