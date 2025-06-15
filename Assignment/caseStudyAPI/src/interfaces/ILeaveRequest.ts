import { LeaveStatus } from "../entity/LeaveRequest";
import { IUser } from "./IUser";

export interface ILeaveRequest {
  id: number;
  user: IUser;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}
