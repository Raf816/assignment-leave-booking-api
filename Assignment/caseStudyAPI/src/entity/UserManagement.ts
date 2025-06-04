import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from "typeorm";
import { User } from "./User";

@Entity()
@Unique(["manager", "staff"])
export class UserManagement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.managedStaff, { eager: true, onDelete: 'CASCADE' })
  manager: User;

  @ManyToOne(() => User, user => user.manager, { eager: true, onDelete: 'CASCADE' })
  staff: User;
}
