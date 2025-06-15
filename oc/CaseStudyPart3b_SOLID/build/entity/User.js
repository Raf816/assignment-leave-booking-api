"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var Role_1 = require("./Role");
var class_transformer_1 = require("class-transformer");
var PasswordHandler_1 = require("../helper/PasswordHandler");
var User = /** @class */ (function () {
    function User() {
    }
    User.prototype.hashPassword = function () {
        if (!this.password) {
            throw new Error("Password must be provided before inserting a user.");
        }
        var _a = PasswordHandler_1.PasswordHandler.hashPassword(this.password), hashedPassword = _a.hashedPassword, salt = _a.salt;
        this.password = hashedPassword;
        this.salt = salt;
    };
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)(),
        __metadata("design:type", Number)
    ], User.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ select: false }) //obscure from get queries
        ,
        (0, class_transformer_1.Exclude)() //after post queries - need instanceToPlain when responding
        ,
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(10, { message: 'Password must be at least 10 characters long' }),
        __metadata("design:type", String)
    ], User.prototype, "password", void 0);
    __decorate([
        (0, typeorm_1.Column)({ select: false }) //obscure from get queries
        ,
        (0, class_transformer_1.Exclude)() //after post queries - need instanceToPlain when responding
        ,
        __metadata("design:type", String)
    ], User.prototype, "salt", void 0);
    __decorate([
        (0, typeorm_1.Column)({ unique: true }),
        (0, class_validator_1.IsEmail)({}, { message: 'Must be a valid email address' }),
        __metadata("design:type", String)
    ], User.prototype, "email", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return Role_1.Role; }, { nullable: false, eager: true }),
        (0, class_validator_1.IsNotEmpty)({ message: 'Role is required' }),
        __metadata("design:type", Role_1.Role)
    ], User.prototype, "role", void 0);
    __decorate([
        (0, typeorm_1.BeforeInsert)(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], User.prototype, "hashPassword", null);
    User = __decorate([
        (0, typeorm_1.Entity)({ name: "user" })
    ], User);
    return User;
}());
exports.User = User;
//# sourceMappingURL=User.js.map