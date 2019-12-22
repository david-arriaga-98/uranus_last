"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const moment_1 = __importDefault(require("moment"));
class Authorization {
    constructor(user) {
        this._user = user;
        this._key = process.env.TOKEN_KEY;
    }
    generateUserToken() {
        const payload = {
            sub: this._user._id,
            names: this._user.names,
            role: this._user.role,
            iat: moment_1.default().unix(),
            exp: moment_1.default()
                .add(8, 'hours')
                .unix()
        };
        return jwt_simple_1.default.encode(payload, this._key);
    }
    generateClientToken() {
        const payload = {
            sub: this._user._id,
            names: this._user.names,
            role: this._user.role,
            iat: moment_1.default().unix(),
            exp: moment_1.default()
                .add(1, 'years')
                .unix()
        };
        return jwt_simple_1.default.encode(payload, this._key);
    }
}
exports.default = Authorization;
//# sourceMappingURL=Authorization.js.map