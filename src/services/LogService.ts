import {LogRepository} from "../repositories/LogRepository.js";
import {Log, LogType} from "@prisma/client";
import {Decimal} from "decimal.js";

export class LogService {

    private logRepository: LogRepository;

    constructor() {
        this.logRepository = new LogRepository();
    }

    async createLog(amount: Decimal, projectId: bigint, userId: bigint, type: LogType) {
        return this.logRepository.create({amount, projectId, userId, type})
    }

    async getCollectedProjectSum(projectId: bigint) {
        return await this.logRepository.findCollectedSumByProjectId(projectId);
    }

    async getInvestedProjectSum(projectId: bigint, userId: bigint) {
        return await this.logRepository.findCollectedSumByProjectIdAndUserId(projectId, userId);
    }

    async getActiveInvests() {
        return this.logRepository.findActiveInvests();
    }

    async getProjectInvests(projectId: bigint) {
        return this.logRepository.findProjectInvests(projectId);
    }

    async getUserLastInvestLogs(userId: bigint) {
        return this.logRepository.findLastInvestLogsByUser(userId);
    }
}
