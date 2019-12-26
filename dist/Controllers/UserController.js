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
const jwt_simple_1 = __importDefault(require("jwt-simple"));
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
    const admin = req.body.user;
    console.log(admin);
    //Recogemos los datos por post
    var { names, schedule, email, type } = req.body;
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
                //Creamos usuarios dependiendo del rango
                if (admin.role === 'MASTER_ADMIN') {
                    //Va a crear solo administradores sin compañias
                    //---Creamos el objeto
                    const newUser = new User_1.User({
                        names,
                        email,
                        password,
                        schedule,
                        role: 'ROLE_ADMIN',
                        createdAt: moment_1.default(),
                        personalToken: new getToken_1.default(60).getUrlToken()
                    });
                    saveUser(newUser, password);
                }
                else if (admin.role === 'ROLE_ADMIN') {
                    if (admin.company === null) {
                        res.status(422).json({
                            status: 'error',
                            message: 'No has creado una compañía'
                        });
                    }
                    else {
                        //Va a poder crear usuarios o administradores
                        //---Validamos el tipo de usuario
                        var valType = !validator_1.default.isEmpty(type) &&
                            validator_1.default.isInt(type) &&
                            type >= 0 &&
                            type <= 1;
                        if (valType) {
                            //1 para admin y 0 para usuario
                            if (type == 1) {
                                const newUser = new User_1.User({
                                    names,
                                    email,
                                    password,
                                    schedule,
                                    role: 'ROLE_ADMIN',
                                    company: admin.company,
                                    createdAt: moment_1.default(),
                                    personalToken: new getToken_1.default(60).getUrlToken()
                                });
                                saveUser(newUser, password);
                            }
                            else {
                                const newUser = new User_1.User({
                                    names,
                                    email,
                                    password,
                                    schedule,
                                    role: 'ROLE_USER',
                                    company: admin.company,
                                    createdAt: moment_1.default(),
                                    personalToken: new getToken_1.default(60).getUrlToken()
                                });
                                saveUser(newUser, password);
                            }
                        }
                        else {
                            res.status(422).json({
                                status: 'error',
                                message: 'Error, no se pudo crear el usuario'
                            });
                        }
                    }
                }
                else {
                    res.status(422).json({
                        status: 'error',
                        message: 'Error, no puedes realizar estos cambios'
                    });
                }
                function saveUser(user, password) {
                    return __awaiter(this, void 0, void 0, function* () {
                        //Hashear la password
                        user.password = yield user.encryptPass(user.password);
                        //Guardamos al usuario en la base de datos
                        yield user.save();
                        //Enviamos un email
                        new sendEmail_1.default().sendVerifyEmail(user, password);
                        res.status(202).json({
                            status: 'success',
                            message: `El usuario con los nombres ${user.names} ha sido registrado satisfactoriamente`
                        });
                    });
                }
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
    var applicationCode = req.params.code;
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
                        //Aquí validamos si esta mandando una application code o no
                        var token = new Authorization_1.default(user).generateUserToken();
                        if (applicationCode != undefined) {
                            //Validamos que la clave y la clave enviada sean las mismas
                            var code = process.env.APPLICATION_CODE;
                            if (applicationCode === code) {
                                //Aqui generamos todo el usuario
                                user.password = undefined;
                                //Retornamos el token y el usuario
                                res.status(202).json({
                                    status: 'success',
                                    token,
                                    user
                                });
                            }
                            else {
                                res.status(422).json({
                                    status: 'error',
                                    message: 'La clave de acceso es incorrecta'
                                });
                            }
                        }
                        else {
                            //Aqui generamos parte del usuario
                            user.password = undefined;
                            user.state = undefined;
                            user.createdAt = undefined;
                            user.updatedAt = undefined;
                            user.email = undefined;
                            user.schedule = undefined;
                            user.personalToken = undefined;
                            user.company = undefined;
                            //Retornamos el token y el usuario
                            res.status(202).json({
                                status: 'success',
                                token,
                                user
                            });
                        }
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
exports.recoveryPass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos los datos por post
    var { credential } = req.body;
    //Buscamos al usuario en la base de datos
    try {
        var valCredetial = !validator_1.default.isEmpty(credential);
        if (valCredetial) {
            //Bucamos al usuario en la base de datos
            const user = yield User_1.User.findOne({
                $or: [{ email: credential }, { schedule: credential }]
            });
            if (user) {
                //Validamos que el usuario no este baneado ni tenga la cuenta inactiva
                if (user.state === false) {
                    res.status(422).json({
                        status: 'error',
                        message: 'El usuario no ha activado su cuenta, verifique su correo'
                    });
                }
                else if (user.role === 'USER_BANNED') {
                    res.status(422).json({
                        status: 'error',
                        message: 'Usuario baneado'
                    });
                }
                else {
                    res.status(201).json({
                        status: 'error',
                        message: 'Se ha enviado a su correo satisfactoriamente'
                    });
                }
            }
            else {
                res.status(404).json({
                    status: 'error',
                    message: 'El usuario no existe'
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
exports.changePass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos los datos
    var { password, newPass, passwordConf } = req.body;
    var token = req.headers.authorization;
    //Validamos los datos
    try {
        var valpass = !validator_1.default.isEmpty(password);
        var valNewPass = !validator_1.default.isEmpty(newPass) &&
            validator_1.default.isLength(newPass, { min: 8, max: 255 });
        var valPassConf = !validator_1.default.isEmpty(passwordConf) &&
            validator_1.default.isLength(passwordConf, { min: 8, max: 255 });
        var valToken = !validator_1.default.isEmpty(token) && validator_1.default.isJWT(token);
        if (valpass && valNewPass && valPassConf && valToken) {
            //Descomponemos el token
            var key = process.env.TOKEN_KEY;
            const user = jwt_simple_1.default.decode(token, key);
            //Buscamos al usuario en la base de datos
            const findUser = yield User_1.User.findById(user.sub);
            if (findUser) {
                //Validamos que la contraseña sea correcta
                const verifyPass = yield findUser.decryptPass(password);
                if (verifyPass) {
                    //Si la contraseña esta bien vamos a generar una nueva
                    if (newPass === passwordConf) {
                        //Verificamos si la password no es igual a la anterior
                        const verifyNewPass = yield findUser.decryptPass(newPass);
                        if (verifyNewPass) {
                            res.status(400).json({
                                status: 'error',
                                message: 'Esta contraseña ya está en uso en este momento'
                            });
                        }
                        else {
                            //Hasheamos la password
                            var newPassword = yield findUser.encryptPass(newPass);
                            //Actualizamos el usuario
                            yield User_1.User.findByIdAndUpdate(findUser._id, {
                                password: newPassword,
                                updatedAt: moment_1.default()
                            });
                            res.status(201).json({
                                status: 'success',
                                message: 'Contraseña actualizada satisfactoriamente'
                            });
                        }
                    }
                    else {
                        res.status(422).json({
                            status: 'error',
                            message: 'Las contraseñas no coinciden'
                        });
                    }
                }
                else {
                    res.status(422).json({
                        status: 'error',
                        message: 'La contraseña es incorrecta'
                    });
                }
            }
            else {
                res.status(404).json({
                    status: 'error',
                    message: 'El usuario no existe'
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
//# sourceMappingURL=UserController.js.map