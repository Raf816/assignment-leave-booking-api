import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, Column } from "typeorm";
import { User } from "./User";
import { IsNotEmpty, IsDate, IsOptional, IsDateString } from "class-validator";

@Entity()
@Unique(["manager", "staff"])
export class UserManagement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.managedStaff, {
    eager: true,
    onDelete: "CASCADE"
  })
  @IsNotEmpty({ message: "Manager must be provided" })
  manager: User;

  @ManyToOne(() => User, user => user.manager, {
    eager: true,
    onDelete: "CASCADE"
  })
  @IsNotEmpty({ message: "Staff must be provided" })
  staff: User;

  @Column({ type: 'varchar', nullable: true })
  @IsNotEmpty({ message: "Start date is required" })
  @IsDateString({ strict: true }, { message: "Start date must be a valid date (YYYY-MM-DD)" })
  startDate: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsDateString({ strict: true }, { message: "End date must be a valid date (YYYY-MM-DD)" })
  endDate: string | null;


  // @Column({ type: 'datetime', nullable: true })
  // @IsDate({ message: "Start date must be a valid date" })
  // @IsNotEmpty({ message: "Start date is required" })
  // startDate: Date | null;

  // @Column({ nullable: true })
  // @IsOptional()
  // @IsDate({ message: "End date must be a valid date" })
  // endDate: Date | null;
}
