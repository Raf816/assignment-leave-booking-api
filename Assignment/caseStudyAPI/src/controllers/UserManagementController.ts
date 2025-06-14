import { Response, request } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { UserManagement } from "../entity/UserManagement";
import { Logger } from "../helper/Logger";
import { ResponseHandler } from "../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { IAuthenticatedJWTRequest } from "../types/IAuthenticatedJWTRequest";
import { IUserManagementController } from "../interfaces/IUserManagementController";
import { ValidationUtil } from "../helper/ValidationUtils";
import { ErrorMessages } from "../constants/ErrorMessages";

export class UserManagementController implements IUserManagementController {
  async assignManagerToStaff(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const { staffId, managerId, startDate } = req.body;

      if (!staffId || !managerId) {
        ResponseHandler.sendErrorResponse(res,StatusCodes.BAD_REQUEST,ErrorMessages.STAFF_OR_MANAGER_ID_REQUIRED);
        return;
      }

      // startDate validation 
      if (startDate && isNaN(Date.parse(startDate))) {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Invalid start date format. Please use a valid date (YYYY-MM-DD)."
        );
        return;
      }

      const userRepo = AppDataSource.getRepository(User);
      const userManagementRepo = AppDataSource.getRepository(UserManagement);

      const staff = await userRepo.findOneBy({ id: staffId });
      const manager = await userRepo.findOneBy({ id: managerId });

      if (!staff || !manager) {
        ResponseHandler.sendErrorResponse(res,StatusCodes.NOT_FOUND,ErrorMessages.STAFF_OR_MANAGER_NOT_FOUND); 
        return;
      }

      const existing = await userManagementRepo.findOne({
        where: {
          staff: { id: staffId },
          manager: { id: managerId }
        }
      });

      if (existing) {
        ResponseHandler.sendErrorResponse(res,StatusCodes.CONFLICT,ErrorMessages.ASSIGNMENT_ALREADY_EXISTS); 
        return;
      }

      const mapping = userManagementRepo.create({
        staff,
        manager,
        startDate,
      });

      
      //using date object below
      // const mapping = userManagementRepo.create({
      //   staff,
      //   manager,
      //   startDate: startDate ? new Date(startDate) : new Date()
      // });

      await ValidationUtil.validateOrThrow(mapping);

      await userManagementRepo.save(mapping);

      Logger.info(`Manager ${managerId} assigned to staff ${staffId} by ${req.signedInUser?.email}`);
      ResponseHandler.sendSuccessResponse(res,
        {
          id: mapping.id,
          staffId: staff.id,
          managerId: manager.id,
          startDate: mapping.startDate
        },
        StatusCodes.CREATED,ErrorMessages.ASSIGNMENT_SUCCESS);
        return;

    } catch (error) {
      Logger.error("Error assigning manager to staff", error);
      ResponseHandler.sendErrorResponse(res,StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.ASSIGNMENT_FAILED); 
      return;
    }
  }
}
