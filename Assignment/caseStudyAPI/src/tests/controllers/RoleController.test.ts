import { RoleController } from '../../controllers/RoleController';
import { Role } from '../../entity/Role';
import { Repository, DeleteResult } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { mock } from 'jest-mock-extended';
import * as classValidator from 'class-validator';
import { ResponseHandler } from '../../helper/ResponseHandler';
import { ErrorMessages } from '../../constants/ErrorMessages';

jest.mock('../../helper/ResponseHandler');

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

const VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED = "Name is required";
const VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE = "Name cannot be empty or whitespace";
const VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED = "Name must be 30 characters or less";

describe('RoleController', () => {
  const getValidManagerData = (): Role => {
    const role = new Role();
    role.id = 1;
    role.name = 'manager';
    return role;
  };

  const mockRequest = (params = {}, body = {}): Partial<Request> => ({ params, body });
  const mockResponse = (): Partial<Response> => ({});

  let roleController: RoleController;
  let mockRoleRepo: jest.Mocked<Repository<Role>>;

  beforeEach(() => {
    mockRoleRepo = mock<Repository<Role>>();
    roleController = new RoleController();
    (roleController as any).roleRepository = mockRoleRepo;
    jest.clearAllMocks();
  });

  it('getAll returns NO_CONTENT if no roles exist', async () => {
    const req = mockRequest();
    const res = mockResponse();
    mockRoleRepo.find.mockResolvedValue([]);
    await roleController.getAll(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.NO_CONTENT);
  });

  it('getAll returns all roles', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const roles = [getValidManagerData()];
    mockRoleRepo.find.mockResolvedValue(roles);
    await roleController.getAll(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, roles);
  });

  it('getAll returns INTERNAL_SERVER_ERROR if DB fails', async () => {
    const req = mockRequest();
    const res = mockResponse();
    mockRoleRepo.find.mockRejectedValue(new Error('Database error'));
    await roleController.getAll(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ErrorMessages.FAILED_TO_RETRIEVE_ROLES
    );
  });

  it('getById returns BAD_REQUEST if id is not a number', async () => {
    const req = mockRequest({ id: 'abc' });
    const res = mockResponse();
    await roleController.getById(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.BAD_REQUEST,
      ErrorMessages.INVALID_USER_ID_FORMAT
    );
  });

  it('getById returns NOT_FOUND if no role exists', async () => {
    const req = mockRequest({ id: '99' });
    const res = mockResponse();
    mockRoleRepo.findOne.mockResolvedValue(undefined);
    await roleController.getById(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.NOT_FOUND,
      RoleController.ERROR_ROLE_NOT_FOUND_WITH_ID(99)
    );
  });

  it('getById returns INTERNAL_SERVER_ERROR if DB fails', async () => {
    const req = mockRequest({ id: '1' });
    const res = mockResponse();
    mockRoleRepo.findOne.mockRejectedValue(new Error('Database error'));
    await roleController.getById(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ErrorMessages.FAILED_TO_RETRIEVE_ROLE
    );
  });

  it('getById returns role if found', async () => {
    const role = getValidManagerData();
    const req = mockRequest({ id: role.id.toString() });
    const res = mockResponse();
    mockRoleRepo.findOne.mockResolvedValue(role);
    await roleController.getById(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, role);
  });

  it('create throws BAD_REQUEST if validation fails', async () => {
    const req = mockRequest({}, {});
    const res = mockResponse();

    const expectedError =
      `${VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED},` +
      `${VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE},` +
      `${VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED}`;

    jest.spyOn(classValidator, 'validate').mockResolvedValue([
      {
        property: 'name',
        constraints: {
          isNotEmpty: VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED,
          Matches: VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE,
          MaxLength: VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED,
        },
      },
    ]);

    await expect(roleController.create(req as Request, res as Response)).rejects.toThrow(expectedError);
  });

  it('create returns CREATED if valid role', async () => {
    const role = getValidManagerData();
    const req = mockRequest({}, { name: role.name });
    const res = mockResponse();

    mockRoleRepo.save.mockResolvedValue(role);
    jest.spyOn(classValidator, 'validate').mockResolvedValue([]);

    await roleController.create(req as Request, res as Response);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, role, StatusCodes.CREATED);
  });

  it('delete throws if id not provided', async () => {
    const req = mockRequest(); // no id
    const res = mockResponse();
    await expect(roleController.delete(req as Request, res as Response)).rejects.toThrow(
      ErrorMessages.NO_USER_ID_PROVIDED
    );
  });

  it('delete throws if role not found', async () => {
    const req = mockRequest({ id: '99' });
    const res = mockResponse();
    mockRoleRepo.delete.mockResolvedValue({ affected: 0 } as DeleteResult);
    await expect(roleController.delete(req as Request, res as Response)).rejects.toThrow(
      ErrorMessages.ROLE_NOT_FOUND_FOR_DELETION
    );
  });

  it('delete returns success if role deleted', async () => {
    const req = mockRequest({ id: '1' });
    const res = mockResponse();
    mockRoleRepo.delete.mockResolvedValue({ affected: 1 } as DeleteResult);
    await roleController.delete(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, 'Role deleted');
  });

  it('update throws if no id provided', async () => {
    const req = mockRequest({}, { name: 'manager' });
    const res = mockResponse();
    await expect(roleController.update(req as Request, res as Response)).rejects.toThrow(
      ErrorMessages.NO_USER_ID_PROVIDED
    );
  });

  it('update throws if role not found', async () => {
    const req = mockRequest({}, { id: 1, name: 'manager' });
    const res = mockResponse();
    mockRoleRepo.findOneBy.mockResolvedValue(null);
    await expect(roleController.update(req as Request, res as Response)).rejects.toThrow(
      ErrorMessages.ROLE_NOT_FOUND
    );
  });

  it('update throws if validation fails', async () => {
    const role = getValidManagerData();
    const req = mockRequest({}, { id: role.id, name: '' });
    const res = mockResponse();
    mockRoleRepo.findOneBy.mockResolvedValue(role);

    const expectedError =
      `${VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED},` +
      `${VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE},` +
      `${VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED}`;

    jest.spyOn(classValidator, 'validate').mockResolvedValue([
      {
        property: 'name',
        constraints: {
          isNotEmpty: VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED,
          Matches: VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE,
          MaxLength: VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED,
        },
      },
    ]);

    await expect(roleController.update(req as Request, res as Response)).rejects.toThrow(expectedError);
  });

  it('update saves and returns role if valid', async () => {
    const updatedRole = getValidManagerData();
    const originalRole = { ...updatedRole, name: 'old' };

    const req = mockRequest({}, updatedRole);
    const res = mockResponse();

    mockRoleRepo.findOneBy.mockResolvedValue(originalRole);
    mockRoleRepo.save.mockResolvedValue(updatedRole);
    jest.spyOn(classValidator, 'validate').mockResolvedValue([]);

    await roleController.update(req as Request, res as Response);

    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, updatedRole);
  });
});
