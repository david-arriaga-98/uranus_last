"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const app = express_1.default();
//Database
const database_1 = require("./database");
database_1.connectDB();
//Setting
dotenv_1.default.config();
app.set('port', process.env.PORT || 3000);
//Middlewares
app.use(cors_1.default());
app.use(morgan_1.default('dev'));
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
//Routes
const UserRouter_1 = __importDefault(require("./Routes/UserRouter"));
app.use(UserRouter_1.default);
const CompanyRoutes_1 = __importDefault(require("./Routes/CompanyRoutes"));
app.use(CompanyRoutes_1.default);
const VehicleRoutes_1 = __importDefault(require("./Routes/VehicleRoutes"));
app.use(VehicleRoutes_1.default);
//Export this module
exports.default = app;
//# sourceMappingURL=app.js.map