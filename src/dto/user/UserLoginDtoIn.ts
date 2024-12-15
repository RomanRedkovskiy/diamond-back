// src/dto/UserDTO.ts
import { IsString, IsNotEmpty } from "class-validator";

export class UserLoginDtoIn {

    @IsString()
    @IsNotEmpty()
    login: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}
