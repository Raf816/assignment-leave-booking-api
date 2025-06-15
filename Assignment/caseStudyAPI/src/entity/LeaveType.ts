import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { LeaveRequest } from "./LeaveRequest";
import { IsNotEmpty, IsNumber, Min } from "class-validator";

@Entity({ name: "leave_type" })
export class LeaveType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({ message: "Leave type name is required" })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 25 }) // ✅ Default to 25 days
  @IsNumber({}, { message: "Default balance must be a number" })
  @Min(0, { message: "Default balance must be 0 or more" })
  defaultBalance: number;

  @Column({ default: 5 }) // ✅ Default to 5 days rollover
  @IsNumber({}, { message: "Max rollover must be a number" })
  @Min(0, { message: "Max rollover must be 0 or more" })
  maxRollover: number;

  @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.leaveType)
  leaveRequests: LeaveRequest[];
}
