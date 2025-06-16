import { LeaveTypeController } from '../../controllers/LeaveTypeController';
import { AppDataSource } from '../../data-source';
import { LeaveType } from '../../entity/LeaveType';
import { LeaveRequest } from '../../entity/LeaveRequest';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import { instanceToPlain } from 'class-transformer';
import { validate } from 'class-validator';
import { ResponseHandler } from '../../helper/ResponseHandler';
import { StatusCodes } from 'http-status-codes';
import { ErrorMessages } from '../../constants/ErrorMessages';

jest.mock('../../helper/ResponseHandler');
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('LeaveTypeController', () => {
  let controller: LeaveTypeController;
  let mockLeaveTypeRepo: any;
  let mockLeaveRequestRepo: any;

  const mockResponse = (): any => ({});
  const mockRequest = (props: Partial<Request>): Request =>
    ({
      params: props.params || {},
      body: props.body || {},
    } as Request);

  const setMockRepos = () => {
    mockLeaveTypeRepo = mock();
    mockLeaveRequestRepo = mock();

    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === LeaveType) return mockLeaveTypeRepo;
      if (entity === LeaveRequest) return mockLeaveRequestRepo;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setMockRepos();
    controller = new LeaveTypeController();
  });

  it('getAll: returns list of leave types', async () => {
    const req = mockRequest({});
    const res = mockResponse();

    mockLeaveTypeRepo.find.mockResolvedValue([{ id: 1, name: 'Annual Leave' }]);

    await controller.getAll(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      instanceToPlain([{ id: 1, name: 'Annual Leave' }]),
      StatusCodes.OK
    );
  });

  it('create: returns BAD_REQUEST if validation fails', async () => {
    const req = mockRequest({
      body: {
        name: '',
        description: '',
        defaultBalance: -1,
        maxRollover: -2,
      },
    });
    const res = mockResponse();

    (validate as jest.Mock).mockResolvedValue([{ property: 'name' }]);

    await controller.create(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      ErrorMessages.LEAVE_TYPE_VALIDATION_FAILED
    );
  });

  it('create: saves and returns new leave type on success', async () => {
    const req = mockRequest({
      body: {
        name: 'Sick Leave',
        description: 'For medical reasons',
        defaultBalance: 10,
        maxRollover: 5,
      },
    });
    const res = mockResponse();

    (validate as jest.Mock).mockResolvedValue([]);
    mockLeaveTypeRepo.save.mockResolvedValue({ id: 2, name: 'Sick Leave' });

    await controller.create(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      instanceToPlain({ id: 2, name: 'Sick Leave' }),
      StatusCodes.CREATED
    );
  });

  it('update: returns BAD_REQUEST if ID is invalid', async () => {
    const req = mockRequest({ params: { id: 'NaN' } });
    const res = mockResponse();

    await controller.update(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      ErrorMessages.INVALID_LEAVE_TYPE_ID
    );
  });

  it('update: returns NOT_FOUND if leave type does not exist', async () => {
    const req = mockRequest({ params: { id: '5' }, body: {} });
    const res = mockResponse();

    mockLeaveTypeRepo.findOneBy.mockResolvedValue(null);

    await controller.update(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.NOT_FOUND,
      ErrorMessages.LEAVE_TYPE_NOT_FOUND(5)
    );
  });

  it('update: validates and updates leave type on success', async () => {
    const req = mockRequest({
      params: { id: '1' },
      body: { name: 'Updated Leave', maxRollover: 10 },
    });
    const res = mockResponse();

    const existing = { id: 1, name: 'Old', description: 'desc', defaultBalance: 10, maxRollover: 5 };
    mockLeaveTypeRepo.findOneBy.mockResolvedValue(existing);
    (validate as jest.Mock).mockResolvedValue([]);
    mockLeaveTypeRepo.save.mockResolvedValue({ ...existing, name: 'Updated Leave', maxRollover: 10 });

    await controller.update(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      instanceToPlain({ ...existing, name: 'Updated Leave', maxRollover: 10 }),
      StatusCodes.OK
    );
  });

  it('delete: returns BAD_REQUEST if ID is invalid', async () => {
    const req = mockRequest({ params: { id: 'xyz' } });
    const res = mockResponse();

    await controller.delete(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      ErrorMessages.INVALID_LEAVE_TYPE_ID
    );
  });

  it('delete: returns NOT_FOUND if leave type does not exist', async () => {
    const req = mockRequest({ params: { id: '3' } });
    const res = mockResponse();

    mockLeaveTypeRepo.findOneBy.mockResolvedValue(null);

    await controller.delete(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.NOT_FOUND,
      ErrorMessages.LEAVE_TYPE_NOT_FOUND(3)
    );
  });

  it('delete: returns BAD_REQUEST if leave type is linked to a request', async () => {
    const req = mockRequest({ params: { id: '2' } });
    const res = mockResponse();

    mockLeaveTypeRepo.findOneBy.mockResolvedValue({ id: 2, name: 'Annual' });
    mockLeaveRequestRepo.count.mockResolvedValue(2);

    await controller.delete(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      ErrorMessages.LEAVE_TYPE_IN_USE
    );
  });

  it('delete: removes and confirms deletion of leave type', async () => {
    const req = mockRequest({ params: { id: '4' } });
    const res = mockResponse();

    const leaveType = { id: 4, name: 'Test Leave' };
    mockLeaveTypeRepo.findOneBy.mockResolvedValue(leaveType);
    mockLeaveRequestRepo.count.mockResolvedValue(0);
    mockLeaveTypeRepo.remove.mockResolvedValue(leaveType);

    await controller.delete(req, res);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      { message: 'Leave type "Test Leave" has been deleted.' },
      StatusCodes.ACCEPTED
    );
  });
});
