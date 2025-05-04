import { MyRouter } from "./routes/MyRouter";
import { Router } from "express";
import { Server } from "./Server";

const myRouter = new MyRouter(Router());
const server = new Server(myRouter, 9900);
server.start();