// src/dto/UserDTO.ts

export class UserDtoOut {

    id: BigInt
    login: string;
    inviterLogin: string | undefined;
    balance: string;
    about: string;
    role: string;
    registrationTime: string;

}
