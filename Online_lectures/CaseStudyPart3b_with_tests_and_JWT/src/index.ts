import { Server } from "./Server";
import { Router } from "express";
import { AppDataSource } from "./data-source"; 
import { LoginRouter } from "./routes/LoginRouter";
import { RoleRouter } from "./routes/RoleRouter";
import { UserRouter } from "./routes/UserRouter";
import { RoleController } from "./controllers/RoleController";
import { UserController } from "./controllers/UserController";
import { LoginController } from "./controllers/LoginController";

//Initialise the port
const DEFAULT_PORT = 8900
const port = process.env.SERVER_PORT || DEFAULT_PORT;
if (!process.env.SERVER_PORT) {
    console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}

// Initialise the data source
const appDataSource = AppDataSource;

// Initialise routers
const loginRouter = new LoginRouter(Router(), new LoginController())
const roleRouter = new RoleRouter(Router(), new RoleController());
const userRouter = new UserRouter(Router(), new UserController());

// Instantiate/start the server
const server = new Server(port, loginRouter, roleRouter, userRouter, appDataSource);
server.start();