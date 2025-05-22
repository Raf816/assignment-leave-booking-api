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

      // Step 1: Get user from token
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

      // Step 2: Convert dates early for reuse
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Step 3: Build LeaveRequest entity
      const leave = new LeaveRequest();
      leave.user = user;
      leave.startDate = startDate;
      leave.endDate = endDate;
      leave.status = LeaveStatus.PENDING;
      leave.leaveType = leaveType || "Annual Leave";
      leave.reason = reason;

      // Step 4: Validate using decorators
      const validationErrors = await validate(leave);
      if (validationErrors.length > 0) {
        const firstError = Object.values(validationErrors[0].constraints || {})[0];
        Logger.warn(`Validation failed: ${firstError}`);
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, firstError);
        return;
      }

      // Step 5: Validate end > start
      if (end <= start) {
        Logger.warn("End date before or equal to start date");
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `End date of ${endDate} is before the start date of ${startDate}`
        );
        return;
      }

      // Step 6: Check overlapping requests
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

      // Step 7: Check leave balance
      const totalRequestedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (totalRequestedDays > user.annualLeaveBalance) {
        Logger.warn(`Requested ${totalRequestedDays} days, but only ${user.annualLeaveBalance} available`);
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Days requested exceed remaining balance");
        return;
      }

      // Step 8: Save to DB
      const savedLeave = await leaveRepository.save(leave);

      Logger.info(`Leave request submitted by ${user.email} for ${totalRequestedDays} days`);

      // Step 9: Respond with success
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
}