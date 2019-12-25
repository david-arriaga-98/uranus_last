"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
//----Middlewares---//
const AdminMD_1 = require("../Middlewares/AdminMD");
//----Usuarios---//
const UserController_1 = require("../Controllers/UserController");
router.post('/user/register', AdminMD_1.AdminMD, UserController_1.registerUser);
router.post('/user/login/:code?', UserController_1.loginUser);
router.post('/user/recovery', UserController_1.recoveryPass);
router.get('/user/verify/:token', UserController_1.activateAccount);
exports.default = router;
//# sourceMappingURL=UserRouter.js.map