import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { LeaveRequest, LeaveStatus } from '../entity/LeaveRequest';
import { User } from '../entity/User';
import { validate } from 'class-validator';
import { instanceToPlain } from 'class-transformer';
import { IAuthenticatedJWTRequest } from '../types/IAuthenticatedJWTRequest';
import { Logger } from '../helper/Logger';
import { ResponseHandler } from '../helper/ResponseHandler';
import { StatusCodes } from 'http-status-codes';
import { In } from 'typeorm';

export class LeaveRequestController {
  async requestLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const leaveRepository = AppDataSource.getRepository(LeaveRequest);
      
      const { startDate, endDate, leaveType, reason } = req.body;

      const emailFromToken = req.signedInUser?.email;
      if (!emailFromToken) {
        Logger.error("Missing email in signedInUser");
        ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "User not authorized");
        return;
      }

      const user = await userRepository.findOne({ where: { email: emailFromToken } });
      if (!user) {
        Logger.error(`User not found: ${emailFromToken}`);
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const leave = new LeaveRequest();
      leave.user = user;
      leave.startDate = startDate;
      leave.endDate = endDate;
      leave.status = LeaveStatus.PENDING;
      leave.leaveType = leaveType || "Annual Leave";
      leave.reason = reason;

      const validationErrors = await validate(leave);
      if (validationErrors.length > 0) {
        const firstError = Object.values(validationErrors[0].constraints || {})[0];
        Logger.warn(`Validation failed: ${firstError}`);
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, firstError);
        return;
      }

      if (end <= start) {
        Logger.warn("End date before or equal to start date");
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `End date of ${endDate} is before the start date of ${startDate}`
        );
        return;
      }

      const existingRequests = await leaveRepository.find({
        where: {
          user: { id: user.id },
          status: In([LeaveStatus.PENDING, LeaveStatus.APPROVED]),
        },
      });

      const overlap = existingRequests.some((r) => {
        const existingStart = new Date(r.startDate);
        const existingEnd = new Date(r.endDate);
        const overlaps = start <= existingEnd && end >= existingStart;

        if (overlaps) {
          Logger.warn(`Overlap with leave from ${existingStart.toDateString()} to ${existingEnd.toDateString()}`);
        }

        return overlaps;
      });

      if (overlap) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Leave dates overlap with an existing request");
        return;
      }

      const totalRequestedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (totalRequestedDays > user.annualLeaveBalance) {
        Logger.warn(`Requested ${totalRequestedDays} days, but only ${user.annualLeaveBalance} available`);
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Days requested exceed remaining balance");
        return;
      }

      const savedLeave = await leaveRepository.save(leave);

      Logger.info(`Leave request submitted by ${user.email} for ${totalRequestedDays} days`);

      ResponseHandler.sendSuccessResponse(
        res,
        {
          ...instanceToPlain(savedLeave),
          remainingBalance: user.annualLeaveBalance - totalRequestedDays,
        },
        StatusCodes.CREATED
      );
    } catch (err) {
      Logger.error("Unhandled error in requestLeave", err);
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "An error occurred while processing the request"
      );
    }
  }

  async getMyRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const email = req.signedInUser?.email;

      if (!email) {
        Logger.error("Missing email from token.");
        ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Unauthorized");
        return;
      }

      const leaveRepo = AppDataSource.getRepository(LeaveRequest);

      const myRequests = await leaveRepo.find({
        where: {
          user: { email }
        },
        order: {
          createdAt: "DESC"
        }
      });

      ResponseHandler.sendSuccessResponse(res, instanceToPlain(myRequests), StatusCodes.OK);
    } catch (error) {
      Logger.error("Error retrieving leave requests", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve leave requests");
    }
  }

  async approveLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const leaveRepo = AppDataSource.getRepository(LeaveRequest);
      const userRepo = AppDataSource.getRepository(User);
      const leaveId = parseInt(req.params.id);
  
      if (isNaN(leaveId)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid leave request ID");
        return;
      }
  
      const leave = await leaveRepo.findOne({
        where: { id: leaveId },
        relations: ["user"]
      });
  
      if (!leave) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Leave request not found");
        return;
      }
  
      if (leave.status !== LeaveStatus.PENDING) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, `Cannot approve request with status: ${leave.status}`);
        return;
      }
  
      // Calculate total days
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
      const user = await userRepo.findOneBy({ id: leave.user.id });
      if (!user) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "User not found for leave request");
        return;
      }
  
      if (user.annualLeaveBalance < totalDays) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Insufficient leave balance to approve");
        return;
      }
  
      // Update leave + user
      leave.status = LeaveStatus.APPROVED;
      user.annualLeaveBalance -= totalDays;
  
      await userRepo.save(user);
      const saved = await leaveRepo.save(leave);
  
      Logger.info(`Leave request ID ${leave.id} approved by ${req.signedInUser?.email}`);
  
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(saved), StatusCodes.OK);
  
    } catch (error) {
      Logger.error("Error approving leave request", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to approve leave request");
    }
  }  
}
