// src/tests/controllers/LoginController.test.ts

import { LoginController } from "../../../src/controllers/LoginController";
import { mock, mockReset } from "jest-mock-extended";
import { Request, Response } from "express";
import { User } from "../../../src/entity/User";
import { AppDataSource } from "../../../src/data-source";
import { PasswordHandler } from "../../../src/helper/PasswordHandler";
import jwt from "jsonwebtoken";
import { AppError } from "../../../src/helper/AppError";
import { Role } from "../../../src/entity/Role";

jest.mock("../../../src/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked-jwt-token"),
}));

const mockUserRepository = {
  createQueryBuilder: jest.fn(),
};

(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

describe("LoginController", () => {
  let controller: LoginController;
  const req = mock<Request>();
  const res = mock<Response>();

  beforeEach(() => {
    controller = new LoginController();
    mockReset(res);
  });

  it("should throw an error if email is missing", async () => {
    req.body = { password: "password" };
    await expect(controller.login(req, res)).rejects.toThrow(AppError);
  });

  it("should throw an error if password is missing", async () => {
    req.body = { email: "test@example.com" };
    await expect(controller.login(req, res)).rejects.toThrow(AppError);
  });

  it("should throw an error if user is not found", async () => {
    req.body = { email: "test@example.com", password: "password" };

    const qb: any = {
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    mockUserRepository.createQueryBuilder.mockReturnValue(qb);

    await expect(controller.login(req, res)).rejects.toThrow(AppError);
  });

  it("should throw an error if password is incorrect", async () => {
    req.body = { email: "test@example.com", password: "wrongpass" };

    const user = new User();
    user.email = "test@example.com";
    user.password = "hashed";
    user.salt = "salt";
    user.role = new Role();

    jest.spyOn(PasswordHandler, "verifyPassword").mockReturnValue(false);

    const qb: any = {
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(user),
    };

    mockUserRepository.createQueryBuilder.mockReturnValue(qb);

    await expect(controller.login(req, res)).rejects.toThrow(AppError);
  });

  it("should return token if credentials are correct", async () => {
    req.body = { email: "test@example.com", password: "correctpass" };

    const user = new User();
    user.email = "test@example.com";
    user.password = "hashed";
    user.salt = "salt";
    user.role = new Role();
    user.role.name = "staff";

    jest.spyOn(PasswordHandler, "verifyPassword").mockReturnValue(true);

    const qb: any = {
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(user),
    };

    mockUserRepository.createQueryBuilder.mockReturnValue(qb);

    res.status.mockReturnValue(res);
    res.send.mockReturnValue(res);

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledWith("mocked-jwt-token");
  });
});
