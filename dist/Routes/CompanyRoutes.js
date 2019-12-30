"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const CompanyController_1 = require("../Controllers/Company/CompanyController");
const AdminMD_1 = require("../Middlewares/AdminMD");
router.post('/company/create', AdminMD_1.AdminMD, CompanyController_1.createCompany);
//Admin
router.post('/company/activate', AdminMD_1.AdminMD, CompanyController_1.activeCompany);
exports.default = router;
//# sourceMappingURL=CompanyRoutes.js.map