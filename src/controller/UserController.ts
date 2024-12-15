import {Request, Response, NextFunction, Router} from 'express';
import {UserService} from "../services/UserService.ts";
import {CustomError} from '../errors/CustomError.ts';
import {UserRegistrationDtoIn} from "../dto/user/UserRegistrationDtoIn.ts";
import {validateDto} from "../middleware/validate-dto.ts";
import {UserLoginDtoIn} from "../dto/user/UserLoginDtoIn.js";
import jsonParser from 'json-bigint';
import {UserUpdateDtoIn} from "@/dto/user/UserUpdateDtoIn.js";
import {Decimal} from "decimal.js";
import {User} from "@prisma/client";

export class UserController {

    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    addRoutes(router: Router) {
        router.post(
            '/api/v1/user/register',
            validateDto(UserRegistrationDtoIn),
            this.registerUser.bind(this)
        );

        router.post(
            "/api/v1/user/login",
            validateDto(UserLoginDtoIn),
            this.loginUser.bind(this)
        );
    }

    async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: bigint = (req as any).userId;
            const user = await this.userService.getCurrentUser(userId);
            const userDtoOut = await this.userService.userToDto(user);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(jsonParser.stringify(userDtoOut));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }

    async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userDtoIn: UserRegistrationDtoIn = req.body;
            const user = await this.userService.createUser(userDtoIn);
            const token = await this.userService.createSecurityToken(user);
            const userDtoOut = await this.userService.userToDto(user);
            res.setHeader('Authorization', `Bearer ${token}`);
            res.setHeader('Content-Type', 'application/json');
            res.status(201).send(jsonParser.stringify(userDtoOut));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }

    async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userDtoIn: UserLoginDtoIn = req.body;
            const user = await this.userService.loginUser(userDtoIn);
            const token = await this.userService.createSecurityToken(user);
            const userDtoOut = await this.userService.userToDto(user);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Authorization', `Bearer ${token}`);
            res.status(200).send(jsonParser.stringify(userDtoOut));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userDtoIn: UserUpdateDtoIn = req.body;
            const user = await this.userService.updateUser(userDtoIn);
            const userDtoOut = await this.userService.userToDto(user);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(jsonParser.stringify(userDtoOut));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }

    async depositUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const amount: number = req.body.amount;
            console.log('now', req)
            const userId: bigint = (req as any).userId;
            const user = await this.userService.handleDeposit(new Decimal(amount), userId);
            const userDtoOut = await this.userService.userToDto(user);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(jsonParser.stringify(userDtoOut));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }

    async withdrawUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const amount: number = req.body.amount;
            const userId: bigint = (req as any).userId;
            const user = await this.userService.handleWithdraw(amount, userId);
            const userDtoOut = await this.userService.userToDto(user);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(jsonParser.stringify(userDtoOut));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }

    async investIntoProject(req: Request, res: Response): Promise<void> {
        try {
            const projectId = BigInt(req.params.id);
            const amount: number = req.body.amount;
            const user = await this.userService.handleInvest(amount, projectId, (req as any).userId);
            const userDtoOut = await this.userService.userToDto(user);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(jsonParser.stringify(userDtoOut));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }

}
