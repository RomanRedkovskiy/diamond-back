import {UserRepository} from "../repositories/UserRepository.js";
import {UserRegistrationDtoIn} from "../dto/user/UserRegistrationDtoIn.ts";
import {dtoToUser, userToDto} from "../mapper/UserMapper.ts";
import {CustomError} from "../errors/CustomError.js";
import {UserLoginDtoIn} from "../dto/user/UserLoginDtoIn.js";
import {Log, LogType, User} from "@prisma/client";
import {SecurityTokenService} from "../services/SecurityTokenService.js";
import {UserUpdateDtoIn} from "@/dto/user/UserUpdateDtoIn.js";
import {Decimal} from 'decimal.js';
import {LogService} from "../services/LogService.js";
import {InterestLogService} from "../services/InterestLogService.js";
import {ProjectService} from "../services/ProjectService.js";
import {sendDataToUser} from "../services/WebSocketService.js";
import jsonParser from "json-bigint";

export class UserService {

    private projectService: ProjectService;
    private logService: LogService;
    private interestLogService: InterestLogService;
    private securityTokenService: SecurityTokenService;
    private userRepository: UserRepository;

    constructor() {
        this.projectService = new ProjectService();
        this.logService = new LogService();
        this.interestLogService = new InterestLogService();
        this.securityTokenService = new SecurityTokenService();
        this.userRepository = new UserRepository();
    }

    async getCurrentUser(userId: bigint) {
        const user = await this.userRepository.findById(userId);
        if (user === null) {
            throw new CustomError('User was not found', 404);
        }
        return user;
    }

    async createUser(userDtoIn: UserRegistrationDtoIn) {
        const inviter = await this.userRepository.findClientByLogin(userDtoIn.inviterLogin);
        if (!inviter) {
            throw new CustomError('No inviter with this login was found', 404);
        }
        if (await this.userRepository.findByLogin(userDtoIn.login)) {
            throw new CustomError('Login is already in use', 409);
        }
        const user = dtoToUser(userDtoIn, inviter.id);
        return this.userRepository.create(user);
    }

    async loginUser(userDtoIn: UserLoginDtoIn) {
        const user = await this.userRepository.findByLogin(userDtoIn.login)
        if (!user) {
            throw new CustomError('No user with this login was found', 404);
        }

        // TODO: after changing password logic -> change comparison logic as well
        if (user.password !== userDtoIn.password) {
            throw new CustomError('Wrong password', 400);
        }

        return user;
    }

    async updateUser(userDtoIn: UserUpdateDtoIn) {
        const user = await this.userRepository.findById(userDtoIn.id)
        if (!user) {
            throw new CustomError('No user with this id was found', 404);
        }
        user.login = userDtoIn.login;
        user.password = userDtoIn.password;
        user.about = userDtoIn.about;
        return this.userRepository.update(user);
    }

    async handleDeposit(amount: Decimal, userId: bigint) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new CustomError('No user with this id was found', 404);
        }
        user.balance = new Decimal(user.balance).plus(amount);
        return this.userRepository.update(user);
    }

    async handleWithdraw(amount: number, userId: bigint) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new CustomError('No user with this id was found', 404);
        }
        const withdrawAmount = new Decimal(amount);
        if (user.balance.lessThan(withdrawAmount)) {
            throw new CustomError('You cannot withdraw more funds than you have available', 403);
        }
        user.balance = new Decimal(user.balance).minus(new Decimal(amount));
        return this.userRepository.update(user);
    }

    async handleInvest(amount: number, projectId: bigint, userId: bigint) {
        const user = await this.handleWithdraw(amount, userId);
        await this.logService.createLog(new Decimal(amount), projectId, userId, LogType.INVEST);
        await this.handleFinalPayoutIfPoolCollected(projectId, userId);
        return user;
    }

    async handleInterest() {
        try {
            const activeInvests: Log[] = await this.logService.getActiveInvests();
            console.log('numer', activeInvests.length)
            // Process each active investment concurrently
            for (const invest of activeInvests) {
                const interestAmount = invest.amount.greaterThanOrEqualTo(1)
                    ? invest.amount.mul(0.01)
                    : new Decimal(0.01);

                // Wait for handleDeposit to complete before proceeding
                await this.handleDeposit(interestAmount, invest.userId!);

                const interestLog = {
                    amount: interestAmount,
                    projectId: invest.projectId,
                    userId: invest.userId,
                    logType: LogType.INTEREST
                };

                // Wait for createInterestLog to complete before proceeding to the next invest
                await this.interestLogService.createInterestLog(new Decimal(interestLog.amount),
                    invest.id, interestLog.userId!, interestLog.logType);
            }

            console.log('Interest handled successfully');

            this.sendLastInterestLogsForAffectedUsers(activeInvests);
        } catch (error) {
            console.error('Error handling interest:', error);
        }
    }

    sendLastInterestLogsForAffectedUsers(activeInvests: Log[]) {
        const userIds = new Set(activeInvests.map(invest => invest.userId));
        console.log('userIds', userIds)
        userIds.forEach(async userId => {
            const lastInterestLogs = await this.interestLogService.getUserLastInterestLogs(userId!);
            const lastInterestLogsDto = lastInterestLogs.map(item => {
                const projectTitle = item?.log?.project?.title;
                const { log, ...newItem } = item;
                return { ...newItem, projectTitle };
            });
            sendDataToUser(userId!, jsonParser.stringify(lastInterestLogsDto));
        });
    }

    async handleFinalPayoutIfPoolCollected(projectId: bigint, userId: bigint) {
        const project = await this.projectService.getActiveProjectById(projectId);

        if (project === null) {
            throw new CustomError('Project not found', 404);
        }

        const projectWithCollectedPool = await this.projectService.projectToDto(project, userId);
        if (projectWithCollectedPool.collectedSum.greaterThanOrEqualTo(projectWithCollectedPool.poolSum)) {
            project.isActive = false;
            await this.projectService.updateProject(project);
            const projectInvestLogs = await this.logService.getProjectInvests(projectId);
            await Promise.all(projectInvestLogs.map(async (invest) => {
                await this.handleDeposit(invest.amount, invest.userId!);
                const interestLog = {
                    amount: invest.amount,
                    projectId: invest.projectId,
                    userId: invest.userId,
                    logType: LogType.FINAL_PAYOUT
                };
                await this.interestLogService.createInterestLog(new Decimal(interestLog.amount),
                    invest.id, interestLog.userId!, interestLog.logType);
            }));
        }
    }

    async createSecurityToken(user: User) {
        return await this.securityTokenService.create(user);
    }

    async userToDto(user: User) {
        const inviter = await this.userRepository.findLoginById(user.inviterId);
        return userToDto(user, inviter?.login);
    }
}
