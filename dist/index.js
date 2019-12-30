"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app_1.default);
const io = socket_io_1.default(server);
const Sockets_1 = require("./Sockets");
Sockets_1.socket(io);
server.listen(app_1.default.get('port'), () => {
    console.log('Socket on port', app_1.default.get('port'));
});
//# sourceMappingURL=index.js.map