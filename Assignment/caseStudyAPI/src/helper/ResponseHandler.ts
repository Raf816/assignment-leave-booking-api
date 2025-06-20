import { Response } from 'express';
import { Logger } from './Logger';
import { StatusCodes } from 'http-status-codes';

export class ResponseHandler {
    public static sendErrorResponse(
        res: Response, 
        statusCode: number, 
        message: string = "Unexpected error" //fallback value
        // Metadata can be added as optional
    ): Response {
        const timestamp = new Date().toISOString();
        Logger.error(`[Error]: ${message}`, `${timestamp}`);

        const errorResponse = {
            error: {
                message: message,
                status: statusCode,
                timestamp: timestamp,
                // Include metadata in the response
            }
        };
        return res.status(statusCode).send(errorResponse);
    }

    public static sendSuccessResponse(
        res: Response,
        data: any = {},
        statusCode: number = StatusCodes.OK,
        message?: string
    ): Response {
        const response = {
            ...(message && { message }),
            data
        };
        return res.status(statusCode).send(response);
    }
    
}
