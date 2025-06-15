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
import { UserManagement } from '../entity/UserManagement';
import { ILeaveRequestController } from '../interfaces/ILeaveRequestController';
import { ValidationUtil } from '../helper/ValidationUtils';
import { ErrorMessages } from '../constants/ErrorMessages';

export class LeaveRequestController implements ILeaveRequestController {

  async requestLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const leaveRepository = AppDataSource.getRepository(LeaveRequest);
      
      const { startDate, endDate, leaveType, reason } = req.body;

      const emailFromToken = req.signedInUser?.email;
      if (!emailFromToken) {
        Logger.error("Missing email in signedInUser");
        ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, ErrorMessages.UNAUTHORISED_USER);
        return;
      }

      const user = await userRepository.findOne({ where: { email: emailFromToken } });
      if (!user) {
        Logger.error(`User not found: ${emailFromToken}`);
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, ErrorMessages.USER_NOT_FOUND);
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        Logger.warn("End date before or equal to start date");
        ResponseHandler.sendErrorResponse(res,StatusCodes.BAD_REQUEST,`End date of ${endDate} is before the start date of ${startDate}`);
        return;
      }

      const leave = new LeaveRequest();
      leave.user = user;
      leave.startDate = startDate;
      leave.endDate = endDate;
      leave.status = LeaveStatus.PENDING;
      leave.leaveType = leaveType || "Annual Leave";
      leave.reason = reason;

      try {
        await ValidationUtil.validateOrThrow(leave);
      } catch (err: any) {
        Logger.warn("Validation failed:", err.message);
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, err.message);
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
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.OVERLAPPING_LEAVE);
        return;
      }

      const totalRequestedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (totalRequestedDays > user.annualLeaveBalance) {
        Logger.warn(`Requested ${totalRequestedDays} days, but only ${user.annualLeaveBalance} available`);
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.LEAVE_EXCEEDS_BALANCE);
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
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.INTERNAL_ERROR);
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
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_LEAVE_ID);
        return;
      }
  
      const leave = await leaveRepo.findOne({
        where: { id: leaveId },
        relations: ["user"]
      });
  
      if (!leave) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, ErrorMessages.LEAVE_REQUEST_NOT_FOUND);
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
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.INSUFFICIENT_BALANCE);
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
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.FAILED_TO_APPROVE);
    }
  }

  async rejectLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try{
      const leaveRepo = AppDataSource.getRepository(LeaveRequest);
      const leaveId = parseInt(req.params.id);
      const { reason = "Leave request rejected" } = req.body || {}; //optional leave reason + default message

      if (isNaN(leaveId)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_LEAVE_ID);
        return;
      }

      const leave = await leaveRepo.findOne({
        where: { id: leaveId },
        relations: ["user"]
      });

      if (!leave) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, ErrorMessages.LEAVE_REQUEST_NOT_FOUND);
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
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, ErrorMessages.FAILED_TO_REJECT);
    }
  }
  
    async cancelLeave(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const leaveRepo = AppDataSource.getRepository(LeaveRequest);
      const userRepo = AppDataSource.getRepository(User);
      const leaveId = parseInt(req.params.id);

      if (isNaN(leaveId)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_LEAVE_ID);
        return;
      }

      const leave = await leaveRepo.findOne({
        where: { id: leaveId },
        relations: ["user"]
      });

      if (!leave) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, ErrorMessages.LEAVE_REQUEST_NOT_FOUND);
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

  // async getAllLeaveRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
  //   try {
  //     const leaveRepo = AppDataSource.getRepository(LeaveRequest);
  //     const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
  //     const status = req.query.status as string | undefined;
  
  //     const whereClause: any = {};
  //     if (userId) whereClause.user = { id: userId };
  //     if (status) whereClause.status = status;
  
  //     const allRequests = await leaveRepo.find({
  //       where: whereClause,
  //       relations: ["user"],
  //       order: { createdAt: "DESC" }
  //     });
  
  //     const formatted = allRequests.map(lr => {
  //       if (!lr.user) {
  //         Logger.warn(`Leave request ID ${lr.id} has no associated user.`);
  //         return null;
  //       }

  //       return {
  //         id: lr.id,
  //         leaveType: lr.leaveType,
  //         startDate: lr.startDate,
  //         endDate: lr.endDate,
  //         status: lr.status,
  //         reason: lr.reason,
  //         createdAt: lr.createdAt,
  //         updatedAt: lr.updatedAt,
  //         user: {
  //           id: lr.user.id,
  //           email: lr.user.email,
  //           firstName: lr.user.firstName,
  //           lastName: lr.user.lastName
  //         }
  //       };
  //     }).filter(Boolean);

  
  //     Logger.info(`Filtered leave requests retrieved by ${req.signedInUser?.email}`);
  //     ResponseHandler.sendSuccessResponse(res, formatted, StatusCodes.OK);
  //   } catch (error) {
  //     Logger.error("Error retrieving filtered leave requests", error);
  //     ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve leave requests");
  //   }
  // }
  async getAllLeaveRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const leaveRepo = AppDataSource.getRepository(LeaveRequest);
      const userRepo = AppDataSource.getRepository(User);
      const userManagementRepo = AppDataSource.getRepository(UserManagement);

      const currentUser = await userRepo.findOne({
        where: { email: req.signedInUser?.email },
        relations: ["role"]
      });

      if (!currentUser) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Not authenticated");
        return;
      }

      const roleName = currentUser.role?.name.toLowerCase();
      const isAdmin = roleName === "admin";
      const isManager = roleName === "manager";
      const isStaff = roleName === "employee";

      const status = req.query.status as string | undefined;

      const whereClause: any = {};
      if (status) whereClause.status = status;

      if (isAdmin) {
        // Admin sees all
      } else if (isManager) {
        const managedRelations = await userManagementRepo.find({
          where: { manager: { id: currentUser.id } },
          relations: ["employee"]
        });

        const staffIds = managedRelations.map(rel => rel.staff.id);
        if (staffIds.length === 0) {
          ResponseHandler.sendSuccessResponse(res, [], StatusCodes.OK, "No leave requests found for your staff");
          return;
        }
        whereClause.user = { id: In(staffIds) };
      } else if (isStaff) {
        whereClause.user = { id: currentUser.id };
      } else {
        ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, "Role not authorised to access leave requests");
        return;
      }

      const allRequests = await leaveRepo.find({
        where: whereClause,
        relations: ["user"],
        order: { createdAt: "DESC" }
      });

      const formatted = allRequests.map(lr => {
        if (!lr.user) {
          Logger.warn(`Leave request ID ${lr.id} has no associated user.`);
          return null;
        }

        return {
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
        };
      }).filter(Boolean);

      Logger.info(`Leave requests retrieved by ${currentUser.email}`);
      ResponseHandler.sendSuccessResponse(res, formatted, StatusCodes.OK);

    } catch (error) {
      Logger.error("Error retrieving leave requests", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve leave requests");
    }
  }
  
  //for staff
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

  //manager/admins
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
      const userManagementRepo = AppDataSource.getRepository(UserManagement);
      const userRepo = AppDataSource.getRepository(User);
      const currentUser = await userRepo.findOne({
        where: { email: req.signedInUser?.email },
      });


      if (!currentUser) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Not authenticated");
        return;
      }

      const isAdmin = currentUser.role?.name?.toLowerCase() === "admin";
      const isManager = currentUser.role?.name?.toLowerCase() === "manager";

      let pendingRequests: LeaveRequest[] = [];

      if (isAdmin) {
        // Admin sees all pending
        pendingRequests = await leaveRepo.find({
          where: { status: LeaveStatus.PENDING },
          relations: ["user"],
          order: { createdAt: "DESC" },
        });
      } else if (isManager) {
        // Manager sees only requests from their managed staff
        const managedRelations = await userManagementRepo.find({
          where: { manager: { id: currentUser.id } },
          relations: ["staff"]
        });

        const managedStaffIds = managedRelations.map(rel => rel.staff.id);
        if (managedStaffIds.length === 0) {
          ResponseHandler.sendSuccessResponse(res, [], StatusCodes.OK, "No pending requests for your staff");
          return;
        }

        pendingRequests = await leaveRepo.find({
          where: {
            status: LeaveStatus.PENDING,
            user: { id: In(managedStaffIds) }
          },
          relations: ["user"],
          order: { createdAt: "DESC" }
        });
      } else {
        ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, "Not authorized to view pending requests");
        return;
      }

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

      Logger.info(`Pending leave requests retrieved by ${currentUser.email}`);
      ResponseHandler.sendSuccessResponse(res, formatted, StatusCodes.OK);

    } catch (error) {
      Logger.error("Error retrieving pending leave requests", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve pending leave requests");
    }
  }


  async getUserLeaveRequests(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const status = req.query.status as string | undefined;

      if (isNaN(userId)) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid user ID");
        return;
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });

      if (!user) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }

      const leaveRepo = AppDataSource.getRepository(LeaveRequest);
      const whereClause: any = { user: { id: userId } };
      if (status) whereClause.status = status;

      const leaveRequests = await leaveRepo.find({
        where: whereClause,
        order: { createdAt: "DESC" },
        relations: ["user"]
      });

      if (leaveRequests.length === 0) {
        Logger.info(`No leave requests found for user ${userId}`);
        ResponseHandler.sendSuccessResponse(
          res,
          [],
          StatusCodes.OK,
          `No leave requests found for ${user.firstName} ${user.lastName}`
        );
        return;
      }

      const formatted = leaveRequests.map(r => ({
        id: r.id,
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
        reason: r.reason,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          id: r.user.id,
          email: r.user.email,
          firstName: r.user.firstName,
          lastName: r.user.lastName
        }
      }));

      Logger.info(`Leave requests for user ${userId} viewed by ${req.signedInUser?.email}`);
      ResponseHandler.sendSuccessResponse(res, formatted, StatusCodes.OK);
    } catch (error) {
      Logger.error("Error retrieving user leave requests", error);
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve leave requests");
    }
  }
}
