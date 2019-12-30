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
const validator_1 = __importDefault(require("validator"));
const moment_1 = __importDefault(require("moment"));
const Company_1 = require("../../Models/Company");
const ErrorMessage_1 = require("../../Helpers/Petitions/ErrorMessage");
const getToken_1 = __importDefault(require("../../Helpers/getToken"));
const User_1 = require("../../Models/User");
//metodo para crear una compañia
exports.createCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos los datos por post
    var { name, ruc, socialReason, direction } = req.body;
    const admin = req.body.user;
    /* OJO LOS MASTER_ADMIN NO PUEDEN TENER COMPAÑIA */
    try {
        //Validamos los datos
        var valName = !validator_1.default.isEmpty(name);
        var valRUC = !validator_1.default.isEmpty(ruc) &&
            validator_1.default.isInt(ruc) &&
            validator_1.default.isLength(ruc, { min: 13, max: 13 });
        if (valName && valRUC) {
            //Validamos si puede crear empresa, solo los admins lo pueden hacer
            if (admin.role === 'ROLE_ADMIN' && admin.company === null) {
                //Validamos que no exista una compañia similar
                const company = yield Company_1.Company.findOne({ ruc });
                if (company) {
                    res.status(422).json({
                        status: 'error',
                        message: 'Ya existe una compañía registrada con este ruc'
                    });
                }
                else {
                    //Creamos el objeto compañia
                    const newCompany = new Company_1.Company({
                        name,
                        ruc,
                        socialReason,
                        direction,
                        users: admin._id,
                        state: false,
                        createdAt: moment_1.default(),
                        companyKey: new getToken_1.default(30).getUrlToken()
                    });
                    //Guardamos la compañia en la base de datos
                    yield newCompany.save();
                    //Retornamos una respuesta
                    res.status(200).json({
                        status: 'success',
                        message: 'Compañia creada correctamente, espera a que esta sea verificada para poder utilizarla'
                    });
                    //Actualizamos el usuario
                    yield User_1.User.findByIdAndUpdate(admin._id, {
                        company: newCompany._id,
                        companyState: newCompany.state
                    });
                }
            }
            else {
                res.status(422).json({
                    status: 'error',
                    message: 'No puedes crear una compañía, ya has creado una o tu Rol no te lo permite'
                });
            }
        }
        else {
            res.status(422).json(ErrorMessage_1.errorPetitions.fieldError);
        }
    }
    catch (error) {
        res.status(422).json(ErrorMessage_1.errorPetitions.fieldError);
    }
});
//Metodo de admin debe ir en otro documento
exports.activeCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos los datos
    var { companyID } = req.body;
    const admin = req.body.user;
    try {
        var valID = !validator_1.default.isEmpty(companyID) && validator_1.default.isMongoId(companyID);
        if (valID) {
            //Buscamos a la compañia en la base de datos
            const company = yield Company_1.Company.findById(companyID);
            if (company) {
                //Validamos si ya esta activada o no
                if (company.state === false) {
                    //Activamos la compañia
                    yield Company_1.Company.findByIdAndUpdate(company._id, {
                        state: true
                    });
                    //Retornamos una respuesta
                    res.status(200).json({
                        status: 'success',
                        message: 'La compañía ha sido activada correctamente'
                    });
                    //Actualizamos los usuarios
                    company.users.forEach((user) => __awaiter(void 0, void 0, void 0, function* () {
                        //Actualizamos a los usaurios
                        yield User_1.User.findByIdAndUpdate(user, {
                            companyState: true
                        });
                    }));
                }
                else {
                    res.status(422).json({
                        status: 'error',
                        message: 'La compañía ya está activada'
                    });
                }
            }
            else {
                res.status(404).json({
                    status: 'error',
                    message: 'Error, la compañía no existe'
                });
            }
        }
        else {
            res.status(422).json(ErrorMessage_1.errorPetitions.fieldError);
        }
    }
    catch (error) {
        res.status(422).json(ErrorMessage_1.errorPetitions.fieldError);
    }
});
//# sourceMappingURL=CompanyController.js.map