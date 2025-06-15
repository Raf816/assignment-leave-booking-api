"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var RoleController_1 = require("../controllers/RoleController");
var Role_1 = require("../entity/Role");
var http_status_codes_1 = require("http-status-codes");
var ResponseHandler_1 = require("../helper/ResponseHandler");
var classValidator = __importStar(require("class-validator"));
var jest_mock_extended_1 = require("jest-mock-extended");
var VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED = "Name is required";
var VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE = "Name cannot be empty or whitespace";
var VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED = "Name must be 30 characters or less";
var INVALID_ROLE_ID_NUMBER = 99;
var INVALID_ROLE_ID_TYPE = "abc";
var BLANK_ROLE_NAME = "";
jest.mock('../helper/ResponseHandler');
jest.mock('class-validator', function () { return (__assign(__assign({}, jest.requireActual('class-validator')), { validate: jest.fn() })); });
describe('RoleController', function () {
    function getValidManagerData() {
        var role = new Role_1.Role();
        role.id = 1;
        role.name = 'manager';
        return role;
    }
    var mockRequest = function (params, body) {
        if (params === void 0) { params = {}; }
        if (body === void 0) { body = {}; }
        return ({
            params: params,
            body: body,
        });
    };
    var mockResponse = function () { return ({}); };
    var roleController;
    var mockRoleRepository;
    beforeEach(function () {
        mockRoleRepository = (0, jest_mock_extended_1.mock)();
        // Inject the mocked repository into RoleController
        roleController = new RoleController_1.RoleController();
        roleController['roleRepository'] = mockRoleRepository;
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    it('getAll returns NO_CONTENT if no roles exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest();
                    res = mockResponse();
                    mockRoleRepository.find.mockResolvedValue([]); //Simulate no roles in the database
                    return [4 /*yield*/, roleController.getAll(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.NO_CONTENT);
                    return [2 /*return*/];
            }
        });
    }); });
    it('getAll return all roles', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest();
                    res = mockResponse();
                    mockRoleRepository.find.mockResolvedValue([validManagerDetails]); //convert to an array (of one role)
                    return [4 /*yield*/, roleController.getAll(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.find).toHaveBeenCalled();
                    expect(ResponseHandler_1.ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [validManagerDetails]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('getAll returns INTERNAL_SERVER_ERROR if server fails to retrieve roles', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest();
                    res = mockResponse();
                    //Mock a database error
                    mockRoleRepository.find.mockRejectedValue(new Error("Database connection error"));
                    return [4 /*yield*/, roleController.getAll(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.find).toHaveBeenCalled();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, RoleController_1.RoleController.ERROR_FAILED_TO_RETRIEVE_ROLES);
                    return [2 /*return*/];
            }
        });
    }); });
    it('getById returns an error if an invalid id is supplied', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest({ id: INVALID_ROLE_ID_TYPE });
                    res = mockResponse();
                    return [4 /*yield*/, roleController.getById(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, RoleController_1.RoleController.ERROR_INVALID_ID_FORMAT);
                    return [2 /*return*/];
            }
        });
    }); });
    it('getById returns NOT_FOUND if the role id does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest({ id: INVALID_ROLE_ID_NUMBER });
                    res = mockResponse();
                    return [4 /*yield*/, roleController.getById(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.NOT_FOUND, RoleController_1.RoleController.ERROR_ROLE_NOT_FOUND_WITH_ID(INVALID_ROLE_ID_NUMBER));
                    return [2 /*return*/];
            }
        });
    }); });
    it('getById returns a role if a valid id is supplied', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({ id: validManagerDetails.id });
                    res = mockResponse();
                    mockRoleRepository.findOne.mockResolvedValue(validManagerDetails);
                    return [4 /*yield*/, roleController.getById(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.findOne).toHaveBeenCalledWith({ where: { id: validManagerDetails.id } });
                    expect(ResponseHandler_1.ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, validManagerDetails);
                    return [2 /*return*/];
            }
        });
    }); });
    it('getById returns INTERNAL_SERVER_ERROR if server fails to retrieve role by id', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({ id: validManagerDetails.id });
                    res = mockResponse();
                    //Mock a database error
                    mockRoleRepository.findOne.mockRejectedValue(new Error("Database connection error"));
                    return [4 /*yield*/, roleController.getById(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.findOne).toHaveBeenCalled();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, RoleController_1.RoleController.ERROR_FAILED_TO_RETRIEVE_ROLE);
                    return [2 /*return*/];
            }
        });
    }); });
    it('create will return BAD_REQUEST if the role name is missing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res, EXPECTED_ERROR_MESSAGE;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest();
                    res = mockResponse();
                    EXPECTED_ERROR_MESSAGE = "".concat(VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED, ",").concat(VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE, ",").concat(VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED);
                    jest.spyOn(classValidator, 'validate').mockResolvedValue([
                        {
                            property: 'name',
                            constraints: {
                                isNotEmpty: VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED,
                                Matches: VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE,
                                MaxLength: VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED
                            },
                        },
                    ]);
                    return [4 /*yield*/, roleController.create(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, EXPECTED_ERROR_MESSAGE);
                    return [2 /*return*/];
            }
        });
    }); });
    //add test for role name is not a string
    it('create will return BAD_REQUEST if the role name is not a string', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest();
                    res = mockResponse();
                    jest.spyOn(classValidator, 'validate').mockResolvedValue([
                        {
                            property: 'name',
                            constraints: {
                                Matches: VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE,
                            },
                        },
                    ]);
                    return [4 /*yield*/, roleController.create(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE);
                    return [2 /*return*/];
            }
        });
    }); });
    it('create will return BAD_REQUEST if the role name is longer than 30 chars', function () { return __awaiter(void 0, void 0, void 0, function () {
        var nameTooLong, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nameTooLong = 'a'.repeat(31);
                    req = mockRequest({}, { name: nameTooLong });
                    res = mockResponse();
                    jest.spyOn(classValidator, 'validate').mockResolvedValue([
                        {
                            property: 'name',
                            constraints: {
                                Matches: VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED,
                            },
                        },
                    ]);
                    return [4 /*yield*/, roleController.create(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED);
                    return [2 /*return*/];
            }
        });
    }); });
    it('create a new role with valid data', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({}, { name: validManagerDetails.name });
                    res = mockResponse();
                    mockRoleRepository.save.mockResolvedValue(validManagerDetails);
                    jest.spyOn(classValidator, 'validate').mockResolvedValue([]);
                    return [4 /*yield*/, roleController.create(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: validManagerDetails.name }));
                    expect(ResponseHandler_1.ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, validManagerDetails, http_status_codes_1.StatusCodes.CREATED);
                    return [2 /*return*/];
            }
        });
    }); });
    it('delete will return NO_ID_PROVIDED if no id is provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest();
                    res = mockResponse();
                    return [4 /*yield*/, roleController.delete(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.NOT_FOUND, RoleController_1.RoleController.ERROR_NO_ID_PROVIDED);
                    return [2 /*return*/];
            }
        });
    }); });
    it('delete will return NOT_FOUND if the role id does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res, deleteResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest({ id: INVALID_ROLE_ID_NUMBER });
                    res = mockResponse();
                    deleteResult = { affected: 0 };
                    mockRoleRepository.delete.mockResolvedValue(deleteResult);
                    return [4 /*yield*/, roleController.delete(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.delete).toHaveBeenCalledWith(INVALID_ROLE_ID_NUMBER);
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.NOT_FOUND, RoleController_1.RoleController.ERROR_ROLE_NOT_FOUND_FOR_DELETION);
                    return [2 /*return*/];
            }
        });
    }); });
    it('delete will return SUCCESS if the role is successfully deleted', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res, deleteResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({ id: validManagerDetails.id });
                    res = mockResponse();
                    deleteResult = { affected: 1 };
                    mockRoleRepository.delete.mockResolvedValue(deleteResult);
                    return [4 /*yield*/, roleController.delete(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.delete).toHaveBeenCalledWith(validManagerDetails.id);
                    expect(ResponseHandler_1.ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, "Role deleted");
                    return [2 /*return*/];
            }
        });
    }); });
    it('update returns a BAD_REQUEST if no id is provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({}, { name: validManagerDetails.name });
                    res = mockResponse();
                    return [4 /*yield*/, roleController.update(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, RoleController_1.RoleController.ERROR_NO_ID_PROVIDED);
                    return [2 /*return*/];
            }
        });
    }); });
    it('update returns a BAD_REQUEST if id provided does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({}, { id: validManagerDetails.id, name: validManagerDetails.name });
                    res = mockResponse();
                    //Mock findOneBy to return null (not found)
                    mockRoleRepository.findOneBy.mockResolvedValue(null);
                    return [4 /*yield*/, roleController.update(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: validManagerDetails.id });
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, RoleController_1.RoleController.ERROR_ROLE_NOT_FOUND);
                    return [2 /*return*/];
            }
        });
    }); });
    it('update will return a BAD_REQUEST if the name does not exist/blank', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res, EXPECTED_ERROR_MESSAGE;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({}, { id: validManagerDetails.id, name: BLANK_ROLE_NAME });
                    res = mockResponse();
                    //Mock findOneBy to return a valid role for id:1, ready to edit 
                    mockRoleRepository.findOneBy.mockResolvedValue(validManagerDetails);
                    EXPECTED_ERROR_MESSAGE = "".concat(VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED, ",").concat(VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE, ",").concat(VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED);
                    jest.spyOn(classValidator, 'validate').mockResolvedValue([
                        {
                            property: 'name',
                            constraints: {
                                isNotEmpty: VALIDATOR_CONSTRAINT_NAME_IS_REQUIRED,
                                Matches: VALIDATOR_CONSTRAINT_EMPTY_OR_WHITESPACE,
                                MaxLength: VALIDATOR_CONSTRAINT_MAX_LENGTH_EXCEEDED
                            },
                        },
                    ]);
                    return [4 /*yield*/, roleController.update(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: validManagerDetails.id });
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, EXPECTED_ERROR_MESSAGE);
                    return [2 /*return*/];
            }
        });
    }); });
    //Similar to above for tests to check decorator constraint Matches and MaxLength
    it('update will return a BAD_REQUEST if the role does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest({}, { id: INVALID_ROLE_ID_NUMBER, name: 'amended name' });
                    res = mockResponse();
                    //Mock findOneBy to return null (not found)
                    mockRoleRepository.findOneBy.mockResolvedValue(null);
                    return [4 /*yield*/, roleController.update(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: INVALID_ROLE_ID_NUMBER });
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, RoleController_1.RoleController.ERROR_ROLE_NOT_FOUND);
                    return [2 /*return*/];
            }
        });
    }); });
    it('update with valid details', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, roleDetailsToChange, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    roleDetailsToChange = new Role_1.Role();
                    roleDetailsToChange.id = validManagerDetails.id;
                    roleDetailsToChange.name = 'old role'; // Previous role name
                    // Mock the findOneBy to return an existing role
                    mockRoleRepository.findOneBy.mockResolvedValue(roleDetailsToChange);
                    req = mockRequest({}, validManagerDetails);
                    res = mockResponse();
                    //Do this otherwise role will be undefined after the save
                    mockRoleRepository.save.mockResolvedValue(validManagerDetails);
                    jest.spyOn(classValidator, 'validate').mockResolvedValue([]);
                    return [4 /*yield*/, roleController.update(req, res)];
                case 1:
                    _a.sent();
                    expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: validManagerDetails.id });
                    expect(mockRoleRepository.save).toHaveBeenCalledWith({ id: validManagerDetails.id, name: validManagerDetails.name });
                    expect(ResponseHandler_1.ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, validManagerDetails);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=RoleController.test.js.map