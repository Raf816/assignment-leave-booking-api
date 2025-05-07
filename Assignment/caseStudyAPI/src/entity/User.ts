import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Role } from "./Role"; 

@Entity({ name: "user" })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column() 
    @IsString()
    @MinLength(10, { message: 'Password must be at least 10 characters long' })
    password: string

    @Column({ unique: true }) 
    @IsEmail({}, { message: 'Must be a valid email address' })
    email: string

    @ManyToOne(() => Role,  { nullable: false, eager: true })
    role: Role; 
}