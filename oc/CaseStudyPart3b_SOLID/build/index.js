"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Server_1 = require("./Server");
var express_1 = require("express");
var data_source_1 = require("./data-source");
var LoginRouter_1 = require("./routes/LoginRouter");
var RoleRouter_1 = require("./routes/RoleRouter");
var UserRouter_1 = require("./routes/UserRouter");
var RoleController_1 = require("./controllers/RoleController");
var UserController_1 = require("./controllers/UserController");
var LoginController_1 = require("./controllers/LoginController");
//Initialise the port
var DEFAULT_PORT = 8900;
var port = process.env.SERVER_PORT || DEFAULT_PORT;
if (!process.env.SERVER_PORT) {
    console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}
//Initialise the data source
var appDataSource = data_source_1.AppDataSource;
//Initialise routers
var routers = [
    new LoginRouter_1.LoginRouter((0, express_1.Router)(), new LoginController_1.LoginController()),
    new RoleRouter_1.RoleRouter((0, express_1.Router)(), new RoleController_1.RoleController()),
    new UserRouter_1.UserRouter((0, express_1.Router)(), new UserController_1.UserController())
];
//Instantiate/start the server
var server = new Server_1.Server(port, routers, appDataSource);
server.start();
//# sourceMappingURL=index.js.map