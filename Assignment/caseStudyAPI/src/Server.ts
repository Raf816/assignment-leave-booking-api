import express, { Request, Response, NextFunction } from "express";
import { DataSource } from "typeorm";
import { LoginRouter } from "./routes/LoginRouter";
import { RoleRouter} from "./routes/RoleRouter";
import { UserRouter } from "./routes/UserRouter";
import { StatusCodes } from "http-status-codes";
import morgan, {StreamOptions} from "morgan";
import { Logger } from "./helper/Logger";
import { ResponseHandler } from "./helper/ResponseHandler";
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { IAuthenticatedJWTRequest } from "./types/IAuthenticatedJWTRequest";

export class Server {
    public static readonly ERROR_TOKEN_IS_INVALID = "Not authorised - Token is invalid";
    public static readonly ERROR_TOKEN_NOT_FOUND = "Not authorised - Token not found";
    public static readonly ERROR_TOKEN_SECRET_NOT_DEFINED = "Token secret not found/defined";
    private readonly app: express.Application;

    //IP limiter - used for /login
    private readonly loginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, //15 minutes
        max: 100, //Maximum requests per window
        message: "Too many requests - try again later",
        standardHeaders: true, 
        legacyHeaders: false, 
    });

   // JWT Rate Limiter based on user email claim
    private readonly jwtRateLimiter = (userEmail: string) => rateLimit({
        windowMs: 15 * 60 * 1000, //15 minutes
        max: 20, //Maximum requests per window
        message: "Too many requests - try again later",
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => userEmail, //email from JWT as the key
    });

    constructor(private readonly port: string | number, 
                private readonly loginRouter: LoginRouter,
                private readonly roleRouter: RoleRouter,
                private readonly userRouter: UserRouter,
                private readonly appDataSource: DataSource
    ) {
        this.app = express();
    
        this.initialiseMiddlewares();       
        this.initialiseRoutes();
        this.initialiseErrorHandling(); 
    }

    private initialiseMiddlewares() {
        const morganStream: StreamOptions = {
            write: (message: string): void => {
                Logger.info(message.trim());  
            }
        };

        this.app.use(express.json());
        this.app.use(morgan("combined", { stream: morganStream }));
    }

    private initialiseRoutes() {
        this.app.use("/api/login", 
            this.loginLimiter, 
            this.logRouteAccess("Login route"), 
            this.loginRouter.getRouter());

        this.app.use("/api/roles", 
            this.authenticateToken,
            this.logRouteAccess("Roles route"), 
            this.jwtRateLimitMiddleware("roles"),
            this.roleRouter.getRouter()
        );

        this.app.use("/api/users", 
            this.authenticateToken,
            this.logRouteAccess("Users route"), 
            this.jwtRateLimitMiddleware("users"),
            this.userRouter.getRouter()
        );
    }
    
    private initialiseErrorHandling() {     
        this.app.use("/", (err: Error, req: Request, res: Response) => {
            const requestedUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
            Logger.error(`Error occurred: ${err.message} at ${req.originalUrl}`);
            ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Route " + requestedUrl + " not found");
        });
    }

    public async start() {
        await this.initialiseDataSource();
        this.app.listen(this.port, () => {
            Logger.info(`Server running on http://localhost:${this.port}`);
        });
    }

    private async initialiseDataSource() {
        try {
            await this.appDataSource.initialize();

            Logger.info("Data Source initialised");
        } catch (error) {
            Logger.error("Error during initialisation:", error);
            throw error;
        }
    }

    private authenticateToken(req: IAuthenticatedJWTRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
    
        if (authHeader) {
            const tokenReceived = authHeader.split(' ')[1];
            
            if (!process.env.JWT_SECRET) { 
                Logger.error(Server.ERROR_TOKEN_SECRET_NOT_DEFINED);
                throw new Error(Server.ERROR_TOKEN_SECRET_NOT_DEFINED);
            }
            jwt.verify(tokenReceived, process.env.JWT_SECRET, (err, payload) => {
                if (err) {
                    Logger.error(Server.ERROR_TOKEN_IS_INVALID);
                    return ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, Server.ERROR_TOKEN_IS_INVALID);
                }
                //console.log(payload);
                const { token: { email, role } } = payload as any;
                if (!email || !role) {
                    Logger.error(Server.ERROR_TOKEN_IS_INVALID);
                    return ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, Server.ERROR_TOKEN_IS_INVALID);
                }    

                req.signedInUser = { email, role };
                next();
            });
        } else {
            Logger.error(Server.ERROR_TOKEN_NOT_FOUND);
            ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, Server.ERROR_TOKEN_NOT_FOUND);
        }
    }

    private logRouteAccess(route: string) {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            Logger.info(`${route} accessed by ${req.ip}`);
            next();
        };
    }

    private jwtRateLimitMiddleware(route: string) {
        return (req: IAuthenticatedJWTRequest, res: express.Response, next: express.NextFunction) => {
            const email = req.signedInUser?.email; //email will be used as unique identifier in rate limiter (could use id if stored)

            if (email) {
                Logger.info(`${route} accessed by ${req.ip}`);
                this.jwtRateLimiter(email)(req, res, next); 
            } else {
                const ERROR_MESSAGE = "Missing essential information in JWT";
                Logger.error(ERROR_MESSAGE);
                ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ERROR_MESSAGE)
            }
        };
    }
}