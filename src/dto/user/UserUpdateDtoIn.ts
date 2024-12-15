// src/dto/UserDTO.ts
import {IsString, IsNotEmpty} from "class-validator";

export class UserUpdateDtoIn {

    @IsNotEmpty()
    id: bigint

    @IsString()
    @IsNotEmpty()
    login: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    about: string;

}
