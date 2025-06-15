"use strict";
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
exports.UserController = void 0;
var data_source_1 = require("../data-source");
var User_1 = require("../entity/User");
var ResponseHandler_1 = require("../helper/ResponseHandler");
var class_transformer_1 = require("class-transformer");
var http_status_codes_1 = require("http-status-codes");
var class_validator_1 = require("class-validator");
var UserController = /** @class */ (function () {
    function UserController() {
        var _this = this;
        // Get all users
        this.getAll = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var users, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.userRepository.find({
                                relations: ["role"],
                            })];
                    case 1:
                        users = _a.sent();
                        if (users.length === 0) {
                            ResponseHandler_1.ResponseHandler.sendSuccessResponse(res, [], http_status_codes_1.StatusCodes.NO_CONTENT);
                        }
                        ResponseHandler_1.ResponseHandler.sendSuccessResponse(res, users);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "".concat(UserController.ERROR_FAILED_TO_RETRIEVE_USERS, ": ").concat(error_1.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Get user by email
        this.getByEmail = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var email, user, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = req.params.emailAddress;
                        if (!email || email.trim().length === 0) {
                            ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, UserController.ERROR_EMAIL_REQUIRED);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.userRepository.find({ where: { email: email },
                                relations: ["role"] })];
                    case 2:
                        user = _a.sent();
                        if (user.length === 0) {
                            ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "".concat(email, " not found"));
                            return [2 /*return*/];
                        }
                        ResponseHandler_1.ResponseHandler.sendSuccessResponse(res, user);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, UserController.ERROR_UNABLE_TO_FIND_USER_EMAIL(email));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // Get user by ID
        this.getById = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, user, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = parseInt(req.params.id);
                        if (isNaN(id)) {
                            ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, UserController.ERROR_INVALID_USER_ID_FORMAT);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.userRepository.findOne({ where: { id: id },
                                relations: ["role"] })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.NO_CONTENT, UserController.ERROR_USER_NOT_FOUND_WITH_ID(id));
                            return [2 /*return*/];
                        }
                        ResponseHandler_1.ResponseHandler.sendSuccessResponse(res, user);
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, UserController.ERROR_RETRIEVING_USER(error_3.message));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // Add a new user
        this.create = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var user, errors, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        user = new User_1.User();
                        user.password = req.body.password;
                        user.email = req.body.email;
                        user.role = req.body.roleId;
                        return [4 /*yield*/, (0, class_validator_1.validate)(user)];
                    case 1:
                        errors = _a.sent();
                        if (errors.length > 0) { //Collate a string of all decorator error messages
                            throw new Error(errors.map(function (err) { return Object.values(err.constraints || {}); }).join(", "));
                        }
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 2:
                        user = _a.sent(); // Save and return the created object
                        ResponseHandler_1.ResponseHandler.sendSuccessResponse(res, (0, class_transformer_1.instanceToPlain)(user), http_status_codes_1.StatusCodes.CREATED);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, error_4.message);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // Delete a user
        this.delete = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (!id) {
                            throw new Error("No ID provided");
                        }
                        return [4 /*yield*/, this.userRepository.delete(id)];
                    case 2:
                        result = _a.sent();
                        if (result.affected === 0) {
                            throw new Error("User with the provided ID not found");
                        }
                        ResponseHandler_1.ResponseHandler.sendSuccessResponse(res, "User deleted", http_status_codes_1.StatusCodes.OK);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.NOT_FOUND, error_5.message);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // Update details (not password or id)
        this.update = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, user, errors, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.body.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        if (!id) {
                            throw new Error(UserController.ERROR_NO_USER_ID_PROVIDED);
                        }
                        return [4 /*yield*/, this.userRepository.findOneBy({ id: id })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            throw new Error(UserController.ERROR_USER_NOT_FOUND);
                        }
                        // Update specific fields
                        user.email = req.body.email;
                        user.role = req.body.roleId;
                        return [4 /*yield*/, (0, class_validator_1.validate)(user)];
                    case 3:
                        errors = _a.sent();
                        if (errors.length > 0) { //Collate a string of all decorator error messages
                            throw new Error(errors.map(function (err) { return Object.values(err.constraints || {}); }).join(", "));
                        }
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 4:
                        user = _a.sent();
                        ResponseHandler_1.ResponseHandler.sendSuccessResponse(res, user, http_status_codes_1.StatusCodes.OK);
                        return [3 /*break*/, 6];
                    case 5:
                        error_6 = _a.sent();
                        ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, error_6.message);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    UserController.ERROR_NO_USER_ID_PROVIDED = "No ID provided";
    UserController.ERROR_INVALID_USER_ID_FORMAT = "Invalid ID format";
    UserController.ERROR_USER_NOT_FOUND = "User not found";
    UserController.ERROR_USER_NOT_FOUND_WITH_ID = function (id) { return "User not found with ID: ".concat(id); };
    UserController.ERROR_PASSWORD_IS_BLANK = "Password is blank";
    UserController.ERROR_FAILED_TO_RETRIEVE_USERS = "Failed to retrieve users";
    UserController.ERROR_FAILED_TO_RETRIEVE_USER = "Failed to retrieve user";
    UserController.ERROR_USER_NOT_FOUND_FOR_DELETION = "User with the provided ID not found";
    UserController.ERROR_EMAIL_REQUIRED = "Email is required";
    UserController.ERROR_EMAIL_NOT_FOUND = function (email) { return "".concat(email, " not found"); };
    UserController.ERROR_RETRIEVING_USER = function (error) { return "Error retrieving user: ".concat(error); };
    UserController.ERROR_UNABLE_TO_FIND_USER_EMAIL = function (email) { return "Unable to find user with the email: ".concat(email); };
    UserController.ERROR_VALIDATION_FAILED = "Validation failed";
    return UserController;
}());
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map