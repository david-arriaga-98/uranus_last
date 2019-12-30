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
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const User_1 = require("../Models/User");
exports.AdminMD = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //Recogemos el token recibido
    var token = req.headers.authorization;
    //Validamos el token
    try {
        var valToken = !validator_1.default.isEmpty(token) && validator_1.default.isJWT(token);
        if (valToken) {
            //Limpiamos el token
            token = token.replace(/['"]+/g, '');
            //Decodificamos el token
            const key = process.env.TOKEN_KEY;
            const tokenValidate = jwt_simple_1.default.decode(token, key);
            //Buscamos al usuario en la base de datos a ver si es cierto que es admin
            const user = yield User_1.User.findById(tokenValidate.sub);
            //Validamos
            if (user.state === false) {
                res.status(401).json({
                    status: 'error',
                    message: 'Tu cuenta no ha sido activado'
                });
            }
            else if (user.role === 'MASTER_ADMIN' || user.role === 'ROLE_ADMIN') {
                req.body.user = user;
                next();
            }
            else if (user.role === 'USER_BANNED') {
                res.status(401).json({
                    status: 'error',
                    message: 'Tu cuenta ha sido baneada'
                });
            }
            else {
                res.status(401).json({
                    status: 'error',
                    message: 'No puedes realizar estos cambios'
                });
            }
        }
        else {
            res.status(401).json({
                status: 'error',
                message: 'Token no válido'
            });
        }
    }
    catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Token no válido'
        });
    }
});
//# sourceMappingURL=AdminMD.js.map