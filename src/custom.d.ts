declare global {
    namespace Express {
        interface Request {
            userId?: bigint;
        }
    }
}

export {};
