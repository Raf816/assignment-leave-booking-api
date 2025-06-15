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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supertest_1 = __importDefault(require("supertest"));
var express_1 = __importStar(require("express"));
var RoleRouter_1 = require("./RoleRouter");
var http_status_codes_1 = require("http-status-codes");
//https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#successful_responses
var mockRoleController = {
    delete: jest.fn(function (req, res) { return res.status(http_status_codes_1.StatusCodes.OK).json({ id: req.params.id }); }),
    getAll: jest.fn(function (req, res) { return res.status(http_status_codes_1.StatusCodes.OK).json([]); }),
    getById: jest.fn(function (req, res) { return res.status(http_status_codes_1.StatusCodes.OK).json({ id: req.params.id }); }),
    create: jest.fn(function (req, res) { return res.status(http_status_codes_1.StatusCodes.CREATED).json(req.body); }),
    update: jest.fn(function (req, res) { return res.status(http_status_codes_1.StatusCodes.OK).json(req.body); })
};
//spy on real router (rather than mock it)
var router = (0, express_1.Router)();
jest.spyOn(router, 'get');
jest.spyOn(router, 'post');
jest.spyOn(router, 'patch'); //No put in router/controller
jest.spyOn(router, 'delete');
jest.spyOn(router, 'use');
var app = (0, express_1.default)();
app.use(express_1.default.json());
var roleRouter = new RoleRouter_1.RoleRouter(router, mockRoleController);
app.use('/roles', roleRouter.getRouter());
var BASE_ROLES_URL = '/roles';
describe('RoleRouter', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('getAll on GET /roles can be called', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app).get(BASE_ROLES_URL)];
                case 1:
                    response = _a.sent();
                    expect(mockRoleController.getAll).toHaveBeenCalled();
                    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
                    expect(response.body).toEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('getById route GET /roles/:id can be called', function () { return __awaiter(void 0, void 0, void 0, function () {
        var id, endPoint, response, requestedUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = "1";
                    endPoint = "".concat(BASE_ROLES_URL, "/").concat(id);
                    return [4 /*yield*/, (0, supertest_1.default)(app).get(endPoint)];
                case 1:
                    response = _a.sent();
                    requestedUrl = mockRoleController.getById.mock.calls[0][0].originalUrl;
                    expect(requestedUrl).toBeDefined();
                    expect(requestedUrl).toBe(endPoint);
                    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
                    expect(response.body).toEqual({ id: id });
                    return [2 /*return*/];
            }
        });
    }); });
    it('create route POST /roles can be called', function () { return __awaiter(void 0, void 0, void 0, function () {
        var newRoleData, response, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newRoleData = { name: 'manager' };
                    return [4 /*yield*/, (0, supertest_1.default)(app).post(BASE_ROLES_URL).send(newRoleData)];
                case 1:
                    response = _a.sent();
                    body = mockRoleController.create.mock.calls[0][0].body;
                    expect(body).toBeDefined();
                    expect(mockRoleController.create).toHaveBeenCalled();
                    expect(body).toStrictEqual(newRoleData);
                    expect(response.status).toBe(http_status_codes_1.StatusCodes.CREATED);
                    return [2 /*return*/];
            }
        });
    }); });
    it('update route PATCH /roles can be called', function () { return __awaiter(void 0, void 0, void 0, function () {
        var updateRoleData, response, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updateRoleData = { id: 1, name: 'Updated Role' };
                    return [4 /*yield*/, (0, supertest_1.default)(app).patch(BASE_ROLES_URL).send(updateRoleData)];
                case 1:
                    response = _a.sent();
                    body = mockRoleController.update.mock.calls[0][0].body;
                    expect(body).toBeDefined();
                    expect(body).toStrictEqual(updateRoleData);
                    expect(mockRoleController.update).toHaveBeenCalled();
                    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
                    return [2 /*return*/];
            }
        });
    }); });
    it('delete route DELETE /roles/:id can be called', function () { return __awaiter(void 0, void 0, void 0, function () {
        var id, endPoint, response, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = "1";
                    endPoint = "".concat(BASE_ROLES_URL, "/").concat(id);
                    return [4 /*yield*/, (0, supertest_1.default)(app).delete(endPoint)];
                case 1:
                    response = _a.sent();
                    url = mockRoleController.delete.mock.calls[0][0].originalUrl;
                    expect(url).toBeDefined();
                    expect(mockRoleController.delete).toHaveBeenCalled();
                    expect(url).toBe(endPoint);
                    expect(response.status).toBe(http_status_codes_1.StatusCodes.OK);
                    expect(response.body).toEqual({ id: id });
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=RoleRouter.test.js.map