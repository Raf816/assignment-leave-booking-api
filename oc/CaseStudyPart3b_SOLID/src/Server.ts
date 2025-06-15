import express from "express";
import { DataSource } from "typeorm";
import morgan, {StreamOptions} from "morgan";
import { Logger } from "./helper/Logger";
import { MiddlewareFactory } from "./helper/MiddlewareFactory";
import { IRouter} from "./routes/IRouter";
import { ErrorHandler } from "./helper/ErrorHandler";

export class Server {
    public static readonly ERROR_TOKEN_IS_INVALID = "Not authorised - Token is invalid";
    public static readonly ERROR_TOKEN_NOT_FOUND = "Not authorised - Token not found";
    public static readonly ERROR_TOKEN_SECRET_NOT_DEFINED = "Token secret not found/defined";
    private readonly app: express.Application;

    constructor(private readonly port: string | number, 
                private readonly routers: IRouter[],
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
        for (const route of this.routers) {
            const middlewares: express.RequestHandler[] = [];

            if (route.authenticate) {
                middlewares.push(MiddlewareFactory.authenticateToken);
            }
    
            //Assume all end points are rate limited
            if (route.basePath === "/api/login") {
                middlewares.push(MiddlewareFactory.loginLimiter());
            } else {
                // jwtRateLimitMiddleware needs to extract the email at request time
                middlewares.push(MiddlewareFactory.jwtRateLimitMiddleware(route.routeName));
            }
    
            middlewares.push(MiddlewareFactory.logRouteAccess(route.routeName));

            this.app.use(route.basePath, ...middlewares, route.getRouter());
        }
    }
    
    private initialiseErrorHandling() { 
        this.app.use((err, req, res, next) => {
            ErrorHandler.handle(err, res);
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
}