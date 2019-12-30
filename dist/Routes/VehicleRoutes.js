"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const AdminMD_1 = require("../Middlewares/AdminMD");
const VehicleController_1 = require("../Controllers/Vehicle/VehicleController");
router.post('/vehicle/create', AdminMD_1.AdminMD, VehicleController_1.createVehicle);
//Coordenadas a enviar
router.get('/vehicle/coords/:key/:idVehicle/:lat/:lng', VehicleController_1.sendCoordsToTheServer);
exports.default = router;
//# sourceMappingURL=VehicleRoutes.js.map