import { Server } from "./Server";
import { Router } from "express";
import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source"; 
import { LoginRouter } from "./routes/LoginRouter";
import { RoleRouter } from "./routes/RoleRouter";
import { UserRouter } from "./routes/UserRouter";
import { RoleController } from "./controllers/RoleController";
import { UserController } from "./controllers/UserController";
import { LoginController } from "./controllers/LoginController";

//Initialise the port
const DEFAULT_PORT = 9900
const port = process.env.SERVER_PORT || DEFAULT_PORT;
if (!process.env.SERVER_PORT) {
    console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}

//Initialise the data source
const appDataSource: DataSource = AppDataSource;

//Initialise routers
const routers = [
    new LoginRouter(Router(), new LoginController()),
    new RoleRouter(Router(), new RoleController()),
    new UserRouter(Router(), new UserController())
];

//Instantiate/start the server
const server = new Server(port, routers, appDataSource);
server.start();