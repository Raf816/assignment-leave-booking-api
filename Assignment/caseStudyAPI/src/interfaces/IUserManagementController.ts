import { Response } from "express";
import { IAuthenticatedJWTRequest } from "../types/IAuthenticatedJWTRequest";

export interface IUserManagementController {
  assignManagerToStaff(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
}
