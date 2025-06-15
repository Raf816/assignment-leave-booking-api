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
var UserController_1 = require("../controllers/UserController");
var User_1 = require("../entity/User");
var Role_1 = require("../entity/Role");
var http_status_codes_1 = require("http-status-codes");
var ResponseHandler_1 = require("../helper/ResponseHandler");
var classValidator = __importStar(require("class-validator"));
var classTransformer = __importStar(require("class-transformer"));
var jest_mock_extended_1 = require("jest-mock-extended");
var VALIDATOR_CONSTRAINT_PASSWORD_AT_LEAST_10_CHARS = 'Password must be at least 10 characters long';
jest.mock('../helper/ResponseHandler');
jest.mock('class-validator', function () { return (__assign(__assign({}, jest.requireActual('class-validator')), { validate: jest.fn() })); });
jest.mock("class-transformer", function () { return (__assign(__assign({}, jest.requireActual("class-transformer")), { instanceToPlain: jest.fn() })); });
describe('UserController', function () {
    function getValidManagerData() {
        var role = new Role_1.Role();
        role.id = 1;
        role.name = 'manager';
        var user = new User_1.User();
        user.id = 1;
        user.password = 'a'.repeat(10);
        user.email = 'manager@email.com';
        user.role = role;
        return user;
    }
    function getValidStaffData() {
        var role = new Role_1.Role();
        role.id = 2;
        role.name = 'staff';
        var user = new User_1.User();
        user.id = 1;
        user.password = 'b'.repeat(10);
        user.email = 'staff@email.com';
        user.role = role;
        return user;
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
    var userController;
    var mockUserRepository;
    beforeEach(function () {
        mockUserRepository = (0, jest_mock_extended_1.mock)();
        // Inject the mocked repository into UserController
        userController = new UserController_1.UserController();
        userController['userRepository'] = mockUserRepository;
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    //getAll test for NO_CONTENT - same as RoleController test version
    //getAll test INTERNAL_SERVER_ERROR - same as RoleController test version
    it('getAll will return all users', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockUsers, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockUsers = [getValidManagerData(), getValidStaffData()];
                    req = mockRequest();
                    res = mockResponse();
                    mockUserRepository.find.mockResolvedValue(mockUsers);
                    return [4 /*yield*/, userController.getAll(req, res)];
                case 1:
                    _a.sent();
                    expect(mockUserRepository.find).toHaveBeenCalledWith({ relations: ['role'] });
                    expect(ResponseHandler_1.ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, mockUsers);
                    return [2 /*return*/];
            }
        });
    }); });
    it('create will return BAD_REQUEST if no user password was provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res, EXPECTED_ERROR_MESSAGE;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({}, { email: validManagerDetails.email,
                        roleId: validManagerDetails.role.id });
                    res = mockResponse();
                    EXPECTED_ERROR_MESSAGE = VALIDATOR_CONSTRAINT_PASSWORD_AT_LEAST_10_CHARS;
                    jest.spyOn(classValidator, 'validate').mockResolvedValue([
                        {
                            property: 'password',
                            constraints: {
                                //IsString: VALIDATOR_CONSTRAINT_PASSWORD_MUST_BE_A_STRING, 
                                MinLength: VALIDATOR_CONSTRAINT_PASSWORD_AT_LEAST_10_CHARS,
                            },
                        },
                    ]);
                    return [4 /*yield*/, userController.create(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, EXPECTED_ERROR_MESSAGE);
                    return [2 /*return*/];
            }
        });
    }); });
    //Follow same approach as above for email
    //Follow same approach for missing role i
    it('Create will return a valid user and return CREATED status when supplied with valid details', function () { return __awaiter(void 0, void 0, void 0, function () {
        var validManagerDetails, req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validManagerDetails = getValidManagerData();
                    req = mockRequest({}, { password: validManagerDetails.password,
                        email: validManagerDetails.email,
                        roleId: validManagerDetails.role.id });
                    res = mockResponse();
                    mockUserRepository.save.mockResolvedValue(validManagerDetails);
                    jest.spyOn(classTransformer, "instanceToPlain").mockReturnValue({
                        id: validManagerDetails.id,
                        email: validManagerDetails.email,
                        role: { id: validManagerDetails.role.id,
                            name: validManagerDetails.role.name },
                    });
                    jest.spyOn(classValidator, 'validate').mockResolvedValue([]);
                    return [4 /*yield*/, userController.create(req, res)];
                case 1:
                    _a.sent();
                    expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({ password: validManagerDetails.password,
                        email: validManagerDetails.email,
                        role: validManagerDetails.role.id })); //role not roleId
                    expect(ResponseHandler_1.ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, 
                    //will now have an id
                    //instanceToPlain should remove password (even if we didn't use a spy)
                    { id: validManagerDetails.id,
                        email: validManagerDetails.email,
                        role: validManagerDetails.role }, http_status_codes_1.StatusCodes.CREATED);
                    return [2 /*return*/];
            }
        });
    }); });
    //add delete tests
    it('update returns a BAD_REQUEST if no id is provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var req, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = mockRequest();
                    res = mockResponse();
                    return [4 /*yield*/, userController.update(req, res)];
                case 1:
                    _a.sent();
                    expect(ResponseHandler_1.ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, http_status_codes_1.StatusCodes.BAD_REQUEST, UserController_1.UserController.ERROR_NO_USER_ID_PROVIDED);
                    return [2 /*return*/];
            }
        });
    }); });
    //add additional update tests
});
//# sourceMappingURL=UserController.test.js.map