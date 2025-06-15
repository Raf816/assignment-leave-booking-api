import { LeaveRequestController } from '../../controllers/LeaveRequestController';
import { AppDataSource } from '../../data-source';
import { LeaveRequest, LeaveStatus } from '../../entity/LeaveRequest';
import { User } from '../../entity/User';
import { UserManagement } from '../../entity/UserManagement';
import { IAuthenticatedJWTRequest } from '../../types/IAuthenticatedJWTRequest';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../helper/ResponseHandler';
import { mock } from 'jest-mock-extended';
import { ErrorMessages } from '../../constants/ErrorMessages';

jest.mock('../../helper/ResponseHandler');
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('LeaveRequestController', () => {
  let controller: LeaveRequestController;
  let mockLeaveRepo: any;
  let mockUserRepo: any;
  let mockUserMgmtRepo: any;

  const mockResponse = (): any => ({});
  const mockRequest = (props: Partial<IAuthenticatedJWTRequest>): IAuthenticatedJWTRequest =>
    ({
      signedInUser: props.signedInUser,
      params: props.params || {},
      query: props.query || {},
      body: props.body || {},
    } as IAuthenticatedJWTRequest);

  const setMockRepos = () => {
    mockLeaveRepo = mock();
    mockUserRepo = mock();
    mockUserMgmtRepo = mock();

    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === LeaveRequest) return mockLeaveRepo;
      if (entity === User) return mockUserRepo;
      if (entity === UserManagement) return mockUserMgmtRepo;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setMockRepos();
    controller = new LeaveRequestController();
  });

  it('requestLeave: returns UNAUTHORIZED if no email in token', async () => {
    const req = mockRequest({ signedInUser: {} });
    const res = mockResponse();

    await controller.requestLeave(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.UNAUTHORIZED,
      'User not authorised'
    );
  });

  it('getMyRequests: returns UNAUTHORIZED if no email in token', async () => {
    const req = mockRequest({ signedInUser: {} });
    const res = mockResponse();

    await controller.getMyRequests(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.UNAUTHORIZED,
      'Unauthorised'
    );
  });

  it('approveLeave: returns BAD_REQUEST if ID is invalid', async () => {
    const req = mockRequest({ params: { id: 'abc' }, signedInUser: { email: 'admin@abc.com' } });
    const res = mockResponse();

    await controller.approveLeave(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Invalid leave request ID'
    );
  });

  it('rejectLeave: returns BAD_REQUEST if ID is invalid', async () => {
    const req = mockRequest({ params: { id: 'NaN' }, body: {}, signedInUser: { email: 'admin@abc.com' } });
    const res = mockResponse();

    await controller.rejectLeave(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Invalid leave request ID' 
    );
  });

  it('cancelLeave: returns BAD_REQUEST if ID is invalid', async () => {
    const req = mockRequest({ params: { id: 'xyz' }, signedInUser: { email: 'admin@abc.com' } });
    const res = mockResponse();

    await controller.cancelLeave(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Invalid leave request ID'
    );
  });

  it('getLeaveBalance: returns BAD_REQUEST if ID is invalid', async () => {
    const req = mockRequest({ params: { id: 'invalid' }, signedInUser: { email: 'admin@abc.com' } });
    const res = mockResponse();

    await controller.getLeaveBalance(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Invalid user ID'
    );
  });

  it('getRemainingLeave: returns BAD_REQUEST if ID is invalid', async () => {
    const req = mockRequest({ params: { userId: 'NaN' }, signedInUser: { email: 'admin@abc.com' } });
    const res = mockResponse();

    await controller.getRemainingLeave(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Invalid user ID'
    );
  });

  it('requestLeave: returns BAD_REQUEST if validation fails', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'staff@abc.com';
    user.annualLeaveBalance = 10;

    const req = mockRequest({
      signedInUser: { email: user.email },
      body: { startDate: '2025-08-01', endDate: '2025-08-05' },
    });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(user);
    const { validate } = require('class-validator');
    validate.mockResolvedValue([{ constraints: { isNotEmpty: 'leaveType should not be empty' } }]);

    await controller.requestLeave(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'leaveType should not be empty'
    );
  });

  it('requestLeave: returns BAD_REQUEST if leave overlaps', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'staff@abc.com';
    user.annualLeaveBalance = 15;

    const req = mockRequest({
      signedInUser: { email: user.email },
      body: { startDate: '2025-08-05', endDate: '2025-08-07' },
    });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(user);
    const { validate } = require('class-validator');
    validate.mockResolvedValue([]);

    mockLeaveRepo.find.mockResolvedValue([
      {
        startDate: '2025-08-04',
        endDate: '2025-08-06',
        status: LeaveStatus.PENDING,
      },
    ]);

    await controller.requestLeave(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Leave dates overlap with an existing request'
    );
  });

  it('cancelLeave: returns FORBIDDEN if not owner or admin', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'staff@abc.com';

    const leave = new LeaveRequest();
    leave.id = 100;
    leave.status = LeaveStatus.PENDING;
    leave.user = user;

    const req = mockRequest({
      signedInUser: {
        email: 'other@abc.com',
        role: { id: 2, name: 'staff' }
      },
      params: { id: '100' },
    });
    const res = mockResponse();

    mockLeaveRepo.findOne.mockResolvedValue(leave);

    await controller.cancelLeave(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.FORBIDDEN,
      'Not authorised to cancel this request'
    );
  });

  it('cancelLeave: restores leave balance if status is APPROVED', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'staffraf@abc.com';
    user.annualLeaveBalance = 5;

    const leave = new LeaveRequest();
    leave.id = 102;
    leave.status = LeaveStatus.APPROVED;
    leave.startDate = '2025-08-10';
    leave.endDate = '2025-08-11';
    leave.user = user;

    const req = mockRequest({
      signedInUser: {
        email: 'staffraf@abc.com',
        role: { id: 2, name: 'staff' }
      },
      params: { id: '102' },
    });
    const res = mockResponse();

    mockLeaveRepo.findOne.mockResolvedValue(leave);
    mockUserRepo.findOneBy.mockResolvedValue(user);
    mockUserRepo.save.mockResolvedValue(user);
    mockLeaveRepo.save.mockResolvedValue({ ...leave, status: LeaveStatus.CANCELLED });

    await controller.cancelLeave(req, res);

    expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      annualLeaveBalance: 7
    }));
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

it('approveLeave: returns BAD_REQUEST if insufficient balance', async () => {
  const user = new User();
  user.id = 1;
  user.annualLeaveBalance = 1;

  const leave = new LeaveRequest();
  leave.id = 1;
  leave.startDate = '2025-08-01';
  leave.endDate = '2025-08-03';
  leave.status = LeaveStatus.PENDING;
  leave.user = user;

  const req = mockRequest({
    signedInUser: { email: 'admin@abc.com' },
    params: { id: '1' },
  });
  const res = mockResponse();

  mockLeaveRepo.findOne.mockResolvedValue(leave);
  mockUserRepo.findOneBy.mockResolvedValue(user); 

  await controller.approveLeave(req, res);

  expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
    res,
    StatusCodes.BAD_REQUEST,ErrorMessages.INSUFFICIENT_BALANCE
  );
});

  // --- Additional Coverage: New Tests ---

  it('getAllLeaveRequests: returns empty if none found', async () => {
    const req = mockRequest({ signedInUser: { email: 'admin@abc.com' } });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue({
      id: 1,
      email:'admin@abc.com',
      role: { name: 'admin'}
    })

    mockLeaveRepo.find.mockResolvedValue([]);

    await controller.getAllLeaveRequests(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [], StatusCodes.OK);
  });

  it('updateLeaveBalance: returns BAD_REQUEST if balance is negative', async () => {
    const req = mockRequest({
      signedInUser: { email: 'admin@abc.com' },
      params: { id: '1' },
      body: { annualLeaveBalance: -5 }
    });
    const res = mockResponse();

    await controller.updateLeaveBalance(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Annual leave balance cannot be negative'
    );
  });

  it('getPendingRequests: returns empty for manager with no staff', async () => {
    const manager = new User();
    manager.id = 1;
    manager.email = 'manager@abc.com';
    manager.role = { id: 2, name: 'Manager' } as any;

    const req = mockRequest({ signedInUser: { email: manager.email } });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(manager);
    mockUserMgmtRepo.find.mockResolvedValue([]);

    await controller.getPendingRequests(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [], StatusCodes.OK, 'No pending requests for your staff');
  });

    // ✅ requestLeave: success
  it('requestLeave: creates leave successfully when valid', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'staff@abc.com';
    user.annualLeaveBalance = 10;

    const req = mockRequest({
      signedInUser: { email: user.email },
      body: {
        startDate: '2025-08-01',
        endDate: '2025-08-03',
        leaveType: 'Annual Leave',
        reason: 'Holiday'
      }
    });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(user);
    mockLeaveRepo.find.mockResolvedValue([]);
    const { validate } = require('class-validator');
    validate.mockResolvedValue([]);
    mockLeaveRepo.save.mockResolvedValue({ id: 1, ...req.body, status: LeaveStatus.PENDING });

    await controller.requestLeave(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      expect.objectContaining({
        startDate: '2025-08-01',
        endDate: '2025-08-03',
        remainingBalance: 7
      }),
      StatusCodes.CREATED
    );
  });

  // ✅ getMyRequests: success
  it('getMyRequests: returns leave requests for user', async () => {
    const req = mockRequest({ signedInUser: { email: 'staff@abc.com' } });
    const res = mockResponse();

    const requests = [{ id: 1, leaveType: 'Annual', startDate: '2025-08-01', user: { email: 'staff@abc.com' } }];
    mockLeaveRepo.find.mockResolvedValue(requests);

    await controller.getMyRequests(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, requests, StatusCodes.OK);
  });

  // ✅ approveLeave: success
  it('approveLeave: approves leave request and deducts balance', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'staff@abc.com';
    user.annualLeaveBalance = 10;

    const leave = new LeaveRequest();
    leave.id = 2;
    leave.status = LeaveStatus.PENDING;
    leave.startDate = '2025-08-01';
    leave.endDate = '2025-08-02';
    leave.user = user;

    const req = mockRequest({ signedInUser: { email: 'admin@abc.com' }, params: { id: '2' } });
    const res = mockResponse();

    mockLeaveRepo.findOne.mockResolvedValue(leave);
    mockUserRepo.findOneBy.mockResolvedValue(user);
    mockUserRepo.save.mockResolvedValue(user);
    mockLeaveRepo.save.mockResolvedValue({ ...leave, status: LeaveStatus.APPROVED });

    await controller.approveLeave(req, res);

    expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      annualLeaveBalance: 8
    }));
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  // ✅ rejectLeave: success
  it('rejectLeave: rejects a pending leave request with reason', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'staff@abc.com';

    const leave = new LeaveRequest();
    leave.id = 3;
    leave.status = LeaveStatus.PENDING;
    leave.user = user;

    const req = mockRequest({
      signedInUser: { email: 'admin@abc.com' },
      params: { id: '3' },
      body: { reason: 'Business needs' }
    });
    const res = mockResponse();

    mockLeaveRepo.findOne.mockResolvedValue(leave);
    mockLeaveRepo.save.mockResolvedValue({ ...leave, status: LeaveStatus.REJECTED, reason: 'Business needs' });

    await controller.rejectLeave(req, res);

    expect(mockLeaveRepo.save).toHaveBeenCalled();
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  // ✅ updateLeaveBalance: success
  it('updateLeaveBalance: updates leave balance successfully', async () => {
    const user = new User();
    user.id = 5;
    user.email = 'staff@abc.com';
    user.firstName = 'Test';
    user.lastName = 'User';
    user.annualLeaveBalance = 10;
    user.role = { id: 2, name: 'staff' } as any;

    const req = mockRequest({
      signedInUser: { email: 'admin@abc.com' },
      params: { id: '5' },
      body: { annualLeaveBalance: 12 }
    });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(user);
    mockUserRepo.save.mockResolvedValue({ ...user, annualLeaveBalance: 12 });

    await controller.updateLeaveBalance(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      expect.objectContaining({
        updatedBalance: 12,
        fullName: 'Test User',
        email: 'staff@abc.com'
      }),
      StatusCodes.OK,
      'Leave balance successfully updated'
    );
  });

  // ✅ getRemainingLeave: success for self
  it('getRemainingLeave: returns balance for self', async () => {
    const user = new User();
    user.id = 10;
    user.email = 'me@abc.com';
    user.firstName = 'Self';
    user.lastName = 'User';
    user.annualLeaveBalance = 8;
    user.role = { id: 3, name: 'staff' } as any;

    const req = mockRequest({ signedInUser: { email: user.email }, params: { userId: '10' } });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(user);

    await controller.getRemainingLeave(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      {
        remainingDays: 8,
        fullName: 'Self User',
        email: 'me@abc.com'
      },
      StatusCodes.OK,
      'Remaining leave for Self User'
    );
  });

  // ✅ getUserLeaveRequests: success
  it('getUserLeaveRequests: returns leave requests for given user', async () => {
    const user = new User();
    user.id = 6;
    user.email = 'target@abc.com';
    user.firstName = 'Target';
    user.lastName = 'User';

    const leave1 = new LeaveRequest();
    leave1.id = 7;
    leave1.leaveType = 'Annual';
    leave1.startDate = '2025-08-01';
    leave1.endDate = '2025-08-02';
    leave1.status = LeaveStatus.APPROVED;
    leave1.reason = 'Vacation';
    leave1.user = user;

    const req = mockRequest({ signedInUser: { email: 'manager@abc.com' }, params: { id: '6' } });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(user);
    mockLeaveRepo.find.mockResolvedValue([leave1]);

    await controller.getUserLeaveRequests(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      expect.arrayContaining([
        expect.objectContaining({
          id: 7,
          leaveType: 'Annual',
          user: expect.objectContaining({ email: 'target@abc.com' })
        })
      ]),
      StatusCodes.OK
    );
  });

  // ✅ getPendingRequests: admin sees all
  it('getPendingRequests: admin sees all pending leave requests', async () => {
    const admin = new User();
    admin.id = 1;
    admin.email = 'admin@abc.com';
    admin.role = { id: 1, name: 'admin' } as any;

    const req = mockRequest({ signedInUser: { email: admin.email } });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(admin);
    mockLeaveRepo.find.mockResolvedValue([
      { id: 1, status: LeaveStatus.PENDING, user: admin }
    ]);

    await controller.getPendingRequests(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      expect.arrayContaining([expect.objectContaining({ id: 1 })]),
      StatusCodes.OK
    );
  });

  // ✅ getPendingRequests: forbidden for regular users
  it('getPendingRequests: denies access for non-admin/manager roles', async () => {
    const user = new User();
    user.id = 3;
    user.email = 'user@abc.com';
    user.role = { id: 4, name: 'staff' } as any;

    const req = mockRequest({ signedInUser: { email: user.email } });
    const res = mockResponse();

    mockUserRepo.findOne.mockResolvedValue(user);

    await controller.getPendingRequests(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.FORBIDDEN,
      'Not authorized to view pending requests'
    );
  });
});
