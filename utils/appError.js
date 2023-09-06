class AppError extends Error {
// all errors we're going to create from this class are operational errors .
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        // the status depends on statusCode,
        // 400 || 404 => fail
        // 500 => error
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
                                //currentObj, AppError class itself
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;