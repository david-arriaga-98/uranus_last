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
const User_1 = require("../Models/User");
const getToken_1 = __importDefault(require("../Helpers/getToken"));
const sendEmail_1 = __importDefault(require("../Helpers/sendEmail"));
const ErrorMessage_1 = require("../Helpers/Petitions/ErrorMessage");
const Authorization_1 = __importDefault(require("../Helpers/Authorization"));
exports.validateSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos la cédula
    var { schedule } = req.body;
    //Validamos la cédula
    try {
        var valSchedule = !validator_1.default.isEmpty(schedule) &&
            validator_1.default.isLength(schedule, { min: 10, max: 10 }) &&
            validator_1.default.isInt(schedule);
        if (valSchedule) {
            //Validamos que no exista la cedula en la base de datos
            const user = yield User_1.User.findOne({ $and: [{ schedule }] });
            if (user) {
                res.status(422).json({
                    status: 'error',
                    message: 'Ya existe un usuario con esta cédula'
                });
            }
            else {
                //Hacemos una busqueda por medio del api
            }
        }
    }
    catch (error) { }
});
exports.registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos los datos por post
    var { names, schedule, email } = req.body;
    //Validamos los datos
    try {
        var valSchedule = !validator_1.default.isEmpty(schedule) &&
            validator_1.default.isLength(schedule, { min: 10, max: 10 }) &&
            validator_1.default.isInt(schedule);
        var valEmail = !validator_1.default.isEmpty(email) && validator_1.default.isEmail(email);
        var valNames = !validator_1.default.isEmpty(names);
        if (valSchedule && valEmail && valNames) {
            //Validamos que el usuario no exista
            const user = yield User_1.User.findOne({
                $or: [{ schedule }, { email }]
            });
            if (user) {
                res.status(422).json({
                    status: 'error',
                    message: 'El usuario con uno o varios parámetros, ya existe'
                });
            }
            else {
                var password = new getToken_1.default(8).getUrlToken().toUpperCase();
                //Generamos el objeto
                const newUser = new User_1.User({
                    names,
                    email,
                    password,
                    schedule,
                    role: 'MASTER_ADMIN',
                    createdAt: moment_1.default(),
                    personalToken: new getToken_1.default(60).getUrlToken()
                });
                //Hashear la password
                newUser.password = yield newUser.encryptPass(newUser.password);
                //Guardamos al usuario en la base de datos
                yield newUser.save();
                //Enviamos un email
                new sendEmail_1.default().sendVerifyEmail(newUser, password);
                res.status(202).json({
                    status: 'success',
                    message: `El usuario con los nombres ${newUser.names} ha sido registrado satisfactoriamente`
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
exports.activateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos el urlToken
    var token = req.params.token;
    //Validamos
    try {
        var valToken = !validator_1.default.isEmpty(token) &&
            validator_1.default.isLength(token, { min: 60, max: 60 });
        if (valToken) {
            //Buscamos al token en la base de datos
            const user = yield User_1.User.findOne({ personalToken: token });
            if (user) {
                //Activamos al usuario
                yield User_1.User.findByIdAndUpdate(user._id, {
                    state: true,
                    personalToken: new getToken_1.default(32).getUrlToken()
                });
                res.status(201).json({
                    status: 'success',
                    message: `Felicidades ${user.names}, tu cuenta ha sido activada satisfactoriamente`
                });
            }
            else {
                res.status(404).json({
                    status: 'error',
                    message: 'El código es erroneo, o el usuario ya está validado'
                });
            }
        }
        else {
            res.status(404).json({
                status: 'error',
                message: 'El código es erroneo, o el usuario ya está validado'
            });
        }
    }
    catch (error) {
        res.status(422).json(ErrorMessage_1.errorPetitions.fieldError);
    }
});
exports.loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recibimos los datos
    var { credential, password } = req.body;
    //Validamos los datos
    try {
        var valCredetial = !validator_1.default.isEmpty(credential);
        var valPassword = !validator_1.default.isEmpty(password);
        if (valCredetial && valPassword) {
            //Buscamos al usuario en la base de datos
            const user = yield User_1.User.findOne({
                $or: [{ email: credential }, { schedule: credential }]
            }).select('-__v');
            if (user) {
                if (user.state === false) {
                    res.status(422).json({
                        status: 'error',
                        message: 'Cuenta inactiva'
                    });
                }
                else if (user.role === 'USER_BANNED') {
                    res.status(422).json({
                        status: 'error',
                        message: 'Cuenta Baneada'
                    });
                }
                else {
                    //Comparamos la contraseña
                    const verifyPass = yield user.decryptPass(password);
                    if (verifyPass) {
                        //Si es verdadero, entonces generamos el token
                        var token = new Authorization_1.default(user).generateUserToken();
                        //Eliminamos cosas sencibles
                        user.password = undefined;
                        user.state = undefined;
                        user.createdAt = undefined;
                        user.updatedAt = undefined;
                        user.email = undefined;
                        user.schedule = undefined;
                        user.personalToken = undefined;
                        user.company = undefined;
                        //Retornamos el token
                        res.status(202).json({
                            status: 'success',
                            token,
                            user
                        });
                    }
                    else {
                        res.status(400).json(ErrorMessage_1.errorPetitions.credentialsError);
                    }
                }
            }
            else {
                res.status(400).json(ErrorMessage_1.errorPetitions.credentialsError);
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
//# sourceMappingURL=UserController.js.map