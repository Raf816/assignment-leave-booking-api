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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
var data_source_1 = require("../data-source");
var User_1 = require("../entity/User");
var ResponseHandler_1 = require("../helper/ResponseHandler");
var http_status_codes_1 = require("http-status-codes");
var PasswordHandler_1 = require("../helper/PasswordHandler");
var UserDTOToken_1 = require("./UserDTOToken");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var LoginController = /** @class */ (function () {
    function LoginController() {
        var _this = this;
        this.login = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var email, password, user, token, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        email = req.body.email;
                        if (!email || email.trim().length === 0) {
                            throw new Error(LoginController.ERROR_NO_EMAIL_PROVIDED);
                        }
                        password = req.body.password;
                        if (!password || password.trim().length === 0) {
                            throw new Error(LoginController.ERROR_NO_PASSWORD_PROVIDED);
                        }
                        return [4 /*yield*/, this.userRepository.createQueryBuilder("user")
                                .addSelect(["user.password",
                                "user.salt"]) //add hidden fields
                                .leftJoinAndSelect("user.role", "role") //Join role 
                                .where("user.email = :email", { email: email })
                                .getOne()];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new Error(LoginController.ERROR_USER_NOT_FOUND);
                        }
                        if (!PasswordHandler_1.PasswordHandler.verifyPassword(password, user.password, user.salt)) {
                            throw new Error(LoginController.ERROR_PASSWORD_INCORRECT);
                        }
                        token = new UserDTOToken_1.UserDTOToken(user.email, user.role);
                        res.status(http_status_codes_1.StatusCodes.ACCEPTED).send(jsonwebtoken_1.default.sign({ token: token }, process.env.JWT_SECRET, { expiresIn: '3h' }));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, error_1.message);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    LoginController.ERROR_NO_EMAIL_PROVIDED = "No email provided";
    LoginController.ERROR_NO_PASSWORD_PROVIDED = "No password provided";
    LoginController.ERROR_USER_NOT_FOUND = "User not found";
    LoginController.ERROR_PASSWORD_INCORRECT = "Password incorrect";
    return LoginController;
}());
exports.LoginController = LoginController;
//# sourceMappingURL=LoginController.js.map