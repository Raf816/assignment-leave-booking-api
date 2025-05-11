import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IsDateString, IsEnum, IsNotEmpty } from "class-validator";
import { User } from "./User";

export enum LeaveStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    CANCELLED = 'Cancelled'
  }
  
  @Entity()
  export class LeaveRequest {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, { nullable: false, eager: true })
    user: User;
  
    @Column({ default: 'Annual Leave' })
    leaveType: string;
  
    @Column()
    @IsDateString({}, { message: 'Start date must be valid' })
    startDate: string;
  
    @Column()
    @IsDateString({}, { message: 'End date must be valid' })
    endDate: string;
  
    @Column({
      type: 'enum',
      enum: LeaveStatus,
      default: LeaveStatus.PENDING,
    })

    @IsEnum(LeaveStatus, { message: "Status must be Pending, Approved, Rejected or Cancelled" })
    
    @IsEnum(LeaveStatus)
    status: LeaveStatus;
  
    @Column({ nullable: true })
    reason: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }



