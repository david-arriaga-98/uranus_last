"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vehicle_1 = require("../../Models/Vehicle");
const moment_1 = __importDefault(require("moment"));
function getCoords() {
    return __awaiter(this, void 0, void 0, function* () {
        //Buscamos todas las coordenadas que hay en el sistema
        const coords = yield Vehicle_1.Coord.find();
        //Ahora iteramos y buscamos las que tengan mas de 10 segundos
        coords.forEach((vehicle) => __awaiter(this, void 0, void 0, function* () {
            //Validamos que si tiene mas de 5 segundos lo eliminamos y cambiamos el estado
            var actualTime = moment_1.default()
                .add(-5, 'hours')
                .unix();
            var totalTime = actualTime - vehicle.createdAt;
            if (totalTime >= 10) {
                //Lo eliminamos en la base de datos
                yield Vehicle_1.Coord.findByIdAndDelete(vehicle._id);
                //Actualizamos el vehiculo
                yield Vehicle_1.Vehicle.findByIdAndUpdate(vehicle.vehicleID, {
                    state: false
                });
            }
        }));
        return coords;
    });
}
exports.getCoords = getCoords;
//# sourceMappingURL=VehicleSocketsController.js.map