import {Request, Response} from 'express';
import jsonParser from 'json-bigint';
import {CustomError} from "../errors/CustomError.js";
import {LogService} from "../services/LogService.js";

export class LogController {

    private logService: LogService;

    constructor() {
        this.logService = new LogService();
    }

    async getLastInvestLogs(req: Request, res: Response): Promise<void> {
        try {
            const userId: bigint = (req as any).userId;
            const logs = await this.logService.getUserLastInvestLogs(userId);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(jsonParser.stringify(logs));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }
}
