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
const axios_1 = __importDefault(require("axios"));
class FindUserBySchedule {
    constructor(schedule) {
        this.schedule = schedule;
    }
    findUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(`http://fenixerp.info/api/v1/730bf4bdb6ec369f235a8416e20c9c07/cedula_ec/?nui=${this.schedule}`);
            if (response.data.result === null ||
                response.data.result === undefined ||
                response.data.result === '') {
                return {
                    code: 404,
                    status: 'error',
                    message: `El usuario con la cédula ${this.schedule}, no existe en el sistema general`
                };
            }
            else {
                return {
                    code: 200,
                    status: 'success',
                    user: response.data.result
                };
            }
        });
    }
}
exports.default = FindUserBySchedule;
//# sourceMappingURL=FindUserBySchedule.js.map