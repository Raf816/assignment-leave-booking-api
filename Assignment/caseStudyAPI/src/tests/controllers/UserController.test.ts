import { UserController } from '../../controllers/UserController';
import { User } from '../../entity/User';
import { Role } from '../../entity/Role';
import { Repository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../../helper/ResponseHandler';
import { Request, Response } from 'express';
import * as classValidator from "class-validator";
import * as classTransformer from "class-transformer";
import { mock } from "jest-mock-extended";
import { ErrorMessages } from '../../constants/ErrorMessages';

jest.mock('../../helper/ResponseHandler');

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

jest.mock("class-transformer", () => ({
  ...jest.requireActual("class-transformer"),
  instanceToPlain: jest.fn(),
}));

describe('UserController', () => {
  const getValidManagerData = (): User => {
    const role = new Role();
    role.id = 1;
    role.name = 'manager';

    const user = new User();
    user.id = 1;
    user.password = 'a'.repeat(12);
    user.email = 'manager@email.com';
    user.role = role;
    user.firstName = 'Alice';
    user.lastName = 'Smith';
    user.department = 'HR';
    return user;
  };

  const getValidStaffData = (): User => {
    const role = new Role();
    role.id = 2;
    role.name = 'staff';

    const user = new User();
    user.id = 2;
    user.password = 'b'.repeat(10);
    user.email = 'staff@email.com';
    user.role = role;
    user.firstName = 'Bob';
    user.lastName = 'Brown';
    user.department = 'Finance';
    return user;
  };

  const mockRequest = (params = {}, body = {}): Partial<Request> => ({
    params,
    body,
  });

  const mockResponse = (): Partial<Response> => ({});

  let userController: UserController;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    mockUserRepository = mock<Repository<User>>();
    userController = new UserController();
    userController['userRepository'] = mockUserRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getAll will return all users', async () => {
    const users = [getValidManagerData(), getValidStaffData()];
    const req = mockRequest();
    const res = mockResponse();

    mockUserRepository.find.mockResolvedValue(users);

    await userController.getAll(req as Request, res as Response);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, users);
  });

  it('getAll returns NO_CONTENT if no users exist', async () => {
    const req = mockRequest();
    const res = mockResponse();

    mockUserRepository.find.mockResolvedValue([]);

    await userController.getAll(req as Request, res as Response);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [], StatusCodes.NO_CONTENT);
  });

it('create returns BAD_REQUEST if no password', async () => {
  const req = mockRequest({}, { email: 'email@test.com', roleId: 1 });
  const res = mockResponse();

  const error = 'Password must be at least 10 characters long';
  jest.spyOn(classValidator, 'validate').mockResolvedValue([
    { constraints: { MinLength: error } } as any,
  ]);

  try {
    await userController.create(req as Request, res as Response);
  } catch (err: any) {
    expect(err.message).toBe(error);
  }
});

  it('create returns CREATED for valid user', async () => {
    const validUser = getValidManagerData();
    const req = mockRequest({}, {
      password: validUser.password,
      email: validUser.email,
      roleId: validUser.role.id,
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      department: validUser.department,
    });
    const res = mockResponse();

    mockUserRepository.save.mockResolvedValue(validUser);
    jest.spyOn(classTransformer, 'instanceToPlain').mockReturnValue({
    id: validUser.id,
    email: validUser.email,
    firstName: validUser.firstName,
    lastName: validUser.lastName,
    department: validUser.department,
    role: {
        id: validUser.role.id,
        name: validUser.role.name,
    },} as any);

    jest.spyOn(classValidator, 'validate').mockResolvedValue([]);

    await userController.create(req as Request, res as Response);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, {
    id: validUser.id,
    email: validUser.email,
    firstName: validUser.firstName,
    lastName: validUser.lastName,
    department: validUser.department,
    role: {
        id: validUser.role.id,
        name: validUser.role.name,
    },
    }, StatusCodes.CREATED);
    });

  it('getByEmail returns BAD_REQUEST if email param missing', async () => {
    const req = mockRequest({ emailAddress: '' });
    const res = mockResponse();

    await userController.getByEmail(req as Request, res as Response);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.BAD_REQUEST, 'Email is required');
  });

  it('getByEmail returns NOT_FOUND if user not found', async () => {
    const req = mockRequest({ emailAddress: 'unknown@email.com' });
    const res = mockResponse();

    mockUserRepository.find.mockResolvedValue([]);

    await userController.getByEmail(req as Request, res as Response);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.NOT_FOUND, 'unknown@email.com not found');
  });

  it('getById returns BAD_REQUEST for invalid id', async () => {
    const req = mockRequest({ id: 'abc' });
    const res = mockResponse();

    await userController.getById(req as Request, res as Response);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.BAD_REQUEST, 'Invalid ID format');
  });

  it('getById returns NOT_FOUND for missing user', async () => {
    const req = mockRequest({ id: '99' });
    const res = mockResponse();

    mockUserRepository.findOne.mockResolvedValue(undefined);

    await userController.getById(req as Request, res as Response);

    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.NOT_FOUND, 'User not found with ID: 99');
  });

  it('getById returns user for valid id', async () => {
    const user = getValidManagerData();
    const req = mockRequest({ id: user.id.toString() });
    const res = mockResponse();

    mockUserRepository.findOne.mockResolvedValue(user);

    await userController.getById(req as Request, res as Response);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, user);
  });

it('update returns BAD_REQUEST if no ID provided', async () => {
  const req = mockRequest(); // no ID in body or params
  const res = mockResponse();

  try {
    await userController.update(req as Request, res as Response);
  } catch (err: any) {
    expect(err.message).toBe(ErrorMessages.NO_USER_ID_PROVIDED);
  }
});
it('delete returns NOT_FOUND if user not found', async () => {
  const req = mockRequest({ id: '999' });
  const res = mockResponse();

  mockUserRepository.delete.mockResolvedValue({ affected: 0 } as any);

  try {
    await userController.delete(req as Request, res as Response);
  } catch (err: any) {
    expect(err.message).toBe(ErrorMessages.USER_NOT_FOUND_FOR_DELETION);
  }
});

  it('delete returns OK if deletion succeeds', async () => {
    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    mockUserRepository.delete.mockResolvedValue({ affected: 1, raw: {} } as any);

    await userController.delete(req as Request, res as Response);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, 'User deleted', StatusCodes.OK);
  });
});
