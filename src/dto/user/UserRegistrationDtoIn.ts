// src/dto/UserDTO.ts
import { IsString, IsNotEmpty } from "class-validator";

export class UserRegistrationDtoIn {

    @IsString()
    @IsNotEmpty()
    login: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    inviterLogin: string;

}
