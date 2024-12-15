import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateDto = (dtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Transform plain object (req.body) to DTO instance
            const dto = plainToInstance(dtoClass, req.body);

            // Validate DTO
            const errors = await validate(dto);
            if (errors.length > 0) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: errors.map((err) => err.constraints),
                });
            }

            // Replace req.body with the validated DTO instance
            req.body = dto;
            next();
        } catch (err) {
            return res.status(500).json({ message: "Internal Server Error", err });
        }
    };
};