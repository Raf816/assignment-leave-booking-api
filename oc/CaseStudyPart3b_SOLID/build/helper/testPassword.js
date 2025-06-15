"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var PasswordHandler_1 = require("./PasswordHandler");
var TEST_PASSWORD = "password123";
//Generate hash and salt
var _a = PasswordHandler_1.PasswordHandler.hashPassword(TEST_PASSWORD), hashedPassword = _a.hashedPassword, salt = _a.salt;
console.log("Hashed Password:", hashedPassword);
console.log("Salt:", salt);
console.log("Correct Password Verified:", PasswordHandler_1.PasswordHandler.verifyPassword(TEST_PASSWORD, hashedPassword, salt));
console.log("Wrong Password Verified:", PasswordHandler_1.PasswordHandler.verifyPassword("Some other password", hashedPassword, salt));
//# sourceMappingURL=testPassword.js.map