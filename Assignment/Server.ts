import express, { Application, Request, Response } from "express";
import { MyRouter } from "./caseStudyAPI/routes/MyRouter";
import { StatusCodes } from "http-status-codes";

export class Server {
    private readonly app: Application;

    constructor(private readonly myRouter: MyRouter,
                private readonly port: number) {
        this.app = express();
        // this.myRouter = myRouter;
        // this.port = port;
    
        this.initialiseMiddlewares();
        this.initialiseRoutes();
        this.initialiseErrorHandling();
    }

    private initialiseMiddlewares() {
        this.app.use(express.json());
    }

    private initialiseErrorHandling() {
        this.app.get("*", (req: Request, res: Response) => {
        const requestedUrl =`${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.status(StatusCodes.NOT_FOUND).send("Route " + requestedUrl + " not found");
        });
    }

    private initialiseRoutes() {
        this.app.use("/api",this.myRouter.getRouter());
    }

    public start(): void {
        this.app.listen(this.port, () => {
        console.log(`Server listening on port ${this.port}`);
        });
    }
}