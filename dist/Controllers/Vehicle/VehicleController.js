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
const Company_1 = require("../../Models/Company");
const validator_1 = __importDefault(require("validator"));
const moment = require("moment");
exports.createVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos los datos por post
    var { plaque, capacity, description } = req.body;
    const admin = req.body.user;
    //Validamos los datos
    try {
        var valplaque = !validator_1.default.isEmpty(plaque);
        var valCapacity = !validator_1.default.isEmpty(capacity) && validator_1.default.isInt(capacity);
        if (valplaque && valCapacity) {
            //Validamos que no haya la placa repetida
            const vehicle = yield Vehicle_1.Vehicle.findOne({ plaque });
            if (vehicle) {
                res.status(422).json({
                    status: 'error',
                    message: 'Ya existe un vehículo con esta misma placa'
                });
            }
            else {
                //Validamos que el master admin no sea quien cree los vehiculos
                if (admin.role != 'ROLE_ADMIN') {
                    res.status(422).json({
                        status: 'error',
                        message: 'Tu rango no te permite realizar esta operación'
                    });
                }
                else {
                    //Validamos que si tenga una compañia
                    if (admin.company === null) {
                        res.status(422).json({
                            status: 'error',
                            message: 'Debes crear una compañía para poder agregar vehículos'
                        });
                    }
                    else {
                        //Validamos la compañia
                        if (admin.companyState === true) {
                            //Creamos el objeto
                            const newVehicle = new Vehicle_1.Vehicle({
                                capacity,
                                company: admin.company,
                                plaque,
                                description,
                                createdAt: moment()
                            });
                            //Guardamos el vehiculo en la base de datos y actualizamos
                            yield newVehicle.save();
                            res.status(200).json({
                                status: 'success',
                                message: 'Has agregado un vehículo satisfactriamente'
                            });
                            yield Company_1.Company.findByIdAndUpdate(admin.company, {
                                $push: { vehicles: newVehicle._id }
                            });
                        }
                        else {
                            res.status(400).json({
                                status: 'error',
                                message: 'No puedes crear un vehículo, no tienes una compañía o esta está desactivada'
                            });
                        }
                    }
                }
            }
        }
        else {
            res.status(400).json({
                status: 'error',
                message: 'Error al validar los datos, ingreselos nuevamente'
            });
        }
    }
    catch (error) {
        res.status(400).json({
            status: 'error',
            message: 'Error, Faltan datos por enviar'
        });
    }
});
exports.sendCoordsToTheServer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos los datos
    var key = req.params.key;
    var idVehicle = req.params.idVehicle;
    var lat = req.params.lat;
    var lng = req.params.lng;
    const keyApp = process.env.APPLICATION_CODE;
    //Validamos los datos
    try {
        var valKey = !validator_1.default.isEmpty(key) &&
            validator_1.default.isLength(key, { min: 40, max: 40 }) &&
            validator_1.default.isHexadecimal(key) &&
            key === keyApp;
        var valVehicle = !validator_1.default.isEmpty(idVehicle) && validator_1.default.isMongoId(idVehicle);
        var valLat = !validator_1.default.isEmpty(lat) && validator_1.default.isDecimal(lat);
        var valLng = !validator_1.default.isEmpty(lng) && validator_1.default.isDecimal(lng);
        if (valKey && valVehicle && valLat && valLng) {
            //Validamos que el vehiculo exista
            const vehicle = yield Vehicle_1.Vehicle.findById(idVehicle);
            if (vehicle) {
                //Buscamos si existe en la base de datos
                const coords = yield Vehicle_1.Coord.findOne({ vehicleID: idVehicle });
                if (coords) {
                    const update = yield Vehicle_1.Coord.findByIdAndUpdate(coords._id, {
                        position: {
                            lat: parseFloat(lat),
                            lng: parseFloat(lng)
                        },
                        createdAt: moment()
                            .add(-5, 'hours')
                            .unix()
                    }, { new: true });
                    res.status(200).json({
                        status: 'success',
                        message: 'Datos recibidos correctamente',
                        update
                    });
                }
                else {
                    const create = new Vehicle_1.Coord({
                        vehicleID: idVehicle,
                        position: {
                            lat: parseFloat(lat),
                            lng: parseFloat(lng)
                        },
                        createdAt: moment()
                            .add(-5, 'hours')
                            .unix()
                    });
                    create.save();
                    res.status(200).json({
                        status: 'success',
                        message: 'Datos recibidos correctamente',
                        create
                    });
                    //Actualizamos el vehculo y le cambiamos el estado
                    yield Vehicle_1.Vehicle.findByIdAndUpdate(vehicle._id, {
                        state: true
                    });
                }
            }
            else {
                res.status(404).json({
                    status: 'error',
                    message: 'Error, el vehículo no existe'
                });
            }
        }
        else {
            res.status(422).json({
                status: 'error',
                message: 'Error al validar tus datos'
            });
        }
    }
    catch (error) {
        res.status(422).json({
            status: 'error',
            message: 'Error, faltan datos por enviar'
        });
    }
});
//# sourceMappingURL=VehicleController.js.map