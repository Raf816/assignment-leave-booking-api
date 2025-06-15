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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var express_1 = __importDefault(require("express"));
var http_status_codes_1 = require("http-status-codes");
var morgan_1 = __importDefault(require("morgan"));
var Logger_1 = require("./helper/Logger");
var ResponseHandler_1 = require("./helper/ResponseHandler");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var Server = /** @class */ (function () {
    function Server(port, routers, appDataSource) {
        this.port = port;
        this.routers = routers;
        this.appDataSource = appDataSource;
        //IP limiter - used for /login
        this.loginLimiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, //15 minutes
            max: 100, //Maximum requests per window
            message: "Too many requests - try again later",
            standardHeaders: true,
            legacyHeaders: false,
        });
        // JWT Rate Limiter based on user email claim
        this.jwtRateLimiter = function (userEmail) { return (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, //15 minutes
            max: 20, //Maximum requests per window
            message: "Too many requests - try again later",
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: function (req) { return userEmail; }, //email from JWT as the key
        }); };
        this.app = (0, express_1.default)();
        this.initialiseMiddlewares();
        this.initialiseRoutes();
        this.initialiseErrorHandling();
    }
    Server.prototype.initialiseMiddlewares = function () {
        var morganStream = {
            write: function (message) {
                Logger_1.Logger.info(message.trim());
            }
        };
        this.app.use(express_1.default.json());
        this.app.use((0, morgan_1.default)("combined", { stream: morganStream }));
    };
    Server.prototype.initialiseRoutes = function () {
        var _a;
        for (var _i = 0, _b = this.routers; _i < _b.length; _i++) {
            var route = _b[_i];
            var middlewares = [];
            if (route.authenticate) {
                middlewares.push(this.authenticateToken);
            }
            //Assuming all end points are rate limited
            if (route.basePath === "/api/login") {
                middlewares.push(this.loginLimiter);
            }
            else {
                middlewares.push(this.jwtRateLimitMiddleware(route.routeName));
            }
            middlewares.push(this.logRouteAccess(route.routeName));
            (_a = this.app).use.apply(_a, __spreadArray(__spreadArray([route.basePath], middlewares, false), [route.getRouter()], false));
        }
    };
    Server.prototype.initialiseErrorHandling = function () {
        this.app.use("/", function (err, req, res) {
            var requestedUrl = "".concat(req.protocol, "://").concat(req.get("host")).concat(req.originalUrl);
            Logger_1.Logger.error("Error occurred: ".concat(err.message, " at ").concat(req.originalUrl));
            ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Route " + requestedUrl + " not found");
        });
    };
    Server.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialiseDataSource()];
                    case 1:
                        _a.sent();
                        this.app.listen(this.port, function () {
                            Logger_1.Logger.info("Server running on http://localhost:".concat(_this.port));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.initialiseDataSource = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.appDataSource.initialize()];
                    case 1:
                        _a.sent();
                        Logger_1.Logger.info("Data Source initialised");
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        Logger_1.Logger.error("Error during initialisation:", error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.authenticateToken = function (req, res, next) {
        var authHeader = req.headers.authorization;
        if (authHeader) {
            var tokenReceived = authHeader.split(' ')[1];
            if (!process.env.JWT_SECRET) {
                Logger_1.Logger.error(Server.ERROR_TOKEN_SECRET_NOT_DEFINED);
                throw new Error(Server.ERROR_TOKEN_SECRET_NOT_DEFINED);
            }
            jsonwebtoken_1.default.verify(tokenReceived, process.env.JWT_SECRET, function (err, payload) {
                if (err) {
                    Logger_1.Logger.error(Server.ERROR_TOKEN_IS_INVALID);
                    return ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, Server.ERROR_TOKEN_IS_INVALID);
                }
                //console.log(payload);
                var _a = payload.token, email = _a.email, role = _a.role;
                if (!email || !role) {
                    Logger_1.Logger.error(Server.ERROR_TOKEN_IS_INVALID);
                    return ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, Server.ERROR_TOKEN_IS_INVALID);
                }
                req.signedInUser = { email: email, role: role };
                next();
            });
        }
        else {
            Logger_1.Logger.error(Server.ERROR_TOKEN_NOT_FOUND);
            ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, Server.ERROR_TOKEN_NOT_FOUND);
        }
    };
    Server.prototype.logRouteAccess = function (route) {
        return function (req, res, next) {
            Logger_1.Logger.info("".concat(route, " accessed by ").concat(req.ip));
            next();
        };
    };
    Server.prototype.jwtRateLimitMiddleware = function (route) {
        var _this = this;
        return function (req, res, next) {
            var _a;
            var email = (_a = req.signedInUser) === null || _a === void 0 ? void 0 : _a.email; //email will be used as unique identifier in rate limiter (could use id if stored)
            if (email) {
                Logger_1.Logger.info("".concat(route, " accessed by ").concat(req.ip));
                _this.jwtRateLimiter(email)(req, res, next);
            }
            else {
                var ERROR_MESSAGE = "Missing essential information in JWT";
                Logger_1.Logger.error(ERROR_MESSAGE);
                ResponseHandler_1.ResponseHandler.sendErrorResponse(res, http_status_codes_1.StatusCodes.BAD_REQUEST, ERROR_MESSAGE);
            }
        };
    };
    Server.ERROR_TOKEN_IS_INVALID = "Not authorised - Token is invalid";
    Server.ERROR_TOKEN_NOT_FOUND = "Not authorised - Token not found";
    Server.ERROR_TOKEN_SECRET_NOT_DEFINED = "Token secret not found/defined";
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=Server.js.map