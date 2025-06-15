"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHandler = void 0;
var crypto_1 = require("crypto");
var PasswordHandler = /** @class */ (function () {
    function PasswordHandler() {
    }
    PasswordHandler.hashPassword = function (password) {
        var salt = (0, crypto_1.randomBytes)(this.SALT_LENGTH_IN_BYTES).toString("hex");
        var hashedPassword = (0, crypto_1.scryptSync)(this.PEPPER + password, salt, this.KEY_LENGTH_IN_BYTES)
            .toString("hex");
        return { hashedPassword: hashedPassword, salt: salt };
    };
    PasswordHandler.verifyPassword = function (password, hashedPassword, salt) {
        var hashToCompare = (0, crypto_1.scryptSync)(this.PEPPER + password, salt, this.KEY_LENGTH_IN_BYTES)
            .toString("hex");
        return (0, crypto_1.timingSafeEqual)(Buffer.from(hashedPassword, "hex"), Buffer.from(hashToCompare, "hex"));
    };
    PasswordHandler.SALT_LENGTH_IN_BYTES = 16;
    PasswordHandler.KEY_LENGTH_IN_BYTES = 64;
    PasswordHandler.PEPPER = process.env.PASSWORD_PEPPER;
    return PasswordHandler;
}());
exports.PasswordHandler = PasswordHandler;
//# sourceMappingURL=PasswordHandler.js.map