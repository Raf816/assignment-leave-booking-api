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
        ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "User not authorised");
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
        ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Unauthorised");
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

  async rejectLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try{
      const leaveRepo = AppDataSource.getRepository(LeaveRequest);
      const leaveId = parseInt(req.params.id);
      const { reason = "Leave request rejected" } = req.body || {}; //optional leave reason + default message

      if (isNaN(leaveId)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid Leave Request ID");
        return;
      }

      const leave = await leaveRepo.findOne({
        where: { id: leaveId },
        relations: ["user"]
      });

      if (!leave) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Leave Request not found");
        return;
      }

      if (leave.status !== LeaveStatus.PENDING){
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, `Cannot reject leave request with status: ${leave.status}`)
      }

      leave.status = LeaveStatus.REJECTED;
      leave.reason = reason || "Leave request rejected";
      
      const saved = await leaveRepo.save(leave);

      Logger.info(`Leave request ID ${leave.id} rejected by ${req.signedInUser?.email}`);
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(saved), StatusCodes.OK);

    } catch (error) {
      Logger.error("Error rejecting leave request", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to reject the leave request");
    }
  }
  
    async cancelLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
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

      const currentUserEmail = req.signedInUser?.email;
      const currentUserRole = req.signedInUser?.role?.name?.toLowerCase();

      const isAdmin = currentUserRole === "admin";
      const isOwner = currentUserEmail === leave.user.email;

      if (!isAdmin && !isOwner) {
        Logger.warn(`Unauthorised cancel attempt by ${currentUserEmail} on request ${leaveId}`);
        ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, "Not authorised to cancel this request");
        return;
      }

      // If already cancelled/rejected, no point in cancelling again
      if ([LeaveStatus.CANCELLED, LeaveStatus.REJECTED].includes(leave.status)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, `Cannot cancel request with status: ${leave.status}`);
        return;
      }

      // If previously approved, restore balance
      if (leave.status === LeaveStatus.APPROVED) {
        const user = await userRepo.findOneBy({ id: leave.user.id });
        if (!user) {
          ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "User not found for leave request");
          return;
        }

        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        user.annualLeaveBalance += days;
        await userRepo.save(user);
      }

      leave.status = LeaveStatus.CANCELLED;
      const saved = await leaveRepo.save(leave);

      Logger.info(`Leave request ID ${leave.id} cancelled by ${currentUserEmail}`);
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(saved), StatusCodes.OK);
    } catch (error) {
      Logger.error("Error cancelling leave request", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to cancel leave request");
    }
  }

  async getAllLeaveRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const leaveRepo = AppDataSource.getRepository(LeaveRequest);
  
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const status = req.query.status as string | undefined;
  
      const whereClause: any = {};
      if (userId) whereClause.user = { id: userId };
      if (status) whereClause.status = status;
  
      const allRequests = await leaveRepo.find({
        where: whereClause,
        relations: ["user"],
        order: { createdAt: "DESC" }
      });
  
      const formatted = allRequests.map(lr => ({
        id: lr.id,
        leaveType: lr.leaveType,
        startDate: lr.startDate,
        endDate: lr.endDate,
        status: lr.status,
        reason: lr.reason,
        createdAt: lr.createdAt,
        updatedAt: lr.updatedAt,
        user: {
          id: lr.user.id,
          email: lr.user.email,
          firstName: lr.user.firstName,
          lastName: lr.user.lastName
        }
      }));
  
      Logger.info(`Filtered leave requests retrieved by ${req.signedInUser?.email}`);
      ResponseHandler.sendSuccessResponse(res, formatted, StatusCodes.OK);
    } catch (error) {
      Logger.error("Error retrieving filtered leave requests", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve leave requests");
    }
  }
  
  async getRemainingLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const requester = req.signedInUser;
  
      if (!userId || isNaN(userId)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid user ID");
        return;
      }
  
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: userId },
        relations: ["role"]
      });
  
      if (!user) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }
  
      const isAdmin = requester?.role?.name?.toLowerCase() === "admin";
      const isSelf = requester?.email === user.email;
  
      if (!isAdmin && !isSelf) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, "Access denied");
        return;
      }
  
      ResponseHandler.sendSuccessResponse(
        res,
        {
          remainingDays: user.annualLeaveBalance,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email
        },
        StatusCodes.OK,
        `Remaining leave for ${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      Logger.error("Error getting remaining leave", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to get remaining leave");
    }
  }

  async getLeaveBalance(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const staffId = parseInt(req.params.id);
  
      if (isNaN(staffId)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid user ID");
        return;
      }
  
      const staff = await userRepo.findOne({
        where: { id: staffId },
        relations: ["role"],
      });
  
      if (!staff) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Staff member not found");
        return;
      }
  
      ResponseHandler.sendSuccessResponse(res, {
        userId: staff.id,
        name: `${staff.firstName} ${staff.lastName}`,
        remainingBalance: staff.annualLeaveBalance,
        department: staff.department,
      }, StatusCodes.OK);
    } catch (err) {
      Logger.error("Error fetching leave balance", err);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve balance");
    }
  }
  
  async updateLeaveBalance(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const { annualLeaveBalance } = req.body;
  
      if (!userId || isNaN(userId)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid user ID");
        return;
      }
  
      if (annualLeaveBalance === undefined || isNaN(annualLeaveBalance)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Annual leave balance must be a valid number");
        return;
      }
  
      if (annualLeaveBalance < 0) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Annual leave balance cannot be negative");
        return;
      }
  
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: userId },
        relations: ["role"]
      });
  
      if (!user) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }
  
      user.annualLeaveBalance = annualLeaveBalance;
      await userRepo.save(user);
  
      Logger.info(`Leave balance for ${user.email} updated by ${req.signedInUser?.email}`);
  
      ResponseHandler.sendSuccessResponse(res, {
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        updatedBalance: user.annualLeaveBalance
      }, StatusCodes.OK, "Leave balance successfully updated");
  
    } catch (error) {
      Logger.error("Error updating leave balance", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update leave balance");
    }
  }
  
  async getPendingRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
  try {
    const leaveRepo = AppDataSource.getRepository(LeaveRequest);

    const pendingRequests = await leaveRepo.find({
      where: { status: LeaveStatus.PENDING },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    const formatted = pendingRequests.map(lr => ({
      id: lr.id,
      leaveType: lr.leaveType,
      startDate: lr.startDate,
      endDate: lr.endDate,
      reason: lr.reason,
      createdAt: lr.createdAt,
      updatedAt: lr.updatedAt,
      user: {
        id: lr.user.id,
        email: lr.user.email,
        firstName: lr.user.firstName,
        lastName: lr.user.lastName,
      }
    }));

    Logger.info(`Pending leave requests retrieved by ${req.signedInUser?.email}`);
    ResponseHandler.sendSuccessResponse(res, formatted, StatusCodes.OK);
  } catch (error) {
    Logger.error("Error retrieving pending leave requests", error);
    ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve pending leave requests");
  }
}

}
