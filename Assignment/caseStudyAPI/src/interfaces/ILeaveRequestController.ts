import { Request, Response } from 'express';
import { IAuthenticatedJWTRequest } from '../types/IAuthenticatedJWTRequest';

export interface ILeaveRequestController {
  requestLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  getMyRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  approveLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  rejectLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  cancelLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  getAllLeaveRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  getRemainingLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  getLeaveBalance(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  updateLeaveBalance(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  getPendingRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
  getUserLeaveRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void>;
}
