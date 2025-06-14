import { UserManagementController } from '../../controllers/UserManagementController';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { UserManagement } from '../../entity/UserManagement';
import { IAuthenticatedJWTRequest } from '../../types/IAuthenticatedJWTRequest';
import { ResponseHandler } from '../../helper/ResponseHandler';
import { Logger } from '../../helper/Logger';
import { StatusCodes } from 'http-status-codes';
import { mock } from 'jest-mock-extended';

jest.mock('../../helper/ResponseHandler');

jest.mock('../../helper/Logger', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
  }
}));

jest.mock('../../helper/ValidationUtils', () => ({
  ValidationUtil: {
    validateOrThrow: jest.fn().mockResolvedValue(undefined), 
  }
}));


describe('UserManagementController', () => {
  let controller: UserManagementController;
  let mockUserRepo: any;
  let mockUserManagementRepo: any;

  const mockRequest = (props: Partial<IAuthenticatedJWTRequest>): IAuthenticatedJWTRequest =>
    ({
      signedInUser: props.signedInUser,
      body: props.body || {},
    } as IAuthenticatedJWTRequest);

  const mockResponse = (): any => ({});

  const setMockRepos = () => {
    mockUserRepo = mock();
    mockUserManagementRepo = mock();

    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === User) return mockUserRepo;
      if (entity === UserManagement) return mockUserManagementRepo;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setMockRepos();
    controller = new UserManagementController();
  });

  it('assignManagerToStaff: returns BAD_REQUEST if staffId or managerId is missing', async () => {
    const req = mockRequest({ body: { staffId: 1 } });
    const res = mockResponse();

    await controller.assignManagerToStaff(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Both staffId and managerId are required'
    );
  });

  it('assignManagerToStaff: returns NOT_FOUND if staff or manager not found', async () => {
    const req = mockRequest({ body: { staffId: 1, managerId: 2 } });
    const res = mockResponse();

    mockUserRepo.findOneBy.mockResolvedValueOnce(null); // staff not found
    mockUserRepo.findOneBy.mockResolvedValueOnce(null); // manager not found

    await controller.assignManagerToStaff(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.NOT_FOUND,
      'Staff or manager user not found'
    );
  });

  it('assignManagerToStaff: returns CONFLICT if assignment already exists', async () => {
    const staff = { id: 1 };
    const manager = { id: 2 };
    const req = mockRequest({ body: { staffId: 1, managerId: 2 } });
    const res = mockResponse();

    mockUserRepo.findOneBy.mockResolvedValueOnce(staff);
    mockUserRepo.findOneBy.mockResolvedValueOnce(manager);
    mockUserManagementRepo.findOne.mockResolvedValueOnce({ id: 99 }); // existing mapping

    await controller.assignManagerToStaff(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.CONFLICT,
      'This staff is already assigned to the given manager'
    );
  });

    it('assignManagerToStaff: returns BAD_REQUEST if startDate is invalid', async () => {
    const staff = { id: 1 };
    const manager = { id: 2 };
    const req = mockRequest({
      signedInUser: { email: 'admin@abc.com' },
      body: {
        staffId: 1,
        managerId: 2,
        startDate: '2025-13-12' // invalid month (should trigger error)
      }
    });
    const res = mockResponse();

    mockUserRepo.findOneBy.mockResolvedValueOnce(staff);
    mockUserRepo.findOneBy.mockResolvedValueOnce(manager);
    mockUserManagementRepo.findOne.mockResolvedValueOnce(null);

    await controller.assignManagerToStaff(req, res);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      'Invalid start date format. Please use a valid date (YYYY-MM-DD).'
    );
  });

  it('assignManagerToStaff: returns CREATED when successfully assigned', async () => {
    const staff = { id: 1 };
    const manager = { id: 2 };
    const req = mockRequest({
      signedInUser: { email: 'admin@abc.com' },
      body: { staffId: 1, managerId: 2, startDate: '2025-08-01' }
    });
    const res = mockResponse();

    mockUserRepo.findOneBy.mockResolvedValueOnce(staff);
    mockUserRepo.findOneBy.mockResolvedValueOnce(manager);
    mockUserManagementRepo.findOne.mockResolvedValueOnce(null);

    const mockMapping = {
      id: 10,
      staff,
      manager,
      startDate: new Date('2025-08-01')
    };

    mockUserManagementRepo.create.mockReturnValueOnce(mockMapping);
    mockUserManagementRepo.save.mockResolvedValueOnce(mockMapping);

    await controller.assignManagerToStaff(req, res);

    expect(Logger.info).toHaveBeenCalled();
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
      res,
      expect.objectContaining({
        id: 10,
        staffId: 1,
        managerId: 2,
        startDate: expect.any(Date)
      }),
      StatusCodes.CREATED,
      'Manager assigned to staff successfully'
    );
  });

  it('assignManagerToStaff: returns INTERNAL_SERVER_ERROR on exception', async () => {
    const req = mockRequest({ body: { staffId: 1, managerId: 2 } });
    const res = mockResponse();

    mockUserRepo.findOneBy.mockImplementation(() => {
      throw new Error('Database crash');
    });

    await controller.assignManagerToStaff(req, res);

    expect(Logger.error).toHaveBeenCalled();
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to assign manager'
    );
  });
});
