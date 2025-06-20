import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Repository } from "typeorm";
import { ResponseHandler } from '../helper/ResponseHandler';
import { instanceToPlain } from "class-transformer";
import { StatusCodes } from 'http-status-codes';
import { validate } from "class-validator";
import { IEntityController } from '../interfaces/IEntityController';
import { AppError } from "../helper/AppError";
import { PasswordHandler } from '../helper/PasswordHandler';
import { ValidationUtil } from '../helper/ValidationUtils';
import { ErrorMessages } from '../constants/ErrorMessages';

export class UserController implements IEntityController {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const users = await this.userRepository.find({ relations: ["role"] });

    if (users.length === 0) {
      ResponseHandler.sendSuccessResponse(res, [], StatusCodes.NO_CONTENT);
      return;
    }

    ResponseHandler.sendSuccessResponse(res, users);
  };

  public getByEmail = async (req: Request, res: Response): Promise<void> => {
    const email = req.params.emailAddress;

    if (!email || email.trim().length === 0) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.EMAIL_REQUIRED);
      return;
    }

    const user = await this.userRepository.find({ where: { email }, relations: ["role"] });

    if (user.length === 0) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, ErrorMessages.EMAIL_NOT_FOUND(email));
      return;
    }

    ResponseHandler.sendSuccessResponse(res, user);
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_USER_ID_FORMAT);
      return;
    }

    const user = await this.userRepository.findOne({ where: { id }, relations: ["role"] });

    if (!user) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, ErrorMessages.USER_NOT_FOUND_WITH_ID(id));
      return;
    }

    ResponseHandler.sendSuccessResponse(res, user);
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    let user = new User();
    user.password = req.body.password;
    user.email = req.body.email;
    user.role = { id: req.body.roleId } as any;
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.department = req.body.department;

    // await ValidationUtil.validateOrThrow(user, ['create']);
    
    const errors = await validate(user, { groups: ['create'] });
    if (errors.length > 0) {
      const errorMessages = errors.map(err => Object.values(err.constraints || {})).flat().join(", ");
      throw new AppError(errorMessages);
    }

    const existing = await this.userRepository.findOne({ where: { email: user.email } });
    if (existing) {
      throw new AppError(ErrorMessages.EMAIL_ALREADY_IN_USE, StatusCodes.CONFLICT);
    }



    user = await this.userRepository.save(user);
    ResponseHandler.sendSuccessResponse(res, instanceToPlain(user), StatusCodes.CREATED);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    if (!id) {
      throw new AppError(ErrorMessages.NO_USER_ID_PROVIDED);
    }

    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new AppError(ErrorMessages.USER_NOT_FOUND_FOR_DELETION);
    }

    ResponseHandler.sendSuccessResponse(res, "User deleted", StatusCodes.OK);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id ? parseInt(req.params.id) : req.body.id;

    if (!id || isNaN(id)) {
      throw new AppError(ErrorMessages.NO_USER_ID_PROVIDED);
    }

    let user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new AppError(ErrorMessages.USER_NOT_FOUND);
    }

    // user.email = req.body.email;
    user.role = { id: req.body.roleId } as any;
    // user.firstName = req.body.firstName;
    // user.lastName = req.body.lastName;
    user.department = req.body.department;

    //or
    /*
    if (req.body.email) user.email = req.body.email;
    if (req.body.roleId) user.role = { id: req.body.roleId } as any;
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.department !== undefined) user.department = req.body.department;
    */

      // Only temporarily assigns raw password for validation — hashes after
    const tempUser = Object.assign(new User(), user); // clone with class type
    if (req.body.password && req.body.password.trim().length > 0) {
      tempUser.password = req.body.password; // raw password for validation
    }

    const errors = await validate(tempUser, { groups: ['update'] });
    if (errors.length > 0) {
      const errorMessages = errors
        .map(err => Object.values(err.constraints || {}))
        .flat()
        .join(", ");
      throw new AppError(errorMessages);
    }

    // Now hashes and assigns only after validation passes
    if (req.body.password && req.body.password.trim().length > 0) {
      const { hashedPassword, salt } = PasswordHandler.hashPassword(req.body.password);
      user.password = hashedPassword;
      user.salt = salt;
    }


    //working beelow line 129-142 (without validation of new password)
    // if (req.body.password && req.body.password.trim().length > 0) {
    //   user.password = req.body.password; // assign raw password for validation
    // }

    // const errors = await validate(user, { groups: ['update'] });
    // if (errors.length > 0) {
    //   const errorMessages = errors.map(err => Object.values(err.constraints || {})).flat().join(", ");
    //   throw new AppError(errorMessages);
    // }

    // if (req.body.password && req.body.password.trim().length > 0) {
    //   const { hashedPassword, salt } = PasswordHandler.hashPassword(req.body.password);
    //   user.password = hashedPassword;
    //   user.salt = salt;
    // }

    // await ValidationUtil.validateOrThrow(user, ['update']);

    user = await this.userRepository.save(user);
    ResponseHandler.sendSuccessResponse(res, instanceToPlain(user), StatusCodes.OK);
  };
}