"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
var UserRouter = /** @class */ (function () {
    function UserRouter(router, userController) {
        this.router = router;
        this.userController = userController;
        this.routeName = "users";
        this.basePath = "/api/users";
        this.authenticate = true;
        this.addRoutes();
    }
    UserRouter.prototype.getRouter = function () {
        return this.router;
    };
    UserRouter.prototype.addRoutes = function () {
        this.router.delete('/:id', this.userController.delete);
        this.router.get('/', this.userController.getAll);
        this.router.get('/email/:emailAddress', this.userController.getByEmail);
        this.router.get('/:id', this.userController.getById);
        this.router.post('/', this.userController.create);
        this.router.patch('/', this.userController.update);
    };
    return UserRouter;
}());
exports.UserRouter = UserRouter;
//# sourceMappingURL=UserRouter.js.map