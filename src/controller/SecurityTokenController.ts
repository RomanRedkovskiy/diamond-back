import {NextFunction, Request, Response} from 'express';
import {CustomError} from '../errors/CustomError.ts';
import {SecurityTokenService} from "../services/SecurityTokenService.js";
import jwt from "jsonwebtoken";

export class SecurityTokenController {

    private securityTokenService: SecurityTokenService;

    constructor() {
        this.securityTokenService = new SecurityTokenService();
    }

    useAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
        this.parseAndValidateToken(req, res, next)
    }

    parseAndValidateToken(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.header('Authorization');
            const decoded = this.securityTokenService.verifyToken(authHeader);
            (req as any).userId = decoded.userId
            next();
        } catch (error: any) {
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({message: 'Invalid token'});
            } else if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: `Error validating token: ${error.message}`});
            }
        }
    }

}
