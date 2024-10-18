// errorMiddleware.js

// errors.js
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

export { AppError };


const errorMiddleware = (err, req, res, next) => {
    console.error(err); // Log the error for internal tracking

    // If it's an operational error (AppError), respond with its status and message
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: false,
            message: err.message,
        });
    }

    // For programming errors or unexpected errors
    res.status(500).json({
        status: false,
        message: "Internal Server Error",
        
    });
};

export default errorMiddleware;
