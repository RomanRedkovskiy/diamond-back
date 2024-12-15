import {InterestLog, PrismaClient} from '@prisma/client';

export class InterestLogRepository {

    private prisma = new PrismaClient();

    async findLastInvestLogsByUser(userId: bigint) {
        return this.prisma.interestLog.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                dateTime: 'desc'
            },
            include: {
                log: {
                    include: {
                        project: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            },
            take: 5
        });
    }

    async create(log: Omit<InterestLog, 'id' | 'dateTime'>) {
        return this.prisma.interestLog.create({data: log});
    }

}