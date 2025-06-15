import { Router } from "express";

export interface IRouter {
    routeName: string;
    basePath: string;
    authenticate?: boolean;

    getRouter(): Router;
}