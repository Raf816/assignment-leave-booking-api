import { RequestHandler, Request, Response, NextFunction } from "express";
import { IAuthenticatedJWTRequest } from "../types/IAuthenticatedJWTRequest";
import { Logger } from "../helper/Logger";
import { ResponseHandler } from "../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

export class MiddlewareFactory {
    // IP Rate Limiter — used for public login route
    static loginLimiter(): RequestHandler {
        return rateLimit({
                        windowMs: 15 * 60 * 1000,
                        max: 100,
                        message: "Too many requests - try again later",
                        standardHeaders: true,
                        legacyHeaders: false,
        });
    }

    // JWT Rate Limiter — user-specific limiter
    static jwtRateLimiter(userEmail: string): RequestHandler {
        return rateLimit({
                        windowMs: 15 * 60 * 1000,
                        max: 20,
                        message: "Too many requests - try again later",
                        standardHeaders: true,
                        legacyHeaders: false,
                        keyGenerator: () => userEmail,
        });
    }

    // Middleware that pulls email from JWT and applies jwtRateLimiter
    static jwtRateLimitMiddleware(route: string): RequestHandler {
        return (req: IAuthenticatedJWTRequest, res: Response, next: NextFunction) => {
            const email = req.signedInUser?.email;

            if (email) {
                Logger.info(`${route} rate limited for ${email} @ ${req.ip}`);
                MiddlewareFactory.jwtRateLimiter(email)(req, res, next);
            } else {
                Logger.error("JWT missing email claim.");
                ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Missing email in token.");
            }
        };
    }

    // Log route access
    static logRouteAccess(route: string): RequestHandler {
        return (req: Request, _res: Response, next: NextFunction) => {
            Logger.info(`Route accessed: [${route}] by ${req.ip}`);
            next();
        };
    }

    // Authenticate JWT and attach signedInUser to request
    static authenticateToken(req: IAuthenticatedJWTRequest, res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            Logger.error("Auth header not found");
            ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Not authorised - Token not found");
        }

        const tokenReceived = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            Logger.error("JWT_SECRET is not defined");
            throw new Error("Token secret not found/defined");
        }

        jwt.verify(tokenReceived, jwtSecret, (err, payload) => {
            if (err || !payload || typeof payload !== "object") {
                Logger.error("Invalid JWT token");
                return ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Not authorised - Token is invalid");
            }

            try {
                const { token: { email, role } } = payload as any;
                if (!email || !role) {
                    throw new Error();
                }

                req.signedInUser = { email, role };
                next();
            } catch {
                Logger.error("JWT payload malformed");
                ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Not authorised - Token is invalid");
            }
        });
    }
}
