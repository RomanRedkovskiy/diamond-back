import {SecurityTokenRepository} from "../repositories/SecurityTokenRepository.js";
import jwt, {Secret} from 'jsonwebtoken';
import {User} from "@prisma/client";
import {CustomError} from "../errors/CustomError.js";

const JWT_SECRET: Secret =  process.env.JWT_SECRET!;
const JWT_EXPIRATION = '1d';

export class SecurityTokenService {

    private securityTokenRepository: SecurityTokenRepository;

    constructor() {
        this.securityTokenRepository = new SecurityTokenRepository();
    }

    async create(user: User) {
        let token;

        try {
            token = jwt.sign(
                { userId: user.id.toString() },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRATION }
            );
        } catch (error) {
            throw new CustomError('Server error occurred while trying to generate jwt token', 500);
        }
        await this.securityTokenRepository.create(token, user.id);
        return token;
    }

    verifyToken(header: string | undefined) {
        if (!header || !header.startsWith('Bearer ')) {
            throw new CustomError('Authorization token missing or malformed', 401);
        }

        const token = header.split(' ')[1];
        if (!token) {
            throw new CustomError('Authorization token missing', 401);
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: bigint; exp: number };

        if (decoded.exp * 1000 < Date.now()) {
            throw new CustomError('Token expired', 401);
        }

        return decoded;
    }
}
