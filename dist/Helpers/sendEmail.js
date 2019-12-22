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
const mail_1 = __importDefault(require("@sendgrid/mail"));
class SendMail {
    constructor() {
        this._sendgridKey = process.env.SENDGRID_API_KEY;
    }
    sendVerifyEmail(user, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                mail_1.default.setApiKey(this._sendgridKey);
                const html = `
                <p>Bienvenido <strong>${user.names}</strong> :)</p> </br>
                <p>Preciona el link, para verificar tu cuenta:</p> </br>
                <a href="https://api.uranus-application.me/user/verify/${user.personalToken}" target="_blank">Da click Aquí</a> </br>
                <p>Y su contraseña provisional es: ${password}</p></br>
                <p>Si el botón no funciona, copia y pega lo siguiente:</p></br>
                <p>https://api.uranus-application.me/user/verify/${user.personalToken}</p>
            `;
                const msg = {
                    to: user.email,
                    from: 'uranus-system@no-reply.dev',
                    subject: 'Verificación tu cuenta',
                    html
                };
                yield mail_1.default.send(msg);
            }
            catch (error) {
                console.log("No se ha enviado un Email :'(");
            }
        });
    }
}
exports.default = SendMail;
//# sourceMappingURL=sendEmail.js.map