import { Role } from "../entity/Role";

export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  annualLeaveBalance: number;
  department?: string;
}
