class CustomError extends Error{
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFound extends CustomError {
    constructor(message: string = 'Not Found') {
        super(message, 404);
    }
}

class Data extends CustomError {
    constructor(message: string = 'Internal Server Error') {
        super(message, 500);
    }
}

export {CustomError, NotFound, Data};
