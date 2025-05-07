import { Request, Response } from 'express';
import { AppDataSource } from '../data-source'; 
import { User } from '../entity/User';
import { Repository } from "typeorm";
import { ResponseHandler } from '../helper/ResponseHandler';
import { instanceToPlain } from "class-transformer";
import { StatusCodes } from 'http-status-codes';
import { validate } from "class-validator";

export class UserController {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  // Get all users
  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.find({
        relations: ["role"], //include all role fields in response
      });

      if (users.length === 0) {
        ResponseHandler.sendSuccessResponse(res, [], StatusCodes.NO_CONTENT); 
      }

      ResponseHandler.sendSuccessResponse(res, users);

    } catch (error) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR,`Failed to retrieve users: ${error.message}`);
    }
  };

  // Get user by email
  public getByEmail = async (req: Request, res: Response): Promise<void> => {
    const email = req.params.emailAddress;

    if (!email || email.trim().length === 0) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Email is required");
      return;
    }

    try {
      const user = await this.userRepository.find({ where: { email: email },  
                                                    relations: ["role"]});
      if (user.length === 0) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, `${email} not found`);
        return;
      }

      ResponseHandler.sendSuccessResponse(res, user);

    } catch (error) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST,  `Unable to find user with the email: {$email}`);
    }
  };

  // Get user by ID
  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format");
      return;
    }

    try {
      const user = await this.userRepository.findOne({ where: { id: id },  
                                                      relations: ["role"] });
      if (!user) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NO_CONTENT, `User not found with ID: ${id}`);
        return;
      }

      ResponseHandler.sendSuccessResponse(res,user);
     
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, `Error fetching user: {$error.message}`);
    }
  };

  // Add a new user
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      let user = new User();
      user.password = req.body.password; //Will be salted and hashed in the entity
      user.email = req.body.email;
      user.role = req.body.roleId;

      const errors = await validate(user);
      if (errors.length > 0) { //Collate a string of all decorator error messages
         throw new Error (errors.map(err => Object.values(err.constraints || {})).join(", "));
      }

      user = await this.userRepository.save(user); // Save and return the created object
      
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(user), StatusCodes.CREATED);
      //remember to include instanceToPlain otherwise sensitive fields will be exposed

    } catch (error: any) { 
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  // Delete a user
  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    try {
      if (!id) {
        throw new Error("No ID provided");
      }

      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new Error("User with the provided ID not found");
      }

      ResponseHandler.sendSuccessResponse(res,"User deleted", StatusCodes.OK);
  
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, error.message);
    }
  };

  // Update details (not password or id)
  public update = async (req: Request, res: Response): Promise<void> => {
      const id = req.body.id;
     try{
      if (!id) {
        throw new Error("id not found");
      }
      
      let user = await this.userRepository.findOneBy({ id });

      if (!user) {
        throw new Error("User not found");
      }

      // Update specific fields
      user.email = req.body.email;
      user.role = req.body.roleId;

      const errors = await validate(user);
      if (errors.length > 0) { //Collate a string of all decorator error messages
         throw new Error (errors.map(err => Object.values(err.constraints || {})).join(", "));
      }

      user = await this.userRepository.save(user);

      ResponseHandler.sendSuccessResponse(res, user, StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };
}