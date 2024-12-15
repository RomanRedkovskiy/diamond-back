import {LogType} from "@prisma/client";
import {Decimal} from "decimal.js";
import {InterestLogRepository} from "../repositories/InterestLogRepository.js";

export class InterestLogService {

    private interestLogRepository: InterestLogRepository;

    constructor() {
        this.interestLogRepository = new InterestLogRepository();
    }

    async createInterestLog(amount: Decimal, logId: bigint, userId: bigint, type: LogType) {
        return await this.interestLogRepository.create({amount, logId, userId, type})
    }

    async getUserLastInterestLogs(userId: bigint) {
        console.log(userId, 'userId')
        return this.interestLogRepository.findLastInvestLogsByUser(userId);
    }
}
