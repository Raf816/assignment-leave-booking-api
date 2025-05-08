import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from "./Role"; 
import { Exclude } from "class-transformer";

@Entity({ name: "user" })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ select: false }) //obscure from get queries
    @Exclude() //after post queries - need instanceToPlain when responding
    @IsString()
    @MinLength(10, { message: 'Password must be at least 10 characters long' })
    password: string

    @Column({ unique: true }) 
    @IsEmail({}, { message: 'Must be a valid email address' })
    email: string

    @ManyToOne(() => Role,  { nullable: false, eager: true })
    @IsNotEmpty({ message: 'Role is required' })
    role: Role; 
}