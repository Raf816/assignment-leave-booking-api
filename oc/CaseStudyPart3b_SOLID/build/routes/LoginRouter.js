"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRouter = void 0;
var LoginRouter = /** @class */ (function () {
    function LoginRouter(router, loginController) {
        this.router = router;
        this.loginController = loginController;
        this.routeName = "login";
        this.basePath = "/api/login";
        this.authenticate = false;
        this.addRoutes();
    }
    LoginRouter.prototype.getRouter = function () {
        return this.router;
    };
    LoginRouter.prototype.addRoutes = function () {
        this.router.post('/', this.loginController.login);
    };
    return LoginRouter;
}());
exports.LoginRouter = LoginRouter;
//# sourceMappingURL=LoginRouter.js.map