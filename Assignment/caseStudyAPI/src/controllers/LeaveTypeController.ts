import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LeaveType } from "../entity/LeaveType";
import { instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "../helper/Logger";
import { ResponseHandler } from "../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants/ErrorMessages";
import { LeaveRequest } from "../entity/LeaveRequest";

export class LeaveTypeController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
      const leaveTypes = await leaveTypeRepo.find();
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(leaveTypes), StatusCodes.OK);
    } catch (error) {
      Logger.error("Error fetching leave types", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.INTERNAL_ERROR);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, defaultBalance, maxRollover } = req.body;

      const leaveType = new LeaveType();
      leaveType.name = name;
      leaveType.description = description;
      leaveType.defaultBalance = defaultBalance;
      leaveType.maxRollover = maxRollover;

      const errors = await validate(leaveType);
      if (errors.length > 0) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.LEAVE_TYPE_VALIDATION_FAILED);
        return;
      }

      const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
      const saved = await leaveTypeRepo.save(leaveType);
      Logger.info(`Leave type created: ${name}`);
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(saved), StatusCodes.CREATED);
    } catch (error) {
      Logger.error("Error creating leave type", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.LEAVE_TYPE_CREATE_FAILED);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_LEAVE_TYPE_ID);
        return;
      }

      const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
      const leaveType = await leaveTypeRepo.findOneBy({ id });

      if (!leaveType) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, ErrorMessages.LEAVE_TYPE_NOT_FOUND(id));
        return;
      }

      const { name, description, defaultBalance, maxRollover } = req.body;
      leaveType.name = name ?? leaveType.name;
      leaveType.description = description ?? leaveType.description;
      leaveType.defaultBalance = defaultBalance ?? leaveType.defaultBalance;
      leaveType.maxRollover = maxRollover ?? leaveType.maxRollover;

      const errors = await validate(leaveType);
      if (errors.length > 0) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.LEAVE_TYPE_VALIDATION_FAILED);
        return;
      }

      const updated = await leaveTypeRepo.save(leaveType);
      Logger.info(`Leave type updated: ${id}`);
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(updated), StatusCodes.OK);
    } catch (error) {
      Logger.error("Error updating leave type", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.LEAVE_TYPE_UPDATE_FAILED);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_LEAVE_TYPE_ID);
        return;
      }

      const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
      const leaveType = await leaveTypeRepo.findOneBy({ id });

      if (!leaveType) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, ErrorMessages.LEAVE_TYPE_NOT_FOUND(id));
        return;
      }

      const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);
      const isUsed = await leaveRequestRepo.count({ where: { leaveType: { id } } });
      if (isUsed > 0) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.LEAVE_TYPE_IN_USE);
        return;
      }

      await leaveTypeRepo.remove(leaveType);
      Logger.info(`Leave type deleted: ${id}`);
      ResponseHandler.sendSuccessResponse(res,{ message: `Leave type "${leaveType.name}" has been deleted.` }, StatusCodes.ACCEPTED);
      } catch (error) {
        Logger.error("Error deleting leave type", error);
        ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.LEAVE_TYPE_DELETE_FAILED);
    }
  }
}
