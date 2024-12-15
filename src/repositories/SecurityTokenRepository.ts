import {PrismaClient, User} from '@prisma/client';

export class SecurityTokenRepository {

    private prisma = new PrismaClient();

    create = async (token: string, userId: bigint) => {
        return this.prisma.securityToken.create({
            data: {
                token,
                userId: userId
            },
        });
    }
}

