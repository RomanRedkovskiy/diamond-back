import {UserRegistrationDtoIn} from '@/dto/user/UserRegistrationDtoIn.ts';
import {User} from '@prisma/client';
import {UserDtoOut} from "@/dto/user/UserDtoOut.js";

export function dtoToUser(dtoIn: UserRegistrationDtoIn, inviterId: bigint): Omit<User, 'id' | 'registrationTime' | 'about' | 'balance' | 'logs'> {
    return {
        login: dtoIn.login,
        password: dtoIn.password,
        role: 'CLIENT',
        inviterId,
    };
}

export function userToDto(user: User, inviterLogin: string | undefined): UserDtoOut {
    return {
        id: user.id,
        login: user.login,
        role: user.role,
        inviterLogin,
        balance: user.balance.toString(),
        about: user.about,
        registrationTime: user.registrationTime.toString(),
    };
}
