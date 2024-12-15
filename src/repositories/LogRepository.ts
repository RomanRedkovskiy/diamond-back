import {Log, PrismaClient} from '@prisma/client';

export class LogRepository {

    private prisma = new PrismaClient();

    create(log: Omit<Log, 'id' | 'dateTime'>) {
        return this.prisma.log.create({data: log});
    }

    async findCollectedSumByProjectId(projectId: bigint) {
        const result = await this.prisma.log.aggregate({
            where: {
                projectId: projectId,
                type: 'INVEST',
            },
            _sum: {
                amount: true,
            },
        });
        return result._sum.amount || 0;
    }

    async findCollectedSumByProjectIdAndUserId(projectId: bigint, userId: bigint) {
        const result = await this.prisma.log.aggregate({
            where: {
                projectId: projectId,
                userId: userId,
                type: 'INVEST',
            },
            _sum: {
                amount: true,
            },
        });
        return result._sum.amount || 0;
    }

    async findActiveInvests() {
        return this.prisma.log.findMany({
            where: {
                type: 'INVEST',
                interestLogs: {
                    none: {
                        type: 'FINAL_PAYOUT',
                    },
                },
            }
        });
    }

    async findProjectInvests(projectId: bigint) {
        return this.prisma.log.findMany({
            where: {
                type: 'INVEST',
                projectId: projectId,
                interestLogs: {
                    none: {
                        type: 'FINAL_PAYOUT',
                    },
                },
            }
        });
    }

    async findLastInvestLogsByUser(userId: bigint) {
        return this.prisma.log.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                dateTime: 'desc'
            },
            include: {
                project: {
                    select: {
                        title: true
                    }
                }
            },
            take: 5
        });
    }
}