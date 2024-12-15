import {Request, Response} from 'express';
import jsonParser from 'json-bigint';
import {CustomError} from "../errors/CustomError.js";
import {InterestLogService} from "../services/InterestLogService.js";

export class InterestLogController {

    private interestLogService: InterestLogService;

    constructor() {
        this.interestLogService = new InterestLogService();
    }

    async getLastInterestLogs(req: Request, res: Response): Promise<void> {
        try {
            const userId: bigint = (req as any).userId;
            const interestLogs = await this.interestLogService.getUserLastInterestLogs(userId);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(jsonParser.stringify(interestLogs));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }
}
