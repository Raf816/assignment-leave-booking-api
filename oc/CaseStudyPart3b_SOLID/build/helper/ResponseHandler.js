"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
var Logger_1 = require("./Logger");
var http_status_codes_1 = require("http-status-codes");
var ResponseHandler = /** @class */ (function () {
    function ResponseHandler() {
    }
    ResponseHandler.sendErrorResponse = function (res, statusCode, message //fallback value
    // Metadata can be added as optional
    ) {
        if (message === void 0) { message = "Unexpected error"; }
        var timestamp = new Date().toISOString();
        Logger_1.Logger.error("[Error]: ".concat(message), "".concat(timestamp));
        var errorResponse = {
            error: {
                message: message,
                status: statusCode,
                timestamp: timestamp,
                // Include metadata in the response
            }
        };
        return res.status(statusCode).send(errorResponse);
    };
    ResponseHandler.sendSuccessResponse = function (res, data, statusCode //fallback value
    // Metadata can be added as optional
    ) {
        if (data === void 0) { data = {}; }
        if (statusCode === void 0) { statusCode = http_status_codes_1.StatusCodes.OK; }
        var successResponse = {
            data: data,
            // Include metadata here if needed
        };
        return res.status(statusCode).send(successResponse);
    };
    return ResponseHandler;
}());
exports.ResponseHandler = ResponseHandler;
//# sourceMappingURL=ResponseHandler.js.map