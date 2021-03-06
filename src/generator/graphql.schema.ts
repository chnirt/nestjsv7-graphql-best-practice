
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class RegisterUserInput {
    username: string;
    password: string;
    age: number;
}

export class LoginUserInput {
    username: string;
    password: string;
}

export class User {
    __typename?: 'User';
    _id: string;
    username: string;
    password: string;
    age: number;
}

export class LoginResponse {
    __typename?: 'LoginResponse';
    accessToken: string;
    refreshToken: string;
}

export class Hello {
    __typename?: 'Hello';
    hello: string;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract hello(): string | Promise<string>;

    abstract today(): Date | Promise<Date>;

    abstract uuid(): string | Promise<string>;

    abstract users(): User[] | Promise<User[]>;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract register(input: RegisterUserInput): boolean | Promise<boolean>;

    abstract login(input: LoginUserInput): LoginResponse | Promise<LoginResponse>;
}

export abstract class ISubscription {
    __typename?: 'ISubscription';

    abstract userAdded(): User | Promise<User>;
}

export type Upload = any;
export type JSON = any;
export type JSONObject = any;
