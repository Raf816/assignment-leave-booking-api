import { Request, Response } from "express";
import { IEntityController } from "./IEntityController";

export interface IGetByEmail extends IEntityController{
    getByEmail(req: Request, res: Response): Promise<void>;
}