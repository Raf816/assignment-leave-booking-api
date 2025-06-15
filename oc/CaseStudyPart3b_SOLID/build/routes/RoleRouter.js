"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRouter = void 0;
var RoleRouter = /** @class */ (function () {
    function RoleRouter(router, roleController) {
        this.router = router;
        this.roleController = roleController;
        this.routeName = "role";
        this.basePath = "/api/roles";
        this.authenticate = true;
        this.addRoutes();
    }
    RoleRouter.prototype.getRouter = function () {
        return this.router;
    };
    RoleRouter.prototype.addRoutes = function () {
        this.router.get('/', this.roleController.getAll);
        this.router.get('/:id', this.roleController.getById);
        this.router.delete('/:id', this.roleController.delete);
        this.router.post('/', this.roleController.create);
        this.router.patch('/', this.roleController.update);
    };
    return RoleRouter;
}());
exports.RoleRouter = RoleRouter;
//# sourceMappingURL=RoleRouter.js.map