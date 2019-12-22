"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
class Tokens {
    constructor(length) {
        this._length = 0;
        this._length = length;
    }
    getUrlToken() {
        const urlToken = crypto_random_string_1.default({
            type: 'hex',
            length: this._length
        });
        return urlToken;
    }
}
exports.default = Tokens;
//# sourceMappingURL=getToken.js.map