import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { UserManagement } from "../entity/UserManagement";
import { Logger } from "../helper/Logger";
import { ResponseHandler } from "../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { IAuthenticatedJWTRequest } from "../types/IAuthenticatedJWTRequest";

export class UserManagementController {
  async assignManagerToStaff(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const { staffId, managerId, startDate } = req.body;

      if (!staffId || !managerId) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST,"Both staffId and managerId are required");
        return;
      }

      const userRepo = AppDataSource.getRepository(User);
      const userManagementRepo = AppDataSource.getRepository(UserManagement);

      const staff = await userRepo.findOneBy({ id: staffId });
      const manager = await userRepo.findOneBy({ id: managerId });

      if (!staff || !manager) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Staff or manager user not found");
        return;
      }

      const existing = await userManagementRepo.findOne({
        where: {
          staff: { id: staffId },
          manager: { id: managerId }
        }
      });

      if (existing) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.CONFLICT, "This staff is already assigned to the given manager");
        return;
      }

      const mapping = userManagementRepo.create({
        staff,
        manager,
        startDate: startDate ? new Date(startDate) : new Date()
      });

      await userManagementRepo.save(mapping);

      Logger.info(`Manager ${managerId} assigned to staff ${staffId} by ${req.signedInUser?.email}`);
      ResponseHandler.sendSuccessResponse(res,
        {
          id: mapping.id,
          staffId: staff.id,
          managerId: manager.id,
          startDate: mapping.startDate
        },
        StatusCodes.CREATED,
        "Manager assigned to staff successfully"
      );
      return;
      
    } catch (error) {
      Logger.error("Error assigning manager to staff", error);
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to assign manager"
      );
      return;
    }
  }
}
