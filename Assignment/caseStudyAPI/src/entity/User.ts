import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm"
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from "./Role"; 
import { Exclude } from "class-transformer";
import { PasswordHandler } from '../helper/PasswordHandler';
import { UserManagement } from "./UserManagement";

@Entity({ name: "user" })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    // @Column({ select: false }) //obscure from get queries
    // @Exclude() //after post queries - need instanceToPlain when responding
    // @IsString()
    // @MinLength(10, { message: 'Password must be at least 10 characters long' })
    // password1: string

    // @IsString({ message: "Password must be a string" })
    // @MinLength(10, { message: 'Password must be at least 10 characters long' })
    // @IsNotEmpty({ message: 'Password is required' })
    // @Column({ select: false }) //obscure from get queries
    // @Exclude() //after post queries - need instanceToPlain when responding
    // password1: string;

    //Working
    @IsOptional({ groups: ['update'] })
    @Column({ select: false }) //obscure from get queries
    @Exclude() //after post queries - need instanceToPlain when responding
    @IsString({ message: "Password must be a string", groups: ['create', 'update'] })
    @MinLength(10, {message: "Password must be at least 10 characters long", groups: ['create', 'update'],})
    @IsNotEmpty({ message: "Password is required", groups: ['create'] }) // only on create
    password: string;

    @Column({ select: false }) //obscure from get queries
    @Exclude() //after post queries - need instanceToPlain when responding
    salt: string // Security salt for password hashing

    @Column({ unique: true }) 
    @IsEmail({}, { message: 'Must be a valid email address' })
    email: string

    @ManyToOne(() => Role,  { nullable: false, eager: true })
    @IsNotEmpty({ message: 'Role is required' })
    role: Role; 

    @BeforeInsert()
    hashPasswordBeforeInsert() {
    if (!this.password) {
        throw new Error("Password must be provided before inserting a user.");
    }
        const { hashedPassword, salt } = PasswordHandler.hashPassword(this.password);
        this.password = hashedPassword;
        this.salt = salt;
    }

    @OneToMany(() => UserManagement, um => um.manager)
    managedStaff: UserManagement[];

    @OneToMany(() => UserManagement, um => um.staff)
    manager: UserManagement[];

    @Column()
    @IsNotEmpty({ message: 'First name is required', groups: ['create'] })
    @IsString({ groups: ['create'] })
    firstName: string;

    @Column()
    @IsNotEmpty({ message: 'Surname is required', groups: ['create'] })
    @IsString({ groups: ['create'] })
    lastName: string;


    @Column({ default: 25 })
    annualLeaveBalance: number;

    @Column({ nullable: true })
    @IsString()
    department: string;
}