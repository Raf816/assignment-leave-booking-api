import { Response } from "express";
import { Logger } from "../helper/Logger";
import { ResponseHandler } from "../helper/ResponseHandler";
import { AppError } from "./AppError";

export class ErrorHandler {
    static handle(err: AppError, res: Response): void {
        Logger.error(err.message);
        ResponseHandler.sendErrorResponse(res, err.statusCode, err.message);
    }
}