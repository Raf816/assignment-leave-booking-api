"use strict";
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
var User_1 = require("./User");
var Role_1 = require("./Role");
var classTransformer = __importStar(require("class-transformer"));
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var typeorm_1 = require("typeorm");
var jest_mock_extended_1 = require("jest-mock-extended");
describe("User Entity tests", function () {
    var mockUserRepository; //required for @Column({ select:false }) and @Column({ unique: true }) 
    var user;
    var role;
    beforeEach(function () {
        //before each test reset the following:
        mockUserRepository = (0, jest_mock_extended_1.mock)();
        role = new Role_1.Role();
        role.id = 1;
        role.name = "admin";
        user = new User_1.User();
        user.id = 1;
        user.email = "test@email.com";
        user.password = 'a'.repeat(10);
        user.role = role;
    });
    it("A password must be a string", function () { return __awaiter(void 0, void 0, void 0, function () {
        var errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user.password = 1234; //password is not a string
                    return [4 /*yield*/, (0, class_validator_1.validate)(user)];
                case 1:
                    errors = _a.sent();
                    expect(errors.length).toBe(1);
                    expect(errors[0].constraints).toHaveProperty("isString");
                    return [2 /*return*/];
            }
        });
    }); });
    it("A password less than 10 characters is considered invalid", function () { return __awaiter(void 0, void 0, void 0, function () {
        var errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user.password = 'a'.repeat(9);
                    return [4 /*yield*/, (0, class_validator_1.validate)(user)];
                case 1:
                    errors = _a.sent();
                    expect(errors.length).toBeGreaterThan(0);
                    expect(errors[0].constraints).toHaveProperty("minLength");
                    return [2 /*return*/];
            }
        });
    }); });
    it("A poorly formed email is considered invalid", function () { return __awaiter(void 0, void 0, void 0, function () {
        var errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user.email = "not a valid email address";
                    return [4 /*yield*/, (0, class_validator_1.validate)(user)];
                case 1:
                    errors = _a.sent();
                    expect(errors.length).toBeGreaterThan(0);
                    expect(errors[0].constraints).toHaveProperty("isEmail");
                    return [2 /*return*/];
            }
        });
    }); });
    it("A user with no role is considered invalid", function () { return __awaiter(void 0, void 0, void 0, function () {
        var errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user.role = null;
                    return [4 /*yield*/, (0, class_validator_1.validate)(user)];
                case 1:
                    errors = _a.sent();
                    expect(errors.length).toBe(1);
                    expect(errors[0].constraints).toHaveProperty("isNotEmpty");
                    return [2 /*return*/];
            }
        });
    }); });
    it("A user with valid details will be accepted", function () { return __awaiter(void 0, void 0, void 0, function () {
        var errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, class_validator_1.validate)(user)];
                case 1:
                    errors = _a.sent();
                    expect(errors.length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it("A user with valid details will not return their password after submitting valid details", function () {
        jest.spyOn(classTransformer, "instanceToPlain").mockReturnValue({
            id: user.id,
            email: user.email,
            role: { id: user.role.id,
                name: user.role.name },
        });
        var plainUser = (0, class_transformer_1.instanceToPlain)(user);
        expect(plainUser).toHaveProperty("id", user.id);
        expect(plainUser).toHaveProperty("email", user.email);
        expect(plainUser).toHaveProperty("role", { id: role.id, name: role.name });
        //Password is excluded
        expect(plainUser).not.toHaveProperty("password");
    });
    it("Users will not include a password from a get request", function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, retrievedUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = new User_1.User();
                    //Mock TypeORM's behaviour of excluding the password from a response
                    mockUserRepository.findOne.mockResolvedValue({
                        id: user.id,
                        email: user.email,
                        role: { id: role.id, name: role.name },
                    });
                    return [4 /*yield*/, mockUserRepository.findOne({ where: { id: user.id } })];
                case 1:
                    retrievedUser = _a.sent();
                    expect(retrievedUser).toBeDefined();
                    expect(retrievedUser).toHaveProperty("id", user.id);
                    expect(retrievedUser).toHaveProperty("email", user.email);
                    expect(retrievedUser).toHaveProperty("role", { id: role.id, name: role.name });
                    //Password is excluded
                    expect(retrievedUser).not.toHaveProperty("password");
                    return [2 /*return*/];
            }
        });
    }); });
    it("A new user with a duplicate email address cannot be inserted/saved", function () { return __awaiter(void 0, void 0, void 0, function () {
        var userWithDuplicateEmailAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockUserRepository.save.mockImplementationOnce(function (user) { return Promise.resolve(user); });
                    //Mock the error for a duplicate
                    mockUserRepository.save.mockRejectedValue(new typeorm_1.QueryFailedError("INSERT INTO user", [], 
                    //#1062 - Duplicate entry 'email@email.com' for key 'email'
                    new Error("#1062 - Duplicate entry '".concat(user.email, "' for key 'email'"))));
                    //Save a user's details
                    return [4 /*yield*/, expect(mockUserRepository.save(user)).resolves.toEqual(user)];
                case 1:
                    //Save a user's details
                    _a.sent();
                    userWithDuplicateEmailAddress = new User_1.User();
                    userWithDuplicateEmailAddress.email = user.email; //Use an existing email address
                    userWithDuplicateEmailAddress.password = 'a'.repeat(10);
                    userWithDuplicateEmailAddress.role = role;
                    return [4 /*yield*/, expect(mockUserRepository.save(userWithDuplicateEmailAddress)).rejects.toThrow(typeorm_1.QueryFailedError)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=User.test.js.map